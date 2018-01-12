// https://www.shadertoy.com/view/XsfXW8 by FabriceNeyret2

uniform float cCameraTilt;
uniform float cCameraPan;
uniform float cWidth;
uniform float cHeight;
uniform float cDepth;
uniform float cIntensity;
uniform float cLightX;
uniform float cLightY;
uniform float cLightZ;
uniform float cAmbient;
uniform float cSmoothness;
uniform float cSmoothnessPower;
uniform float cThickness;
uniform float cThicknessPower;
// vec3 R = vec3(2.0, 3.0, 2.0);
// vec3 L = normalize(vec3(-0.4, 0.0, 1.0));
// #define AMBIENT 0.1
// float t = time;


// --- noise functions from https://www.shadertoy.com/view/XslGRr
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

mat3 m = mat3( 0.00,  0.80,  0.60,
              -0.80,  0.36, -0.48,
              -0.60, -0.48,  0.64 );

float hash( float n ) {    // in [0,1]
    return fract(sin(n)*43758.5453);
}

float noise( in vec3 x ) { // in [0,1]
  vec3 p = floor(x);
  vec3 f = fract(x);

  f = f*f*(3.0-2.0*f);

  float n = p.x + p.y*57.0 + 113.0*p.z;

  float res = mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
                      mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y),
                  mix(mix( hash(n+113.0), hash(n+114.0),f.x),
                      mix( hash(n+170.0), hash(n+171.0),f.x),f.y),f.z);
  return res;
}

float fbm( vec3 p ) {    // in [0,1]
  p += time;
  float f;
  f  = 0.5000*noise( p ); p = m*p*2.02;
  f += 0.2500*noise( p ); p = m*p*2.03;
  f += 0.1250*noise( p ); p = m*p*2.01;
  f += 0.0625*noise( p );
  return f;
}

float snoise2(in vec3 x) { // in [-1,1]
  return 2.0 * noise(x) - 1.0;
}

float sfbm( vec3 p ) {    // in [0,1]
  p += time;
  float f;
  f  = 0.5000*snoise2( p ); p = m*p*2.02;
  f += 0.2500*snoise2( p ); p = m*p*2.03;
  f += 0.1250*snoise2( p ); p = m*p*2.01;
  f += 0.0625*snoise2( p );
  return f;
}

// --- view matrix when looking T from O with [-1,1]x[-1,1] screen at dist d
mat3 lookat(vec3 O, vec3 T, float d) {
  mat3 M;
  vec3 OT = normalize(T-O);
  M[0] = OT;
  M[2] = normalize(vec3(0.0, 0.0, 1.0)-OT.z*OT)/d;
  M[1] = cross(M[2], OT);
  return M;
}

// --- ray -  ellipsoid intersection
// if true, return P,N and thickness l
bool intersectEllipsoid(vec3 R, vec3 O, vec3 D, out vec3 P, out vec3 N, out float l) {
  vec3 OR = O/R, DR = D/R; // to space where ellipsoid is a sphere
// P=O+tD & |P|=1 -> solve t in O^2 + 2(O.D)t + D^2.t^2 = 1
  float OD = dot(OR,DR), OO = dot(OR,OR), DD = dot(DR,DR);
  float d = OD*OD - (OO-1.0)*DD;

  if (!((d >= 0.0) && (OD < 0.0) && (OO > 1.0))) return false;
// ray intersects the ellipsoid (and not in our back)
// note that t>0 <=> -OD>0 &  OD^2 > OD^-(OO-1.0)*DD -> |O|>1

  float t = (-OD-sqrt(d))/DD;
// return intersection point, normal and distance
  P = O + t*D;
  N = normalize(P/(R*R));
  l = 2.0 * sqrt(d)/DD;

  return true;
}

// --- Gardner textured ellipsoids (sort of)
// 's' index corresponds to Garner faked silhouette
// 't' index corresponds to interior term faked by mid-surface

// float ks, ps, ki, pi; // smoothness/thickness parameters
// float l;

void drawObj(vec3 O, mat3 M, vec2 pos, int mode, inout vec3 color) {
  vec3 R = vec3(3.0*cDepth, 3.0*cWidth, 3.0*cHeight);
  vec3 D = normalize(M*vec3(1.0,pos)); // ray
  vec3 L = normalize(vec3(cLightX, cLightY, cLightZ));

  vec3 P, N; float l;
  if (!intersectEllipsoid(R, O, D, P, N, l)) return;

  vec3 Pm = P + 0.5 * l * D; // 0.5: deepest point inside cloud.
  vec3 Nm = normalize(Pm/(R*R)); // it's normal
  vec3 Nn = normalize(P/R);
  float nl = clamp(dot(N,L), 0.0, 1.0) * cIntensity; // ratio of light-facing (for lighting)
  float nd = clamp(-dot(Nn,D), 0.0, 1.0); // ratio of camera-facing (for silhouette)
  float ns = fbm(P), ni = fbm(Pm+10.0);
  float A, l0 = 3.0;
//   l += l*(l/l0-1.0)/(1.0+l*l/(l0*l0)); // optical depth modified at silhouette
  l = clamp(l-6.0*ni, 0.0, 1e10);
  float As = pow(cSmoothness*nd, cSmoothnessPower); // silhouette
  float Ai = 1.0 - pow(cThickness, cThicknessPower*l); // interior

  As = clamp(As-ns, 0.0, 1.0)*2.0; // As = 2.0*pow(As, 0.6)
  if (mode == 2) {
    A = 1.0 - (1.0 - As)*(1.0 - Ai); // mul Ti and Ts
  } else {
    A = (mode == 0) ? Ai : As;
  }

  A = clamp(A, 0.0, 1.0);
  nl = 0.8 * (nl + ((mode == 0) ? fbm(Pm-10.0) : fbm(P+10.0)));

#if 0 // noise bump
  N = normalize(N - 0.1*(dFdx(A)*M[1] + dFdy(A)*M[2])*resolution.y);
  nl = clamp(dot(N,L), 0.0, 1.0);
#endif

  vec3 col = vec3(mix(nl, 1.0, cAmbient));
  color = mix(color, col, A);
}