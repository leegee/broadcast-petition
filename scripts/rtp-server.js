import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";

export const STREAMER_PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certPath = path.join(__dirname, "../certs/cert.pem");
const keyPath = path.join(__dirname, "../certs/key.pem");

let streamUrl = process.env.YOUTUBE_KEY
    ? "rtmp://a.rtmp.youtube.com/live2/" + process.env.YOUTUBE_KEY
    : null;

let ffmpegProcess = null;
let currentClient = null;

function startFfmpeg() {
    if (!streamUrl) {
        console.warn("Cannot start ffmpeg: no stream URL set");
        return;
    }

    if (ffmpegProcess) {
        console.log("Killing existing ffmpeg...");
        ffmpegProcess.kill("SIGINT");
        ffmpegProcess = null;
    }

    console.log("Starting ffmpeg →", streamUrl);

    ffmpegProcess = spawn("ffmpeg", [
        "-re",
        "-f", "webm",
        "-i", "-", // stdin from WS

        "-f", "lavfi",
        "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",

        "-map", "0:v",
        "-map", "1:a",

        "-c:v", "libx264",
        "-b:v", "6800k",
        "-maxrate", "6800k",
        "-bufsize", "13600k",

        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-pix_fmt", "yuv420p",
        "-g", "120",          // keyframe every 2s
        "-keyint_min", "120",
        "-sc_threshold", "0",

        "-c:a", "aac",
        "-ar", "44100",
        "-b:a", "128k",

        "-shortest",
        "-f", "flv",
        streamUrl,
    ]);

    ffmpegProcess.stderr.on("data", (data) =>
        console.log("FFmpeg:", data.toString())
    );

    ffmpegProcess.on("close", (code, signal) => {
        console.log(`FFmpeg exited with code ${code} signal ${signal}`);
        ffmpegProcess = null;
    });
}

function startWebSocketServer() {
    const server = https.createServer({
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
    });

    const wss = new WebSocketServer({ server });
    server.listen(STREAMER_PORT, () => {
        console.log(`Stream server running at wss://localhost:${STREAMER_PORT}`);
    });

    wss.on("connection", (ws) => {
        if (currentClient) {
            console.log("Rejecting new client (already connected).");
            ws.close(1013, "Only one client allowed");
            return;
        }

        console.log("🎥 Client connected");
        currentClient = ws;
        startFfmpeg();

        ws.on("message", (msg) => {
            console.log("Received chunk", msg.length);
            if (ffmpegProcess?.stdin.writable) {
                ffmpegProcess.stdin.write(msg);
            }
        });

        ws.on("close", () => {
            console.log("Client disconnected");
            currentClient = null;
            ffmpegProcess?.kill("SIGINT");
            ffmpegProcess = null;
        });

        ws.on("error", (err) => {
            console.error("WebSocket error:", err);
            currentClient = null;
            ffmpegProcess?.kill("SIGINT");
            ffmpegProcess = null;
        });
    });
}

if (streamUrl) {
    startWebSocketServer();
} else {
    console.warn("No YOUTUBE_KEY set — waiting for update");
}
