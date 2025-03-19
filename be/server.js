import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongoDB } from "./config.js";
import router from "./routes.js";
import mongoose from "mongoose"; // Use import instead of require
import { v4 as uuidv4 } from "uuid"; // Use import instead of require

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

connectMongoDB();

app.listen(5000, () => console.log("Server running on port 5000"));
