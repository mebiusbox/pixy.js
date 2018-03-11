// https://www.shadertoy.com/view/Xl2Bz3
uniform float cRadius;
uniform float cWidth;
uniform float cThickness;
uniform float cColor;
uniform float cBubblesVariation;
#define TAU 6.28318530718
#define CLR vec3(0.388, 0.843, 0.976)
#define ROWS 9

#define COLS1 20
#define initialRad1 0.125
#define waveCenter1 0.41
#define waveWidth1 0.2
#define es1 0.01
#define dotRad1(x) TAU*x/float(COLS1)*0.4

#define COLS2 12
#define es2 4.0/resolution.y
#define initialRad2 0.175
#define waveCenter2 0.4325
#define waveWidth2 0.205
#define dotRad2(x) TAU*x/float(COLS2)*0.25
#define colDelta PI/float(COLS2)

float remap(float value, float minValue, float maxValue) {
  return clamp((value - minValue) / (maxValue - minValue), 0.0, 1.0);
}

float calcRowRad1(int rowNum) {
  float rad = initialRad1;
  rad += max(0.0, sin(time*3.0)) * step(0.0, cos(time*3.0)) * 0.0705;
  for (int i=0; i<ROWS; i++) {
    if (i >= rowNum) break;
    rad += dotRad1(rad) * 2.0;
  }
  return rad;
}

float calcRowRad2(int rowNum) {
  float rad = initialRad2;
  rad += max(0.0, sin(time*4.0)) * step(0.0, cos(time*4.0)) * 0.066;
  for (int i=0; i<ROWS; i++) {
    if (i >= rowNum) break;
    rad += dotRad2(rad) * 1.33;
  }
  return rad;
}

float clr1(vec2 st) {
  float clr = 0.0;
  float colStep = TAU/float(COLS1);
  for (int j=0; j<ROWS; j++) {
    float rowRad = calcRowRad1(j);
    for (int i=0; i<COLS1; i++) {
      vec2 dotCenter = vec2(rowRad, 0.0) * rotate2d(float(i) * colStep + (colStep * 0.5 * mod(float(j), 2.0)));
      float dotRad = dotRad1(rowRad);
      float dotClr = 1.0 - smoothstep(dotRad - es1, dotRad, length(st - dotCenter));
      float thickness = pow(remap(abs(length(dotCenter) - waveCenter1 * cRadius), 0.0, waveWidth1 * cWidth), 1.25*cThickness);
      dotClr *= smoothstep(dotRad * thickness - es1, dotRad * thickness, length(st - dotCenter));
      dotClr *= step(es1, 1.0 - thickness);
      clr += dotClr;
    }
  }
  return clr;
}

float clr2(float r, float a) {
  vec2 st = vec2(r*cos(a), r*sin(a));
  float clr = 0.0;
  for (int j=0; j<ROWS; j++) {
    float rowRad = calcRowRad2(j);
    vec2 dotCenter = vec2(rowRad, 0.0) * rotate2d(colDelta * mod(float(j), 2.0));
    float dotRad = dotRad2(rowRad);
    float dotClr = smoothstep(dotRad, dotRad - es2, length(st - dotCenter));
    float thickness = pow(remap(abs(length(dotCenter) - waveCenter2*cRadius), 0.0, waveWidth2*cWidth), 1.25*cThickness);
    dotClr *= smoothstep(dotRad * thickness - es2, dotRad * thickness, length(st - dotCenter));
    dotClr *= step(es2, 1.0 - thickness);
    clr += dotClr;
  }
  return clr;
}