// https://www.shadertoy.com/view/4tdSDr

#define S 4
vec2 I = pin.coord;
vec2 R = resolution;
I = I+I-R;
vec4 O = vec4(1.0,1.0,0.0,0.0);
mat2 M;
for (int i=0; i<S+S; i++) {
  M = mat2(O.y=cos(O.x=acos(-1.0)*float(i)/float(S)), O.z=sin(O.x), -O.z,O.y);
  I *= M;
  O.a = max(O.a, calc((I+R)/(R+R)));
}
pout.color = O.aaa;