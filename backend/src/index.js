import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import fs from "fs";

import connectDB from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhook from "./webhooks/clerk.webhook.js";
import job from "./lib/cron.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(clerkMiddleware());

app.get("/working", (req, res) => res.json({ message: "OK" }));

// Static files + SPA fallback
const publicDir = path.join(process.cwd(), "public");
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get("*", (req, res) => {
        res.sendFile(path.join(publicDir, "index.html"));
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
    if (process.env.NODE_ENV === "production") job.start();
});