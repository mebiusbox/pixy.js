uniform float cDensity;
uniform float cScale;
uniform float cTrabeculumVariation;
uniform float cCameraTilt;
uniform float cCameraPan;
uniform float cColor;

const vec3 skyColor = 0.*vec3(.7,.8,1.); const float skyTrsp = .5;

float grad = .2/2., scale = 5., thresh = .5;

vec3 hash13(float n) {
    return fract(sin(n+vec3(0.,12.345,124))*43758.5453);
}
float hash31(vec3 n) {
    return rand(n.x+10.*n.y+100.*n.z);
}
vec3 hash33(vec3 n) {
    return hash13(n.x+10.*n.y+100.*n.z);
}
vec4 worley(vec3 p) {
    vec4 d = vec4(1e15);
    vec3 ip = floor(p);
    for (float i=-1.;i<2.; i++) {
        for (float j=-1.;j<2.;j++) {
            for (float k=-1.;k<2.;k++) {
                vec3 p0 = ip + vec3(i,j,k);
                vec3 c  = hash33(p0)+p0-p;
                float d0 = dot(c,c);
                if      (d0<d.x) { d.yzw = d.xyz; d.x=d0; }
                else if (d0<d.y) { d.zw  = d.yz;  d.y=d0; }
                else if (d0<d.z) { d.w   = d.z;   d.z=d0; }
                else if (d0<d.w) {                d.w=d0; }
            }
        }
    }
    return sqrt(d);
}

float tweaknoise(vec3 p, bool step) {
    float d1 = smoothstep(grad/2., -grad/2., length(p)-.5);
    float d2 = smoothstep(grad/1., -grad/1., abs(p.z)-.5);
    float d= d1;
    if (cTrabeculumVariation <= .0) d = (1.-d1)*d2;
    if (cTrabeculumVariation >= 2.) d = d2;
    if (d < .5) return 0.;
    grad=.8;
    scale = mix(2.,10.,cScale);
    thresh = .5+.5*(cos(.5*time)+.36*cos(.5*3.*time))/1.36;
    vec4 w = scale*worley(scale*p-vec3(0.,0.,3.*time));
    float v = 1.-1./(1./(w.z-w.x)+1./(w.a-w.x));

    return smoothstep(thresh-grad/2., thresh+grad/2., v*d);
}
