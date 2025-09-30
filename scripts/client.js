import { chromium, devices } from "playwright";

const VITE_ADDRESS = "http://localhost:3000";
const STREAMER_WS = "wss://localhost:3001";
const STREAM_WIDTH = 1920;
const STREAM_HEIGHT = 1080;

(async () => {
    console.log("Launching Chromium...");

    const browser = await chromium.launch({
        headless: false,
        args: ["--start-maximized", "--disable-infobars", `--app=${VITE_ADDRESS}`],
    });

    const context = await browser.newContext({
        ...devices["Desktop Chrome"],
        viewport: null, // allow full window size
        deviceScaleFactor: undefined,
    });

    const page = await context.newPage();

    page.on("console", (msg) => console.log(`[browser] ${msg.text()}`));
    await page.goto(VITE_ADDRESS);

    await page.evaluate(
        ({ STREAMER_WS, STREAM_WIDTH, STREAM_HEIGHT }) => {

            const cropTop = 90; // pixels to remove at top

            const ws = new WebSocket(STREAMER_WS);
            ws.onopen = async () => {
                console.log("[browser] Connected to streaming server");

                try {
                    // Capture the page (not the whole screen)
                    const pageStream = await navigator.mediaDevices.getDisplayMedia({
                        video: { width: STREAM_WIDTH, height: STREAM_HEIGHT, cursor: "never" },
                        audio: false,
                    });

                    const video = document.createElement("video");
                    video.srcObject = pageStream;
                    video.play();

                    const canvas = document.createElement("canvas");
                    canvas.width = STREAM_WIDTH;
                    canvas.height = STREAM_HEIGHT;
                    const ctx = canvas.getContext("2d");

                    function drawFrame() {
                        const scaleHeight = video.videoHeight - cropTop;
                        ctx.drawImage(video, 0, cropTop, video.videoWidth, scaleHeight, 0, 0, STREAM_WIDTH, STREAM_HEIGHT);
                        requestAnimationFrame(drawFrame);
                    }
                    drawFrame();

                    const recorder = new MediaRecorder(canvas.captureStream(60), {
                        mimeType: "video/webm; codecs=vp9,opus",
                        videoBitsPerSecond: 5_000_000, // 5 Mbps
                        audioBitsPerSecond: 128_000,   // 128 kbps
                    });

                    recorder.ondataavailable = (event) => {
                        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
                            ws.send(event.data);
                        }
                    };

                    // 250ms chunks → keyframes ~4s
                    recorder.start(1000);
                    console.log("[browser] Recording started (canvas)");
                } catch (err) {
                    console.error("[browser] Screen capture failed:", err);
                }
            };
        },
        { STREAMER_WS, STREAM_WIDTH, STREAM_HEIGHT }
    );

    console.log("⏳ Waiting for screen-share permission...");
})();
