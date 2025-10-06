"""
Avatar module for Cyber Face
Handles 3D avatar rendering, expressions, and animations
"""

import asyncio
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import json
import numpy as np

from ..vision import EmotionResult

logger = logging.getLogger(__name__)

class ExpressionType(Enum):
    """Available avatar expressions"""
    NEUTRAL = "neutral"
    HAPPY = "happy" 
    SAD = "sad"
    ANGRY = "angry"
    SURPRISED = "surprised"
    FEARFUL = "fearful"
    DISGUSTED = "disgusted"
    FOCUSED = "focused"
    CONFUSED = "confused"
    STRESSED = "stressed"
    THINKING = "thinking"
    SPEAKING = "speaking"

@dataclass
class AvatarState:
    """Current avatar state"""
    expression: ExpressionType = ExpressionType.NEUTRAL
    expression_intensity: float = 1.0
    animation_speed: float = 1.0
    head_position: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    head_rotation: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    eye_direction: Tuple[float, float] = (0.0, 0.0)
    is_speaking: bool = False
    is_listening: bool = False

@dataclass
class ExpressionBlendShapes:
    """Blend shape weights for facial expressions"""
    eyebrows_inner_up: float = 0.0
    eyebrows_outer_up: float = 0.0
    eyebrows_down: float = 0.0
    eye_blink_left: float = 0.0
    eye_blink_right: float = 0.0
    eye_squint_left: float = 0.0
    eye_squint_right: float = 0.0
    mouth_smile: float = 0.0
    mouth_frown: float = 0.0
    mouth_open: float = 0.0
    mouth_pucker: float = 0.0
    cheek_puff: float = 0.0
    jaw_open: float = 0.0

class ExpressionMapper:
    """Maps emotions to avatar expressions and blend shapes"""
    
    def __init__(self):
        self.expression_mappings = {
            'neutral': ExpressionBlendShapes(),
            'happy': ExpressionBlendShapes(
                eyebrows_outer_up=0.3,
                mouth_smile=0.8,
                eye_squint_left=0.2,
                eye_squint_right=0.2
            ),
            'sad': ExpressionBlendShapes(
                eyebrows_inner_up=0.6,
                mouth_frown=0.7,
                eye_blink_left=0.3,
                eye_blink_right=0.3
            ),
            'angry': ExpressionBlendShapes(
                eyebrows_down=0.8,
                mouth_frown=0.5,
                eye_squint_left=0.4,
                eye_squint_right=0.4
            ),
            'surprised': ExpressionBlendShapes(
                eyebrows_inner_up=0.9,
                eyebrows_outer_up=0.9,
                mouth_open=0.6,
                jaw_open=0.4
            ),
            'fearful': ExpressionBlendShapes(
                eyebrows_inner_up=0.8,
                eye_blink_left=0.1,
                eye_blink_right=0.1,
                mouth_open=0.3
            ),
            'disgusted': ExpressionBlendShapes(
                eyebrows_down=0.4,
                mouth_frown=0.6,
                cheek_puff=0.3
            ),
            'focused': ExpressionBlendShapes(
                eyebrows_down=0.2,
                eye_squint_left=0.1,
                eye_squint_right=0.1
            ),
            'confused': ExpressionBlendShapes(
                eyebrows_inner_up=0.4,
                eyebrows_down=0.2,
                mouth_pucker=0.3
            ),
            'stressed': ExpressionBlendShapes(
                eyebrows_inner_up=0.5,
                eyebrows_down=0.3,
                mouth_frown=0.4
            )
        }
    
    def map_emotion_to_expression(self, emotion: EmotionResult) -> ExpressionType:
        """Map detected emotion to avatar expression"""
        emotion_to_expression = {
            'neutral': ExpressionType.NEUTRAL,
            'happy': ExpressionType.HAPPY,
            'sad': ExpressionType.SAD,
            'angry': ExpressionType.ANGRY,
            'surprised': ExpressionType.SURPRISED,
            'fearful': ExpressionType.FEARFUL,
            'disgusted': ExpressionType.DISGUSTED,
            'focused': ExpressionType.FOCUSED,
            'confused': ExpressionType.CONFUSED,
            'stressed': ExpressionType.STRESSED
        }
        
        return emotion_to_expression.get(
            emotion.primary_emotion, 
            ExpressionType.NEUTRAL
        )
    
    def get_blend_shapes(self, expression: ExpressionType, intensity: float = 1.0) -> ExpressionBlendShapes:
        """Get blend shape weights for expression"""
        base_shapes = self.expression_mappings.get(
            expression.value,
            self.expression_mappings['neutral']
        )
        
        # Scale by intensity
        scaled_shapes = ExpressionBlendShapes()
        for field in scaled_shapes.__dataclass_fields__.keys():
            base_value = getattr(base_shapes, field)
            setattr(scaled_shapes, field, base_value * intensity)
        
        return scaled_shapes
    
    def blend_expressions(self, 
                         primary: ExpressionType, 
                         secondary: Optional[ExpressionType] = None,
                         blend_factor: float = 0.0) -> ExpressionBlendShapes:
        """Blend two expressions together"""
        primary_shapes = self.get_blend_shapes(primary)
        
        if secondary is None or blend_factor <= 0:
            return primary_shapes
        
        secondary_shapes = self.get_blend_shapes(secondary)
        
        # Blend the shapes
        blended_shapes = ExpressionBlendShapes()
        for field in blended_shapes.__dataclass_fields__.keys():
            primary_value = getattr(primary_shapes, field)
            secondary_value = getattr(secondary_shapes, field)
            
            blended_value = primary_value * (1 - blend_factor) + secondary_value * blend_factor
            setattr(blended_shapes, field, blended_value)
        
        return blended_shapes

class AvatarAnimator:
    """Handles avatar animations and transitions"""
    
    def __init__(self):
        self.current_state = AvatarState()
        self.target_state = AvatarState()
        self.animation_queue: List[Dict] = []
        self.is_animating = False
        self.animation_speed = 1.0
        
        # Transition parameters
        self.expression_transition_duration = 0.5  # seconds
        self.head_movement_duration = 1.0
        self.eye_movement_duration = 0.3
    
    async def update_expression(self, 
                              expression: ExpressionType, 
                              intensity: float = 1.0,
                              duration: float = None):
        """Update avatar expression with smooth transition"""
        if duration is None:
            duration = self.expression_transition_duration
        
        animation = {
            'type': 'expression',
            'target_expression': expression,
            'target_intensity': intensity,
            'duration': duration,
            'start_time': asyncio.get_event_loop().time()
        }
        
        self.animation_queue.append(animation)
        
        if not self.is_animating:
            asyncio.create_task(self._process_animation_queue())
    
    async def update_head_pose(self, 
                              position: Tuple[float, float, float] = None,
                              rotation: Tuple[float, float, float] = None,
                              duration: float = None):
        """Update head position and rotation"""
        if duration is None:
            duration = self.head_movement_duration
        
        animation = {
            'type': 'head_pose',
            'target_position': position or self.current_state.head_position,
            'target_rotation': rotation or self.current_state.head_rotation,
            'duration': duration,
            'start_time': asyncio.get_event_loop().time()
        }
        
        self.animation_queue.append(animation)
        
        if not self.is_animating:
            asyncio.create_task(self._process_animation_queue())
    
    async def update_eye_direction(self, 
                                  direction: Tuple[float, float],
                                  duration: float = None):
        """Update eye gaze direction"""
        if duration is None:
            duration = self.eye_movement_duration
        
        animation = {
            'type': 'eye_direction',
            'target_direction': direction,
            'duration': duration,
            'start_time': asyncio.get_event_loop().time()
        }
        
        self.animation_queue.append(animation)
        
        if not self.is_animating:
            asyncio.create_task(self._process_animation_queue())
    
    async def set_speaking_state(self, is_speaking: bool):
        """Set speaking animation state"""
        self.current_state.is_speaking = is_speaking
        
        if is_speaking:
            # Add subtle mouth movement animation
            await self.update_expression(ExpressionType.SPEAKING, 0.3, 0.2)
        else:
            # Return to previous expression
            await self.update_expression(self.current_state.expression, 1.0, 0.2)
    
    async def set_listening_state(self, is_listening: bool):
        """Set listening animation state"""
        self.current_state.is_listening = is_listening
        
        if is_listening:
            # Subtle focused expression
            await self.update_expression(ExpressionType.FOCUSED, 0.5, 0.3)
        else:
            # Return to neutral
            await self.update_expression(ExpressionType.NEUTRAL, 1.0, 0.3)
    
    async def _process_animation_queue(self):
        """Process animation queue"""
        if self.is_animating:
            return
        
        self.is_animating = True
        
        try:
            while self.animation_queue:
                animation = self.animation_queue.pop(0)
                await self._execute_animation(animation)
                
        finally:
            self.is_animating = False
    
    async def _execute_animation(self, animation: Dict):
        """Execute a single animation"""
        animation_type = animation['type']
        duration = animation['duration']
        start_time = animation['start_time']
        
        # Calculate frames for smooth animation (60 FPS)
        frame_duration = 1.0 / 60.0
        total_frames = int(duration / frame_duration)
        
        for frame in range(total_frames + 1):
            progress = frame / total_frames if total_frames > 0 else 1.0
            
            # Easing function (ease-in-out)
            eased_progress = self._ease_in_out(progress)
            
            if animation_type == 'expression':
                await self._animate_expression(animation, eased_progress)
            elif animation_type == 'head_pose':
                await self._animate_head_pose(animation, eased_progress)
            elif animation_type == 'eye_direction':
                await self._animate_eye_direction(animation, eased_progress)
            
            await asyncio.sleep(frame_duration)
    
    def _ease_in_out(self, t: float) -> float:
        """Ease-in-out animation curve"""
        return t * t * (3.0 - 2.0 * t)
    
    async def _animate_expression(self, animation: Dict, progress: float):
        """Animate expression transition"""
        target_expression = animation['target_expression']
        target_intensity = animation['target_intensity']
        
        # Interpolate expression intensity
        current_intensity = self.current_state.expression_intensity
        new_intensity = current_intensity + (target_intensity - current_intensity) * progress
        
        # Update state
        if progress >= 1.0:
            self.current_state.expression = target_expression
            self.current_state.expression_intensity = target_intensity
        else:
            self.current_state.expression_intensity = new_intensity
    
    async def _animate_head_pose(self, animation: Dict, progress: float):
        """Animate head pose transition"""
        target_position = animation['target_position']
        target_rotation = animation['target_rotation']
        
        # Interpolate position
        current_pos = self.current_state.head_position
        new_position = tuple(
            current_pos[i] + (target_position[i] - current_pos[i]) * progress
            for i in range(3)
        )
        
        # Interpolate rotation
        current_rot = self.current_state.head_rotation
        new_rotation = tuple(
            current_rot[i] + (target_rotation[i] - current_rot[i]) * progress
            for i in range(3)
        )
        
        self.current_state.head_position = new_position
        self.current_state.head_rotation = new_rotation
    
    async def _animate_eye_direction(self, animation: Dict, progress: float):
        """Animate eye direction transition"""
        target_direction = animation['target_direction']
        
        # Interpolate eye direction
        current_dir = self.current_state.eye_direction
        new_direction = (
            current_dir[0] + (target_direction[0] - current_dir[0]) * progress,
            current_dir[1] + (target_direction[1] - current_dir[1]) * progress
        )
        
        self.current_state.eye_direction = new_direction

class AvatarRenderer:
    """3D avatar renderer using Three.js-compatible interface"""
    
    def __init__(self, config):
        self.config = config
        self.model_path = config.model_path
        self.expressions_path = config.expressions_path
        self.render_quality = config.render_quality
        
        # Avatar components
        self.avatar_model = None
        self.expression_mixer = None
        self.animation_mixer = None
        
        # Rendering state
        self.scene = None
        self.camera = None
        self.renderer = None
        self.lights = []
        
        # Performance tracking
        self.fps_counter = 0
        self.last_fps_time = 0
        self.current_fps = 60
        
        self.initialized = False
    
    async def initialize(self):
        """Initialize the 3D avatar renderer"""
        try:
            # Initialize rendering components
            await self._setup_scene()
            await self._setup_camera()
            await self._setup_lighting()
            await self._load_avatar_model()
            await self._setup_animations()
            
            self.initialized = True
            logger.info("Avatar renderer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize avatar renderer: {e}")
            raise
    
    async def _setup_scene(self):
        """Setup 3D scene"""
        # Placeholder for Three.js scene setup
        # In a real implementation, this would create Three.js Scene
        self.scene = {"type": "Scene", "background": "#1a1a1a"}
        logger.debug("3D scene created")
    
    async def _setup_camera(self):
        """Setup camera"""
        # Perspective camera for 3D avatar
        self.camera = {
            "type": "PerspectiveCamera",
            "fov": 45,
            "aspect": 16/9,
            "near": 0.1,
            "far": 1000,
            "position": [0, 0, 5]
        }
        logger.debug("Camera configured")
    
    async def _setup_lighting(self):
        """Setup scene lighting"""
        # Key light
        key_light = {
            "type": "DirectionalLight",
            "color": "#ffffff",
            "intensity": 1.0,
            "position": [5, 5, 5]
        }
        
        # Fill light
        fill_light = {
            "type": "AmbientLight",
            "color": "#404040",
            "intensity": 0.3
        }
        
        # Rim light
        rim_light = {
            "type": "DirectionalLight",
            "color": "#8888ff",
            "intensity": 0.5,
            "position": [-5, 3, -5]
        }
        
        self.lights = [key_light, fill_light, rim_light]
        logger.debug("Lighting setup complete")
    
    async def _load_avatar_model(self):
        """Load 3D avatar model"""
        # Placeholder for model loading
        # Real implementation would load GLTF/GLB model
        self.avatar_model = {
            "type": "GLTF",
            "path": self.model_path,
            "blend_shapes": [],
            "skeleton": None
        }
        logger.debug(f"Avatar model loaded from {self.model_path}")
    
    async def _setup_animations(self):
        """Setup animation system"""
        # Animation mixer for blend shapes and skeletal animation
        self.animation_mixer = {
            "type": "AnimationMixer",
            "clips": [],
            "actions": {}
        }
        
        self.expression_mixer = ExpressionMapper()
        logger.debug("Animation system initialized")
    
    async def update_avatar(self, state: AvatarState):
        """Update avatar with new state"""
        if not self.initialized:
            await self.initialize()
        
        try:
            # Update expression blend shapes
            blend_shapes = self.expression_mixer.get_blend_shapes(
                state.expression, 
                state.expression_intensity
            )
            
            await self._apply_blend_shapes(blend_shapes)
            await self._update_head_pose(state.head_position, state.head_rotation)
            await self._update_eye_direction(state.eye_direction)
            
            # Handle speaking animation
            if state.is_speaking:
                await self._add_speaking_animation()
            
            # Handle listening state
            if state.is_listening:
                await self._add_listening_animation()
            
        except Exception as e:
            logger.error(f"Error updating avatar: {e}")
    
    async def _apply_blend_shapes(self, blend_shapes: ExpressionBlendShapes):
        """Apply blend shape weights to avatar"""
        # Placeholder for blend shape application
        # Real implementation would update mesh morph targets
        logger.debug("Blend shapes applied")
    
    async def _update_head_pose(self, 
                               position: Tuple[float, float, float],
                               rotation: Tuple[float, float, float]):
        """Update head position and rotation"""
        # Placeholder for head pose update
        logger.debug(f"Head pose updated: pos={position}, rot={rotation}")
    
    async def _update_eye_direction(self, direction: Tuple[float, float]):
        """Update eye gaze direction"""
        # Placeholder for eye direction update
        logger.debug(f"Eye direction updated: {direction}")
    
    async def _add_speaking_animation(self):
        """Add subtle speaking animation"""
        # Placeholder for speaking lip-sync animation
        pass
    
    async def _add_listening_animation(self):
        """Add listening state animation"""
        # Placeholder for listening animation (subtle head nods, etc.)
        pass
    
    async def render_frame(self) -> Dict[str, Any]:
        """Render current frame"""
        if not self.initialized:
            return {"error": "Renderer not initialized"}
        
        # Update performance metrics
        await self._update_performance_metrics()
        
        # Render frame (placeholder)
        frame_data = {
            "timestamp": asyncio.get_event_loop().time(),
            "fps": self.current_fps,
            "scene": self.scene,
            "camera": self.camera,
            "avatar": self.avatar_model
        }
        
        return frame_data
    
    async def _update_performance_metrics(self):
        """Update rendering performance metrics"""
        current_time = asyncio.get_event_loop().time()
        
        if self.last_fps_time == 0:
            self.last_fps_time = current_time
            return
        
        time_delta = current_time - self.last_fps_time
        
        if time_delta >= 1.0:  # Update FPS every second
            self.current_fps = self.fps_counter / time_delta
            self.fps_counter = 0
            self.last_fps_time = current_time
        else:
            self.fps_counter += 1
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get rendering performance statistics"""
        return {
            "fps": self.current_fps,
            "render_quality": self.render_quality,
            "model_loaded": self.avatar_model is not None,
            "initialized": self.initialized
        }

# Export main classes
__all__ = [
    'AvatarRenderer',
    'AvatarAnimator',
    'ExpressionMapper',
    'AvatarState',
    'ExpressionType',
    'ExpressionBlendShapes'
]
