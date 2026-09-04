import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
// To start- run python -m http.server 5500  because python starts a tiny local webserver. 
// http://localhost:5500   paste this on the browser.  

let handLandmarker = null;
let videoTime = -1;


/**
 * This will load mediapipe and the hand landmark model. Code available in documentation. 
 */

export async function handDetectionSetup() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, 
        {
            baseOptions: {
                modelAssetPath: "../detection_model/hand_landmarker.task"
            },

            runningMode: "VIDEO", numHands: 1, minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5
        }
    );
    console.log("Ready for hand detection");
}

/**
 * This function detects the hand in the video and return the 21 landmarks.
 */

export function handDetection(camera) {
    // if handLandmarker does not exist or data for the current frame is not ready
    if ((!handLandmarker) || (camera.readyState < 2)) {
        return null;
    }
    // If the current video timestamp is the same as the timestamp we processed previously,
    //  this is still the same frame. Do not run MediaPipe again.
    if (camera.currentTime == videoTime) {
        return null;
    }
    videoTime = camera.currentTime;
    const results = handLandmarker.detectForVideo(camera, performance.now());
    if (results.landmarks.length == 0) {
        return null;
    }
    // an array of 21 points
    return results.landmarks[0];



    
}


