// https://www.shadertoy.com/view/XsXSWS by xbe

vec2 q = pin.uv;
q.y *= 2.0 - 1.0 * cPower;
float T3 = max(3.0, 1.25 * cStrength) * time;
q.x = mod(q.x, 1.0) - 0.5;
q.y -= 0.25;
float n = fbm(cStrength * q - vec2(0, T3));
float c = 2.0 * cIntensity - 16.0 * pow(max(0.0, length(q * vec2(3.0 - cWidth*3.0 + q.y*1.5, 0.75)) - n * max(0.0, q.y + 0.25)), 1.2);
float c1 = n * c * (1.5 - pow((2.50 / cRange)*pin.uv.y, 4.0));
c1 = clamp(c1, 0.0, 1.0);
vec3 col = vec3(1.5*c1, 1.5*c1*c1*c1, c1*c1*c1*c1*c1);

float a = c * (1.0 - pow(pin.uv.y, 3.0));
vec3 finalColor = mix(vec3(0.0), col, a);
float gray = rgb2gray(finalColor);
pout.color = mix(vec3(gray), finalColor, cColor);