uniform float cWidth;
uniform float cInnerWidth;
// 
// float Capsule(vec2 p, vec2 a, float r) {
//   vec2 pa = p - a, ba = -a*2.0;
//   float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
//   return length(pa - ba*h) - r;
// }
