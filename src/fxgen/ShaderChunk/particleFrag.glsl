vec3 col = vec3(0.);
for (float i=0.0; i<PARTICLE_COUNT; i++) {
    if (i>=cCount) break;
    float seed = SEED + floor(i/cCount+time);
    vec2 anchor = vec2(0.5, 0.5);
    vec2 velocity = vec2(mix(-.5, .5, rand(vec2(seed,i))),mix(-.5, .5, rand(vec2(i,seed)/3.)));
    float creationTime = time - fract(i/cCount + time);
    col += particle(pin.uv, 0., anchor, velocity, creationTime) * currentColor();
}
col = smoothstep(.6, .9, col);
pout.color = vec3(rgb2gray(col));