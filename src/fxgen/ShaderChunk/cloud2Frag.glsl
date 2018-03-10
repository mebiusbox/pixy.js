vec2 ndc = 2.0 * pin.coord.xy / resolution.xy - 1.0;
vec3 col = render(ndc, resolution.y / resolution.x);
pout.color = sqrt(col);