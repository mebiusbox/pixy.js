vec2 camctrl = vec2(cCameraPan, cCameraTilt);
if (camctrl.x+camctrl.y == 0.) camctrl.xy = vec2(0.5);

float theta = (camctrl.x*2.-1.)*PI;
float phi = (camctrl.y-.5)*PI;
float t=3.*time, B=.07; theta += B*cos(t); phi += B*sin(t);

vec3 cameraPos = vec3(sin(theta)*cos(phi), sin(phi), cos(theta)*cos(phi));
vec3 cameraTarget = vec3(0.);
vec3 ww = normalize(cameraPos - cameraTarget);
vec3 uu = normalize(cross(vec3(0.,1.,0.), ww));
vec3 vv = normalize(cross(ww,uu));
vec2 q = 2.*(pin.uv - vec2(.5,.5));
vec3 rayDir = normalize(q.x*uu + q.y*vv - 1.5*ww);

vec3 col = vec3(0.);
float transp=1., epsC = .01/2.;
float l = .5;
float density = cDensity * 200.;
vec3 p = cameraPos + l*rayDir, p_=p;
for (int i=0; i<200; i++) {
    if (float(i)>=density) break;
    float Aloc = tweaknoise(p,true);
    if (Aloc>0.01) {
        float a = 2.*PI*float(i)/density;
        vec3 c = .5+.5*cos(a+vec3(0.,2.*PI/3.,-2.*PI/3.)+time);
        col += transp*c*Aloc;
        col = clamp(col, 0., 1.);
        transp *= 1.-Aloc;
        if (transp<.001) break;
    }
    p += epsC*rayDir;
}
vec3 rgb = col+transp*skyColor;
vec3 gray = vec3(rgb2gray(rgb));
pout.color = mix(gray, rgb, cColor);
