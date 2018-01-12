// https://gist.github.com/KeyMaster-/70c13961a6ed65b6677d
// vec2 polar;
// polar.y = sqrt(dot(pin.position, pin.position));
// polar.y /= resolution.x / 0.5;
// polar.y = 1.0 - polar.y;
// 
// polar.x = atan(pin.position.y, pin.position.x);
// polar.x -= 1.57079632679;
// if (polar.x < 0.0) polar.x += 6.28318530718;
// polar.x /= 6.28318530718;
// polar.x = 1.0 - polar.x;
// 
// vec4 c = texture2D(tDiffuse, polar);
// pout.color = c.rgb;

vec2 cartesian(vec2 coords) {
  return coords - vec2(0.5);
}

vec2 cartToPolar(vec2 coords) {
  float mag = length(coords) / 0.5;
  if (mag > 1.0) return vec2(0.0);
  mag = clamp(mag, 0.0, 1.0);
  float angle = atan(coords.y, coords.x);
//   angle += 1.57079632679;
  if (angle < 0.0) angle += 6.28318530718;
  angle /= 6.28318530718;
  return vec2(angle, mag);
}