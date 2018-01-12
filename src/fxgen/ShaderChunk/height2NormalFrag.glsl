//   // Determine the offsets
//   vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);
//   
//   // Take three samples to determine two vectors that can be
//   // use to generate the normal at this pixel
//   float h0 = texture2D(tDiffuse, pin.uv).r;
//   float h1 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).r;
//   float h2 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).r;
//   
//   vec3 v01 = vec3(vPixelSize.xy, h1-h0);
//   vec3 v02 = vec3(vPixelSize.yx, h2-h0);
//   vec3 n = cross(v01, v02);
//   
//   // Can be useful to scale the Z component to tweak the
//   // amount bumps show up, less than 1.0 will make them
//   // more apparent, greater than 1.0 will smooth them out
//   n.z *= 0.5;
//   
//   pout.color = n;

const vec2 size = vec2(2.0, 0.0);
vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);
float s01 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).x;
float s21 = texture2D(tDiffuse, pin.uv + vPixelSize.zy).x;
float s10 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).x;
float s12 = texture2D(tDiffuse, pin.uv + vPixelSize.yz).x;
vec3 va = normalize(vec3(size.xy,(s21-s01)*cHeightScale));
vec3 vb = normalize(vec3(size.yx,(s10-s12)*cHeightScale));
vec3 n = cross(va,vb);
pout.color = n*0.5 + 0.5;

// THREE.JS (NormalMapShader.js)
// vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);
// float s11 = texture2D(tDiffuse, pin.uv).x;
// float s01 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).x;
// float s10 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).x;
// vec3 n = normalize(vec3((s11-s10) * heightScale, (s11-s01)*heightScale, 2.0));
// pout.color = n*0.5 + 0.5;

// vec3 vPixelSize = vec3(1.0 / resolution.x, 0.0, -1.0 / resolution.x);
// float s01 = texture2D(tDiffuse, pin.uv + vPixelSize.xy).x;
// float s21 = texture2D(tDiffuse, pin.uv + vPixelSize.zy).x;
// float s10 = texture2D(tDiffuse, pin.uv + vPixelSize.yx).x;
// float s12 = texture2D(tDiffuse, pin.uv + vPixelSize.yz).x;
// vec3 n = normalize(vec3((s11-s10) * heightScale, (s11-s01)*heightScale, 2.0));
// pout.color = n*0.5 + 0.5;