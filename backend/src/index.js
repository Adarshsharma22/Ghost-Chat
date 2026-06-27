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
const FRONTEND_URL = process.env.FRONTEND_URL;

const publicDir = path.join(process.cwd(), "public");

// Webhook route (must be before other middleware that parses body)
app.use("/api/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhook);

app.use(express.json());
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(clerkMiddleware());   // ← Apply after webhook route

app.get("/working", (req, res) => {
    res.status(200).json({ message: "OK" });
});

// Serve static files (React build)
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    
    // SPA fallback - catch all routes and serve index.html
    app.get("*", (req, res) => {
        res.sendFile(path.join(publicDir, "index.html"));
    });
} else {
    console.warn("Public directory not found. Running in API-only mode.");
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
    
    if (process.env.NODE_ENV === "production") {
        job.start();
    }
});