int j=0;
vec2 x = pin.position + vec2(-0.5, 0.0);
float y = 1.5 - pin.mouse.x * 0.5;
vec2 z = vec2(0.0);

for (int i=0; i<360; i++) {
  j++;
  if (length(z) > 2.0) break;
  z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + x * y;
}

float h = mod(time * 20.0, 360.0) / 360.0;
vec3 color = hsv2rgb(vec3(h, 1.0, 1.0));

float t = float(j) / 360.0;
pout.color = color * t;