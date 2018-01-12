// http://glslsandbox.com/e#37373.0
float t = fworley(pin.uv * resolution.xy / 1500.0) * cIntensity;
t = pow(t, cPowerExponent);
// t *= exp(-lengthSqr(abs(0.7 * pin.uv - 1.0)));
// "pout.color = t * vec3(0.1, 1.5*t, 1.2*t + pow(t, 0.5-t));"
pout.color = vec3(t);