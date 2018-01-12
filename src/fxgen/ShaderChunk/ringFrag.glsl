float t = cWidth / (abs(cRadius - length(pin.position)));
t = pow(t, cPowerExponent);
pout.color = vec3(t);