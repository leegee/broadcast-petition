import { spawn } from "child_process";
import { chromium } from "playwright";

const YOUTUBE_STREAM_KEY = "YOUR_STREAM_KEY_HERE";
const VITE_ADDRESS = "http://localhost:3000";
const STREAM_WIDTH = 1280;
const STREAM_HEIGHT = 720;

// A unique title so gdigrab can lock onto this window
const WINDOW_TITLE = "Petition The UK Government";

(async () => {
    console.log("🚀 Launching Playwright browser...");

    const browser = await chromium.launch({
        headless: false,
        args: [
            `--app=${VITE_ADDRESS}`,               // frameless app window
            `--window-size=${STREAM_WIDTH},${STREAM_HEIGHT}`, // exact size
            "--kiosk",                             // removes window borders/title bar
            "--disable-infobars",                  // no "Chrome is being controlled…" bar
            "--no-sandbox"
        ]
    });

    const context = await browser.newContext({
        viewport: { width: STREAM_WIDTH, height: STREAM_HEIGHT }
    });

    const page = await context.newPage();
    await page.goto(VITE_ADDRESS);

    // Set document.title (may still get a suffix, see note below)
    await page.evaluate((title) => {
        document.title = title;
    }, WINDOW_TITLE);

    console.log(`✅ Chromium opened borderless at ${STREAM_WIDTH}x${STREAM_HEIGHT}`);
    console.log("🎥 Starting FFmpeg...");

    // FFmpeg command
    const ffmpegArgs = [
        "-f", "gdigrab",
        "-framerate", "30",
        "-i", `title=${WINDOW_TITLE}`,        // will match if no suffix
        "-video_size", `${STREAM_WIDTH}x${STREAM_HEIGHT}`,
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-pix_fmt", "yuv420p",
        "-f", "flv",
        `rtmp://a.rtmp.youtube.com/live2/${YOUTUBE_STREAM_KEY}`
    ];

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    ffmpeg.stdout.on("data", (data) => {
        console.log(`FFmpeg stdout: ${data.toString()}`);
    });

    ffmpeg.stderr.on("data", (data) => {
        console.error(`FFmpeg stderr: ${data.toString()}`);
    });

    ffmpeg.on("close", (code) => {
        console.log(`⚠️  FFmpeg exited with code ${code}`);
    });

    ffmpeg.on("error", (err) => {
        console.error(`❌ Failed to start FFmpeg: ${err}`);
    });
})();
