vec2 I = pin.coord+vec2(16,32);
float g = 3.0 - length((modf(I/vec2(16,32),I)-0.5)*mat2(12,12,32,12)[int(length(I)*1e5-time)&1]); 
vec3 o = vec3(g, g, g);
o *= mat3(2.0,2.0,2.0, 2.8,2.8,2.8, 2.0,2.0,2.0)[int(length(I)*1e5-time)&1] - o;
pout.color = o;