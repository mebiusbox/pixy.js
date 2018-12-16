uniform float cDensity;
uniform float cSize;
uniform float cScale;

// https://www.shadertoy.com/view/MstBD4
// Number of layars.
// Higher value shows more layers of effects
// Lower value higer FPS.
const int numLayers = 16;

//Length of worm
const int wormLength = 8;

float squigglesRand(vec3 pos) {
    vec3 p = pos + vec3(2.);
    vec3 fp = fract(p*p.yzx*222.)+vec3(2.);
    p.y *= p.z * fp.x;
    p.x *= p.y * fp.y;
    return fract(p.x*p.x);
}

float skewF(float n) {
    return (sqrt(n+1.0)-1.0)/n;
}

float unskewG(float n) {
    return (1.0/sqrt(n+1.0)-1.0)/n;
}

vec2 smplxNoise2DDeriv(vec2 x, float m, vec2 g) {
    vec2 dmdxy = min(dot(x,x)-vec2(0.5), 0.0);
    dmdxy = 8.*x*dmdxy*dmdxy*dmdxy;
    return dmdxy*dot(x,g) + m*g;
}

float smplxNoise2D(vec2 p, out vec2 deriv, float randKey, float roffset) {
    // i is a skewed coordinate of a bottom vertex of a simplex where p is in.
    vec2 i0 = floor(p+vec2(p.x+p.y)*skewF(2.0));
    // x0, x1, x2 are unskewed displacement vectors.
    float unskew = unskewG(2.0);
    vec2 x0 = p-(i0+vec2((i0.x+i0.y)*unskew));

    vec2 ii1 = x0.x > x0.y ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 ii2 = vec2(1.0);
    vec2 x1 = x0 - ii1 - vec2(unskew);
    vec2 x2 = x0 - ii2 - vec2(2.0*unskew);

    vec3 m = max(vec3(0.5)-vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    m = m*m;
    m = m*m;

    float r0 = 3.1416*2.0*squigglesRand(vec3(mod(i0, 16.0)/16.0, randKey));
    float r1 = 3.1416*2.0*squigglesRand(vec3(mod(i0+ii1, 16.0)/16.0, randKey));
    float r2 = 3.1416*2.0*squigglesRand(vec3(mod(i0+ii2, 16.0)/16.0, randKey));

    float randKey2 = randKey + 0.01;
    float spmin = 0.5;
    float sps = 2.0;
    float sp0 = spmin + sps*squigglesRand(vec3(mod(i0, 16.0)/16.0, randKey2));
    float sp1 = spmin + sps*squigglesRand(vec3(mod(i0+ii1, 16.0)/16.0, randKey2));
    float sp2 = spmin + sps*squigglesRand(vec3(mod(i0+ii2, 16.0)/16.0, randKey2));

    r0 += time*sp0 + roffset;
    r1 += time*sp1 + roffset;
    r2 += time*sp2 + roffset;

    // Gradients
    vec2 g0 = vec2(cos(r0), sin(r0));
    vec2 g1 = vec2(cos(r1), sin(r1));
    vec2 g2 = vec2(cos(r2), sin(r2));

    deriv = smplxNoise2DDeriv(x0, m.x, g0);
    deriv += smplxNoise2DDeriv(x1, m.y, g1);
    deriv += smplxNoise2DDeriv(x2, m.z, g2);

    return dot(m*vec3(dot(x0,g0), dot(x1,g1), dot(x2,g2)), vec3(1.0));
}

vec3 norm(vec2 deriv) {
    deriv *= 2000.0;
    vec3 tx = vec3(1.0, 0.0, deriv.x);
    vec3 ty = vec3(0.0, 1.0, deriv.y);
    return normalize(cross(tx,ty));
}
