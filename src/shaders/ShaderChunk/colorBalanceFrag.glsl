uniform vec3 cColorBalanceColor;
uniform sampler2D tDiffuse;
varying vec2 vUv;
// http://stackoverflow.com/questions/23213925/interpreting-color-function-and-adjusting-pixels-values
// https://gist.github.com/liovch/3168961
// https://github.com/liovch/GPUImage/blob/master/framework/Source/GPUImageColorBalanceFilter.m

float rgb2l(vec3 c) {
  float fmin = min(min(c.r, c.g), c.b);
  float fmax = max(max(c.r, c.g), c.b);
  return (fmax + fmin) * 0.5; // Luminance
}

void main() {
  vec4 texel = texture2D(tDiffuse, vUv);

  float lightness = rgb2l(texel.rgb);

  const float a = 0.25;
  const float b = 0.333;
  const float scale = 0.7;

  float c2 = clamp((lightness - b) / a + 0.5, 0.0, 1.0);
  float c3 = clamp((lightness + b - 1.0) / -a + 0.5, 0.0, 1.0);
  vec3 midtones = cColorBalanceColor * (c2 * c3 * scale);

  vec3 newColor = texel.rgb + midtones;
  newColor = clamp(newColor, 0.0, 1.0);
  gl_FragColor = vec4(newColor, 1.0);
}