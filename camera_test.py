from PyQt5.QtWidgets import QWidget, QLabel, QVBoxLayout, QApplication
from PyQt5.QtGui import QImage, QPixmap
from PyQt5.QtCore import Qt, QTimer
from picamera2 import Picamera2, Preview
import cv2
import numpy as np
import imutils
import time
from imutils import face_utils
import dlib

class CameraWidget(QWidget):
    def __init__(self):
        super().__init__()

        self.detecting = False
        self.camera = None
        self.yawn_count = 0
        self.yawn_start_time = None
        self.yawn_reset_time = time.time()

        # Initialize face detector and landmark predictor
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")  # Make sure you have this file

        # Thresholds and other parameters
        self.thresh = 0.25
        self.alert_duration = 2  # seconds
        self.mouth_thresh = 0.5  # Adjust if needed

        # 3D model points for head pose estimation
        self.model_points = np.array([
            (0.0, 0.0, 0.0),  # Nose tip
            (0.0, -330.0, -65.0),  # Chin
            (-225.0, 170.0, -135.0),  # Left eye left corner
            (225.0, 170.0, -135.0),  # Right eye right corner
            (-150.0, -150.0, -125.0),  # Left Mouth corner
            (150.0, -150.0, -125.0)  # Right mouth corner
        ])

        self.image_label = QLabel(self)
        self.image_label.setAlignment(Qt.AlignCenter)

        self.status_label = QLabel("Status: Ready", self)
        self.status_label.setAlignment(Qt.AlignCenter)

        layout = QVBoxLayout(self)
        layout.addWidget(self.image_label)
        layout.addWidget(self.status_label)

        self.timer = QTimer(self)
        self.timer.timeout.connect(self.update_frame)

    def start_detection(self):
        self.status_label.setText("Status: Detecting Eyes and Yawns in Real-time")
        self.detecting = True

        # Initialize Picamera2
        self.camera = Picamera2()
        self.camera.configure(self.camera.create_preview_configuration())
        self.camera.start()

        time.sleep(1)  # Allow the camera to warm up

        self.timer.start(30)  # Update frame every 30ms

    def stop_detection(self):
        self.detecting = False
        if self.camera:
            self.camera.stop()
            self.camera = None
        self.timer.stop()
        self.status_label.setText("Status: Stopped")

    def update_frame(self):
        if self.detecting and self.camera:
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
                        self.status_label.setText(f"Status: ALERT! Eyes Closed, Yawn Count: {self.yawn_count}")
                        # alert_sound.play()  # You'll need to implement sound playback
                    else:
                        self.start_time = None
                        self.status_label.setText(f"Status: Eyes Open, Yawn Count: {self.yawn_count}")

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

                if self.yawn_count >= 4:
                    self.status_label.setText("Status: ALERT! Yawning Detected 4 Times")
                    # yawn_alert_sound.play()  # Implement sound playback
                    self.yawn_count = 0

            else:
                self.status_label.setText("Status: No face detected. Please adjust your position.")

            # Display the resulting frame
            height, width, channel = frame.shape
            bytes_per_line = 3 * width
            q_image = QImage(frame.data, width, height, bytes_per_line, QImage.Format_RGB888).rgbSwapped()
            pixmap = QPixmap.fromImage(q_image)
            self.image_label.setPixmap(pixmap)

    def detect(self, gray, up_sample_num_times):
        subjects = self.detector(gray, up_sample_num_times)
        return subjects

    def predict(self, gray, subject):
        shape = self.predictor(gray, subject)
        return shape

    def eye_aspect_ratio(self, eye):
        # Compute the euclidean distances between the two sets of
        # vertical eye landmarks (x, y)-coordinates
        A = np.linalg.norm(eye[1] - eye[5])
        B = np.linalg.norm(eye[2] - eye[4])

        # Compute the euclidean distance between the horizontal
        # eye landmark (x, y)-coordinates
        C = np.linalg.norm(eye[0] - eye[3])

        # Compute the eye aspect ratio
        ear = (A + B) / (2.0 * C)

        # Return the eye aspect ratio
        return ear

    def mouth_aspect_ratio(self, mouth):
        # Compute the euclidean distances between the two sets of
        # vertical mouth landmarks (x, y)-coordinates
        A = np.linalg.norm(mouth[2] - mouth[10])  # 51, 59
        B = np.linalg.norm(mouth[4] - mouth[8])  # 53, 57

        # Compute the euclidean distance between the horizontal
        # mouth landmark (x, y)-coordinates
        C = np.linalg.norm(mouth[0] - mouth[6])  # 49, 55

        # Compute the mouth aspect ratio
        mar = (A + B) / (2.0 * C)

        # Return the mouth aspect ratio
        return mar

    def draw_marks(self, image, marks, color=(0, 255, 0)):
        for mark in marks:
            cv2.circle(image, (mark[0], mark[1]), 2, color, -1, cv2.LINE_AA)


if __name__ == '__main__':
    app = QApplication([])
    camera_widget = CameraWidget()
    camera_widget.show()
    app.exec_()
