// https://www.shadertoy.com/view/XdcGzH
Angle = 90.0 * 0.5 * (1.0 + sin(time + 0.1 * PI));
float ang = A2B * Angle;
ca = cos(ang);
sa = sin(ang);
csa = vec2(ca, -sa);
lambda = 0.5 / (ca*ca);
lscl = 2.0 / lambda;

const float scaleFactor = 1.4;
vec2 uv = scaleFactor * (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
uv.y += 0.5;
pout.color = color(uv);