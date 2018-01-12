// float t = 1.1 - length(pin.mouse - pin.position);
float t = cRadius - length(pin.position);
t = pow(t, cPowerExponent);
pout.color = vec3(t);