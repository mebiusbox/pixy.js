// float threshold = bayer(5, vScreenPos.xy * (100.0 + mod(time, 0.5)));
  float threshold = bayer(5, vScreenPos.xy * 100.0);
  material.opacity = step(threshold, material.opacity);
// material.opacity = threshold;