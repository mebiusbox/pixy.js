varying vec4 vScreenPos;
// http://fe0km.blog.fc2.com/blog-entry-122.html?sp
// http://glslsandbox.com/e#30514.1
float bayer(int iter, vec2 rc) {
  float sum = 0.0;
  for (int i=0; i<4; ++i) {
    if (i >= iter) break;
    vec2 bsize = vec2(pow(2.0, float(i+1)));
    vec2 t = mod(rc, bsize) / bsize;
    int idx = int(dot(floor(t*2.0), vec2(2.0, 1.0)));
    float b = 0.0;
    if (idx == 0) { b = 0.0; } else if (idx == 1) { b = 2.0; } else if (idx == 2) { b = 3.0; } else { b = 1.0; }
    sum += b * pow(4.0, float(iter-i-1));
  }
  float phi = pow(4.0, float(iter)) + 1.0;
  return (sum + 1.0) / phi;
}