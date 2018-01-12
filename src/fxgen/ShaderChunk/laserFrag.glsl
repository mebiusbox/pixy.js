// http://glslsandbox.com/e#26951.0

float t = abs(cWidth / (sin(pin.position.x + sin(pin.position.y*0.0) * pin.position.y) * 5.0));
t -= (1.0 - abs(cWidth / (sin(pin.position.x) * 0.5))) * 4.0;
vec3 c = vec3(t*0.1, t*0.4, t*0.8);
vec3 g = vec3(rgb2gray(c));
pout.color = mix(g, c, cColor);