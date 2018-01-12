vec2 p = pin.uv - time*0.1;
float lum = fbm(pin.uv);
pout.color = vec3(lum);

float graph = fbm(pin.uv.xx);