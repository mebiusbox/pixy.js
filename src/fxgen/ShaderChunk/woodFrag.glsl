float t = sin(length(pin.position) * cFrequency + time * 5.0);
// float t = sin(length(pin.mouse - pin.position) * 30.0 + time * 5.0);
t = pow(t, cPowerExponent);
pout.color = vec3(t);