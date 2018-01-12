float rgb2gray(vec3 c) {
  return dot(c, vec3(0.3, 0.59, 0.11));
}


float rgb2l(vec3 c) {
  float fmin = min(min(c.r, c.g), c.b);
  float fmax = max(max(c.r, c.g), c.b);
  return (fmax + fmin) * 0.5; // Luminance
}


// https://github.com/liovch/GPUImage/blob/master/framework/Source/GPUImageColorBalanceFilter.m
vec3 rgb2hsl(vec3 c) {
  vec3 hsl;
  float fmin = min(min(c.r, c.g), c.b);
  float fmax = max(max(c.r, c.g), c.b);
  float delta = fmax - fmin;

  hsl.z = (fmax + fmin) * 0.5; // Luminance

  if (delta == 0.0) {  // This is a gray, no chroma...
    hsl.x = 0.0; // Hue
    hsl.y = 0.0; // Saturation
  } else { // Chromatic data...
    if (hsl.z < 0.5) {
      hsl.y = delta / (fmax + fmin); // Saturation
    } else {
      hsl.y = delta / (2.0 - fmax - fmin); // Saturation
    }

    float deltaR = (((fmax - c.r) / 6.0) + (delta / 2.0)) / delta;
    float deltaG = (((fmax - c.g) / 6.0) + (delta / 2.0)) / delta;
    float deltaB = (((fmax - c.b) / 6.0) + (delta / 2.0)) / delta;

    if (c.r == fmax) {
      hsl.x = deltaB - deltaG; // Hue
    } else if (c.g == fmax) {
      hsl.x = (1.0 / 3.0) + deltaR - deltaB; // Hue
    } else if (c.b == fmax) {
      hsl.x = (2.0 / 3.0) + deltaG - deltaR; // Hue
    }

    if (hsl.x < 0.0) {
      hsl.x += 1.0; // Hue
    } else if (hsl.x > 1.0) {
      hsl.x -= 1.0; // Hue
    }
  }
  return hsl;
}


float hue2rgb(float f1, float f2, float hue) {
  if (hue < 0.0) {
    hue += 1.0;
  } else if (hue > 1.0) {
    hue -= 1.0;
  }
  float res;
  if ((6.0*hue) < 1.0) {
    res = f1 + (f2-f1) * 6.0 * hue;
  } else if ((2.0 * hue) < 1.0) {
    res = f2;
  } else if ((3.0 * hue) < 2.0) {
    res = f1 + (f2-f1) * ((2.0/3.0) - hue) * 6.0;
  } else {
    res = f1;
  }
  return res;
}


vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb;
  if (hsl.y == 0.0) {
    rgb = vec3(hsl.z); // Luminace
  } else {
    float f2;
    if (hsl.z < 0.5) {
      f2 = hsl.z * (1.0 + hsl.y);
    } else {
      f2 = (hsl.z + hsl.y) - (hsl.y * hsl.z);
    }
    float f1 = 2.0 * hsl.z - f2;
    rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
    rgb.g = hue2rgb(f1, f2, hsl.x);
    rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
  }
  return rgb;
}


vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}