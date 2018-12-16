vec3 color = vec3(0.0);
float s = 1.0;
for (int i=0; i<numLayers; ++i) {
    if (float(i)>=cDensity) break;
    float sn = 0.0;
    float y = 0.0;
    
    vec2 deriv;
    float nx = smplxNoise2D(pin.position*s*mix(10., 1., cScale), deriv, 0.1+1./s, 0.0);
    float ny = smplxNoise2D(pin.position*s*mix(10., 1., cScale), deriv, 0.11+1./s, 0.0);
    for (int j=0; j<wormLength; ++j) {
        if (float(j)>=cSize) break;
        sn += smplxNoise2D(pin.position*s+vec2(1./s,0.)+vec2(nx,ny)*4., deriv, 0.2+1./s, y);
        color += vec3(norm(deriv).z)/s;
        y += 0.1;
    }
    s *= 1.1;
}
color /= 4.;

vec2 deriv;
float delay = smplxNoise2D(pin.position*s*1., deriv, 0.111, 0.);
pout.color = mix(color, vec3(1.0)-color, clamp(sin(time*0.25+pin.position.x*.5+delay*32.)*32., 0.0, 1.0));