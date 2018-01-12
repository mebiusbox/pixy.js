// port from https://www.shadertoy.com/view/lsySzd
// "Volumetric explosion" by Duke
//-------------------------------------------------------------------------------------
// Based on "Supernova remnant" (https://www.shadertoy.com/view/MdKXzc) 
// and other previous shaders 
// otaviogood's "Alien Beacon" (https://www.shadertoy.com/view/ld2SzK)
// and Shane's "Cheap Cloud Flythrough" (https://www.shadertoy.com/view/Xsc3R4) shaders
// Some ideas came from other shaders from this wonderful site
// Press 1-2-3 to zoom in and zoom out.
// License: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
//-------------------------------------------------------------------------------------
  
// ro: ray origin
// rd: direction of the ray
vec3 rd = normalize(vec3((pin.coord.xy - 0.5*resolution.xy) / resolution.y, 1.0));
vec3 ro = vec3(0.0, 0.0, -6.0);

#ifdef DITHERING
vec2 seed = pin.uv + fract(time);
#endif

// ld, td: local, total density
// w: weighting factor
float ld = 0.0, td = 0.0, w = 0.0;

// t: length of the ray
// d: distance function
float d = 1.0, t = 0.0;

const float h = 0.1;
vec4 sum = vec4(0.0);
float min_dist = 0.0, max_dist = 0.0;

if (raySphereIntersect(ro, rd, min_dist, max_dist)) {
  t = min_dist * step(t, min_dist);
  for (int i=0; i<86; i++) {

    vec3 pos = ro + t*rd;

    if (td > 0.9 || d < 0.12*t || t > 10.0 || sum.a > 0.99 || t > max_dist) break;

    float d = map(pos);
    d = abs(d) + 0.07;
     // change this starting to control density
    d = max(d, 0.03);

     // point light calculations
    vec3 ldst = vec3(0.0) - pos;
    float lDist = max(length(ldst), 0.001);

     // the color of light
    vec3 lightColor = vec3(1.0, 0.5, 0.25);
//     sum.rgb += (lightColor / exp(lDist*lDist*lDist*0.08)/30.0);// bloom
    sum.rgb += (lightColor / exp(lDist*lDist*lDist*0.15)/(30.0 - 20.0 * cBloom));// bloom

    if (d < h) {
       // compute local density
      ld = h - d;
       // compute weighting factor
      w = (1.0 - td) * ld;
       // accumulate density
      td += w + 1.0 / 200.0;

      vec4 col = vec4(computeColor(td, lDist), td);
       // emission
      sum += sum.a * vec4(sum.rgb, 0.0) * cEmission / lDist;
       // uniform scale density
      col.a *= 0.2;
       // colour by alpha
      col.rgb *= col.a;
       // alpha blend in contribution
      sum = sum + col*(1.0 - sum.a);
    }

    td += 1.0 / 70.0;

    #ifdef DITHERING
    d = abs(d) * (0.8 + 0.2*rand2(seed*vec2(i)*0.123));
    #endif
     // trying to optimize step size
//     t += max(d*0.25, 0.01);
    t += max(d * 0.08 * max(min(length(ldst), d), 2.0), 0.01);
  }
// simple scattering
//   sum *= 1.0 / exp(ld * 0.2) * 0.9;
  sum *= 1.0 / exp(ld * 0.2) * 0.8;
  sum = clamp(sum, 0.0, 1.0);
  sum.xyz = sum.xyz * sum.xyz * (3.0 - 2.0 * sum.xyz);
}

vec3 gray = vec3(rgb2gray(sum.xyz));
sum.xyz = mix(gray, sum.xyz, cColor);

#ifdef TOENMAPPING
pout.color = toneMapFilmicALU(sum.xyz*2.02);
#else
pout.color = sum.xyz;
#endif