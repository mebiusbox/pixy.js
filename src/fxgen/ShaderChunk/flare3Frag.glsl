// https://www.shadertoy.com/view/4sX3Rs#
vec2 pos = vec2(0.5);
vec2 uv = pin.uv - 0.5;
vec2 uvd = uv * length(uv);
vec2 p = vec2(0.0) - uv;
float ang = atan(p.x, p.y);
float dist = length(p); dist = pow(dist, 0.1);
float f0 = cIntensity / (length(uv-p)*16.0+1.0);
f0 = f0+f0*(sin(noise(time + (pos.x+pos.y)*2.2 + ang*4.0+5.954)*16.0)*0.1+dist*0.1+0.8);

// float f1 = max(0.01-pow(length(uv+1.2*pos),1.9),.0)*7.0;
// float f2 = max(1.0/(1.0+32.0*pow(length(uvd+0.8*pos),2.0)),.0)*00.25;
// float f22 = max(1.0/(1.0+32.0*pow(length(uvd+0.85*pos),2.0)),.0)*00.23;
// float f23 = max(1.0/(1.0+32.0*pow(length(uvd+0.9*pos),2.0)),.0)*00.21;
// 
// vec2 uvx = mix(uv,uvd,-0.5);
// float f4 = max(0.01-pow(length(uvx+0.4*pos),2.4),.0)*6.0;
// float f42 = max(0.01-pow(length(uvx+0.45*pos),2.4),.0)*5.0;
// float f43 = max(0.01-pow(length(uvx+0.5*pos),2.4),.0)*3.0;
// 
// uvx = mix(uv,uvd,-.4);
// float f5 = max(0.01-pow(length(uvx+0.2*pos),5.5),.0)*2.0;
// float f52 = max(0.01-pow(length(uvx+0.4*pos),5.5),.0)*2.0;
// float f53 = max(0.01-pow(length(uvx+0.6*pos),5.5),.0)*2.0;
// 
// uvx = mix(uv,uvd,-0.5);
// float f6 = max(0.01-pow(length(uvx-0.3*pos),1.6),.0)*6.0;
// float f62 = max(0.01-pow(length(uvx-0.325*pos),1.6),.0)*3.0;
// float f63 = max(0.01-pow(length(uvx-0.35*pos),1.6),.0)*5.0;

vec3 c = vec3(.0);
// c.r+=f2+f4+f5+f6; c.g+=f22+f42+f52+f62; c.b+=f23+f43+f53+f63;
// c = c*1.3 - vec3(length(uvd)*.05);
c+=vec3(f0);

c *= vec3(1.4, 1.2, 1.0);
c -= noise(pin.uv) * 0.015;
c = cc(c, 0.5, 0.1);

float t = c.x;
t = pow(t, cPowerExponent);

pout.color = vec3(t);
// pout.color = vec3(f0);
// pout.color = vec3(iqnoise(pin.uv*64.0, 0.0, 0.0));