float u = abs(sin((atan(pin.position.y, pin.position.x) - length(pin.position) + time) * floor(cPetals)) * cRadius) + cOffset;
float t = cIntensity / abs(u - length(pin.position));
t = pow(abs(t), cPowerExponent);
pout.color = vec3(t);