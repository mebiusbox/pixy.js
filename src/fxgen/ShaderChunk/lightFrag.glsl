// http://glslsandbox.com/e#30670.0

float size = 200.0 * cRadius;
float lum = size/length(pin.coord - resolution*0.5);
vec3 c = vec3(lum, pow(max(lum*0.9,0.0), 2.0)*0.4, pow(max(lum*0.8, 0.0), 3.0)*0.15);
c = pow(c, vec3(cPowerExponent));
vec3 g = vec3(rgb2gray(c));
pout.color = mix(g, c, cColor);