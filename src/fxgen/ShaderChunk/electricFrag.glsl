float pauseFreq = cFrequency;
float pauseScale = 1.0;
float scaledTime = time * 0.5;
scaledTime += 0.05 * pin.uv.x;
float sinTime = sin(pauseFreq*scaledTime);
float sinTimeOffset = sin(pauseFreq*scaledTime - 0.5*3.141);
float timeStep = scaledTime + pauseScale * (sinTime/pauseFreq);

vec2 p = pin.uv;
vec4 c;

p *= 4.0;
p.x = 0.5 - timeStep*3.0;
p.y = 0.5 - timeStep*3.0;
c = voronoi(p);

float cellPos = (p.y+c.z) + timeStep * 3.0;
vec2 uv = pin.uv;
uv.x += 1.5*(2.0*c.x-0.33) * (uv.y-0.5);
uv.x *= cScale;

p = uv;
p.y = max(p.y, 0.5);
p *= 12.0; // higher values zoom out further - don't go too high or the sine waves will become quite obvious...
p.x += timeStep*16.0;
p.y += timeStep*32.0;
c = voronoi(p);

// pout.color = 0.5*vec4(c.x);

float d= 0.0;
float edgeScale = 1.0-2.0*abs(pin.uv.x-0.5);
float scaleMulti = pow(0.5*sinTime + 0.5, 2.0);
float dScale = 2.0*edgeScale*(0.25+0.75*pow(0.5*sinTimeOffset+0.5,2.0));

p.y = 0.5*12.0 - timeStep*6.0;
c = dScale * voronoi(p);
d = (uv.y + c.x-0.75);

p.x = uv.x*12.0 - timeStep*6.0;
p.y = 4.5*12.0 - timeStep*3.0;
c = dScale*voronoi(p);
d = mix(d, (uv.y-c.x-0.25), 0.5);
d = 1.0-abs(d);

// pout.color = vec3(d);

float lineWidth = d+0.025*scaleMulti*edgeScale;
vec4 outcolor = mix(vec4(0,1,1.5,1), vec4(1,2,2.0,1), scaleMulti)*smoothstep(1.0, 1.005, lineWidth);
outcolor += edgeScale*pow(scaleMulti*smoothstep(0.75, 1.005, lineWidth), 16.0) * 0.5*vec4(.8,1,2.0,1);
outcolor += 0.5*vec4(.1, 0.05, 0.2, 1);

pout.color = outcolor.xyz;