import "dotenv/config.js";

import express from "express";
import mongoose from "mongoose";
import apiRouter from "./routers/index.js"
import errorHandler from "./middleware/ErrorHandlingMiddleware.js"
import authMiddleware from "./middleware/AuthMiddleware.js";
import ApiError from "./models/ApiError.js";

const PORT = process.env.PORT;
const app = express();
const DB_URL = process.env.DB_URL;

app.use(express.json());
app.use(authMiddleware);
app.use("/api", apiRouter); 

//Not found
app.use((req, res, next) => {
    res.status(404).json({message: "ENDPOINT_NOT_EXISTS"});
});
app.use(errorHandler);

async function startApp() {
    try{
        await mongoose.connect(DB_URL);
        app.listen(PORT, () => {
            console.log("Server is running on port " + PORT);
        });
   }
   catch(err) {
       console.error("Error starting app:", err);
   }
}

startApp();