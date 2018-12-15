uniform float cRadialMask;
float radialMask(in vec2 uv) {
    vec2 p = abs(fract(uv) - vec2(0.5)) * 2.0;
    return max(1.0-dot(p,p), 0.0001);
}
float linearMask(in vec2 uv) {
    vec2 p = abs(fract(uv) - vec2(0.5));
    return max((0.5-max(p.x,p.y)) / 0.5, 0.0001);
}