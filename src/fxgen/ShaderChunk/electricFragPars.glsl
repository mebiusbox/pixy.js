uniform float cFrequency;
uniform float cScale;

vec4 voronoi(in vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    vec2 o;
    // first pass: regular voronoi
    vec2 mg, mr;
    float oldDist;

    float md = 8.0;
    for (int j=-1;j<=1; j++) {
        for (int i=-1; i<=1; i++) {
            vec2 g = vec2(float(i), float(j));
            o = hash2(n+g);
            vec2 r = g + o - f;
            float d = dot(r,r);
            if (d<md) {
                md = d;
                mr = r;
                mg = g;
            }
        }
    }

    oldDist = md;

    // second pass: distance to borders
    md = 8.0;
    for (int j=-2;j<=2; j++) {
        for (int i=-2; i<=2; i++) {
            vec2 g = vec2(float(i), float(j));
            o = hash2(n+g);
            vec2 r = g + o - f;
            if (dot(mr-r,mr-r)>0.0001) {
                md = min(md, dot(0.5*(mr+r), normalize(r-mr)));
            }
        }
    }

    return vec4(md, mr, oldDist);
}