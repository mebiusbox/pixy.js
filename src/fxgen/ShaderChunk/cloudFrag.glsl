// https://www.shadertoy.com/view/XsfXW8 by FabriceNeyret2

vec2 uv = pin.position;
// float z = -PI/2.0*cCameraTilt;
float z = -3.14/2.0*cCameraTilt;
// ks = 1.0; ps = 3.0; ki=0.9; pi=3.0;
float t = -PI/2.0*cCameraPan;
// t = -PI/2.0 * mouse.x;
// z = -PI/2.0 * mouse.y;

vec3 O = vec3(-15.0*cos(t)*cos(z), 15.0*sin(t)*cos(z), 15.0*sin(z)); // camera
float compas = t-0.2 * uv.x;
vec2 dir = vec2(cos(compas), sin(compas));

mat3 M = lookat(O, vec3(0.0), 5.0);
// vec2 dx = vec2(1.0, 0.0);
drawObj(O, M, uv, 2, pout.color);
// drawObj(O, M, 1.5*(uv+dx), 0, pout.color);
// drawObj(O, M, 1.5*(uv-dx), 1, pout.color);
// pout.color = vec3(1.0, 0.0, 0.0);