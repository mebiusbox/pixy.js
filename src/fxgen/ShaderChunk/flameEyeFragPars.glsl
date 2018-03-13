// https://www.shadertoy.com/view/ltBfDt
const float cSize = 2.3;
const float cRadius = 0.099;
// uniform float cSize;
// uniform float cRadius;
uniform float cSpeed;
uniform float cColor;
uniform float cFlameEyeInnerFade;
uniform float cFlameEyeOuterFade;
uniform float cFlameEyeBorder;

float flameEyeNoise(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = rand(i);
  float b = rand(i + vec2(1.0, 0.0));
  float c = rand(i + vec2(0.0, 1.0));
  float d = rand(i + vec2(1.0, 1.0));
  
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

float light(in vec2 pos, float size, float radius, float inner_fade, float outer_fade) {
  float len = length(pos/size);
  return pow(clamp((1.0 - pow(clamp(len-radius, 0.0, 1.0), 1.0/inner_fade)), 0.0, 1.0), 1.0/outer_fade);
}

float flare(float angle, float alpha, float t) {
  float n = flameEyeNoise(vec2(t+0.5+abs(angle)+pow(alpha,0.6), t-abs(angle)+pow(alpha+0.1,0.6))*7.0);
  float split = (15.0 + sin(t*2.0+n*4.0+angle*20.0+alpha*1.0*n)*(0.3+0.5+alpha*0.6*n));
  float rotate = sin(angle*20.0 + sin(angle*15.0+alpha*4.0+t*30.0+n*5.0+alpha*4.0))*(0.5 + alpha*1.5);
  float g = pow((2.0 + sin(split + n*1.5*alpha+rotate)*1.4)*n*4.0, n*(1.5-0.8*alpha));
  g *= alpha * alpha * alpha * 0.4;
  g += alpha * 0.7 + g*g*g;
  return g;
}