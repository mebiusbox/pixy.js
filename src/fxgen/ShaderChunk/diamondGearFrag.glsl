float g0 = gear(pin.position * mix(8.0, 1.0, cScale), cDiamondGearTeeth, time*0.1);
// float g1 = gear(pin.position*4.0-vec2(2.85,0.0), 9.0, -time*0.2);
// float g3 = gear(pin.position*3.0+vec2(2.35,0.0), 12.0, -time*0.15+0.125);
// float sd = min(min(g0,g1),g3);
// float val = smoothstep(0.0, 0.01, sd);
float val = smoothstep(0.0, 0.01, g0);
pout.color = vec3(clamp(1.0 - 1.0*val, 0.0, 1.0));