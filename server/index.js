const express = require("express");
const app = express();
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();
const connectDb = require("./Database/db");
const cors = require("cors");
const Message = require('./Models/message');

const requestRoutes = require('./Routes/requestRoute');
const historyRoutes = require('./Routes/historyRoute');
const rewardRoutes = require('./Routes/rewardRoute'); // --- NEW ---

const PORT = process.env.PORT || 5000;
connectDb();

app.use(express.json());
app.use(cors({ origin: "https://cnntsphere.netlify.app" }));

app.get("/", (req, res) => {
    res.status(200).send("Server is up and running!");
});

app.use(express.static("public"));

app.use("/api/auth", require("./Routes/userRoute"));
app.use("/api/items", require("./Routes/itemRoute"));
app.use("/api/messages", require("./Routes/messageRoute"));
app.use('/api/requests', requestRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/rewards', rewardRoutes); // --- NEW ---

const chatServer = http.createServer(app);
const io = new Server(chatServer, {
    cors: { origin: "https://cnntsphere.netlify.app", methods: ["GET", "POST"] },
});

app.set('io', io);
const userSocketMap = new Map();
app.set('userSocketMap', userSocketMap);

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('register_user', (userId) => {
        console.log(`Registering user ${userId} with socket ${socket.id}`);
        userSocketMap.set(userId, socket.id);
    });

    socket.on("join_chat", (room) => {
        socket.join(room);
        console.log(`User with ID: ${socket.id} joined room: ${room}`);
    });

    socket.on("send_message", async (data) => {
        try {
            const newMessage = new Message({
                room: data.room,
                sender: data.senderId,
                author: data.author,
                recipient: data.recipientId,
                message: data.message,
                itemId: data.itemId,
            });
            await newMessage.save();

            // --- FIX: Broadcast to EVERYONE in the room ---
            io.to(data.room).emit("receive_message", data);

        } catch (error) {
            console.error("Failed to save or broadcast message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
        for (let [userId, socketId] of userSocketMap.entries()) {
            if (socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    });
});

chatServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});