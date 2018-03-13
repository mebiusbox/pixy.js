vec2 uv = pin.position;
float f = 0.0;
float f2 = 0.0;
float t = time * cSpeed;
float alpha = light(uv, cSize, cRadius, cFlameEyeInnerFade, cFlameEyeOuterFade);
float angle = atan(uv.x, uv.y);
float n = flameEyeNoise(vec2(uv.x*20.0+time, uv.y*20.0+time));
float l = length(uv);
if (l < cFlameEyeBorder) {
  t *= 0.8;
  alpha = (1.0 - pow(((cFlameEyeBorder-l)/cFlameEyeBorder),0.22)*0.7);
  alpha = clamp(alpha-light(uv, 0.2, 0.0, 1.3, 0.7)*0.55, 0.0, 1.0);
  f = flare(angle*1.0, alpha,-t*0.5+alpha);
  f2 = flare(angle*1.0, alpha,((-t+alpha*0.5+5.38134)));
}
else if (alpha < 0.001) {
  f = alpha;
}
else {
  f = flare(angle, alpha, t)*1.3;
}
vec3 col = vec3(f*(1.0 + sin(angle-t*4.0)*0.3) + f2*f2*f2, 
  f*alpha + f2*f2*2.0, 
  f*alpha*0.5 + f2*(1.0 + sin(angle + t*4.0)*0.3));
float gray = rgb2gray(col);
pout.color = mix(vec3(gray), col, cColor);