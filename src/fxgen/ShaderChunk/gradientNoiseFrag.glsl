vec2 uv = pin.uv * cNoiseScale * 10.0;
vec3 p = normal(vec3(uv, time), 0.01);
p = (p + vec3(1.0)) * 0.5;
vec3 gray = vec3(rgb2gray(p));
pout.color = mix(gray, p, cColor);

float graph = gray.x;