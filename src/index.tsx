import './index.scss';
import { render } from 'solid-js/web';
import 'solid-devtools';
import "beercss";
import App from './App';

const root = document.getElementById('root');

function startRecorder() {
  const ws = new WebSocket("ws://localhost:3001");

  ws.onopen = () => {
    console.log("✅ Connected to streaming server");

    navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
      audio: true
    }).then((stream) => {
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp8,opus" // browser H.264 might not always work
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      recorder.start(500); // send chunks every 0.5s for lower latency
      console.log("🎬 Recording started");
    }).catch(err => {
      console.error("❌ Failed to get display media:", err);
    });
  };
}

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// start recorder shortly after render
setTimeout(startRecorder, 1000);

render(() => <App />, root!);
