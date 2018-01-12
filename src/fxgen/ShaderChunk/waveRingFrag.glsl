float u = sin((atan(pin.position.y, pin.position.x) + time * 0.5) * floor(cFrequency)) * cAmplitude;
float t = cWidth / abs(cRadius + u - length(pin.position));
t = pow(abs(t), cPowerExponent);
pout.color = vec3(t);