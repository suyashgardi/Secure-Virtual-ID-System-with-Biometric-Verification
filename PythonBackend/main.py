from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import face_recognition
import cv2
import numpy as np
import helper as hp
import json
import uvicorn
import urllib.request
import os

app = FastAPI()




# "/ws/liveness" ws here is just like how we use api in api and liveness is actual endpoint  
@app.websocket("/ws/liveness")
async def liveness_endpoint(websocket: WebSocket):
    await websocket.accept() # this line accepts connection request sent by reaact 
   

    session_id_descriptor = None
    frame_count = 0
    match_attempts = 0
    MAX_ATTEMPTS = 60 
    
    not_registering= None
    has_blinked = False
    blink_frames = 0
    EAR_THRESHOLD = 0.22 

    try:
        while True:
            raw_data = await websocket.receive_text() #websocket only accepts text data & this recieves the text 
            data = json.loads(raw_data)
            message_type = data.get("type")

      
            if message_type == "init":
                print("Received uploaded image. Analyzing ID Photo...")
                id_image = hp.decode_base64_image(data.get("id_photo"))
                not_registering=data.get("not_registering")
                
                if id_image is None:
                    await websocket.send_json({"status": "failed", "message": "Corrupted ID image format."})
                    continue
                balanced_id = hp.balance_lighting(id_image)
                rgb_id_image = cv2.cvtColor(balanced_id, cv2.COLOR_BGR2RGB)
                encodings = face_recognition.face_encodings(rgb_id_image)
                

                if len(encodings) == 0:
                    await websocket.send_json({"status": "failed", "message": "No face found on the ID card."})
                    continue
                elif len(encodings) > 1:
                    await websocket.send_json({"status": "failed", "message": "Multiple faces detected on ID."})
                    continue
                

                session_id_descriptor = encodings[0]
                
                if not not_registering:
                
                    try:
                        print("Checking database for duplicate faces...")
                    
                        NODE_API_URL = os.environ.get("NODE_API_URL", "http://localhost:5000")
                        req = urllib.request.Request(f"{NODE_API_URL}/api/preusers")
                        with urllib.request.urlopen(req) as response:
                            existing_users = json.loads(response.read().decode())
                            
                            known_encodings = []
                            for user in existing_users:
                                arr = user.get("T28BitArr")
                                if arr:
                                    known_encodings.append(np.array(arr))
                            
                            if known_encodings:
                        
                                matches = face_recognition.compare_faces(known_encodings, session_id_descriptor, tolerance=0.45)
                                
                                if True in matches:
                                    print("Duplicate face detected! Blocking registration.")
                                    await websocket.send_json({
                                        "status": "failed",
                                        "message": "SECURITY ALERT: This face is already registered in the system."
                                        
                                    })
                                    continue 
                    except Exception as e:
                        print(f"Warning: Could not connect to Node.js database: {e}")

                await websocket.send_json({
                    "status": "processing",
                    "message": "ID verified. Please look directly at the camera..."
                })

         
            elif message_type == "frame":
                frame_count += 1
                
      
                if frame_count % 3 == 0 and session_id_descriptor is not None:
                    match_attempts += 1
                    
                    if match_attempts > MAX_ATTEMPTS:
                        await websocket.send_json({
                            "status": "failed",
                            "message": "Verification timeout. Please refresh and try again."
                        })
                        break 
                        
                    live_frame = hp.decode_base64_image(data.get("live_photo"))
                    if live_frame is None:
                        continue 
                    balanced_live = hp.balance_lighting(live_frame)
                    rgb_live_frame = cv2.cvtColor(balanced_live, cv2.COLOR_BGR2RGB)
                    

                    live_encodings = face_recognition.face_encodings(rgb_live_frame)
                    
                
                    if len(live_encodings) > 1:
                        await websocket.send_json({"status": "processing", "message": "Multiple faces detected! Please ensure you are alone."})
                        continue
                        
                    elif len(live_encodings) == 1:

                        landmarks_list = face_recognition.face_landmarks(rgb_live_frame)
                        
                        if landmarks_list and not has_blinked:
                            left_eye = landmarks_list[0]['left_eye']
                            right_eye = landmarks_list[0]['right_eye']
                            
                            leftEAR = hp.eye_aspect_ratio(left_eye)
                            rightEAR = hp.eye_aspect_ratio(right_eye)
                            ear = (leftEAR + rightEAR) / 2.0
                            
                            if ear < EAR_THRESHOLD:
                                blink_frames += 1 
                            else:
                                if blink_frames >= 1: 
                                    has_blinked = True 
                                blink_frames = 0
                                

                        live_descriptor = live_encodings[0]
                        matches = face_recognition.compare_faces([session_id_descriptor], live_descriptor, tolerance=0.45)
                        
                        if matches[0]:
                            if has_blinked:

                                print("Match & Liveness Success! Sending array to Node.js.")
                                await websocket.send_json({
                                    "status": "success",
                                    "message": "Biometrics & Liveness Verified! Completing process...",
                                    "descriptor": session_id_descriptor.tolist()
                                })
                                break 
                            else:
                                await websocket.send_json({
                                    "status": "processing",
                                    "message": "Face matched. Please BLINK to prove you are human."
                                })
                        else:
                            await websocket.send_json({
                                "status": "processing",
                                "message": "Face does not match ID."
                            })
                    else:
                        await websocket.send_json({"status": "processing", "message": "No face detected in camera."})

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        print(f"Server Error: {e}")
    finally:
        print("WebSocket Connection Closed.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
