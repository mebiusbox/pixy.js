t = time * cSpeed;

float c = .0;
if (cDensity > 4.) c += snow(pin.uv, 30.);
if (cDensity > 3.) c += snow(pin.uv, 15.);
if (cDensity > 2.) c += snow(pin.uv, 10.);
c += snow(pin.uv, 5.);
if (cDensity > 1. && cDensity < 5.5) c += snow(pin.uv, 3.);


vec3 finalColor = vec3(c*.6);

vec2 v = pin.position;
finalColor *= (.5+cRange - sqrt((v.x*v.x) + (v.y*v.y)))*2.5;

// vec2 p = pin.uv;
// p = 2.*p - 2.;
// p.x *= resolution.x / resolution.y;
// p.x -= time * .125;
// float a = 0.5;
// float n = pin.coord.y / resolution.y;
// n *= n;
// n *= snowNoise(p*2.) * a;
// finalColor += vec3(n) * 1.2;

pout.color = finalColor;