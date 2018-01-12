// http://stackoverflow.com/questions/23213925/interpreting-color-function-and-adjusting-pixels-values
// https://gist.github.com/liovch/3168961
// https://github.com/liovch/GPUImage/blob/master/framework/Source/GPUImageColorBalanceFilter.m
vec4 texel = texture2D(tDiffuse, pin.uv);

float lightness = rgb2l(texel.rgb);

const float a = 0.25;
const float b = 0.333;
const float scale = 0.7;

float c1 = clamp((lightness - b) / -a + 0.5, 0.0, 1.0);
float c2 = clamp((lightness - b) / a + 0.5, 0.0, 1.0);
float c3 = clamp((lightness + b - 1.0) / -a + 0.5, 0.0, 1.0);
float c4 = clamp((lightness + b - 1.0) / a + 0.5, 0.0, 1.0);
vec3 shadows = cColorBalanceShadows * (c1 * scale);
vec3 midtones = cColorBalanceMidtones * (c2 * c3 * scale);
vec3 highlights = cColorBalanceHighlights * (c4 * scale);

vec3 newColor = texel.rgb + shadows + midtones + highlights;
newColor = clamp(newColor, 0.0, 1.0);

if (cColorBalancePreserveLuminosity) {
  vec3 newHSL = rgb2hsl(newColor);
  pout.color = hsl2rgb(vec3(newHSL.x, newHSL.y, lightness));
} else {
  pout.color = newColor.xyz;
}
pout.opacity = texel.w;