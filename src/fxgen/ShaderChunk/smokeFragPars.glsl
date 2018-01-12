// http://glslsandbox.com/e#37011.6
uniform float cVolume;
uniform float cBeta;
uniform float cDelta;

float hash(float n) { return fract(sin(n) * 783.5453123); }

float noise(in vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);
  float n = p.x + p.y * 157.0 + 113.0 * p.z;
  return mix(mix(mix(hash(n+  0.0), hash(n+  1.0), f.x),
                 mix(hash(n+157.0), hash(n+158.0), f.x), f.y),
             mix(mix(hash(n+113.0), hash(n+114.0), f.x),
                 mix(hash(n+270.0), hash(n+271.0), f.x), f.y), f.z);
}

float fbm(vec3 p) {
  float f;
  f = 0.50000 * noise(p); p = p*2.02;
  f += 0.2500 * noise(p); p = p*2.03;
  f += 0.1250 * noise(p); p = p*2.01;
  f += 0.0625 * noise(p);
  return f;
}

float sdEllipsoid(in vec3 p, in vec3 r) {
  return (length(p/r) - 1.0) * min(min(r.x, r.y), r.z);
}

float map(in vec3 p, float f, vec3 r) {
  float den = sdEllipsoid(p, r);
  den = smoothstep(-0.1, 0.25, den);
  den = -den - (sin(0.0) + 1.0) * 0.3;
  return clamp(den + f, 0.0, 1.0);
}

// vec3 light(vec3 ro, vec3 rd) {
//   vec4 rnd = vec4(0.1, 0.2, 0.3, 0.4);
//   float arclight = 0.0;
//   vec3 pos = ro + rd;
//   for (int i=0; i<3; ++i) {
//     rnd = fract(sin(rnd * 1.111111) * 298729.258972);
//     float ts = rnd.z * 4.0 * 1.61803398875 + 1.0;
//     float arcfl = floor(time / ts + rnd.y) * ts;
//     float arcfr = fract(time / ts + rnd.y) * ts;
//     float arcseed = floor(time * 1.0 + rnd.y);
//     float arcdur = rnd.x * 0.2 + 0.05;
//     float arcint = smoothstep(0.1 + arcdur, arcdur, arcfr);
//     arclight += exp(-0.5) * fract(sin(arcseed) * 198721.6231) * arcint;
//   }
//   vec3 arccol = vec3(0.9, 0.7, 0.7);
//   vec3 lighting = arclight * arccol * 0.5;
//   return lighting;
// }

vec3 raymarch(in vec3 ro, in vec3 rd) {
  vec4 sum = vec4(0.0);
  float t = 0.0;
  for (int i=0; i<100; ++i) {
    if (sum.a > 0.99) break;
    vec3 pos = ro + t*rd;
    float f = fbm(cBeta * pos + vec3(0.0, 0.0, 0.25) * time);
    float d = map(pos, f, vec3(1.0, 1.0, 0.5));
//     vec4 col = vec4(mix(vec3(0.07, 0.1, 0.2), vec3(1.5), d), 1.0);
    vec4 col = vec4(mix(vec3(0.0), vec3(1.5), d), 1.0);
    col *= d*cVolume;
    sum += col * (1.0 - sum.a);
    t += cDelta;
  }
//   vec3 lighting = light(ro, rd);
//   vec3 rain_cloud = mix(vec3(0.0), lighting, sum.a);
//   rain_cloud += sum.rgb;
//   vec3 sky_color = mix(rain_cloud, vec3(0.5, 0.5, 0.3), 1.0 - sum.a);
//   vec3 sky_color = mix(rain_cloud, vec3(0.0), 1.0 - sum.a);
//   return clamp(sky_color, 0.0, 1.0);
  return clamp(mix(sum.rgb, vec3(0.0), 1.0 - sum.a), 0.0, 1.0);
}