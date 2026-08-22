from pathlib import Path
import sys

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Lets the backend use your existing frontend/getHandSign.py file.
frontend_folder = Path(__file__).resolve().parents[1] / "frontend"
sys.path.insert(0, str(frontend_folder))

from getHandSign import getHandSign

app = FastAPI()

# The frontend and backend are on different ports.
# This allows requests from either frontend port while developing.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_methods=["POST"],
    allow_headers=["Content-Type"]
)

class Landmark(BaseModel):
    x: float
    y: float
    z: float

class HandRequest(BaseModel):
    points: list[Landmark]

@app.post("/classify")
def classify(hand: HandRequest):
    if len(hand.points) != 21:
        raise HTTPException(
            status_code=422,
            detail="Expected 21 hand points."
        )

    sign = getHandSign(hand)
    return {"sign": sign}