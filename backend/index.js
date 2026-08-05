import "dotenv/config.js";

import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import mongoose from "mongoose";
import apiRouter from "./routers/index.js"
import errorHandler from "./middleware/ErrorHandlingMiddleware.js"
import authMiddleware from "./middleware/AuthMiddleware.js";
import ApiError from "./models/ApiError.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketServer } from "socket.io";
import SocketChat from "./sockets/SocketChat.js";
import SocketAuth from "./sockets/SocketAuth.js";

const PORT = process.env.PORT;
const app = express();
const DB_URL = process.env.DB_URL;

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:4000',
    credentials: true
}));
app.use(cookieParser());
app.use(authMiddleware);
app.use("/api", apiRouter);

//Not found
app.use((req, res, next) => {
    res.status(404).json({ message: "ENDPOINT_NOT_EXISTS" });
});
app.use(errorHandler);

const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: "http://localhost:4000",
        methods: ["GET", "POST"],
        credentials: true
    }
})
app.set('io', io);

io.use(SocketAuth);

io.on("connection", socket => {
    SocketChat(io, socket);
})

async function startApp() {
    try {
        await mongoose.connect(DB_URL);
        server.listen(PORT, () => {
            console.log("Server is running on port " + PORT);
        });
    }
    catch (err) {
        console.error("Error starting app:", err);
    }
}

startApp();