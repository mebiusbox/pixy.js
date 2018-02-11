// compute flame area
vec2 position = vec2((cAngle+1.)/2., 0.) * resolution.xy;
float xinc = clamp(mod(time, 6.0)-3.0, -3.0, 3.0);
float yinc = clamp(mod(-time, 6.0)+3.0, -3.0, 3.0);
// float inc = xinc/yinc;
float inc = -cAngle;
float xslope = (pin.coord.x - position.x);
float yslope = (pin.coord.y - position.y);
float slope = xslope/yslope;
float xdif = xinc/xslope;
float ydif = yinc/yslope;
float dist = distance(position, pin.coord.xy);
dist = abs(slope - inc) * .1 + dist/(10000.*cPower);
if ((inc > 0.0 && inc > 2.0) || (inc < 0.0 && inc < -2.0)) dist *= dist;
if ((xdif < 0.0 && ydif < 0.0) || (ydif < 0.0 && xdif > 0.0)) dist = 10.0;

// compute flame noise
vec2 noisePosition = cNoiseSize * (pin.coord - position) / resolution.y - vec2(xinc*cSpeed*time, yinc*cSpeed*time);
float noise = 0.0;
for (int i=0; i<10; i++) {
  if (i > cNoiseDepth) break;
  noise += cnoise(noisePosition * pow(2.0, float(i)));
}
vec4 d = mix(-(101.0-cSize) * dist, noise, cNoiseStrength) + color;
vec3 gray = vec3(rgb2gray(d.xyz));
pout.color = mix(gray, d.xyz, cColor);