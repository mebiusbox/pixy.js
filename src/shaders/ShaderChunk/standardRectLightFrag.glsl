//------------------------------------------------------------
// Real-time Collision Detection
vec3 closestPointPToRay(in vec3 p, in vec3 start, in vec3 dir) {
  float t = max(dot(p-start, dir) / dot(dir,dir), 0.0);
  return start + dir*t;
}
vec3 closestPointPToSegment(in vec3 p, in vec3 a, in vec3 b) {
  vec3 ab = b-a;
  float t = dot(p-a,ab);
  if (t <= 0.0) {
    return a;
  }
  else {
    float denom = dot(ab,ab);
    if (t >= denom) {
      return b;
    }
    
    return a + ab*(t/denom);
  }
  // vec3 ab = b-a;
  // float t = clamp(dot(p-a, ab) / dot(ab,ab), 0.0, 1.0);
  // return a + ab*t;
}

vec3 closestPointPToTriangle(in vec3 p, in vec3 a, in vec3 b, in vec3 c) {
  // Check if P in vertex region outside A
  vec3 ap = p-a;
  vec3 ab = b-a;
  vec3 ac = c-a;
  float d1 = dot(ab,ap);
  float d2 = dot(ac,ap);
  if (d1 <= 0.0 && d2 <= 0.0) {
    return a; // voronoi=0. barycentric coordinates (1,0,0)
  }
  
  vec3 bp = p-b;
  
  // Check if P in vertex region outside B
  float d3 = dot(ab,bp);
  float d4 = dot(ac,bp);
  if (d3 >= 0.0 && d4 <= d3) {
    return b; // voronoi=1. barycentric coordinates (0,1,0)
  }
  
  // Check if P in edge region of AB,k if so return projection of P onto AB
  float vc = d1*d4 - d3*d2;
  if (vc <= 0.0 && d1 >= 0.0 && d3 <= 0.0) {
    // float v = d1/(d1-d3)
    return a + ab * (d1/(d1-d3)); // voronoi=2. barycentric coordinates (1-v,v,0)
  }
  
  // Check if P in vertex region outside C
  vec3 cp = p-c;
  float d5 = dot(ab, cp);
  float d6 = dot(ac, cp);
  if (d6 >= 0.0 && d5 <= d6) {
    return c; // voronoi=3. barycentric coordinates (0,0,1)
  }
  
  // Check if P in edge region of AC, if so return projection of P onto AC
  float vb = d5*d2 - d1*d6;
  if (vb <= 0.0 && d2 >= 0.0 && d6 <= 0.0) {
    // float w = d2/(d2-d6)
    return a + ac * (d2/(d2-d6)); // voronoi=4. barycentric cooridnates (1-w,w,0)
  }
  
  // Check if P in edge region of BC, if so return projection of P onto BC
  float va = d3*d6 - d5*d4;
  if (va <= 0.0 && (d4-d3) >= 0.0 && (d5-d6) >= 0.0) {
    // float w = (d4-d3)/(d4-d3+d5-d6)
    return b + (c-b) * ((d4-d3)/(d4-d3+d5-d6)); // voronoi=5. barycentric coordinates (0,1-w,w)
  }
  
  // P inside face region. Compute Q through its barycentric coordinates (u,v,w)
  float denom = 1.0 / (va+vb+vc);
  float v = vb * denom;
  float w = vc * denom;
  return a + ab*v + ac*w; // voronoi=6
}

int pointInTriangle(in vec3 p, in vec3 a, in vec3 b, in vec3 c) {
  a -= p;
  b -= p;
  c -= p;
  float ab = dot(a,b);
  float ac = dot(a,c);
  float bc = dot(b,c);
  float cc = dot(c,c);
  if (bc*ac - cc*ab < 0.0) return 0;
  float bb = dot(b,b);
  if (ab*bc - ac*bb < 0.0) return 0;
  return 1;
}
//--------------------------------------------------
vec3 Specular_AreaLight(vec3 specularColor, vec3 N, float roughnessFactor, vec3 L, vec3 Lc, vec3 V) {
  // Compute some useful values
  float NoL = saturate(dot(N, L));
  float NoV = saturate(dot(N, V));
  vec3 H = normalize(L+V);
  float NoH = saturate(dot(N, H));
  float VoH = saturate(dot(V, H));
  float LoV = saturate(dot(L, V));
  
  float a = pow2(roughnessFactor);
  
  vec3 cspec = PBR_Specular_CookTorrance(specularColor, H, V, L, a, NoL, NoV, NoH, VoH, LoV);
  return Lc * NoL * cspec;
}
//--------------------------------------------------
void computeRectLight_Triangle(const in RectLight rectLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {
  
  vec4 lpos[3];
  vec3 lvec[3];
  
  // direction vectors from point to area light corners
  for (int i=0; i<3; ++i) {
    // lpos[i] = lightMatrixWorld * vec4(rectLight.positions[i], 1.0); // in world space
    lpos[i] = vec4(rectLight.positions[i], 1.0); // in camera space
    lvec[i] = normalize(lpos[i].xyz - geometry.position); // dir from vertex to area light
  }
  
  // bail if the point is on the wrong side of the light... there must be a better way...
  float tmp = dot(lvec[0], cross((lpos[2]-lpos[0]).xyz, (lpos[1]-lpos[0]).xyz));
  if (tmp > 0.0) return;
  
  // vector irradiance at point
  vec3 lightVec = vec3(0.0);
  for (int i=0; i<3; ++i) {
    vec3 v0 = lvec[i];
    vec3 v1 = lvec[int(mod(float(i+1), float(3)))];
    // if (tmp > 0.0) { // double side
    //   lightVec += acos(dot(v0,v1)) * normalize(cross(v1,v0));
    // }
    // else {
      lightVec += acos(dot(v0,v1)) * normalize(cross(v0,v1));
    // }
  }
  
  vec3 N = geometry.normal;
  vec3 V = geometry.viewDir;
  
  // irradiance factor at point
  float factor = max(dot(lightVec, N), 0.0) / (2.0 * PI);
  
  vec3 irradiance = rectLight.color * rectLight.intensity * factor;
  irradiance *= PI; // punctual light
  
  
  vec3 planePosition = (lpos[0].xyz + lpos[1].xyz + lpos[2].xyz) / 3.0;
  vec3 planeNormal = rectLight.normal;
  planeNormal = normalize(planeNormal - planePosition);
  
  // project onto plane and calculate direction from center to the projection
  // vec3 projection = projectOnPlane(P, planePosition, planeNormal);
  
  // calculate distance from area
  // vec3 nearestPointInside = closestPointPToTriangle(projection, lpos[0].xyz, lpos[1].xyz, lpos[2].xyz);
  // float Ld = distance(P, nearestPointInside);
  // if (cutoffDistance == 0.0 || Ld < cutoffDistance) {
  //   float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), 2.0);
    // float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), decayExponent);
    float NoL = saturate(dot(N, lightVec));
    reflectedLight.directDiffuse += irradiance * NoL * DiffuseLambert(material.diffuseColor);
  // }
  
  /// SPECULAR
  
  // shoot a ray to calculate specular
  vec3 R = reflect(-V, N);
  vec3 E = linePlaneIntersect(geometry.position, -R, planePosition, planeNormal);
  float specAngle = dot(-R, planeNormal);
  if (specAngle > 0.0) {
    
    if (pointInTriangle(E, lpos[0].xyz, lpos[1].xyz, lpos[2].xyz) == 1) {
      reflectedLight.directSpecular += Specular_AreaLight(material.specularColor, N, material.specularRoughness, R, irradiance * specAngle, V);
    }
    else {
      vec3 nearestPointInside = closestPointPToTriangle(E, lpos[0].xyz, lpos[1].xyz, lpos[2].xyz);
      float Ld = length(nearestPointInside-E);
      
      if (rectLight.distance == 0.0 || Ld < rectLight.distance) {
        float Lc = pow(saturate(-Ld / rectLight.distance + 1.0), rectLight.decay);
        reflectedLight.directSpecular += Specular_AreaLight(material.specularColor, N, material.specularRoughness, R, irradiance * Lc * specAngle, V);
      }
    }
  }
}
//--------------------------------------------------
void computeRectLight_Rectangle(const in RectLight rectLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {
  
  vec4 lpos[4];
  vec3 lvec[4];
  
  // direction vectors from point to area light corners
  for (int i=0; i<4; ++i) {
    // lpos[i] = lightMatrixWorld * vec4(lightverts[i], 1.0); // in world space
    lpos[i] = vec4(rectLight.positions[i], 1.0); // in camera space
    lvec[i] = normalize(lpos[i].xyz - geometry.position); // dir from vertex to area light
  }
  
  // bail if the point is on the wrong side of the light... there must be a better way...
  float tmp = dot(lvec[0], cross((lpos[2]-lpos[0]).xyz, (lpos[1]-lpos[0]).xyz));
  if (tmp > 0.0) return;
  
  // vector irradiance at point
  vec3 lightVec = vec3(0.0);
  for (int i=0; i<4; ++i) {
    vec3 v0 = lvec[i];
    vec3 v1 = lvec[int(mod(float(i+1), 4.0))];
    // if (tmp > 0.0) { // double side
    //   lightVec += acos(dot(v0,v1)) * normalize(cross(v1,v0));
    // }
    // else {
      lightVec += acos(dot(v0,v1)) * normalize(cross(v0,v1));
    // }
  }
  
  vec3 N = geometry.normal;
  vec3 V = geometry.viewDir;
  
  // irradiance factor at point
  float factor = max(dot(lightVec, N), 0.0) / (2.0 * PI);
  
  vec3 irradiance = rectLight.color * rectLight.intensity * factor;
  irradiance *= PI; // punctual light
  
  vec3 planePosition = (lpos[0].xyz + lpos[1].xyz + lpos[2].xyz + lpos[3].xyz) / 4.0;
  vec3 planeNormal = rectLight.normal;
  vec3 right = rectLight.tangent;
  planeNormal = normalize(planeNormal - planePosition);
  right = normalize(right - planePosition);
  vec3 up = normalize(cross(right, planeNormal));
  
  // project onto plane and calculate direction from center to the projection
  // vec3 projection = projectOnPlane(P, planePosition, planeNormal);
  // vec3 dir = projection - planePosition;
  
  // calculate distance from area
  // vec2 diagonal = vec2(dot(dir,right), dot(dir,up));
  // vec2 nearest2D = vec2(clamp(diagonal.x, -width, width), clamp(diagonal.y, -height, height));
  // vec3 nearestPointInside = planePosition + (right*nearest2D.x + up*nearest2D.y);
  
  // float Ld = distance(P, nearestPointInside); // real distance to area rectangle
  // if (cutoffDistance == 0.0 || Ld < cutoffDistance) {
  //   float Lc = pow(saturate(-Ld / cutoffDistance + 1.0), 2.0);
    float NoL = saturate(dot(N, lightVec));
    reflectedLight.directDiffuse += irradiance * NoL * DiffuseLambert(material.diffuseColor);
  // }
  
  // shoot a ray to calculate specular
  vec3 R = reflect(-V, N);
  vec3 E = linePlaneIntersect(geometry.position, -R, planePosition, planeNormal);
  float specAngle = dot(-R, planeNormal);
  if (specAngle > 0.0) {
    vec3 dirSpec = E - planePosition;
    vec2 dirSpec2D = vec2(dot(dirSpec,right), dot(dirSpec,up));
    vec2 nearestSpec2D = vec2(clamp(dirSpec2D.x,-rectLight.width,rectLight.width), clamp(dirSpec2D.y,-rectLight.height,rectLight.height));
    
    float Ld = length(nearestSpec2D-dirSpec2D);
    if (rectLight.distance == 0.0 || Ld < rectLight.distance) {
      float Lc = pow(saturate(-Ld / rectLight.distance + 1.0), rectLight.decay);
      reflectedLight.directSpecular += Specular_AreaLight(material.specularColor, N, material.specularRoughness, R, irradiance * Lc * specAngle, V);
    }
  }
}
//------------------------------------------------------------
void computeRectLight(const in RectLight rectLight, const in GeometricContext geometry, const in Material material, inout ReflectedLight reflectedLight) {
  
  if (rectLight.numPositions <= 3) {
    computeRectLight_Triangle(rectLight, geometry, material, reflectedLight);
  }
  else {
    computeRectLight_Rectangle(rectLight, geometry, material, reflectedLight);
  }
}