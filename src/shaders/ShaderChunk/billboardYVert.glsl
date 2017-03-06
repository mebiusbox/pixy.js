  mat3 invMatrix;
  invMatrix[2] = normalize(vec3(ViewInverse[2].x, 0.0, ViewInverse[2].z));
  invMatrix[0] = normalize(cross(vec3(0.0, 1.0, 0.0), invMatrix[2]));
  invMatrix[1] = cross(invMatrix[2], invMatrix[0]);