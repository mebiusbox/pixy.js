mat3 m = mat3(-2,-1,2,3,-2,1,1,2,2);
vec3 a = vec3(pin.coord/vec2(100.0*cScale), time/(max(4.5-cSpeed,0.001)))*m;
vec3 b = a * m * .4;
vec3 c = b * m * .3;
pout.color = vec3(pow(min(
    min(length(.5-fract(a)), length(.5-fract(b))),
    length(.5-fract(c))),7.0) * 25.0);
pout.color += mix(vec3(.0), vec3(.0,.35,.5), cColor);
