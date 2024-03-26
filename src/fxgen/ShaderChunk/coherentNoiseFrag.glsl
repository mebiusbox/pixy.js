vec2 p = pin.uv * cNoiseFrequency;
float period = cNoiseFrequency / max(cRepeat, 1.0);
float n = coherentNoise(vec3(p, time), period);
n = mix(n, scaleShift(n, 0.5, 0.5), cScaleShift);
n = coherentBias(n, cBias);
n = coherentGain(n, cGain);
n = pow(abs(n), cPowerExponent) * sign(n);
n = mix(0.0, n, step(cThreshold, abs(n)));
n = mix(n, 1.0 - min(max(n,0.0),1.0), cInvert);
pout.color = vec3(n);

float graph = n;