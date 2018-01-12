// https://www.shadertoy.com/view/MlKGDc by Iulian Marinescu Ghetau

initScene();

vec3 col0 = rayTrace(pin.coord + vec2(0.0, 0.0));
vec3 col1 = rayTrace(pin.coord + vec2(0.5, 0.0));
vec3 col2 = rayTrace(pin.coord + vec2(0.0, 0.5));
vec3 col3 = rayTrace(pin.coord + vec2(0.5, 0.5));
vec3 col = 0.25 * (col0 + col1 + col2 + col3);

vec3 gray = vec3(rgb2gray(col));
pout.color = mix(gray, col, cColor);