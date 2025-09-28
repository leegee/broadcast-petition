import { spawn } from "child_process";
import { chromium } from "playwright";

const YOUTUBE_STREAM_KEY = "jbz4-htgq-kh0z-63hx-a53c";
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

    // Give the browser a moment to render
    await page.waitForTimeout(500);

    // Detect content bounds (exclude chrome/title bar)
    const bounds = await page.evaluate(() => ({
        x: window.screenX,
        y: window.screenY + (window.outerHeight - window.innerHeight),
        width: window.innerWidth,
        height: window.innerHeight
    }));

    console.log("Detected content bounds:", bounds);

    console.log("🎥 Starting FFmpeg...");

    const ffmpegArgs = [
        "-f", "gdigrab",                     // capture Windows desktop
        "-framerate", "30",
        "-i", "desktop",                     // capture the whole screen
        "-vf", `crop=${bounds.width}:${bounds.height}:${bounds.x}:${bounds.y}`, // crop to browser
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-b:v", "3000k",
        "-c:a", "aac",
        "-ar", "44100",
        "-f", "flv",
        `rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    ffmpeg.stdout.on("data", (data) => { });
    ffmpeg.stderr.on("data", (data) => console.error(data.toString()));

    ffmpeg.on("close", (code) => console.log(`⚠️  FFmpeg exited with code ${code}`));
    ffmpeg.on("error", (err) => console.error(`❌ Failed to start FFmpeg: ${err}`));

    console.log("✅ Streaming started! Check YouTube Studio for live preview.");
})();
