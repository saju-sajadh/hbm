import sys
from PyQt5.QtWidgets import QApplication, QWidget, QLabel
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtCore import Qt, QTimer
from picamera2 import Picamera2, Preview
import cv2
import numpy as np
import imutils
import time
from playsound import playsound  # Import playsound for audio alerts
import dlib  # Import dlib for facial landmark detection
from scipy.spatial import distance as dist  # Import distance for EAR calculation
import face_recognition

class DrowsinessDetectionApp(QWidget):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Drowsiness Detection")
        self.setGeometry(100, 100, 640, 480)

        self.label = QLabel(self)
        self.label.setAlignment(Qt.AlignCenter)

        # Initialize drowsiness detection parameters
        self.thresh = 0.25  # Eye aspect ratio threshold
        self.alert_duration = 2.0  # Duration of eye closure to trigger alert
        self.mouth_thresh = 0.50  # Mouth aspect ratio threshold
        self.start_time = None
        self.yawn_start_time = None
        self.yawn_count = 0
        self.yawn_reset_time = time.time()
        self.detecting = False

        # Load face detection and landmark prediction models 
        self.detector = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        self.predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")  # Example landmark predictor

        # Define 3D model points for head pose estimation
        self.model_points = np.array([
            (0.0, 0.0, 0.0),  # Nose tip
            (0.0, -330.0, -65.0),  # Chin
            (-225.0, 170.0, -135.0),  # Left eye left corner
            (225.0, 170.0, -135.0),  # Right eye right corner
            (-150.0, -150.0, -125.0),  # Left Mouth corner
            (150.0, -150.0, -125.0)  # Right mouth corner
        ])

        self.timer = QTimer()
        self.timer.timeout.connect(self.update_frame)
        self.timer.start(30)  # Update frame every 30 milliseconds

        # Start the camera and detection
        self.start_detection()

    def start_detection(self):
        self.detecting = True
        self.camera = Picamera2()
        self.camera.configure(self.camera.create_preview_configuration())
        self.camera.start()
        time.sleep(1)

    def stop_detection(self):
        self.detecting = False
        self.camera.stop()

    def update_frame(self):
        if self.detecting:
            frame = self.camera.capture_array()
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
                        # Use playsound for audio alert
                        playsound("yawn_alert.mp3")  # Replace with your alert sound file
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
                        # Use playsound for audio alert
                        playsound("alert_sound.mp3")  # Replace with your alert sound file
                else:
                    self.start_time = None

                # Head Pose Estimation
                image_points = np.array([
                    shape[30],  # Nose tip
                    shape[8],  # Chin
                    shape[36],  # Left eye left corner
                    shape[45],  # Right eye right corner
                    shape[48],  # Left Mouth corner
                    shape[54]  # Right mouth corner
                ], dtype='double')

                size = frame.shape
                focal_length = size[1]
                center = (size[1] // 2, size[0] // 2)
                camera_matrix = np.array([[focal_length, 0, center[0]],
                                         [0, focal_length, center[1]],
                                         [0, 0, 1]], dtype='double')

                dist_coeffs = np.zeros((4, 1))

                # Solve PnP
                success, rotation_vector, translation_vector = cv2.solvePnP(self.model_points, image_points, camera_matrix,
                                                                          dist_coeffs)

                (nose_end_point2D, _) = cv2.projectPoints(np.array([(0.0, 0.0, 1000.0)]), rotation_vector,
                                                        translation_vector, camera_matrix, dist_coeffs)
                p1 = (int(image_points[0][0]), int(image_points[0][1]))
                p2 = (int(nose_end_point2D[0][0][0]), int(nose_end_point2D[0][0][1]))
                cv2.line(frame, p1, p2, (255, 0, 0), 2)

            else:
                pass  # No face detected

            # Display the resulting frame in the PyQt label
            self.display_frame(frame)

    def display_frame(self, frame):
        height, width, channel = frame.shape
        bytes_per_line = 3 * width
        q_image = QImage(frame.data, width, height, bytes_per_line, QImage.Format_RGB888).rgbSwapped()
        pixmap = QPixmap.fromImage(q_image)
        self.label.setPixmap(pixmap)

    def detect(self, gray, i):
        # Implement your face detection logic here using self.detector
        # This function should return a list of detected faces
        rects = self.detector.detectMultiScale(gray, scaleFactor=1.1, 
                                         minNeighbors=5, minSize=(30, 30),
                                         flags=cv2.CASCADE_SCALE_IMAGE)
        return rects

    def predict(self, gray, rect):
        # Implement your facial landmark prediction logic here using self.predictor
        # This function should return the facial landmarks for the given face rectangle
        shape = self.predictor(gray, dlib.rectangle(int(rect[0]), int(rect[1]), int(rect[0] + rect[2]), int(rect[1] + rect[3])))
        return shape

    def eye_aspect_ratio(self, eye):
        # Compute the euclidean distances between the two sets of
        # vertical eye landmarks (x, y)-coordinates
        A = dist.euclidean(eye[1], eye[5])
        B = dist.euclidean(eye[2], eye[4])

        # Compute the euclidean distance between the horizontal
        # eye landmark (x, y)-coordinates
        C = dist.euclidean(eye[0], eye[3])

        # Compute the eye aspect ratio
        ear = (A + B) / (2.0 * C)

        # Return the eye aspect ratio
        return ear

    def mouth_aspect_ratio(self, mouth):
        # Compute the euclidean distances between the two sets of
        # vertical mouth landmarks (x, y)-coordinates
        A = dist.euclidean(mouth[2], mouth[10])  # 51, 59
        B = dist.euclidean(mouth[4], mouth[8])  # 53, 57

        # Compute the euclidean distance between the horizontal
        # mouth landmark (x, y)-coordinates
        C = dist.euclidean(mouth[0], mouth[6])  # 49, 55

        # Compute the mouth aspect ratio
        mar = (A + B) / (2.0 * C)

        # Return the mouth aspect ratio
        return mar

    def draw_marks(self, image, shape):
        for (x, y) in shape:
            cv2.circle(image, (x, y), 1, (0, 0, 255), -1)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    window = DrowsinessDetectionApp()
    window.show()
    sys.exit(app.exec_())
