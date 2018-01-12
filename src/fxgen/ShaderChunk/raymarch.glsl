float box(vec2 p, vec2 b, float r) {
  return length(max(abs(p)-b,0.0))-r;
}