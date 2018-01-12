float u = sin((atan(pin.position.y, pin.position.x) + time * 0.5) * floor(cPetals)) * cRadius;
float t = cIntensity / abs(u - length(pin.position));
t = pow(abs(t), cPowerExponent);
pout.color = vec3(t);