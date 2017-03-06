  vec3 wdir = normalize(vWorldPosition);
  float theta = acos(wdir.y); // y-axis [0, pi]
  float phi = atan(wdir.z, wdir.x); // x-axis [-pi/2, pi/2]
  // uv = vec2(0.5, 1.0) - vec2(phi, theta * 2.0 - PI) / vec2(2.0*PI, PI);
  uv = vec2(0.5 - phi / (2.0 * PI), 1.0 - theta * 2.0 / PI);