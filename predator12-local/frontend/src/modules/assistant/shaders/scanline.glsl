/**
 * Scanline Shader for 3D Head
 * Creates animated scanline + fresnel glow effect
 */

// Vertex Shader
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vPosition = position;
  vNormal = normalMatrix * normal;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}

// Fragment Shader
uniform float time;
uniform float intensity;
uniform vec3 color;
uniform vec3 cameraPosition;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  // Normalize
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Scanline effect (animated)
  float scanline = sin(vPosition.y * 20.0 + time * 2.0) * 0.5 + 0.5;
  scanline = pow(scanline, 2.0); // sharper lines

  // Fresnel (rim light)
  float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);

  // Grid pattern (vertical lines)
  float grid = sin(vPosition.x * 30.0) * sin(vPosition.z * 30.0);
  grid = smoothstep(0.3, 0.7, grid);

  // Combine effects
  float finalIntensity = (scanline * 0.3 + fresnel * intensity + grid * 0.1);
  vec3 finalColor = color * finalIntensity;

  // Add pulsation
  float pulse = sin(time * 2.0) * 0.1 + 0.9;
  finalColor *= pulse;

  gl_FragColor = vec4(finalColor, 1.0);
}
