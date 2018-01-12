float map = min(resolution.x, resolution.y) * cNoiseScale;
vec2 t = mod(pin.coord.xy + vec2(time * 10.0), map);
float n = psnoise(t, t / map, vec2(map));
pout.color = vec3(n);

float graph = psnoise(t.xx, t.xx/map, vec2(map));