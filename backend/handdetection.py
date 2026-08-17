import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
from pathlib import Path


model_path = Path(__file__).parent / "hand_landmarker.task"

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

# Creating a hand landmarker instance with the image mode:

options = HandLandmarkerOptions(base_options=BaseOptions(model_asset_path = str(model_path)), 
                                running_mode = VisionRunningMode.VIDEO, num_hands=1, 
                                min_hand_detection_confidence=0.5, 
                                min_tracking_confidence=0.5)


# Opening the webcamera

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error")
    exit()

# This will create mediapipe hand landmarker
with HandLandmarker.create_from_options(options) as landmarker:
    frame_timestamp_ms = 0
    while True:
        success, frame = cap.read()
        if not success:
            print("Error")
            break

        # Converting bgr to rgb because opencv uses bgr but mediapipe accepts the input in rgb
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Need to convert opencv frame to mediapipe image 
        mp_image = mp.Image(image_format= mp.ImageFormat.SRGB, data=rgb_frame)

        # It detects hands 
        results = landmarker.detect_for_video(mp_image, frame_timestamp_ms)
        frame_timestamp_ms += 33

        # This draws the detected landmarks
        if results.hand_landmarks:
            for hand_landmarks in results.hand_landmarks:

                # Draws all 21 landmarks
                for landmark in hand_landmarks:
                    x = int(landmark.x * frame.shape[1])
                    y = int(landmark.y * frame.shape[0])

                    cv2.circle(frame, (x,y), 5, (0, 255, 0), -1)
                    # Draws connection between those landmarks
                    connections = [(0, 1), (1, 2), (2, 3), (3, 4),
                                   (0, 5), (5, 6), (6, 7), (7, 8),
                                   (5, 9), (9, 10), (10, 11), (11, 12),
                                   (9, 13), (13, 14), (14, 15), (15, 16),
                                   (13, 17), (17, 18), (18, 19), (19, 20),
                                   (0, 17)]
                    for start, end in connections:
                        x1 = int(hand_landmarks[start].x * frame.shape[1])
                        y1 = int(hand_landmarks[start].y * frame.shape[0])
                        x2 = int(hand_landmarks[end].x * frame.shape[1])
                        y2 = int(hand_landmarks[end].y * frame.shape[0])
                        cv2.line(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        
        # Displays the camera 
        cv2.imshow("MediaPipe Hand Detection", frame)
        # Allows to quit ("q")
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

cap.release()
cv2.destroyAllWindows()





