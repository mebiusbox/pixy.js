vec2 p = pin.uv - time*0.1;
float lum = iqnoise(p * 48.0 * cNoiseFrequency, 1.0, 0.0);
pout.color = vec3(lum);

float graph = iqnoise(p.xx * 48.0 * cNoiseFrequency, 1.0, 0.0);