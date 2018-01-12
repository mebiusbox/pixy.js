// http://glslsandbox.com/e#34145.1

#define SHOW_BLOCKS
const float speed = 0.7;
const float spread = 1.6;
const int numBlocks = 35;

float pulse = 0.5;

vec2 uv = pin.position * 0.5;
vec3 baseColor = vec3(0.0, 0.3, 0.6);
vec3 color = pulse * baseColor * 0.5 * (0.9 - cos(uv.x*8.0));
for (int i=0; i<numBlocks; ++i) {
  float z = 1.0 - 0.7*rand(float(i)*1.4333); // 0=far , 1=near
  float tickTime = time * z * speed + float(i) * 1.23753;
  float tick = floor(tickTime);
//   vec2 pos = vec2(0.6 * (rand(tick)-0.5), sign(uv.x)*spread*(0.5-fract(tickTime)));
//   vec2 pos = vec2(0.6 * (rand(tick)-0.5), abs(sign(uv.x))*spread*(0.5-fract(tickTime)));
  vec2 pos = vec2(0.6 * (rand(tick)-0.5), 0.6 * (rand(tick+0.2)-0.5));
//   pos.x += 0.24*sign(pos.x);
//   if (abs(pos.x) < 0.1) pos.x++;

  vec2 size = 1.8*z*vec2(0.04, 0.04 + 0.1 * rand(tick+0.2)) * sin(tickTime);
  float b = box(uv - pos, size, 0.01);
  float dust = z * smoothstep(0.22, 0.0, b) * pulse * 0.5;
#ifdef SHOW_BLOCKS
  float block = 0.2*z*smoothstep(0.002, 0.0, b);
  float shine = 0.6*z*pulse*smoothstep(-0.002, b, 0.007);
  color += dust * baseColor + block*z + shine;
#else
  color += dust * baseColor;
#endif
}
pout.color = color;