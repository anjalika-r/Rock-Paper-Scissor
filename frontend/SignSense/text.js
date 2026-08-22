import { handDetectionSetup, handDetection } from "./handdetection.js";

const camera = document.getElementById('camera');
const signOutput = document.getElementById("sign-output");
const API_URL = "http://127.0.0.1:8000/classify";

const userScoreEl = document.getElementById("user-score");
const botScoreEl = document.getElementById("bot-score");
const countdownEl = document.getElementById("countdown");
const gameInstructionEl = document.getElementById("game-instruction");
const gameResultsEl = document.getElementById("game-results");
const userMoveEl = document.getElementById("user-move");
const botMoveEl = document.getElementById("bot-move");
const winnerAnnouncementEl = document.getElementById("winner-announcement");

let lastRequestTime = 0;
let requestInFlight = false;
const recentSigns = [];
const REQUIRED_MATCHES = 3;
let acceptedSign = null;

let gameState = "IDLE"; // "IDLE", "COUNTDOWN", "EVALUATE", "RESULT"
let userScore = 0;
let botScore = 0;
let countdownVal = 3;
let countdownInterval = null;
let lastRoundEndTime = 0;

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        camera.srcObject = stream;
    })
    .catch(error => {
        console.error('Error accessing the camera:', error);
    });

function triggerCountdown() {
    if (gameState !== "IDLE" && gameState !== "RESULT") return;
    
    gameState = "COUNTDOWN";
    countdownVal = 3;
    countdownEl.textContent = countdownVal;
    countdownEl.classList.remove("hidden");
    gameResultsEl.classList.add("hidden");
    gameInstructionEl.textContent = "Get ready!";
    
    countdownInterval = setInterval(() => {
        countdownVal--;
        if (countdownVal > 0) {
            countdownEl.textContent = countdownVal;
        } else {
            clearInterval(countdownInterval);
            countdownEl.classList.add("hidden");
            gameState = "EVALUATE";
            evaluateRound();
        }
    }, 1000);
}

function evaluateRound() {
    const validMoves = ["rock", "paper", "scissors"];
    const userMove = acceptedSign;
    const botMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    userMoveEl.textContent = `Your Move: ${userMove ? userMove.toUpperCase() : "None"}`;
    botMoveEl.textContent = `Bot Move: ${botMove.toUpperCase()}`;
    
    if (!userMove || !validMoves.includes(userMove)) {
        winnerAnnouncementEl.textContent = "No valid move detected! Try again.";
        winnerAnnouncementEl.style.color = "var(--danger-color)";
    } else {
        if (userMove === botMove) {
            winnerAnnouncementEl.textContent = "It's a Tie!";
            winnerAnnouncementEl.style.color = "var(--accent-color)";
        } else if (
            (userMove === "rock" && botMove === "scissors") ||
            (userMove === "paper" && botMove === "rock") ||
            (userMove === "scissors" && botMove === "paper")
        ) {
            userScore++;
            userScoreEl.textContent = userScore;
            winnerAnnouncementEl.textContent = "You Win!";
            winnerAnnouncementEl.style.color = "var(--success-color)";
        } else {
            botScore++;
            botScoreEl.textContent = botScore;
            winnerAnnouncementEl.textContent = "Bot Wins!";
            winnerAnnouncementEl.style.color = "var(--danger-color)";
        }
    }
    
    gameResultsEl.classList.remove("hidden");
    gameInstructionEl.textContent = "Show Thumbs-Up to Play Again!";
    gameState = "RESULT";
    lastRoundEndTime = performance.now();
}

function updateStableSign(sign) {
    if (!sign || sign === "unknown") {
        recentSigns.length = 0;
        acceptedSign = null;
        signOutput.textContent = "Show a clear hand sign.";
        return;
    }

    recentSigns.push(sign);

    if (recentSigns.length > REQUIRED_MATCHES) {
        recentSigns.shift();
    }

    const isStable =
        recentSigns.length === REQUIRED_MATCHES &&
        recentSigns.every(recentSign => recentSign === sign);

    if (isStable) {
        acceptedSign = sign;
        signOutput.textContent = `Detected sign: ${sign.toUpperCase()}`;
        
        if (sign === "thumbs-up") {
            if (gameState === "IDLE" || (gameState === "RESULT" && performance.now() - lastRoundEndTime > 1500)) {
                triggerCountdown();
            }
        }
    } else if (acceptedSign === null) {
        signOutput.textContent = "Checking hand sign...";
    }
}

async function classifyLandmarks(landmarks) {
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
            classifyLandmarks(landmarks);
        }
        requestAnimationFrame(detectionLoop);
    }
    detectionLoop();
}

startDetection();
