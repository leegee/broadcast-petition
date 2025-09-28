// scripts/stream-mediarecorder.ts
import { spawn } from "child_process";
import { chromium } from "playwright";
import { WebSocketServer } from "ws";

const YOUTUBE_STREAM_KEY = process.env.YOUTUBE_STREAM_KEY || "jbz4-htgq-kh0z-63hx-a53c";
const VITE_ADDRESS = "http://localhost:3000";
const STREAM_WIDTH = 1920;
const STREAM_HEIGHT = 1080;

(async () => {
    console.log("🚀 Launching Playwright browser...");

    // --- Launch Chromium ---
    const browser = await chromium.launch({
        headless: false,
        args: [`--window-size=${STREAM_WIDTH},${STREAM_HEIGHT}`, "--disable-infobars"]
    });

    const context = await browser.newContext({
        viewport: { width: STREAM_WIDTH, height: STREAM_HEIGHT }
    });

    const page = await context.newPage();
    await page.goto(VITE_ADDRESS);

    // --- Start FFmpeg ---
    console.log("🎥 Starting FFmpeg...");
    const ffmpeg = spawn("ffmpeg", [
        "-f", "webm",
        "-i", "pipe:0",
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-b:v", "2500k",
        "-vf", "scale=1920:1080,setsar=1:1",
        "-c:a", "aac",
        "-ar", "44100",
        "-f", "flv",
        `rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`
    ]);

    ffmpeg.stderr.on("data", (data) => console.error(data.toString()));
    ffmpeg.on("close", (code) => console.log(`⚠️  FFmpeg exited with code ${code}`));
    ffmpeg.on("error", (err) => console.error(`❌ FFmpeg error: ${err}`));

    // --- WebSocket server ---
    const wss = new WebSocketServer({ port: 3001 });
    console.log("✅ WebSocket server running on ws://localhost:3001");

    wss.on("connection", (ws) => {
        ws.on("message", (chunk) => {
            ffmpeg.stdin.write(chunk);
        });
    });

    // --- Inject MediaRecorder into browser page ---
    await page.evaluate(() => {
        const ws = new WebSocket("ws://localhost:3001");

        ws.onopen = () => {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true }).then((stream) => {
                const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp8,opus" });

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                        ws.send(event.data);
                    }
                };

                recorder.start(500); // send ~0.5s chunks
                console.log("🎬 Recording started");
            }).catch((err) => console.error("❌ Failed to capture screen:", err));
        };
    });

    console.log("✅ Browser launched, waiting for screen-share permission…");
})();
