const express = require("express");
const app = express();
const http = require('http');
const { Server } = require("socket.io");
require('dotenv').config();
const connectDb = require("./Database/db");
const cors = require("cors");
const Message = require('./Models/message'); 

const PORT = process.env.PORT || 5000;
connectDb();

app.use(express.json());

app.use(cors({
    origin: "https://cnntsphere.netlify.app"
}));

app.get("/", (req, res) => {
    res.status(200).send("Server is up and running!");
});

app.use(express.static("public"));

app.use("/api/auth", require("./Routes/userRoute"));
app.use("/api/items", require("./Routes/itemRoute"));
app.use("/api/messages", require("./Routes/messageRoute")); 

// --- SOCKET IO SETUP ---
const chatServer = http.createServer(app);

const io = new Server(chatServer, {
    cors: {
        origin: "https://cnntsphere.netlify.app",
        methods: ["GET", "POST"],
    },
});


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

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
                isRead: false // Explicitly set to false on creation
            });
            // --- UPDATE ---
            // Save the message first, then emit the saved message object.
            // This ensures the client receives the message with its database ID (_id).
            const savedMessage = await newMessage.save();

            // Emit to the specific room so only participants get the message
            socket.to(data.room).emit("receive_message", savedMessage);

        } catch (error) {
            console.error("Failed to save or broadcast message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});


chatServer.listen(PORT, (err) => {
    if (err) {
        console.error("Error starting server:", err);
        return;
    }
    console.log(`Server with chat is listening on port: ${PORT}`);
});
