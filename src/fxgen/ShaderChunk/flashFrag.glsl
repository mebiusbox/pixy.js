float t = atan(pin.position.y, pin.position.x) + time;
t = sin(t * cFrequency);
t = pow(t, cPowerExponent);
pout.color = vec3(t);