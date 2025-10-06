"""
Computer Vision module for Cyber Face AI
Handles face detection, emotion recognition, and attention tracking
"""

import cv2
import numpy as np
from typing import Dict, List, Optional, Tuple, NamedTuple
from dataclasses import dataclass
from collections import deque
import asyncio
import logging

logger = logging.getLogger(__name__)

@dataclass
class FaceLandmarks:
    """Face landmarks data structure"""
    points: np.ndarray
    confidence: float
    bounding_box: Tuple[int, int, int, int]  # x, y, width, height

@dataclass
class EmotionResult:
    """Emotion detection result"""
    primary_emotion: str
    confidence: float
    all_emotions: Dict[str, float]
    timestamp: float
    face_landmarks: Optional[FaceLandmarks] = None

class AttentionMetrics(NamedTuple):
    """Attention tracking metrics"""
    focus_level: float  # 0-1
    gaze_direction: Tuple[float, float]  # x, y angles
    blink_rate: float
    head_pose: Tuple[float, float, float]  # pitch, yaw, roll

class FaceDetector:
    """Advanced face detection with MediaPipe integration"""
    
    def __init__(self):
        self.initialized = False
        self.face_mesh = None
        self.face_detection = None
        
    async def initialize(self):
        """Initialize MediaPipe models"""
        try:
            import mediapipe as mp
            
            self.mp_face_mesh = mp.solutions.face_mesh
            self.mp_face_detection = mp.solutions.face_detection
            self.mp_drawing = mp.solutions.drawing_utils
            
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            
            self.face_detection = self.mp_face_detection.FaceDetection(
                model_selection=0,
                min_detection_confidence=0.5
            )
            
            self.initialized = True
            logger.info("Face detector initialized successfully")
            
        except ImportError:
            logger.error("MediaPipe not available, falling back to OpenCV")
            await self._initialize_opencv_fallback()
    
    async def _initialize_opencv_fallback(self):
        """Fallback to OpenCV face detection"""
        try:
            # Load Haar cascade for face detection
            cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            self.face_cascade = cv2.CascadeClassifier(cascade_path)
            self.initialized = True
            logger.info("OpenCV face detector initialized")
        except Exception as e:
            logger.error(f"Failed to initialize face detection: {e}")
            raise
    
    async def detect_faces(self, frame: np.ndarray) -> List[FaceLandmarks]:
        """Detect faces and extract landmarks"""
        if not self.initialized:
            await self.initialize()
        
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        if self.face_mesh:
            return await self._detect_with_mediapipe(rgb_frame)
        else:
            return await self._detect_with_opencv(frame)
    
    async def _detect_with_mediapipe(self, rgb_frame: np.ndarray) -> List[FaceLandmarks]:
        """Detect faces using MediaPipe"""
        results = self.face_mesh.process(rgb_frame)
        landmarks_list = []
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                # Extract landmark points
                points = []
                for landmark in face_landmarks.landmark:
                    points.append([landmark.x, landmark.y, landmark.z])
                
                points = np.array(points)
                
                # Calculate bounding box
                h, w = rgb_frame.shape[:2]
                x_coords = points[:, 0] * w
                y_coords = points[:, 1] * h
                
                x_min, x_max = int(x_coords.min()), int(x_coords.max())
                y_min, y_max = int(y_coords.min()), int(y_coords.max())
                
                landmarks_list.append(FaceLandmarks(
                    points=points,
                    confidence=0.9,  # MediaPipe doesn't provide confidence per face
                    bounding_box=(x_min, y_min, x_max - x_min, y_max - y_min)
                ))
        
        return landmarks_list
    
    async def _detect_with_opencv(self, frame: np.ndarray) -> List[FaceLandmarks]:
        """Detect faces using OpenCV (fallback)"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(30, 30)
        )
        
        landmarks_list = []
        for (x, y, w, h) in faces:
            # For OpenCV, we don't have detailed landmarks
            # Create a simplified landmark set
            landmarks_list.append(FaceLandmarks(
                points=np.array([[x, y], [x+w, y], [x+w, y+h], [x, y+h]]),
                confidence=0.7,
                bounding_box=(x, y, w, h)
            ))
        
        return landmarks_list

class EmotionDetector:
    """Advanced emotion detection with ensemble models"""
    
    def __init__(self, config):
        self.config = config
        self.emotions = config.emotions
        self.confidence_threshold = config.confidence_threshold
        self.smoothing_buffer = deque(maxlen=config.smoothing_window)
        
        # Model placeholders (to be loaded)
        self.primary_model = None
        self.backup_model = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize emotion detection models"""
        try:
            # Try to load TensorFlow model first
            await self._load_tensorflow_model()
        except Exception as e:
            logger.warning(f"TensorFlow model failed to load: {e}")
            try:
                # Fallback to OpenCV/traditional CV
                await self._load_opencv_model()
            except Exception as e2:
                logger.error(f"All emotion models failed to load: {e2}")
                # Use rule-based fallback
                await self._load_rule_based_model()
        
        self.initialized = True
        logger.info("Emotion detector initialized")
    
    async def _load_tensorflow_model(self):
        """Load TensorFlow-based emotion model"""
        # Placeholder for TensorFlow model loading
        # In a real implementation, this would load a pre-trained model
        logger.info("TensorFlow emotion model loaded (placeholder)")
        self.primary_model = "tensorflow_model"
    
    async def _load_opencv_model(self):
        """Load OpenCV-based emotion model"""
        # Placeholder for OpenCV model loading
        logger.info("OpenCV emotion model loaded (placeholder)")
        self.backup_model = "opencv_model"
    
    async def _load_rule_based_model(self):
        """Load rule-based emotion detection"""
        logger.info("Rule-based emotion model loaded")
        self.backup_model = "rule_based"
    
    async def detect_emotions(self, frame: np.ndarray, face_landmarks: FaceLandmarks) -> EmotionResult:
        """Detect emotions from face landmarks"""
        if not self.initialized:
            await self.initialize()
        
        # Extract face region
        x, y, w, h = face_landmarks.bounding_box
        face_roi = frame[y:y+h, x:x+w]
        
        if face_roi.size == 0:
            return self._create_neutral_result()
        
        # Resize face for model input
        face_resized = cv2.resize(face_roi, (48, 48))
        
        # Predict emotions based on available model
        if self.primary_model:
            emotions_dict = await self._predict_with_tensorflow(face_resized)
        elif self.backup_model == "opencv_model":
            emotions_dict = await self._predict_with_opencv(face_resized, face_landmarks)
        else:
            emotions_dict = await self._predict_rule_based(face_landmarks)
        
        # Find primary emotion
        primary_emotion = max(emotions_dict, key=emotions_dict.get)
        confidence = emotions_dict[primary_emotion]
        
        # Apply smoothing
        result = EmotionResult(
            primary_emotion=primary_emotion,
            confidence=confidence,
            all_emotions=emotions_dict,
            timestamp=asyncio.get_event_loop().time(),
            face_landmarks=face_landmarks
        )
        
        return self._apply_smoothing(result)
    
    async def _predict_with_tensorflow(self, face_roi: np.ndarray) -> Dict[str, float]:
        """Predict emotions using TensorFlow model"""
        # Placeholder implementation
        # In real implementation, this would use a trained CNN model
        return {emotion: np.random.random() for emotion in self.emotions}
    
    async def _predict_with_opencv(self, face_roi: np.ndarray, landmarks: FaceLandmarks) -> Dict[str, float]:
        """Predict emotions using OpenCV features"""
        # Simplified emotion detection based on facial features
        emotions_dict = {emotion: 0.0 for emotion in self.emotions}
        
        # Basic rule-based emotion detection
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        
        # Calculate some basic features
        mean_intensity = np.mean(gray_face)
        std_intensity = np.std(gray_face)
        
        # Very simplified emotion mapping
        if mean_intensity > 120:
            emotions_dict['happy'] = 0.7
        elif mean_intensity < 80:
            emotions_dict['sad'] = 0.6
        else:
            emotions_dict['neutral'] = 0.8
        
        # Normalize probabilities
        total = sum(emotions_dict.values())
        if total > 0:
            emotions_dict = {k: v/total for k, v in emotions_dict.items()}
        
        return emotions_dict
    
    async def _predict_rule_based(self, landmarks: FaceLandmarks) -> Dict[str, float]:
        """Rule-based emotion prediction"""
        emotions_dict = {emotion: 0.0 for emotion in self.emotions}
        emotions_dict['neutral'] = 1.0  # Default to neutral
        return emotions_dict
    
    def _create_neutral_result(self) -> EmotionResult:
        """Create a neutral emotion result"""
        emotions_dict = {emotion: 0.0 for emotion in self.emotions}
        emotions_dict['neutral'] = 1.0
        
        return EmotionResult(
            primary_emotion='neutral',
            confidence=1.0,
            all_emotions=emotions_dict,
            timestamp=asyncio.get_event_loop().time()
        )
    
    def _apply_smoothing(self, result: EmotionResult) -> EmotionResult:
        """Apply temporal smoothing to emotion detection"""
        self.smoothing_buffer.append(result)
        
        if len(self.smoothing_buffer) < 2:
            return result
        
        # Average emotions over smoothing window
        averaged_emotions = {emotion: 0.0 for emotion in self.emotions}
        
        for buffered_result in self.smoothing_buffer:
            for emotion, confidence in buffered_result.all_emotions.items():
                averaged_emotions[emotion] += confidence
        
        # Normalize
        window_size = len(self.smoothing_buffer)
        averaged_emotions = {k: v/window_size for k, v in averaged_emotions.items()}
        
        # Find new primary emotion
        primary_emotion = max(averaged_emotions, key=averaged_emotions.get)
        
        return EmotionResult(
            primary_emotion=primary_emotion,
            confidence=averaged_emotions[primary_emotion],
            all_emotions=averaged_emotions,
            timestamp=result.timestamp,
            face_landmarks=result.face_landmarks
        )

class AttentionTracker:
    """Track user attention and engagement"""
    
    def __init__(self):
        self.gaze_history = deque(maxlen=30)  # 1 second at 30 FPS
        self.blink_detector = BlinkDetector()
        self.head_pose_estimator = HeadPoseEstimator()
    
    async def track_attention(self, face_landmarks: FaceLandmarks) -> AttentionMetrics:
        """Track attention metrics from face landmarks"""
        # Calculate gaze direction
        gaze_direction = await self._estimate_gaze(face_landmarks)
        
        # Detect blinks
        blink_rate = await self.blink_detector.detect_blinks(face_landmarks)
        
        # Estimate head pose
        head_pose = await self.head_pose_estimator.estimate_pose(face_landmarks)
        
        # Calculate focus level
        focus_level = await self._calculate_focus_level(gaze_direction, blink_rate, head_pose)
        
        return AttentionMetrics(
            focus_level=focus_level,
            gaze_direction=gaze_direction,
            blink_rate=blink_rate,
            head_pose=head_pose
        )
    
    async def _estimate_gaze(self, landmarks: FaceLandmarks) -> Tuple[float, float]:
        """Estimate gaze direction from eye landmarks"""
        # Simplified gaze estimation
        # In a real implementation, this would use eye landmark analysis
        return (0.0, 0.0)  # Placeholder
    
    async def _calculate_focus_level(self, gaze: Tuple[float, float], blink_rate: float, head_pose: Tuple[float, float, float]) -> float:
        """Calculate overall focus level"""
        # Simplified focus calculation
        # Real implementation would consider multiple factors
        base_focus = 0.8
        
        # Reduce focus if looking away
        gaze_penalty = min(abs(gaze[0]) + abs(gaze[1]), 0.3)
        
        # Reduce focus if blinking too much (fatigue)
        blink_penalty = max(0, (blink_rate - 20) / 60)  # Normal blink rate is ~15-20/min
        
        focus_level = max(0, base_focus - gaze_penalty - blink_penalty)
        return min(1.0, focus_level)

class BlinkDetector:
    """Detect eye blinks for fatigue monitoring"""
    
    def __init__(self):
        self.blink_history = deque(maxlen=1800)  # 1 minute at 30 FPS
    
    async def detect_blinks(self, landmarks: FaceLandmarks) -> float:
        """Detect blinks and return blink rate per minute"""
        # Simplified blink detection
        # Real implementation would analyze eye aspect ratio
        
        # Simulate blink detection
        is_blink = np.random.random() < 0.01  # ~1% chance per frame = ~18 blinks/min
        
        self.blink_history.append(is_blink)
        
        # Calculate blinks per minute
        blinks_in_window = sum(self.blink_history)
        window_duration_minutes = len(self.blink_history) / (30 * 60)  # 30 FPS
        
        if window_duration_minutes > 0:
            return blinks_in_window / window_duration_minutes
        else:
            return 0.0

class HeadPoseEstimator:
    """Estimate head pose for attention tracking"""
    
    async def estimate_pose(self, landmarks: FaceLandmarks) -> Tuple[float, float, float]:
        """Estimate head pose (pitch, yaw, roll) in degrees"""
        # Simplified head pose estimation
        # Real implementation would use 3D facial landmarks
        return (0.0, 0.0, 0.0)  # Placeholder

# Export main classes
__all__ = [
    'FaceDetector',
    'EmotionDetector', 
    'AttentionTracker',
    'EmotionResult',
    'FaceLandmarks',
    'AttentionMetrics'
]
