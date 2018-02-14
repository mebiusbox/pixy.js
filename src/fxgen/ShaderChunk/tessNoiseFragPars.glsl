uniform float cOffset;

vec4 tessNoise(vec2 p) {
  vec4 base = vec4(p, 0.0, 0.0);
  vec4 rotation = vec4(0.0, 0.0, 0.0, 0.0);
  float theta = fract(time*1.025);
  float phase = .55;
  float frequency = .49 * mix(1.0, 1.2, cNoiseFrequency);
  
  vec4 result;
  for (int i=0; i<16; i++) {
    base += rotation;
    rotation = fract(base.wxyz - base.zwxy + theta);
    rotation *= (1.0 - rotation);
    base *= frequency;
    base += base.wxyz * phase;
  }
  return rotation * 2.0;
}