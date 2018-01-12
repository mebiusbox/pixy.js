vec2 t = pin.coord + vec2(time * 10.0);
float n = pnoise(t);
pout.color = vec3(n);

float graph = pnoise(t.xx);