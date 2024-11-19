from picamera2 import Picamera2, Preview
import cv2
import numpy as np
import imutils
import time

def start_detection(self):
    self.lbl_status.config(text="Status: Detecting Eyes and Yawns in Real-time", fg="green")
    self.btn_start.config(state=tk.DISABLED)
    self.btn_stop.config(state=tk.NORMAL)
    self.detecting = True
    
    # Initialize Picamera2
    self.camera = Picamera2()
    self.camera.configure(self.camera.create_preview_configuration())
    self.camera.start()

    time.sleep(1)  # Allow the camera to warm up

    while self.detecting:
        # Capture a frame
        frame = self.camera.capture_array()
        
        # Resize and process the image
        frame = imutils.resize(frame, width=640)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        subjects = self.detect(gray, 0)
        if subjects:
            subject = subjects[0]  
            shape = self.predict(gray, subject)
            shape = face_utils.shape_to_np(shape)
            (x, y, w, h) = face_utils.rect_to_bb(subject)
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

            leftEye = shape[36:42]
            rightEye = shape[42:48]
            mouth = shape[48:68]
            
            leftEAR = self.eye_aspect_ratio(leftEye)
            rightEAR = self.eye_aspect_ratio(rightEye)
            ear = (leftEAR + rightEAR) / 2.0
            
            mar = self.mouth_aspect_ratio(mouth)
            
            self.draw_marks(frame, leftEye)  
            self.draw_marks(frame, rightEye)  
            self.draw_marks(frame, mouth)  

            # Yawn detection logic
            if mar > self.mouth_thresh:  
                if self.yawn_start_time is None:
                    self.yawn_start_time = time.time()
                elif time.time() - self.yawn_start_time >= 1.5:
                    self.yawn_count += 1
                    self.yawn_start_time = None
            else:
                self.yawn_start_time = None

            if time.time() - self.yawn_reset_time > 60:
                self.yawn_count = 0
                self.yawn_reset_time = time.time()

            if ear < self.thresh:
                if self.start_time is None:
                    self.start_time = time.time()
                elapsed_time = time.time() - self.start_time

                if elapsed_time >= self.alert_duration:
                    self.lbl_status.config(text=f"Status: ALERT! Eyes Closed, Yawn Count: {self.yawn_count}", fg="red")
                    alert_sound.play()
            else:
                self.start_time = None
                self.lbl_status.config(text=f"Status: Eyes Open, Yawn Count: {self.yawn_count}", fg="green")

            # Head Pose Estimation
            image_points = np.array([
                shape[30],     # Nose tip
                shape[8],      # Chin
                shape[36],     # Left eye left corner
                shape[45],     # Right eye right corner
                shape[48],     # Left Mouth corner
                shape[54]      # Right mouth corner
            ], dtype='double')

            size = frame.shape
            focal_length = size[1]
            center = (size[1] // 2, size[0] // 2)
            camera_matrix = np.array([[focal_length, 0, center[0]],
                                       [0, focal_length, center[1]],
                                       [0, 0, 1]], dtype='double')

            dist_coeffs = np.zeros((4, 1))

            # Solve PnP
            success, rotation_vector, translation_vector = cv2.solvePnP(self.model_points, image_points, camera_matrix, dist_coeffs)

            (nose_end_point2D, _) = cv2.projectPoints(np.array([(0.0, 0.0, 1000.0)]), rotation_vector, translation_vector, camera_matrix, dist_coeffs)
            p1 = (int(image_points[0][0]), int(image_points[0][1]))
            p2 = (int(nose_end_point2D[0][0][0]), int(nose_end_point2D[0][0][1]))
            cv2.line(frame, p1, p2, (255, 0, 0), 2)

            if self.yawn_count >= 4:
                self.lbl_status.config(text="Status: ALERT! Yawning Detected 4 Times", fg="red")
                yawn_alert_sound.play()  
                self.yawn_count = 0  

        else:
            self.lbl_status.config(text="Status: No face detected. Please adjust your position.", fg="orange")
        
        # Display the resulting frame
        self.display_frame(frame)
    
    self.camera.stop()  # Stop the camera when done
