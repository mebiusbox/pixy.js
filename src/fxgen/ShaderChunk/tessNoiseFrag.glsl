vec2 p = pin.uv - cOffset;
p *= pow(2.0, 13.0);
vec4 a = tessNoise(p);
vec4 n = vec4(a.x+a.y+a.z+a.w) * .5;
pout.color = vec3(n.xyz);

float graph = n.x;