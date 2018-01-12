// https://www.shadertoy.com/view/MdX3zr
vec2 v = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
v.x *= resolution.x / resolution.y;

vec3 org = vec3(0.0, -2.0, 4.0);
vec3 dir = normalize(vec3(v.x*1.6 / cWidth, -v.y, -1.5 * cScale));

vec4 p = raymarch(org, dir);
float glow = p.w;

// vec4 col = mix(vec4(1.0, 0.5, 0.1, 1.0), vec4(0.1, 0.5, 1.0, 1.0), p.y*0.02 + 0.4);
// col = mix(vec4(0.0), col, pow(glow*2.0, 4.0));
vec4 col = mix(vec4(0.0), vec4(1.0), pow(glow*2.0*cIntensity, 4.0));
pout.color = col.xyz;
pout.opacity = col.w;