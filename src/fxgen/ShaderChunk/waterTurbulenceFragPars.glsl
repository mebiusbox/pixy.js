uniform float cScale;
uniform float cIntensity;

#define MAX_ITER 2.0

float Turb(vec2 p) {
    vec2 i = p;
    float c = 0.0;
    float inten = cIntensity;
    float r = length(p + vec2(sin(time), sin(time*0.433+2.))*3.);
    for (float n=0.0; n<MAX_ITER; n++) {
        float t = r-time * (1.0 - (1.9/(n+1.)));
        t = r-time/(n+.6);//r-time*(1.+.5/float(n+1.)));
        i -= p + vec2(
            cos(t-i.x-r)+sin(t+i.y),
            sin(t-i.y)+cos(t+i.x)+r);
            c += 1./length(vec2(sin(i.x+t)/inten, cos(i.y+t)/inten));
    }
    c /= float(MAX_ITER);
    c = clamp(c,-1.,1.);
    return c;
}