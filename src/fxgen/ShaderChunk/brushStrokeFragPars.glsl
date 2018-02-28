uniform float cWidth;
uniform float cStrength;
uniform float cAlpha;
uniform float cAmplitude;
uniform float cAngle;
uniform float cBrushStrokeX1;
uniform float cBrushStrokeY1;
uniform float cBrushStrokeX2;
uniform float cBrushStrokeY2;
uniform float cColor;
//-------------------------------------------------------------------------
// https://www.shadertoy.com/view/lt23D3
float nsin(float a) { return 0.5+0.5*sin(a); }
float ncos(float a) { return 0.5+0.5*cos(a); }
float opS(float d2, float d1) { return max(-d1,d2); }
float brushRand(vec2 co) { return rand(co); }
float brushRand(float n) { return rand3(n); }
float dtoa(float d, float amount) { return clamp(1.0 / (clamp(d, 1.0/amount, 1.0)*amount), 0.0, 1.0); }
float sdAxisAlignedRect(vec2 uv, vec2 tl, vec2 br) {
  vec2 d = max(tl-uv, uv-br);
  return length(max(vec2(0.0), d)) + min(0.0, max(d.x, d.y));
}
// 0-1 1-0
float smoothstep4(float e1, float e2, float e3, float e4, float val) {
  return min(smoothstep(e1,e2,val), 1.0 - smoothstep(e3,e4,val));
}
vec2 brushHash(vec2 p) { return iqhash2vec(p); }
// returns -0.5 to 1.5
float brushNoise(vec2 p) {
  const float K1 = 0.366025404; // (sqrt(3)-1)/2
  const float K2 = 0.211324865; // (3-sqrt(3))/6 
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); // vec2 of = 0.5 + 0.5*vec2(sign(a.x-a.y), sign(a.y-a.x));
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
  vec3 n = h*h*h*h*vec3(dot(a, brushHash(i+0.0)), dot(b, brushHash(i+o)), dot(c, brushHash(i+1.0)));
  return dot(n, vec3(70.0));
}
float brushNoise01(vec2 p) {
  return clamp((brushNoise(p) + 0.5) * 0.5, 0.0, 1.0);
}
//-------------------------------------------------------------------------
vec3 colorAxisAlignedBrushStroke(vec2 uv, vec2 uvPaper, vec3 inpColor, vec4 brushColor, vec2 p1, vec2 p2) {
  // how far along is this point in the line. will come in handy.
  vec2 posInLine = smoothstep(p1, p2, uv); // (uv-p1)/(p2-p1);
  
  // wobble it around, humanize
  float wobbleAmplitude = cAmplitude;
  uv.x += sin(posInLine.y * PI2 * cAngle) * wobbleAmplitude;
  
  // distance to geometry
  float d = sdAxisAlignedRect(uv, p1, vec2(p1.x, p2.y));
  d -= abs(p1.x - p2.x) * 0.5; // rounds out the end.
  
  // warp the position-in-line, to control the curve of the brush falloff.
  posInLine = pow(posInLine, vec2((nsin(time*0.5) * 2.0) + 0.3));
  
  // brush stroke fibers effect
  float strokeStrength = dtoa(d, 100.0);
  float strokeAlpha = 0.0
    + brushNoise01((p2-uv) * vec2(min(resolution.y,resolution.x)*0.25, 1.0)) // high freq fibers
    + brushNoise01((p2-uv) * vec2(79.0, 1.0)) // smooth brush texture. lots of room for variation here, also layering.
    + brushNoise01((p2-uv) * vec2(14.0, 1.0)) // low freq noise, gives more variation
    ;
  strokeAlpha *= cAlpha;
  strokeAlpha = strokeAlpha * strokeStrength;
  strokeAlpha = strokeAlpha - (1.0 - posInLine.y);
  strokeAlpha = (1.0 - posInLine.y) - (strokeAlpha * (1.0 - posInLine.y));
  
  // fill texture.
  float inkOpacity = 0.85 * cStrength;
  float fillAlpha = (dtoa(abs(d), 90.0) * (1.0 - inkOpacity)) + inkOpacity;
  
  // paper bleed effect
  // float amt = 140.0 + (brushRand(uvPaper.y) * 30.0) + (brushRand(uvPaper.x) * 30.0);
  float amt = 140.0 + (brushRand(uvPaper.y) * 1.0) + (brushRand(uvPaper.x) * 1.0);
  
  float alpha = fillAlpha * strokeAlpha * brushColor.a * dtoa(d, amt);
  alpha = clamp(alpha, 0.0, 1.0);
  return mix(inpColor, brushColor.rgb, alpha);
}
//-------------------------------------------------------------------------
vec3 colorBrushStroke(vec2 uv, vec3 inpColor, vec4 brushColor, vec2 p1, vec2 p2, float lineWidth) {
  // flatten the line to be axis-aligned
  vec2 rectDimensions = p2 - p1;
  float angle = atan(rectDimensions.x, rectDimensions.y);
  mat2 rotMat = rotate2d(-angle);
  p1 *= rotMat;
  p2 *= rotMat;
  float halfLineWidth = lineWidth / 2.0;
  p1 -= halfLineWidth;
  p2 += halfLineWidth;
  vec3 ret = colorAxisAlignedBrushStroke(uv * rotMat, uv, inpColor, brushColor, p1, p2);
  return ret;
}
