const express = require("express");
const app = express();
require('dotenv').config();
const connectDb = require("./Database/db");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
connectDb();


app.use(express.json());
app.use(cors());
app.use(express.static("public"));


app.use("/api/auth", require("./Routes/userRoute"));
app.use("/api/items", require("./Routes/itemRoute"));


app.listen(PORT, (err) => {
    if (err) {
        console.error("Error starting server:", err);
        return;
    }
    console.log(`Listening on port:- ${PORT}`);
});
