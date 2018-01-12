// https://www.shadertoy.com/view/MdX3zr
uniform float cIntensity;
uniform float cWidth;
uniform float cScale;

float flameNoise(vec3 p) {
  vec3 i = floor(p);
  vec4 a = dot(i, vec3(1.0, 57.0, 21.0)) + vec4(0.0, 57.0, 21.0, 78.0);
  vec3 f = cos((p-i)*acos(-1.0)) * (-0.5) + 0.5;
  a = mix(sin(cos(a)*a), sin(cos(1.0+a)*(1.0+a)), f.x);
  a.xy = mix(a.xz, a.yw, f.y);
  return mix(a.x, a.y, f.z);
}

float sphere(vec3 p, vec4 spr) {
  return length(spr.xyz-p) - spr.w;
}

float flame(vec3 p) {
  float d = sphere(p * vec3(1.0, 0.5, 1.0), vec4(0.0, -1.0, 0.0, 1.0));
  return d + (flameNoise(p + vec3(0.0, time*2.0, 0.0)) + flameNoise(p*3.0)*0.5)*0.25*p.y;
}

float scene(vec3 p) {
  return min(100.0 - length(p), abs(flame(p)));
}

vec4 raymarch(vec3 org, vec3 dir) {
  float d = 0.0, glow = 0.0, eps = 0.02;
  vec3 p = org;
  bool glowed = false;
  for (int i=0; i<64; i++) {
    d = scene(p) + eps;
    p += d * dir;
    if (d > eps) {
      if (flame(p) < 0.0) {
        glowed = true;
      } else if (glowed) {
        glow = float(i)/64.0;
      }
    }
  }
  return vec4(p, glow);
}