// https://www.shadertoy.com/view/4scXWB
// rotation hexagon
vec2 A = sin(vec2(0.0, 1.57) + time);
vec2 U = abs(pin.position * mat2(A, -A.y, A.x)) * mat2(2.0, 0.0, 1.0, 1.7);
float t = cIntensity * 0.5 / max(U.x, U.y); // glowing-spiky approx of step(max, 0.2)
t = pow(t, cPowerExponent);
pout.color = vec3(t);