float t = 0.02 / abs(sin(time) - length(pin.position));
pout.color = vec3(t);