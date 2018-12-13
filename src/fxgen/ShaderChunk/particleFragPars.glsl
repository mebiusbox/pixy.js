// https://www.shadertoy.com/view/llGBWw
uniform float cSize;
uniform float cLifeTime;
uniform float cGravity;
uniform float cCount;
#define SEED 0.12345679
#define GRAV vec2(0,-.26)
#define SIZE 0.024
#define DIE_TIME 0.9
#define PARTICLE_COUNT 500.0

float particle(vec2 uv, float identifier, vec2 anchor, vec2 velocity, float creationTime) {
    float particleTime = max(0., time - creationTime);
    float size = max(0., cLifeTime - particleTime) * cSize;
    vec2 velocityOffset = velocity * particleTime;
    vec2 gravityOffset = vec2(0,-cGravity) * pow(particleTime, 1.798);
    vec2 point = anchor + velocityOffset + gravityOffset;
    float dist = distance(uv, point);
    float hit = smoothstep(size, 0., dist);
    return hit;
}
vec3 currentColor() {
    float c = time * 0.2;
    float r = sin(c*PI)/2. + .5;
    float g = sin((c+.6)*PI)/2. +.5;
    float b = sin((c+1.2)*PI)/2. + .5;
    return vec3(r,g,b);
}

