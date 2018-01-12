// float t = 1.0 / (length(pin.position) * solarIntensity);
float t = cIntensity / (length(pin.position));
t = pow(t, cPowerExponent);
pout.color = vec3(t);