float scale = min(resolution.x, resolution.y);
float width = resolution.x / scale;
float height = resolution.y / scale;
vec2 xy = pin.coord / scale - vec2(width/2.0, height/2.0);
xy = vec2(xy) * rotate2d(radians(time*5.0));

float tile = floor(sin(xy.x*cWidth) * sin(xy.y*cHeight) + 1.0);
pout.color = vec3(tile);
