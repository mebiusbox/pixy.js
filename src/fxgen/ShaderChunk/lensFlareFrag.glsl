// http://glslsandbox.com/e#36072.2

vec2 uv = pin.uv;
float tt = cRadius / abs(distance(uv, vec2(0.5)) * zoom);
float v = cRange / abs(length((vec2(0.5) - pin.uv) * vec2(0.03, 1.0)) * (zoom * 10.0));

vec3 finalColor = tex2D(uv) * 0.5 * cRadius;
tt = pow(tt, cPowerExponent);
v = pow(v, cPowerExponent);
finalColor += vec3(2.0 * tt, 4.0 * tt, 8.0 * tt);
finalColor += vec3(2.0 * v, 4.0 * v, 8.0 * v);

float x;

// ghost

// uv = pin.uv - 0.5;
// x = length(uv);
// uv *= pow(x, 4.0) * -100.0 + 1.0 / (x-0.5);
// uv = clamp(uv + 0.5, 0.0, 1.0);
// finalColor += tex2D(uv);

// ghost with double chroma
// uv = pin.uv - 0.5;
// x = length(uv);
// uv *= pow(x, 16.0) * -1000000.0 + 0.2 / (x-0.3);
// uv = clamp(uv + 0.5, 0.0, 1.0);
// finalColor += tex2D(uv);

// chroma
// uv = pin.uv - 0.5;
// x = length(uv);
// uv *= pow(x, 16.0) * -20000.0 + 0.2 / (x*x+5.0);
// uv = clamp(uv + 0.5, 0.0, 1.0);
// finalColor += tex2D(uv);

// double chroma
// uv = pin.uv - 0.5;
// x = length(uv);
// uv *= pow(x, 16.0) * -10000.0 + 0.2 / (x*x);
// uv = clamp(uv + 0.5, 0.0, 1.0);
// finalColor += tex2D(uv);

vec2 D = 0.5 - pin.uv;
vec3 o = vec3(-D.x * 0.4, 0.0, D.x * 0.4);
vec3 lx = vec3(0.01, 0.01, 0.3);
vec2 S = pin.uv - 0.5;
vec2 m = 0.5 * S;
m.xy *= pow(4.0 * length(S), 1.0);
m.xy *= -2.0;
m.xy = 0.5 + m.xy;

vec3 e = tex2D(m.xy);
S = (m.xy - 0.5) * 1.75;
e *= clamp(1.0 - dot(S,S), 0.0, 1.0);

float n = max(e.x, max(e.y, e.z)), c = n / (1.0 + n);
e.xyz *= c;
finalColor += e;

vec3 gray = vec3(rgb2gray(finalColor));
pout.color = mix(gray, finalColor, cColor);