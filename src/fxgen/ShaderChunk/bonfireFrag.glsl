vec2 drag = vec2(0.0, 0.0);
vec2 offset = vec2(0.0, 0.0);

float clip = 210.0;
float ypartClip = pin.coord.y/clip;
float ypartClippedFalloff = clamp(2.0-ypartClip, 0.0, 1.0);
float ypartClipped = min(ypartClip, 1.0);
float ypartClippedn = 1.0 - ypartClipped;

float xfuel = 1.0 - abs(2.0*pin.uv.x-1.0);
// float xfuel = pow(1.0 - abs(2.0*pin.uv.x-1.0),0.5);

float realTime = cSpeed * time;

vec2 coordScaled = cDensity * 0.01 * pin.coord.xy - 0.02 * vec2(offset.x, 0.0);
vec3 position = vec3(coordScaled,0.0) + vec3(1223.0,6443.0,8425.0);
vec3 flow = vec3(4.1*(0.5-pin.uv.x)*pow(ypartClippedn,4.0),-2.0*xfuel*pow(ypartClippedn,64.0),0.0);
vec3 timing = realTime * vec3(0.0,-1.7*cStrength*10.0,1.1) + flow;

vec3 displacePos = vec3(1.0,0.5,1.0)*2.4*position + realTime*vec3(0.01,-0.7,1.3);
vec3 displace3 = vec3(noiseStackUV(displacePos, 2, 0.4, 0.1),0.0);

vec3 noiseCoord = (vec3(2.0,1.0,1.0)*position + timing + 0.4*displace3);
float noise = noiseStack(noiseCoord, 3, 0.4);

float flames = pow(ypartClipped, 0.3*xfuel) * pow(noise, 0.3*xfuel);

float f = ypartClippedFalloff * pow(1.0 - flames*flames*flames, 8.0);
float fff = f*f*f;
vec3 fire = cIntensity * vec3(f, fff, fff*fff);

// smoke
// float smokeNoise = 0.5 + snoise(0.4*position + timing*vec3(1.0,1.0,0.2))/2.0;
// vec3 smoke = vec3(0.3 * pow(xfuel,3.0)*pow(pin.uv.y,2.0) * (smokeNoise + 0.4*(1.0-noise)));

// sparks
float sparkGridSize = cSize*10.0;
vec2 sparkCoord = pin.coord.xy - vec2(2.0*offset.x,190.0*realTime);
sparkCoord -= 30.0*noiseStackUV(0.01*vec3(sparkCoord,30.0*time), 1, 0.4, 0.1);
sparkCoord += 100.0 * flow.xy;
if (mod(sparkCoord.y/sparkGridSize,2.0) < 1.0) sparkCoord.x += 0.5 * sparkGridSize;
vec2 sparkGridIndex = vec2(floor(sparkCoord/sparkGridSize));
float sparkRandom = prng(sparkGridIndex);
float sparkLife = min(10.0*(1.0-min((sparkGridIndex.y + (190.0*realTime/sparkGridSize))/(24.0-20.0*sparkRandom), 1.0)), 1.0);
vec3 sparks = vec3(0.0);
if (sparkLife > 0.0) {
  float sparkSize = xfuel*xfuel*sparkRandom*0.08;
  float sparkRadians = 999.0*sparkRandom*2.0*PI + 2.0*time;
  vec2 sparkCircular = vec2(sin(sparkRadians), cos(sparkRadians));
  vec2 sparkOffset = (0.5-sparkSize) * sparkGridSize * sparkCircular;
  vec2 sparkModules = mod(sparkCoord + sparkOffset, sparkGridSize) - 0.5*vec2(sparkGridSize);
  float sparkLength = length(sparkModules);
  float sparksGray = max(0.0, 1.0 - sparkLength/(sparkSize*sparkGridSize));
  sparks = sparkLife * sparksGray * vec3(1.0,0.3,0.0);
}

// vec3 color = max(fire,sparks) + smoke;
vec3 color = max(fire,sparks);
vec3 gray = vec3(rgb2gray(color));
pout.color = mix(gray, color, cColor);