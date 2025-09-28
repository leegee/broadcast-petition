import { spawn } from "child_process";
import { chromium } from "playwright";
import { WebSocketServer } from "ws";

const YOUTUBE_STREAM_KEY = "31bb-bt22-spgb-0bjm-8dd4";
const VITE_ADDRESS = "http://localhost:3000";
const STREAM_WIDTH = 1920;
const STREAM_HEIGHT = 1080 - 100;

(async () => {
    console.log("# Launching Playwright browser...");

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

    // Give browser a moment to render
    await page.waitForTimeout(500);

    // Get content-only bounds (exclude chrome/title bar)
    const bounds = await page.evaluate(() => ({
        x: window.screenX,
        y: window.screenY + (window.outerHeight - window.innerHeight),
        width: window.innerWidth,
        height: window.innerHeight
    }));

    console.log("# Detected content bounds:", bounds);

    console.log("# Starting FFmpeg...");

    const ffmpeg = spawn("ffmpeg", [
        "-i", "pipe:0",              // read from stdin
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-b:v", "2500k",
        "-c:a", "aac",
        "-ar", "44100",
        "-f", "flv",
        `rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`
    ]);

    ffmpeg.stdout.on("data", (data) => { });  // silence stdout
    ffmpeg.stderr.on("data", (data) => console.error(data.toString()));

    ffmpeg.on("close", (code) =>
        console.log(`##  FFmpeg exited with code ${code}`)
    );
    ffmpeg.on("error", (err) =>
        console.error(`### Failed to start FFmpeg: ${err}`)
    );

    const wss = new WebSocketServer({ port: 3001 });
    console.log("# WSS listening on 3001");

    wss.on("connection", (ws) => {
        ws.on("message", (chunk) => {
            console.log("# 📦 Got chunk:", (chunk).length, "bytes");
            // FFmpeg expects raw bytes
            ffmpeg.stdin.write(chunk);
        });
    });

    console.log("# Streaming started! Check YouTube Studio for live preview.");
})();
