#extension GL_EXT_draw_buffers : require
#extension GL_OES_standard_derivatives : enable
precision mediump float;
#include <packing>
uniform sampler2D tDiffuse;
uniform sampler2D tRoughness;
uniform sampler2D tNormal;
uniform float bumpiness;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

vec2 dHdxy_fwd() {
  vec2 dSTdx = dFdx(vUv);
  vec2 dSTdy = dFdy(vUv);
  float Hll = bumpiness * texture2D(tNormal, vUv).x;
  float dBx = bumpiness * texture2D(tNormal, vUv + dSTdx).x - Hll;
  float dBy = bumpiness * texture2D(tNormal, vUv + dSTdy).x - Hll;
  return vec2(dBx, dBy);
}

vec3 perturbNormalArb(vec3 surf_pos, vec3 surf_norm, vec2 dHdxy) {
  vec3 vSigmaX = dFdx(surf_pos);
  vec3 vSigmaY = dFdy(surf_pos);
  vec3 vN = surf_norm; // normalized
  vec3 R1 = cross(vSigmaY, vN);
  vec3 R2 = cross(vN, vSigmaX);
  float fDet = dot(vSigmaX, R1);
  vec3 vGrad = sign(fDet) * (dHdxy.x * R1 + dHdxy.y * R2);
  return normalize(abs(fDet) * surf_norm - vGrad);
}

void main() {
  vec4 diffuseRGBA = texture2D(tDiffuse, vUv);
  vec4 roughnessRGBA = texture2D(tRoughness, vUv);
  vec3 Nn = perturbNormalArb(-vViewPosition, normalize(vNormal), dHdxy_fwd());
  gl_FragData[0] = vec4(Nn * 0.5 + 0.5, 0.0);
  gl_FragData[1] = vec4(diffuseRGBA.xyz, roughnessRGBA.r);
}