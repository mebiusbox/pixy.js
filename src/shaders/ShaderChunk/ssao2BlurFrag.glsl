#define KERNEL_RADIUS 4
uniform sampler2D tAO;
uniform vec4 blurParams;
varying vec2 vUv;

float CrossBilateralWeight(float r, float ddiff, inout float w_total) {
  float w = exp(-r*r*blurParams.z) * (ddiff < blurParams.w ? 1.0 : 0.0);
  w_total += w;
  return w;
}

// Performs a gaussian blur in one direction
vec2 Blur(vec2 texScale) {
  vec2 centerCoord = vUv;
  float w_total = 1.0;
  vec2 aoDepth = texture2D(tAO, centerCoord).xy;
  float totalAo = aoDepth.x;
  float centerZ = aoDepth.y;
  // [unroll]
  for (int i=-KERNEL_RADIUS; i<KERNEL_RADIUS; i++) {
    vec2 texCoord = centerCoord + (float(i)*texScale);
    vec2 sampleAoZ = texture2D(tAO, texCoord).xy;
    float diff = abs(sampleAoZ.y - centerZ);
    float weight = CrossBilateralWeight(float(i), diff, w_total);
    totalAo += sampleAoZ.x * weight;
  }
  
  return vec2(totalAo / w_total, centerZ);
}

void main() {
  gl_FragColor = vec4(Blur(vec2(blurParams.x, blurParams.y)), 0.0, 1.0);
}