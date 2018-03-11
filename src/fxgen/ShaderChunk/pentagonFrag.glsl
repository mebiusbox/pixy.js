vec2 R = resolution.xy;
vec2 U = pin.coord;
vec2 V = U = (U+U-R) / R.y;
vec3 O = vec3(0.0);

U = U * rotate2d(0.3+time);

float p = 0.6283; // = 2Pi/10
float x,y;
float a = mod(atan(U.y,U.x) + p, p+p)-p; // 2Pi/5 symmetry
U = P(length(U), a)*1.25;
x = U.x;
y = U.y = abs(U.y); // mirror symmetry in each fan

// B S( x-0.6*cSize  - 0.4*y, 0.01+cWidth*0.01); // exterior thin wall
B S( x-cScale*0.5  - cAlpha*y, 0.5*cWidth); // exterior thin wall
// B S( x-0.67 + 1.2*y, 0.01) * S(abs(y), 0.04)*0.6;

// B S( x-cStarX*0.5  - cStarY*y, 0.5*cWidth) // thick wall
  // * max(S(y,0.45),
  //       C(P(0.83,p), 0.07));

// B S( x-0.46, 0.06) * S(y, 0.19) // interior bar attached to thick wall
//   * (1.0 - C(vec2(0.477,0.18), 0.045));

// U *= 0.72;
// B S( U.x-0.5 - 0.4*U.y, 0.05) * 0.3 // exterior pit (by scaling thick wall)
//   * max(S(U.y, 0.45),
//         C(P(0.83,p), 0.07))
//   * (0.6 + 0.4*cos(200.0*a)); // radial strips

// B S( x-1.7 - 0.4*y, 0.9) * 0.3
//   * max(0.0, cos(200.0*V.y) - 0.6); // background strips (V: before 5-sym)

// O += (1.0-O)*0.3; // B&W background
//O = mix(vec3(1.0, 0.95, 0.6), vec3(0.6, 0.3, 0.3), O); // background + color scheme
pout.color = O;
