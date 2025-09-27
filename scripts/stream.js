const { spawn } = require("child_process");
const { chromium } = require("playwright");

const YOUTUBE_STREAM_KEY = "YOUR_STREAM_KEY_HERE";
const VITE_ADDRESS = "http://localhost:5173";
const STREAM_WIDTH = 1280;
const STREAM_HEIGHT = 720;
const MOVE_OFFSCREEN = true;

// Unique title for Playwright app window
const WINDOW_TITLE = "Petition The UK Government";

// Launch Playwright browser
(async () => {
    console.log("🚀 Launching Playwright browser...");
    const browser = await chromium.launch({
        headless: false, // must be false for FFmpeg to capture pixels
        args: [
            `--app=${VITE_ADDRESS}`,
            `--window-size=${STREAM_WIDTH},${STREAM_HEIGHT}`
        ]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`🔗 Navigating to ${VITE_ADDRESS}...`);
    await page.goto(VITE_ADDRESS);

    // Set window title to a known value for FFmpeg capture
    console.log(`✏️  Setting window title to "${WINDOW_TITLE}"`);
    await page.evaluate((title) => {
        document.title = title;
    }, WINDOW_TITLE);

    if (MOVE_OFFSCREEN) {
        console.log("📤 Moving browser window off-screen for background streaming...");
        await page.evaluate(() => window.moveTo(-2000, 0));
    }

    console.log(`✅ Browser launched in app mode with title "${WINDOW_TITLE}"`);
    console.log(`🎥 Starting FFmpeg to stream ${STREAM_WIDTH}x${STREAM_HEIGHT} at 30 FPS...`);

    // Spawn FFmpeg to stream
    const ffmpegArgs = [
        "-f", "gdigrab",
        "-framerate", "30",
        "-i", `title=${WINDOW_TITLE}`,      // capture only this window
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
