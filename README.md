# Rock-Paper-Scissor

## To start the program: 
```bash
python -m http.server 5500
```
Python starts a tiny local server. 

## Paste this on the browser: 
```bash 
http://localhost:5500/frontend/SignSense/
``` 
This will open start the camera and you can see the hand landmarks printed in the console.


## Python mediapipe
- If you wanna test python mediapipe version sitting in the backend, you will have to install required libraries and dependecies. 

```bash 
python -m pip install opencv-python==5.0.0 mediapipe==1.0.1 numpy==2.5.1
```

- Once you have them installed, you can run 
```bash 
python handdetection.py 
``` 
- It will start the camera and you will be able to see a wireframe on your hand. 

But make sure you are in the correct directory everytime you run these commands. 

