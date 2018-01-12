// http://glslsandbox.com/e#37112.0

// float dist = -Capsule(pin.position, vec2(1.0, 0), .25);
// dist = 1.0 - pow(dist, 2.0) * 4.0;
// if (abs(pin.position.y) < laserInnerWidth) {
//   float t = dist * abs(pin.position.y) / laserInnerWidth + 0.5;
//   dist = clamp(t, 0.0, dist);
// }

float dist = cWidth / abs(pin.position.x);
dist = clamp(pow(dist, 10.0), 0.0, 1.0);

float d2 = (0.1 * cInnerWidth) / abs(pin.position.x);
dist -= clamp(pow(d2, 2.0), 0.0, 1.0) * 0.5;

// vec3 c = vec3(dist*0.1, dist*0.4, dist*0.8);
// pout.color = mix(vec3(dist), c, laserColor);
pout.color = vec3(dist);