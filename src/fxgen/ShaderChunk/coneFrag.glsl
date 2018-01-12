vec2 n = normalize(cDirection);
float len = length(cDirection);
vec2 pos = pin.position - (-cDirection);
float t = (dot(pos, n) * 0.5) / len;
// t /= (length(pin.position) * len * 0.5);
t /= (length(pos) * len * 0.5);
t = pow(abs(t), cPowerExponent);
pout.color = vec3(t);