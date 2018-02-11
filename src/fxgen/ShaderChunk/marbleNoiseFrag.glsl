vec2 pos = pin.coord / cScale;
vec2 dpos = vec2(pos.x - pos.y, pos.x + pos.y);
dpos = dpos * rotate2d(radians(time*5.0));
dpos += 0.12 * combinedNoise(dpos);
dpos += 0.25 * snoise(0.5*dpos*vec2(0.5,1.0));
float graph = 0.5 + sin(dpos.x * cFrequency) / 2.0;
pout.color = vec3(graph);