// https://www.shadertoy.com/view/MtcSz4

uniform float cRadius;
uniform float cInnerRadius;
uniform float cInnerRadius2;

float circle(vec2 p, float r, float width) {
  float d = 0.0;
  d += smoothstep(1.0, 0.0, width*abs(p.x-r));
  return d;
}

float arc(vec2 p, float r, float a, float width) {
  float d = 0.0;
  if (abs(p.y) < a) {
    d += smoothstep(1.0, 0.0, width*abs(p.x-r));
  }
  return d;
}

float rose(vec2 p, float t, float width) {
  const float a0 = 6.0;
  float d = 0.0;
  p.x *= 7.0 + 8.0 * t;
  d += smoothstep(1.0, 0.0, width*abs(p.x-sin(a0*p.y)));
  d += smoothstep(1.0, 0.0, width*abs(p.x-abs(sin(a0*p.y))));
  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-sin(a0*p.y)));
  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-abs(sin(a0*p.y))));
  return d;
}

float rose2(vec2 p, float t, float width) {
  const float a0 = 6.0;
  float d = 0.0;
  p.x *= 7.0 + 8.0 * t;
  d += smoothstep(1.0, 0.0, width*abs(p.x-cos(a0*p.y)));
  d += smoothstep(1.0, 0.0, width*abs(p.x-abs(cos(a0*p.y))));
  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-cos(a0*p.y)));
  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-abs(cos(a0*p.y))));
  return d;
}

float spiral(vec2 p, float width) {
  float d = 0.0;
  d += smoothstep(1.0, 0.0, width*abs(p.x-0.5*p.y/PI));
  d += smoothstep(1.0, 0.0, width*abs(p.x-0.5*abs(p.y)/PI));
  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-0.5*p.y/PI));
  d += smoothstep(1.0, 0.0, width*abs(abs(p.x)-0.5*abs(p.y)/PI));
  return d;
}