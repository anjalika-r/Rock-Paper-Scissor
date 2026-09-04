import { handDetectionSetup, handDetection } from "./handdetection.js";

const camera = document.getElementById('camera');
const signOutput = document.getElementById("sign-output");
const API_URL = "http://127.0.0.1:8000/classify";

let lastRequestTime = 0;
let requestInFlight = false;
const recentSigns = [];
const REQUIRED_MATCHES = 3;
let acceptedSign = null;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        camera.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing the camera:', error);
    });

function updateStableSign(sign) {
    // The current getHandSign() may return null for an unrecognised hand.
    if (!sign || sign === "unknown") {
        recentSigns.length = 0;
        acceptedSign = null;
        signOutput.textContent = "Show a clear hand sign.";
        return;
    }

    recentSigns.push(sign);

    // Keep only the newest three results.
    if (recentSigns.length > REQUIRED_MATCHES) {
        recentSigns.shift();
    }

    // Only accept a sign when the last three results are identical.
    const isStable =
        recentSigns.length === REQUIRED_MATCHES &&
        recentSigns.every(recentSign => recentSign === sign);

    if (isStable) {
        acceptedSign = sign;
        signOutput.textContent = `Detected sign: ${sign}`;
    } else if (acceptedSign === null) {
        signOutput.textContent = "Checking hand sign...";
    }
}

async function classifyLandmarks(landmarks) {
    // The detection loop runs very quickly.
    // This prevents sending too many requests to Python.
    if (requestInFlight || performance.now() - lastRequestTime < 200) {
        return;
    }

    requestInFlight = true;
    lastRequestTime = performance.now();

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                points: landmarks
            })
        });

        if (!response.ok) {
            throw new Error("Backend error");
        }

        const result = await response.json();
        updateStableSign(result.sign);
    } catch (error) {
        signOutput.textContent = "Cannot connect to backend.";
        console.error(error);
    } finally {
        requestInFlight = false;
    }
}

async function startDetection() {
    await handDetectionSetup();
    function detectionLoop() {
        const landmarks = handDetection(camera);
        if (landmarks) {
            console.log("Hand detected successfully.");
            console.log(landmarks);

            classifyLandmarks(landmarks);
        }
        requestAnimationFrame(detectionLoop);
    }
    detectionLoop();
}
startDetection();
