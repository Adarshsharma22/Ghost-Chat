import { CronJob } from "cron";
import http from "http";
import https from "https";

const job = new CronJob("*/14 * * * *", function() {
    const base = process.env.FrONTEND_URL;
    if (!base) return;
    const url = new URL("/health", base);
    const client = url.startsWith("https:") ? https : http;

    client 
    .get(url, (res) => {
        if (res.statusCode === 200) console.log("Get request sent successfully");
        else console.log("Get request failed with status code: ", res.statusCode);
    })
    .on("error", (e) => console.error("Error sending get request: ", e));
});

export default job;