// uniform float cNoiseFrequency;
// uniform float cNoiseAmplitude;
// uniform float cNoisePersistence;
// uniform bool cNoiseSphereEnable;
// uniform bool cNoiseGraphEnable;
uniform float cNoiseLacunarity;
uniform float cGradientNoise;
uniform float cValueNoise;
uniform float cVoronoiNoise;
uniform float cVoronoiCell;
uniform float cSimplexNoise;
uniform float cRepeat;
uniform float cTurbulence;
uniform float cRidge;
uniform float cRidgeOffset;
uniform float cScaleShift;
uniform float cPowerExponent;
uniform float cBias;
uniform float cGain;
uniform float cThreshold;
uniform float cInvert;

vec2 coherentModulo(vec2 x, float period) {
    if (period > 0.0) {
        return mod(x, period);
    }

    return x;
}

vec3 coherentModulo(vec3 x, float period) {
    if (period > 0.0) {
        return mod(x, period);
    }

    return x;
}

// Ridged multifractal
// See "Texturing & Modeling, A Procedural Approach", Chapter 12
float coherentRidge(float h, float offset) {
    h = abs(h);      // create creases
    h = offset - h;  // invert so creases are at top
    h = h * h;       // sharpen creases
    return h;
}

float coherentBias(float x, float bias) {
    if (bias <= -1.) {
        return x;
    }
    bias = bias / (1. + bias);
    return (1. + x) / (1. - bias * (1. - x) * 0.5) - 1.;
}

float coherentGainFunc(float x, float gain) {
    return x * (1. + gain) / (1. + gain - (1. - x) * 2. * gain);
}

float coherentGain(float x, float gain) {
    if (x < 0.0) {
        return -coherentGainFunc(-x, gain);
    } else {
        return coherentGainFunc(x, gain);
    }
}

float coherentPerlinNoise(vec2 st, float period) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = smoothstep(0.0, 1.0, f);
    const vec2 off = vec2(0, 1);

    vec2 a = random2(coherentModulo(i + off.xx, period));
    vec2 b = random2(coherentModulo(i + off.yx, period));
    vec2 c = random2(coherentModulo(i + off.xy, period));
    vec2 d = random2(coherentModulo(i + off.yy, period));

    return mix(mix(dot(a, f - off.xx), dot(b, f - off.yx), u.x),
               mix(dot(c, f - off.xy), dot(d, f - off.yy), u.x), u.y);
}

float coherentPerlinNoise(vec3 st, float period) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    vec3 u = smoothstep(0.0, 1.0, f);
    const vec3 off = vec3(0, 1, 0);

    vec3 a1 = random3(coherentModulo(i + off.xxx, period));
    vec3 a2 = random3(coherentModulo(i + off.yxx, period));
    vec3 b1 = random3(coherentModulo(i + off.xyx, period));
    vec3 b2 = random3(coherentModulo(i + off.yyx, period));
    vec3 c1 = random3(coherentModulo(i + off.xxy, period));
    vec3 c2 = random3(coherentModulo(i + off.yxy, period));
    vec3 d1 = random3(coherentModulo(i + off.xyy, period));
    vec3 d2 = random3(coherentModulo(i + off.yyy, period));

    return mix(bimix(dot(a1, f - off.xxx), dot(a2, f - off.yxx), dot(b1, f - off.xyx),
                     dot(b2, f - off.yyx), u.x, u.y),
               bimix(dot(c1, f - off.xxy), dot(c2, f - off.yxy), dot(d1, f - off.xyy),
                     dot(d2, f - off.yyy), u.x, u.y),
               u.z);
}

// 3D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
// return: [-1,1]
float coherentValueNoise(vec3 st, float period) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    const vec2 off = vec2(0, 1);

    float a1 = random1(coherentModulo(i + off.xxx, period));
    float a2 = random1(coherentModulo(i + off.yxx, period));
    float b1 = random1(coherentModulo(i + off.xyx, period));
    float b2 = random1(coherentModulo(i + off.yyx, period));
    float c1 = random1(coherentModulo(i + off.xxy, period));
    float c2 = random1(coherentModulo(i + off.yxy, period));
    float d1 = random1(coherentModulo(i + off.xyy, period));
    float d2 = random1(coherentModulo(i + off.yyy, period));

    vec3 u = smoothstep(0.0, 1.0, f);
    return mix(bimix(a1, a2, b1, b2, u.x, u.y), bimix(c1, c2, d1, d2, u.x, u.y), u.z);
}

float coherentVoronoiNoise(vec3 st, float cell, float period) {
    vec2 i = floor(st.xy);
    vec2 f = fract(st.xy);

    float m_dist = 10.;
    vec2 m_point;

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(x), float(y));
            // Random position from current + neighbor place in the grid
            // vec2 point = random2(i_st + neighbor);
            vec2 point = hash2(coherentModulo(i + neighbor, period));
            // Animate the point
            point = 0.5 + 0.5 * sin(st.z + 6.2831 * point);
            // Vector between the pixel and the point
            vec2 diff = neighbor + point - f;
            // Distance to the point
            float dist = length(diff);

            // Keep the closer distance
            if (dist < m_dist) {
                m_dist = dist;
                m_point = point;
            }
        }
    }

    // return mix(m_dist, hash1(m_point), cell);
    float n = mix(m_dist, dot(m_point, vec2(.3, .6)), cell);
    return scaleShift(n, 2.0, -1.0);
}
// https://github.com/ashima/webgl-noise/blob/master/src/psrdnoise2D.glsl
// Copyright (c) 2016 Stefan Gustavson. All rights reserved.
vec2 coherentGrad2(vec2 p, float rot) {
    // For more istorpic gradients, sin/cos can be used instead
    float u = permute(permute(p.x) + p.y) * 0.0243902439 + rot; // Rotate by shift
    u = fract(u) * 6.28318530718;
    return vec2(cos(u), sin(u));
}
float coherentSimplexNoise(vec3 st, float period) {
    const vec2 off = vec2(0, 1);
    // Hack: offset y slightly to hide some rare artifacts
    st.y += 0.001;
    // Skew to hexagonal grid
    vec2 uv = vec2(st.x + st.y*0.5, st.y);
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    // Traversal order
    vec2 i1 = (f.x > f.y) ? off.yx : off.xy;
    // Unskewed grid poings in (x,y) space
    vec2 p0 = vec2(i.x - i.y * 0.5, i.y);
    vec2 p1 = vec2(p0.x + i1.x - i1.y * 0.5, p0.y + i1.y);
    vec2 p2 = vec2(p0.x + 0.5, p0.y + 1.0);
    // Integer grid point indices in (u,v) space
    i1 = i + i1;
    vec2 i2 = i + off.yy;
    // Vectors in unskewed (x,y) coordinates from
    // each of the simplex cornerse to the evaluation point
    vec2 d0 = st.xy - p0;
    vec2 d1 = st.xy - p1;
    vec2 d2 = st.xy - p2;

    // Wrap i, i1, and i2 to the desired period before gradient hasing:
    // wrap points in (x,y), map to (u,v)
    vec3 xw = coherentModulo(vec3(p0.x, p1.x, p2.x), period);
    vec3 yw = coherentModulo(vec3(p0.y, p1.y, p2.y), period);
    vec3 iuw = xw + 0.5 * yw;
    vec3 ivw = yw;

    // Create gradient from indices
    vec2 g0 = coherentGrad2(vec2(iuw.x, ivw.x), st.z);
    vec2 g1 = coherentGrad2(vec2(iuw.y, ivw.y), st.z);
    vec2 g2 = coherentGrad2(vec2(iuw.z, ivw.z), st.z);

    // Gradients dot vectors to corresponding corners
    // (The derivatives of this are simply the gradients)
    vec3 w = vec3(dot(g0,d0), dot(g1,d1), dot(g2,d2));

    // Radial weights from corners
    // 0.8 is the square of 2/sqrt(5), the distance from
    // a grid point to the nearest simplex bounndary
    vec3 t = 0.8 - vec3(dot(d0,d0), dot(d1,d1), dot(d2,d2));

#if 0 // analytical dervatives
    // Partial derivatives for analytical gradient computation
    vec3 dtdx = -2.0 * vec3(d0.x, d1.x, d2.x);
    vec3 dtdy = -2.0 * vec3(d0.y, d1.y, d2.y);

    // Set influence of each surflet to zero outside radius sqrt(0.8)
    if (t.x < 0.0) {
        dtdx.x = dtdy.x = 0.0;
        t.x = 0.0;
    }
    if (t.y < 0.0) {
        dtdx.y = dtdy.y = 0.0;
        t.y = 0.0;
    }
    if (t.z < 0.0) {
        dtdx.z = dtdy.z = 0.0;
        t.z = 0.0;
    }
#else
    // Set influence of each surflet to zero outsdie radius sqrt(0.8)
    t = max(t, 0.0);
#endif

    // Fource power of t (and third power for derivative)
    vec3 t2 = t*t;
    vec3 t4 = t2*t2;
    vec3 t3 = t2*t;

    // Final noise value is:
    // sum of ((radial weights) times (gradient dot vector from corner))
    float n = dot(t4, w);

#if 0 // analytical dervatives
    // Final analytical derivatve (gradient of a sum of scalar products)
    vec2 dt0 = vec2(dtdx.x, dtdy.x) * 4.0 * t3.x;
    vec2 dn0 = t4.x * g0 + dt0 * w.x;
    vec2 dt1 = vec2(dtdx.y, dtdy.y) * 4.0 * t3.y;
    vec2 dn1 = t4.y * g1 + dt1 * w.y;
    vec2 dt2 = vec2(dtdx.z, dtdy.z) * 4.0 * t3.z;
    vec2 dn2 = t4.z * g2 + dt2 * w.z;

    return 11.0 * vec3(n, dn0 + dn1, d2);
#else
    return 11.0 * n;
#endif
}

vec2 coherentTurbulent(vec2 st, float period, float strength) {
    const vec2 c = vec2(1.0, 0.0);
    const mat2 m = mat2(0.00, 0.80, -0.80, 0.36);
    float dx = coherentPerlinNoise(st+c.xy, period);
    float dy = coherentPerlinNoise(st+c.yx, period);
    vec2 displacement = vec2(dx,dy) * m * strength;
    return st+displacement;
}

float coherentNoiseFunc(vec3 st, float period) {
    float n = 0.0;
    n += coherentPerlinNoise(st, period) * cGradientNoise;
    n += coherentValueNoise(st, period) * cValueNoise;
    n += coherentVoronoiNoise(st, cVoronoiCell, period) * cVoronoiNoise;
    n += coherentSimplexNoise(st, period) * cSimplexNoise;
    return n / max(cGradientNoise+cValueNoise+cVoronoiNoise+cSimplexNoise,0.001);
}

float coherentNoise(vec3 st, float period) {
    // FREQ = 1.0
    // AMPL = 1.0
    // LACU = 2.0
    // GAIN = pow(2.0, -0.5);
    float amplitude = cNoiseAmplitude;
    float frequency = 1.0;
    float value = 0.0;
    float turbulence = 2.0;
    for (int i = 0; i < NOISE_OCTAVE_MAX; i++) {
        if (i >= cNoiseOctave) break;
        vec3 p = frequency * st;
        p.xy = mix(p.xy, coherentTurbulent(p.xy, period, turbulence), cTurbulence);
        float t = coherentNoiseFunc(p, period);
        t = mix(t, coherentRidge(t, cRidgeOffset), cRidge);
        value += amplitude * t;
        frequency *= cNoiseLacunarity;
        amplitude *= cNoisePersistence;
        period *= cNoiseLacunarity;
        turbulence += 0.01;
    }
    return value;
}