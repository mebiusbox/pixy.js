#define PI 3.14159265359
#define SAMPLE_FIRST_STEP 1
#define NUM_STEPS 4
#define MAX_STEPS 16
#define NUM_DIRECTIONS 8
uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform vec4 radiusParams;
uniform vec4 biasParams;
uniform vec4 screenParams;
uniform vec4 uvToViewParams;
uniform vec4 focalParams;
uniform vec2 cameraParams;
varying vec2 vUv;

#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
// highp float rand(const in vec2 uv) {
//   const highp float a = 12.9898, b = 78.233, c = 43758.5453;
//   highp float dt = dot(uv.xy, vec2(a,b)), sn = mod(dt, PI);
//   return fract(sin(sn) * c);
// }
// Value Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/lsf3WH
vec2 rand(vec2 p) {
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return -1.0 + 2.0 * fract(sin(p)*43758.5453123);
}

// vec2 round(vec2 a) {
//   return floor(a + 0.5);
// }

float rsqrt(float a) {
  return inversesqrt(a);
}

const vec3 PackFactors = vec3(255.0, 65025.0, 16581375.0);
const vec4 UnpackFactors = vec4(1.0, 1.0 / PackFactors);
const float ShiftRight8 = 1.0 / 255.0;
float unpackRGBAToDepth(vec4 rgba) {
  return dot(rgba, UnpackFactors);
}

float viewZToOrthographicDepth(const in float viewZ, const in float near, const in float far) {
  return (viewZ + near) / (near - far);
}

float perspectiveDepthToViewZ(const in float invClipZ, const in float near, const in float far) {
  return (near * far) / ((far - near) * invClipZ - far);
}

vec3 uvToView(vec2 uv, float eye_z) {
  uv = uvToViewParams.xy * uv + uvToViewParams.zw;
  return vec3(uv * eye_z, eye_z);
}

vec3 viewPos(vec2 uv) {
  float depth = texture2D(tDepth, uv).x;
  float viewZ = -perspectiveDepthToViewZ(depth, cameraParams.x, cameraParams.y);
  return uvToView(uv, viewZ);
}

float getLengthSqr(vec3 v) {
  return dot(v,v);
}

vec3 minOfDiff(vec3 P, vec3 Pr, vec3 Pl) {
  vec3 v1 = Pr - P;
  vec3 v2 = P - Pl;
  return (getLengthSqr(v1) < getLengthSqr(v2)) ? v1 : v2;
}

float falloffFactor(float d2) {
  return d2 * radiusParams.z + 1.0;
}

vec2 snapUVOffset(vec2 uv) {
  return round(uv * screenParams.xy) * screenParams.zw;
}

float TanToSin(float x) {
  return x * rsqrt(x*x + 1.0);
}

float getTangent(vec3 T) {
  return -T.z * rsqrt(dot(T.xy,T.xy));
}

float integerateOcclusion(
  vec2 uv0,
  vec2 snapped_duv,
  vec3 P,
  vec3 dPdu,
  vec3 dPdv,
  inout float tanH)
{
  float ao = 0.0;
  
  // Compute a tangent vector for snapped_duv
  vec3 tangVec = snapped_duv.x * dPdu + snapped_duv.y * dPdv;
  float invTanLen = rsqrt(dot(tangVec.xy,tangVec.xy));
  float tanT = -tangVec.z * invTanLen;
  tanT += biasParams.y;
  
  float sinT = TanToSin(tanT);
  vec3 S = viewPos(uv0 + snapped_duv);
  vec3 diff = S - P;
  float tanS = getTangent(diff);
  float sinS = TanToSin(tanS);
  float d2 = getLengthSqr(diff);
  
  if ((d2 < radiusParams.y) && (tanS > tanT)) {
    // Compute AO between the tangent plane and the sample
    ao = falloffFactor(d2) * saturate(sinS - sinT);
    
    // Update the horizon angle
    tanH = max(tanH, tanS);
  }
  
  return ao;
}

float calculateHorizonOcclusion(
  vec2 dUv, vec2 texelDeltaUV, vec2 uv0, vec3 P, float numSteps,
  float randstep, vec3 dPdu, vec3 dPdv)
{
  float ao = 0.0;
  
  vec2 uv = uv0 + snapUVOffset(randstep * dUv);
  vec2 deltaUV = snapUVOffset(dUv);
  vec3 T = deltaUV.x * dPdu + deltaUV.y * dPdv;
  
  float invTanLen = rsqrt(dot(T.xy,T.xy));
  float tanH = -T.z * invTanLen;
  tanH += biasParams.y;
  
#if SAMPLE_FIRST_STEP
// Take a first sample between uv0 and uv0 + deltaUV
vec2 snapped_duv = snapUVOffset(randstep * deltaUV + texelDeltaUV);
ao = integerateOcclusion(uv0, snapped_duv, P, dPdu, dPdv, tanH);
--numSteps;
#endif

  float sinH = TanToSin(tanH);
  for (int j=1; j<MAX_STEPS; ++j) {
    if (float(j) >= numSteps) {
      break;
    }
    uv += deltaUV;
    vec3 S = viewPos(uv);
    vec3 diff = S - P;
    float tanS = getTangent(diff);
    float d2 = getLengthSqr(diff);
    
    // Use a merged dynamic branch
    //[branch]
    if ((d2 < radiusParams.y) && (tanS > tanH)) {
      // Accumulate AO betrween the horizon and the sample
      float sinS = TanToSin(tanS);
      ao += falloffFactor(d2) * saturate(sinS - sinH);
      
      // Update the current horizon angle
      tanH = tanS;
      sinH = sinS;
    }
  }
  
  return ao;
}

vec2 rotateDirections(vec2 Dir, vec2 CosSin) {
  return vec2(Dir.x*CosSin.x - Dir.y*CosSin.y, Dir.x*CosSin.y+Dir.y*CosSin.x);
}

vec3 randCosSinJitter(vec2 uv) {
  vec2 r = rand(uv);
	float angle = 2.0 * PI * r.x / float(NUM_DIRECTIONS);
  return vec3(cos(angle), sin(angle), r.y);
}

void calculateNumSteps(inout vec2 stepSizeInUV, inout float numSteps, float radiusInPixels, float rand) {
  // Avoid oversampling if NUM_STEPS is greater than the kerenl radius in pixels
  numSteps = min(float(NUM_STEPS), radiusInPixels);
  
  // Divide by Ns+1 so taht the farthest samples are not fully attenuated
  float stepSizeInPixels = radiusInPixels / (numSteps+1.0);
  
  // Clamp numSteps if it is greater than the max kernel footprint
  float maxNumSteps = radiusParams.w / stepSizeInPixels;
  if (maxNumSteps < numSteps) {
    // Use dithering to avoid AO discontinuities
    numSteps = floor(maxNumSteps + rand);
    numSteps = max(numSteps, 1.0);
    stepSizeInPixels = radiusParams.w / numSteps;
  }
  
  // Step size in uv space
  stepSizeInUV = stepSizeInPixels * screenParams.zw;
}

void main() {
  
  vec2 uv = vUv;
  // vec2 uv = vec2(0.5,0.5);
  vec2 scr = vUv*screenParams.xy;
  
  vec3 posCenter = viewPos(uv);
  
  // (cos(alpha), sin(alpha), jitter)
  vec3 rand = randCosSinJitter(uv);
  // vec3 rand = randCosSinJitter(vUv*2.0-1.0);
  // vec3 rand = randomTexture.Sample(PointWrapSampler, IN.position.xy / RANDOM_TEXTURE_WIDTH);
  
  // Compute projection of disk of radius g_R into uv space
  // Multiply by 0.5 to scale from [-1,1]^2 to [0,1]^2
  vec2 diskRadiusInUV = 0.5 * radiusParams.x * focalParams.xy / posCenter.z;
  float radiusInPixels = diskRadiusInUV.x * screenParams.x;
  if (radiusInPixels < 1.0) {
    gl_FragColor = vec4(vec3(1.0), 1.0);
    return;
  }
  
  // vec3 rand = randomTexture.Load(int3(IN.position.xy,0) & 63);
  //calculateNumSteps(stepSize, numSteps, radiusInPixels, rand.z);
  
  // Nearest neighbor pixels on the tangent plane
  vec3 posRight  = viewPos(uv + vec2(screenParams.z, 0));
  vec3 posLeft   = viewPos(uv + vec2(-screenParams.z, 0));
  vec3 posTop    = viewPos(uv + vec2(0, screenParams.w));
  vec3 posBottom = viewPos(uv + vec2(0,-screenParams.w));
  
  // Screen-aligned basis for the tangent plane
  vec3 dPdu = minOfDiff(posCenter, posRight, posLeft);
  vec3 dPdv = minOfDiff(posCenter, posTop, posBottom) * (screenParams.y * screenParams.z);
  
  float ao = 0.0;
  float alpha = 2.0 * PI / float(NUM_DIRECTIONS);
  //vec3 rand;
  float numSteps;
  vec2 stepSize;
  for (int d=0; d<NUM_DIRECTIONS; ++d) {
    //rand = randomTexture.Sample(PointWrapSampler, IN.uv * 100);
    //rand = randomTexture.Load(int3(IN.position.xy + int2(d*5, d*17),0) & 31);
    float angle = alpha * float(d);
    
    calculateNumSteps(stepSize, numSteps, radiusInPixels, rand.z);
    vec2 dir = rotateDirections(vec2(cos(angle), sin(angle)), rand.xy);
    vec2 deltaUV = dir * stepSize.xy;
    vec2 texelDeltaUV = dir * screenParams.zw;
    ao += calculateHorizonOcclusion(deltaUV, texelDeltaUV, uv, posCenter, numSteps, rand.z, dPdu, dPdv);
    
    // vec2 snapped_duv = snapUVOffset(deltaUV);
    // vec2 snapped_uv = snapUVOffset(rand.z * snapped_duv + texelDeltaUV);
    // vec2 snapped_scr = (uv + snapped_uv) * screenParams.xy;
    // vec2 snapped_scr = (uv + snapped_uv) * screenParams.xy;
    // vec2 snapped_scr = uv * screenParams.xy;
    // if (snapped_scr.x >= scr.x && snapped_scr.x <= scr.x+1.0 && snapped_scr.y >= scr.y && snapped_scr.y <= scr.y+1.0) {
    //   gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    //   return;
    // }
  }
  
  ao = 1.0 - ao / float(NUM_DIRECTIONS) * biasParams.z;
  gl_FragColor = vec4(saturate(ao), posCenter.z, 0.0, 1.0);
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  // gl_FragColor = vec4(normalize(posCenter)*0.5+0.5, 1.0);
  // gl_FragColor = vec4(vec3(saturate(ao)), 1.0);
}
  