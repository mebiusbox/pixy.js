vec2 position = pin.uv + cOffset;
position *= cNoiseScale * 10.0;
float color = intersectcloudscovonly(vec3(position.x, time * 0.03, position.y));
pout.color = vec3(color);

float graph = color;