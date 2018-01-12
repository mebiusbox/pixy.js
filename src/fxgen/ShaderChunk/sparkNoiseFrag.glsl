float lum = fbm(vec3(pin.uv * 16.0 * cNoiseFrequency, time));
pout.color = vec3(lum);

float graph = fbm(vec3(pin.uv.xx * 16.0 * cNoiseFrequency, time));