import { spawn } from "child_process";
import { chromium } from "playwright";
import { WebSocketServer } from "ws";

const YOUTUBE_STREAM_KEY = "31bb-bt22-spgb-0bjm-8dd4";
const VITE_ADDRESS = "http://localhost:3000";
const STREAM_WIDTH = 1920;
const STREAM_HEIGHT = 1080 - 100;

(async () => {
    console.log("🚀 Launching Playwright browser...");

    const browser = await chromium.launch({
        headless: false,
        args: [
            `--window-size=${STREAM_WIDTH},${STREAM_HEIGHT}`,
            "--disable-infobars",
            "--no-sandbox"
        ]
    });

    const context = await browser.newContext({
        viewport: { width: STREAM_WIDTH, height: STREAM_HEIGHT }
    });

    const page = await context.newPage();
    await page.goto(VITE_ADDRESS);

    await page.waitForTimeout(500); // wait for render

    console.log("🎥 Starting FFmpeg...");

    const ffmpeg = spawn("ffmpeg", [
        "-f", "webm",            // input format from MediaRecorder
        "-i", "pipe:0",          // read from stdin
        "-c:v", "libx264",       // re-encode to H.264
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-b:v", "2500k",
        "-c:a", "aac",           // audio
        "-ar", "44100",
        "-b:a", "128k",
        "-f", "flv",             // YouTube expects FLV container
        `rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`
    ]);

    ffmpeg.stdout.on("data", () => { }); // silence
    ffmpeg.stderr.on("data", (data) => console.error(data.toString()));

    ffmpeg.on("close", (code) => console.log(`⚠️ FFmpeg exited with code ${code}`));
    ffmpeg.on("error", (err) => console.error(`❌ FFmpeg failed: ${err}`));

    const wss = new WebSocketServer({ port: 3001 });
    console.log("✅ WSS listening on 3001");

    wss.on("connection", (ws) => {
        console.log("Client connected");
        ws.on("message", (chunk) => {
            ffmpeg.stdin.write(chunk);
        });
    });

    console.log("✅ Streaming server ready! Connect client to send MediaRecorder chunks.");
})();
