vec2 n = normalize(pin.position);
float t = cIntensity * 2.0 / length(pin.position);
float r = pnoise(n*resolution+time) * 2.0;
r = max(t-r, 0.0);
r = pow(r, cPowerExponent);
pout.color = vec3(r);