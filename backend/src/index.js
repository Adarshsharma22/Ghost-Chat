import express from "express";
import "dotenv/config"
import cors from "cors";
import fs from "fs";
import path from "path";
import connectDB from "./lib/db.js";
import User from "./models/user.model.js";
import { clerkMiddleware } from "@clerk/express";
import job from "./lib/cron.js";
import clerkWebhook from "./webhooks/clerk.webhook.js";

const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const publicDir = path.join(process.cwd(), "public");


// it's important that you don't parse the webhook event data, it should be in the raw format
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(clerkMiddleware());

app.get("/working", (req, res) => {
    res.status(200).json({ message: "OK" });
});

if(fs.existsSync(publicDir)){
    app.use(express.static(publicDir));
    app.get("/{*any}", (req,res,next) => {
        res.sendFile(path.join(publicDir, "index.html"), (err) => next(err));
    });
}

app.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);

    if (process.env.NODE_ENV === "production") job.start();
});