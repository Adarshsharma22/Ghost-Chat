import express from "express";
import "dotenv/config"
import cors from "cors";
import connectDB from "./lib/db.js";
import User from "./models/user.model.js";
import { clerkMiddleware } from "@clerk/express";

const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(clerkMiddleware());

app.get("/working", (req, res) => {
    res.status(200).json({ message: true });
});

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);
});