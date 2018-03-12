vec2 uv = pin.position;
vec3 ro = vec3(uv, sin(time)*2.0-mix(100.0, 20.0, cScale));
vec3 rd = vec3(uv, 1.0);
vec3 mp = ro;
float shade = 0.0;
const vec4 shadow = vec4(0.3);
float t = time;
float cnt = 0.0;
for (int i=0; i<50; ++i) {
  float md = map(mp);
  if (md < 0.0001) {
    break;
  }
  mp += rd*md*mix(2.0, 0.25, cDensity);
  cnt += 1.0;
}

if (length(mp) > mix(10.0, 20.0, cThickness)) {
  pout.color = vec3(0.0);
} else {
  float r = cnt/50.0;
  vec3 col = vec3(hsv(vec3(st(length(mp)*0.01-time*0.2,6.0), 0.8, 1.0)));
  col *= 1.0 - r*(1.0-r)*-1.0;
  col *= length(mp-ro)*0.02;
  col = 1.0 - col;
  float gray = rgb2gray(col);
  pout.color = mix(vec3(gray), col, cColor);
}