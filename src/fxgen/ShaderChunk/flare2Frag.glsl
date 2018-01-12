// https://www.shadertoy.com/view/Xs33R2
// Particle star constants
const float part_int_div = 40000.;                            // Divisor of the particle intensity. Tweak this value to make the particles more or less bright
const float part_int_factor_min = 0.1;                        // Minimum initial intensity of a particle
const float part_int_factor_max = 100.2;                        // Maximum initial intensity of a particle
const float mp_int = 12.0;
const float ppow = 2.3;

const vec2 part_starhv_dfac = vec2(9., 0.32);                 // x-y transformation vector of the distance to get the horizontal and vertical star branches
const float part_starhv_ifac = 0.25;                          // Intensity factor of the horizontal and vertical star branches
const vec2 part_stardiag_dfac = vec2(13., 0.61);              // x-y transformation vector of the distance to get the diagonal star branches
const float part_stardiag_ifac = 0.19;                        // Intensity factor of the diagonal star branches
const float dist_factor = 3.0;

vec2 p = vec2(0.5);
float dist = distance(pin.uv, p);
vec2 uvp = pin.uv - p;

// rotate
vec2 A = sin(vec2(0.0, 1.57) + time);
uvp = uvp * mat2(A, -A.y, A.x);

float distv = distance(uvp * part_starhv_dfac + p, p);
float disth = distance(uvp * part_starhv_dfac.yx + p, p);
vec2 uvd = 0.7071 * vec2(dot(uvp, vec2(1.0, 1.0)), dot(uvp, vec2(1.0, -1.0)));
float distd1 = distance(uvd * part_stardiag_dfac + p, p);
float distd2 = distance(uvd * part_stardiag_dfac.yx + p, p);
float pint1 = 1.0 / (dist * dist_factor + 0.015);
pint1 += part_starhv_ifac / (disth * dist_factor + 0.01);
pint1 += part_starhv_ifac / (distv * dist_factor + 0.01);
pint1 += part_stardiag_ifac / (distd1 * dist_factor + 0.01);
pint1 += part_stardiag_ifac / (distd2 * dist_factor + 0.01);
// if (part_int_factor_max * pint1 > 6.0) {
  float pint = part_int_factor_max * (pow(pint1, ppow) / part_int_div) * mp_int * cIntensity;
  pint = pow(pint, cPowerExponent);
  pout.color = vec3(pint);
// "} else { pout.color = vec3(0.0); }"