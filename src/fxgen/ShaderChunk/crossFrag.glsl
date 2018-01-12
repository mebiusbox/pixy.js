// https://www.shadertoy.com/view/ls3GRS
float minBright = 0.01;
float maxBright = 0.04;
float magnitude = (minBright + abs(sin(time) * (maxBright - minBright)));

vec2 dist = abs(pin.position);
float longDist = max(dist.x, dist.y);
dist += longDist / 40.0 * (1.0 - cIntensity) * 10.0;
vec2 uv = magnitude / dist;

float t = (uv.x + uv.y) / 2.0;
t = pow(t, cPowerExponent);
pout.color = vec3(t);