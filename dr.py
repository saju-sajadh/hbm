import cv2
import imutils
from imutils import face_utils
import time
from scipy.spatial import distance
import dlib
import pygame
import tkinter as tk
from tkinter import filedialog
from PIL import Image, ImageTk
import numpy as np
from picamera2 import Picamera2

# Initialize pygame mixer for sounds
pygame.mixer.init()
#alert_sound = pygame.mixer.Sound('beep-warning-6387.mp3')
#yawn_alert_sound = pygame.mixer.Sound('yawn-alert.mp3')
picam2 = Picamera2()

class DrowsinessDetectionApp:
    def __init__(self, window):
        self.window = window
        self.window.title("Drowsiness Detection Program")
        
        # Load Dlib models for face detection and landmark prediction
        self.detect = dlib.get_frontal_face_detector()
        self.predict = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
        
        # Detection parameters
        self.alert_duration = 1.0  # Duration for alert
        self.thresh = 0.22  # Eye Aspect Ratio threshold
        self.mouth_thresh = 0.7  # Increased Mouth Aspect Ratio threshold for yawning
        self.start_time = None
        self.yawn_start_time = None
        self.yawn_count = 0
        self.yawn_reset_time = time.time()  # Reset time for yawns
        self.detecting = False
        
        # For tracking head position
        self.last_head_position = None
        
        # 3D Model points for head pose estimation
        self.model_points = np.array([
            (0.0, 0.0, 0.0),          # Nose tip
            (0.0, -330.0, -65.0),     # Chin
            (-225.0, 170.0, -135.0),  # Left eye left corner
            (225.0, 170.0, -135.0),   # Right eye right corner
            (-150.0, -150.0, -125.0), # Left Mouth corner
            (150.0, -150.0, -125.0)   # Right mouth corner
        ], dtype='double')

        self.create_widgets()
    
    def create_widgets(self):
        self.canvas = tk.Canvas(self.window, width=640, height=480)
        self.canvas.pack()
        
        self.btn_upload = tk.Button(self.window, text="Upload Image to Predict", command=self.upload_image)
        self.btn_upload.pack(pady=10)
        
        self.btn_start = tk.Button(self.window, text="Start Detection", command=self.start_detection)
        self.btn_start.pack(side=tk.LEFT, padx=10, pady=10)
        
        self.btn_stop = tk.Button(self.window, text="Stop Detection", command=self.stop_detection, state=tk.DISABLED)
        self.btn_stop.pack(side=tk.LEFT, padx=10, pady=10)
        
        self.lbl_status = tk.Label(self.window, text="Status: Waiting for Image or Start", fg="blue")
        self.lbl_status.pack(side=tk.BOTTOM, fill=tk.X, padx=10, pady=10)

    def upload_image(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image files", ".jpg;.png;*.jpeg")])
        if file_path:
            self.detect_from_image(file_path)
    
    def preprocess_frame(self, frame):
        # Convert to grayscale and apply CLAHE for contrast
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)
        frame = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        return frame
    
    def detect_from_image(self, image_path):
        frame = cv2.imread(image_path)
        if frame is None:
            self.lbl_status.config(text="Status: Invalid Image File", fg="red")
            return
        
        frame = imutils.resize(frame, width=640)
        frame = self.preprocess_frame(frame)  
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        subjects = self.detect(gray, 0)
        if subjects:
            subject = subjects[0]  
            shape = self.predict(gray, subject)
            shape = face_utils.shape_to_np(shape)
            
            leftEye = shape[36:42]
            rightEye = shape[42:48]
            self.draw_eye_rectangles(frame, leftEye)
            self.draw_eye_rectangles(frame, rightEye)
            leftEAR = self.eye_aspect_ratio(leftEye)
            rightEAR = self.eye_aspect_ratio(rightEye)
            ear = (leftEAR + rightEAR) / 2.0
            
            if ear < self.thresh:
                self.lbl_status.config(text="Prediction: Eyes Closed in Image", fg="red")
            else:
                self.lbl_status.config(text="Prediction: Eyes Open in Image", fg="green")
        else:
            self.lbl_status.config(text="Status: No face detected in Image", fg="orange")
        
        self.display_frame(frame)

    def draw_eye_rectangles(self, frame, eye_points):  
        for i in range(len(eye_points) - 1):
            cv2.rectangle(frame, tuple(eye_points[i]), tuple(eye_points[i+1]), (0, 255, 0), 2)
        cv2.rectangle(frame, tuple(eye_points[-1]), tuple(eye_points[0]), (0, 255, 0), 2)
        
    def start_detection(self):
        self.lbl_status.config(text="Status: Detecting Eyes and Yawns in Real-time", fg="green")
        self.btn_start.config(state=tk.DISABLED)
        self.btn_stop.config(state=tk.NORMAL)
        self.detecting = True
        picam2.start()
        
        while self.detecting:
            frame = picam2.capture_array()
            frame = imutils.resize(frame, width=640)
            frame = self.preprocess_frame(frame)  
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
            
            self.display_frame(frame)
            self.window.update()
        
        picam2.stop()
    
    def stop_detection(self):
        self.detecting = False
        self.btn_start.config(state=tk.NORMAL)
        self.btn_stop.config(state=tk.DISABLED)
        self.lbl_status.config(text="Status: Detection Stopped", fg="blue")

    def eye_aspect_ratio(self, eye):
        A = distance.euclidean(eye[1], eye[5])  # Vertical eye
        B = distance.euclidean(eye[2], eye[4])  # Vertical eye
        C = distance.euclidean(eye[0], eye[3])  # Horizontal eye
        ear = (A + B) / (2.0 * C)
        return ear

    def mouth_aspect_ratio(self, mouth):
        A = distance.euclidean(mouth[2], mouth[10])  # Vertical mouth
        B = distance.euclidean(mouth[4], mouth[8])   # Vertical mouth
        C = distance.euclidean(mouth[0], mouth[6])   # Horizontal mouth
        mar = (A + B) / (2.0 * C)
        return mar

    def draw_marks(self, frame, points):
        for (x, y) in points:
            cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)

    def display_frame(self, frame):
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img = Image.fromarray(frame)
        imgtk = ImageTk.PhotoImage(image=img)
        self.canvas.create_image(0, 0, anchor=tk.NW, image=imgtk)
        self.canvas.imgtk = imgtk

if __name__ == "__main__":
    root = tk.Tk()
    app = DrowsinessDetectionApp(root)
    root.mainloop()
