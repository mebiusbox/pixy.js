if (cBubblesVariation >= 2.0) {
  float delta = colDelta*2.0;
  float l = length(pin.position);
  float a = mod(atan(pin.position.x, pin.position.y), delta) - delta/4.0;
  float c= clr2(l,a);
  pout.color = c * mix(vec3(1.0), CLR, cColor);
}
else {
  float c = clr1(pin.position);
  pout.color = c * mix(vec3(1.0), CLR, cColor);
}