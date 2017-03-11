bool testLightInRange(const in float lightDistance, const in float cutoffDistance) {
  return any(bvec2(cutoffDistance == 0.0, lightDistance < cutoffDistance));
}

float punctualLightIntensityToIrradianceFactor(const in float lightDistance, const in float cutoffDistance, const in float decayExponent) {
  
  if (decayExponent > 0.0) {
  
// #if defined(PHYSICALLY_CORRECT_LIGHTS)
  // based upon Frostbite 3 Moving to Physically-based Rendering
  // page 32, equation 26: E[window1]
  // http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr_v2.pdf
  // this is intended to be used to spot and point lights who are represented as mulinouse intensity
  // but who must be converted to luminous irradiance for surface lighting calculation
  
  // float distanceFalloff = 1.0 / max(pow(lightDistance, decayExponent), 0.01);
  // float maxDistanceCutoffFactor = pow2(saturate(1.0 - pow4(lightDistance / cutoffDistance)));
  // return distanceFalloff * maxDistanceCutoffFactor;
// #else
    return pow(saturate(-lightDistance / cutoffDistance + 1.0), decayExponent);
// #endif
  }

  return 1.0;
}

struct DirectLight {
  vec3 direction;
  vec3 color;
};

void getDirectLightIrradiance(const in DirectLight directionalLight, const in GeometricContext geometry, out IncidentLight directLight) {
  directLight.color = directionalLight.color;
  directLight.direction = directionalLight.direction;
  directLight.visible = true;
}

struct PointLight {
  vec3 position;
  vec3 color;
  float distance;
  float decay;
};

void getPointDirectLightIrradiance(const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight directLight) {
  vec3 L = pointLight.position - geometry.position;
  directLight.direction = normalize(L);

  float lightDistance = length(L);

  if (testLightInRange(lightDistance, pointLight.distance)) {
    directLight.color = pointLight.color;
    directLight.color *= punctualLightIntensityToIrradianceFactor(lightDistance, pointLight.distance, pointLight.decay);
    directLight.visible = true;
  } else {
    directLight.color = vec3(0.0);
    directLight.visible = false;
  }
}

struct SpotLight {
  vec3 position;
  vec3 direction;
  vec3 color;
  float distance;
  float decay;
  float coneCos;
  float penumbraCos;
};

void getSpotDirectLightIrradiance(const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight directLight) {
  vec3 L = spotLight.position - geometry.position;
  directLight.direction = normalize(L);

  float lightDistance = length(L);
  float angleCos = dot(directLight.direction, spotLight.direction);

  if (all(bvec2(angleCos > spotLight.coneCos, testLightInRange(lightDistance, spotLight.distance)))) {
    float spotEffect = smoothstep(spotLight.coneCos, spotLight.penumbraCos, angleCos);
    directLight.color = spotLight.color;
    directLight.color *= spotEffect * punctualLightIntensityToIrradianceFactor(lightDistance, spotLight.distance, spotLight.decay);
    directLight.visible = true;
  } else {
    directLight.color = vec3(0.0);
    directLight.visible = false;
  }
}

struct AreaLight {
  vec3 position;
  vec3 color;
  float distance;
  float decay;
  float radius;
};

struct TubeLight {
  vec3 start;
  vec3 end;
  vec3 color;
  float distance;
  float decay;
  float radius;
};

struct RectLight {
  vec3 positions[4];
  vec3 color;
  float width;
  float height;
  float distance;
  float decay;
};