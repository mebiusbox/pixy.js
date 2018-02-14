vec2 speed = vec2(2.0, 1.0);
vec2 p = pin.uv * cScale * 50.0 - time*0.2;
float q = fbm2(p);
vec2 r = vec2(fbm2(p + q + time * speed.x - p.x - p.y), fbm2(p + q - time * speed.y));
pout.color = vec3(fbm2(r));

float graph = q;