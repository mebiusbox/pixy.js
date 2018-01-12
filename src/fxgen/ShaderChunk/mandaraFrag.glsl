// https://www.shadertoy.com/view/MtcSz4

vec2 p = pin.position * 0.7;
vec2 f = vec2(length(p), atan(p.y, p.x));
float T0 = cos(0.3*time);
float T1 = 0.5 + 0.5*T0;
float T2 = sin(0.15*time);

float m0 = 0.0;
float m1 = 0.0;
float m2 = 0.0;
float m3 = 0.0;
float m4 = 0.0;

if (f.x < cRadius) {
  f.y += 0.1 * time;
  vec2 c;
  vec2 f2;

  c = vec2(0.225 -0.1*T0, PI/4.0);
  if (f.x < 0.25) {
    for (float i=0.0; i<2.0; ++i) {
      f2 = mod(f,c)-0.5*c;
      m0 += spiral(vec2(f2.x, f2.y), 192.0);
    }
  }

  c = vec2(0.225 -0.1*T0, PI/4.0);
  if (f.x < cInnerRadius) {
    for (float i=0.0; i<2.0; ++i) {
      f.y += PI/8.0;
      f2 = mod(f,c)-0.5*c;
      m1 += rose((0.75-0.5*T0)*f2, 0.4*T1, 24.0);
      m1 += rose2((0.5+0.5*T1)*f2, 0.2+0.2*T0, 36.0);
    }
  }

  c = vec2(0.6 -0.2*T0, PI/4.0);
  if (f.x > cInnerRadius2) {
    for (float i=0.0; i<2.0; ++i) {
      f.y += PI/8.0;
      f2 = mod(f,c)-0.5*c;
      m2 += spiral(vec2((0.25+0.5*T1)*f2.x, f2.y), 392.0);
//       m2 += rose2((1.0+0.25*T0)*f2, 0.5, 24.0);
    }
  }

//   c = vec2(0.4 -0.23*T0, PI/4.0);
//   if (f.x < 0.265) {
//     for (float i=0.0; i<2.0; ++i) {
//       f.y += PI/8.0;
//       f2 = mod(f,c)-0.5*c;
//       m3 += spiral(f2, 256.0);
//       m3 += rose(f2, 1.5*T1, 16.0);
//     }
//   }

  m4 += circle(f, 0.040, 192.0);
  m4 += circle(f, cInnerRadius2, 192.0);
  m4 += circle(f, cInnerRadius, 192.0);

}

// m4 += circle(f, cRadius, 192.0);

// color
float z = m0+m1+m2+m3+m4;
z *= z;
z = clamp(z, 0.0, 1.0);
pout.color = vec3(z);