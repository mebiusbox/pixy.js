int j=0;
vec2 x = vec2(-0.345, 0.654);
vec2 y = vec2(time * 0.005, 0.0);
vec2 z = pin.position;

for (int i=0; i<360; i++) {
  j++;
  if (length(z) > 2.0) break;
  z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + x + y;
}

float h = abs(mod(time * 15.0 - float(j), 360.0) / 360.0);
vec3 color = hsv2rgb(vec3(h, 1.0, 1.0));

float t = float(j) / 360.0;
pout.color = color * t;