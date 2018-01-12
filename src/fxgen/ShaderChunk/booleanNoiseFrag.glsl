vec2 p = pin.uv - time*0.1;
float s = resolution.x * cNoiseFrequency;
float lum = float(iqhash2(floor(p*s)/s) > 0.5);
pout.color = vec3(lum);

float graph = float(iqhash2(floor(p.xx*s)/s) > 0.5);