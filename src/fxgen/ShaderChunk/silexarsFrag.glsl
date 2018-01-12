vec3 c;
float l, z = sin(time) * 1.0 + 17.0;
for (int i=0; i<3; i++) {
  vec2 uv = pin.uv;
  vec2 p = uv - 0.5;
  z += 0.07;
  l = length(p);
  uv += p / l * (sin(z) + 1.0) * abs(sin(l*9.0-z*2.0));
  c[i] = 0.01 / length(abs(mod(uv, 1.0)-0.5));
}
pout.color = c/l;