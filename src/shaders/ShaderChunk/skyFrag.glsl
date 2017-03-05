// https://github.com/SimonWallner/kocmoc-demo/blob/RTVIS/media/shaders/scattering.glsl

float sunfade = 1.0 - clamp(1.0 - exp((skySunPosition.y / 450000.0)), 0.0, 1.0);
// luminance = 1.0; // vPos.y / 450000.0 + 0.5; // skySunPosition.y / 450000.0 * 1.0 + 0.5
// reflectedLight.indirectDiffuse += vec3(sunfade);",

float rayleighCoefficient = skyRayleigh - (1.0 * (1.0 - sunfade));

vec3 sunDirection = normalize(skySunPosition);

float sunE = sunIntensity(dot(sunDirection, up));

// extinction (absorbition + out scattering)
// rayleigh coefiiceneints
// vec3 betaR = totalRayleigh(lambda) * reyleighCoefficient;
vec3 betaR = simplifiedRayleigh() * rayleighCoefficient;

// mie coefficients
vec3 betaM = totalMie(lambda, K, skyTurbidity) * skyMieCoefficient;

// optical length
// cutoff angle at 90 to avoid singularity in next formula
float zenithAngle = acos(max(0.0, dot(up, -geometry.viewDir)));
float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));

// combined extinction factor
vec3 Fex = exp(-(betaR * sR + betaM * sM));

// in scattering

float cosTheta = dot(-geometry.viewDir, sunDirection);

// float rPhase = rayleighPhase(cosTheta);
float rPhase = rayleighPhase(cosTheta * 0.5 + 0.5);
vec3 betaRTheta = betaR * rPhase;

float mPhase = hgPhase(cosTheta, skyMieDirectionalG);
vec3 betaMTheta = betaM * mPhase;

// vec3 Lin = sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex);
vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex), vec3(1.5));
Lin *= mix(vec3(1.0), pow(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex, vec3(0.5)), clamp(pow(1.0 - dot(up, sunDirection), 5.0), 0.0, 1.0));

// nightsky
// float theta = acos(-geometry.viewDir.y); // elevation --> y-axis [-pi/2, pi/2]
// float phi = atan(-geometry.viewDir.z, -geometry.viewDir.x); // azimuth ---> x-axis [-pi/2, pi/2]
// vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);
// vec3 L0 = texture2D(tSky, uv).rgb * Fex;
// vec3 L0 = texture2D(tSky, uv).rgb + 0.1 * Fex;
vec3 L0 = vec3(0.1) * Fex;

// composition + solar disc
// if (cosTheta > sunAngularDiameterCos) {
//   L0 += sunE * Fex;
// }
float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta);
// "if (-geometry.viewDir.y > 0.0) {
L0 += (sunE * 19000.0 * Fex) * sundisk;

// vec3 whiteScale = 1.0 / Uncharted2ToneMapping(vec3(W));
vec3 whiteScale = 1.0 / Uncharted2Tonemap(vec3(W));
// vec3 whiteScale = Uncharted2Tonemap(vec3(toneMappingWhitePoint));

vec3 texColor = (Lin + L0);
texColor *= 0.04;
texColor += vec3(0.0, 0.001, 0.0025) * 0.3;

float g_fMaxLuminance = 1.0;
float fLumScaled = 0.1 / skyLuminance;
float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled);

float ExposureBias = fLumCompressed;

// vec3 curr = Uncharted2ToneMapping((log2(2.0 / pow(skyLuminance, 4.0))) * texColor);
vec3 curr = Uncharted2Tonemap((log2(2.0 / pow(skyLuminance, 4.0))) * texColor * toneMappingExposure);
vec3 color = curr * whiteScale;

reflectedLight.indirectDiffuse += pow(color, vec3(1.0 / (1.2 + (1.2 * sunfade))));
// reflectedLight.indirectDiffuse += vec3(uv.x, uv.y, 0.0);
// reflectedLight.indirectDiffuse += Lin + L0;
// reflectedLight.indirectDiffuse += texColor;
// reflectedLight.indirectDiffuse += L0;
// reflectedLight.indirectDiffuse += Lin;
// reflectedLight.indirectDiffuse += vec3(cosTheta);
// reflectedLight.indirectDiffuse += vec3(sundisk);
// reflectedLight.indirectDiffuse += vec3(max(dot(sunDirection, up), 0.0));
// reflectedLight.indirectDiffuse += vec3(sunE);