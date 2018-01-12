vec2 p = pin.uv - time*0.1;
float lum = iqhash2(p);
pout.color = vec3(lum);

float graph = iqhash2(p.xx);