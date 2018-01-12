vec2 p = pin.uv - time*0.1;
float lum = fbm(p, cNoiseOctave, cNoiseFrequency * 128.0, cNoiseAmplitude);
pout.color = vec3(lum);

float graph = fbm(p.xx, cNoiseOctave, cNoiseFrequency * 128.0, cNoiseAmplitude);