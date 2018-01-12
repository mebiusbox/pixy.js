const float period = 0.2;
const float amp = 0.05;
const float lambda = 0.5;
float r = sqrt(pow2(pin.position.x) + pow2(pin.position.y));
float phase = 2.0 * PI * (time/period - r/lambda);
if (phase >= 0.0 && phase < 2.0*PI) {
  pout.color = vec3((amp * sin(phase)) / sqrt(r));
} else {
  pout.color = vec3(0.0);
}