// https://www.shadertoy.com/view/MlBfWz
uniform float cScale;
uniform float cAlpha;
uniform float cWidth;

#define P(r,a) (r)*vec2(cos(a),sin(a)) // to polar
#define S(v,tk) smoothstep(2.0/R.y, -2.0/R.y, abs(v)-(tk)) // darw bar (antialiased)
#define C(p,r) (S(length(U-p), r) + S(length(U-p*vec2(1.0,-1.0)), r)) // draw(2 sym disks)
#define B O += (1.0-O)* // blend