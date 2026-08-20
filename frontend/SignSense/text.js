import { handDetectionSetup, handDetection } from "./handdetection.js";

const camera = document.getElementById('camera');
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        camera.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing the camera:', error);
    });


async function startDetection() {
    await handDetectionSetup();
    function detectionLoop() {
        const landmarks = handDetection(camera);
        if (landmarks) {
            console.log("Hand detected successfully.");
            console.log(landmarks);
        }
        requestAnimationFrame(detectionLoop);
    }
    detectionLoop();
}
startDetection();
