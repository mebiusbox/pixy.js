uniform float cScale;
uniform float cWidth;
uniform float cRadius;
uniform float cDiamondGearTeeth;
uniform float cDiamondGearMid;

vec2 sd_line(vec2 pos, vec2 a, vec2 b) {
  pos -= a;
  vec2 d = b-a;
  float l = length(d);
  d /= l;
  
  float t = dot(d,pos);
  vec2 p = d * clamp(t, 0.0, l);
  vec2 perp = vec2(d.y, -d.x);
  
  return vec2(length(pos-p), dot(pos,perp));
}

float abs_min(float a, float b) {
  return abs(a) < abs(b) ? a : b;
}

vec2 lmin(vec2 a, vec2 b) {
  if (abs(a.x-b.x) < 0.0001) {
    return a.y > b.y ? a : b;
  }
  return a.x < b.x ? a : b;
}

float to_sd(vec2 x) {
  return x.x * sign(x.y);
}

float sd_diamond(vec2 pos, vec2 tail, vec2 tip, float width, float mid) {
  vec2 d = tip-tail;
  vec2 p = vec2(d.y,-d.x) * width * 0.5;
  vec2 m = d*mid + tail;
  vec2 la = sd_line(pos, tail, m+p);
  vec2 lb = sd_line(pos, m+p, tip);
  vec2 lc = sd_line(pos, tip, m-p);
  vec2 ld = sd_line(pos, m-p, tail);
  return to_sd(lmin(lmin(la,lb), lmin(lc,ld)));
}

vec2 to_polar(vec2 x) {
  return vec2(length(x), atan(-x.y,-x.x) + 3.14159);
}

vec2 from_polar(vec2 x) {
  return vec2(cos(x.y), sin(x.y)) * x.x;
}

vec2 radial_repeat(vec2 pos, float count) {
  float offset = 0.5/count;
  pos = to_polar(pos);
  pos.y /= 2.0*3.14159;
  pos.y += offset;
  pos.y *= count;
  pos.y = fract(pos.y);
  pos.y /= count;
  pos.y -= offset;
  pos.y *= 2.0*3.14159;
  pos = from_polar(pos);
  return pos;
}

vec2 rotate(vec2 pos, float turns) {
  pos = to_polar(pos);
  pos.y += turns * 2.0 * 3.14159;
  return from_polar(pos);
}

float gear(vec2 uv, float teeth, float turns) {
  uv = rotate(uv, turns);
  uv = radial_repeat(uv, teeth);
  return sd_diamond(uv, vec2(0.0+cRadius,0.0), vec2(1.0,0.0), cWidth/teeth, cDiamondGearMid);
}
