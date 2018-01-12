// http://glslsandbox.com/e#36774.0
vec2 uv = pin.uv * 2.0111 - 1.5;

vec3 finalColor = vec3(0.0);
for (int i=0; i<3; ++i) {
  float amp = 80.0 + float(i) * 5.0;
  float period = 0.4;
  float thickness = mix(0.9, 1.0, noise(uv*10.0));
  float t = abs(cWidth / (sin(uv.x + fbm(uv * cFrequency + 4.0*time*period)) * amp) * thickness);
//   float show = fract(abs(sin(time))) >= 0.0 ? 1.0 : 0.0;
//   finalColor += t * vec3(0.2, 0.2, 1.0);
  finalColor += t * vec3(0.1) * cIntensity;
}

pout.color = finalColor;