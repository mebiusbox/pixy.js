vec2 coords = pin.uv - vec2(0.5); // cartesian
// cartesian -> polar
float mag = length(coords) * 2.0; // length(coords) / 0.5
if (mag > 1.0) {
  pout.color = vec3(0.0);
} else {
  mag = clamp(mag, 0.0, 1.0);
  float angle = atan(coords.y, coords.x);
  angle -= 1.57079632679;
  if (angle < 0.0) angle += 6.28318530718;
  angle /= 6.28318530718;
  vec4 c = texture2D(tDiffuse, vec2(angle, mag));
  pout.color = c.rgb;
}