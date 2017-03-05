// https://github.com/SimonWallner/kocmoc-demo/blob/RTVIS/media/shaders/scattering.glsl

// uniform sampler2D tSky;
uniform float skyLuminance;
uniform float skyTurbidity;
uniform float skyRayleigh;
uniform float skyMieCoefficient;
uniform float skyMieDirectionalG;
uniform vec3 skySunPosition;

// constants for atmospheric scattering
const float e = 2.71828182845904523536028747135266249775724709369995957;
const float pi = 3.141592653589793238462643383279502884197169;
const float n = 1.0003; // refractive index of air
const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)
const float pn = 0.035; // depolatization factor for standard air

// wavelength of used primaries, according to preetham
const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);

// mie stuff
// K koefficient for the primaries
const vec3 K = vec3(0.686, 0.678, 0.666);
const float v = 4.0;

// optical length at zenith for molecules
const float rayleighZenithLength = 8.4E3;
const float mieZenithLength = 1.25E3;
const vec3 up = vec3(0.0, 1.0, 0.0);

const float EE = 1000.0; 
const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324; // 66 arc seconds -> degrees, and the cosine of that

// earth shadow hack
const float cutoffAngle = pi / 1.95;
const float steepness = 1.5;

// Compute total rayleigh coefficient for a set of wavelengths (usually the tree primaries)
// @param lambda wavelength in m
vec3 totalRayleigh(vec3 lambda) {
  return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn));
}

// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness
// A simplied version of the total Rayleigh scattering to works on browsers that use ANGLE
vec3 simplifiedRayleigh() {
  return 0.0005 / vec3(94, 40, 18);
//   return 0.0054532832366 / (3.0 * 2.545E25 * pow(lambda, vec3(4.0)) * 6.245);
}

// Reileight phase function as a function of cos(theta)
float rayleighPhase(float cosTheta) {
// NOTE: there are a few scale factors for the phase function
// (1) as give bei Preetheam, normalized over the sphere with 4pi sr
// (2) normalized to intergral = 1
// (3) nasa: integrates to 9pi / 4, looks best
  return (3.0 / (16.0 * pi)) * (1.0 + pow(cosTheta, 2.0));
//   return (1.0 / (3.0 * pi)) * (1.0 + pow(cosTheta, 2.0));
//   return (3.0 / 4.0) * (1.0 + pow(cosTheta, 2.0));
}

// total mie scattering coefficient
// @param labmda set of wavelengths in m
// @param K corresponding scattering param
// @param T turbidity, somewhere in the range of 0 to 20
vec3 totalMie(vec3 lambda, vec3 K, float T) {
// not the formula given py Preetham
  float c = (0.2 * T) * 10E-18;
  return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
}

// Henyey-Greenstein approximataion as a function of cos(theta)
// @param cosTheta
// @param g geometric constant that defines the shape of the ellipse
float hgPhase(float cosTheta, float g) {
  return (1.0 / (4.0 * pi)) * ((1.0 - pow(g, 2.0)) / pow(1.0 - 2.0 * g * cosTheta + pow(g, 2.0), 1.5));
}

float sunIntensity(float zenithAngleCos) {
// This function originally used 'exp(n)', but it returns an incorrect value
// on Samsung S6 phones. So it has been replaced with the equivalent 'pow(e,n)'
// See https://github.com/mrdoob/three.js/issues/8382
  return EE * max(0.0, 1.0 - pow(e, -((cutoffAngle - acos(zenithAngleCos)) / steepness)));
}

// float logLuminance(vec3 c) {
//   return log(c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722);
// }

// Filmic ToneMapping http://filmicgames.com/archives/75",
float A = 0.15;
float B = 0.50;
float C = 0.10;
float D = 0.20;
float E = 0.02;
float F = 0.30;
float W = 1000.0;
vec3 Uncharted2Tonemap(vec3 x) {
  return ((x*(A*x + C*B) + D*E) / (x*(A*x + B) + D*F)) - E/F;
}