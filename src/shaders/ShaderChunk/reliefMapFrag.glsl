  vec3 vv = -geometry.viewDir * mat3(vTangent, vBinormal, vNormal);
  float parallaxLimit = -length(vv.xy) / vv.z;
  parallaxLimit *= parallaxScale;

  vec2 vOffsetDir = normalize(vv.xy);
  vec2 vMaxOffset = vOffsetDir * parallaxLimit;

  float nNumSamples = mix(20.0, 10.0, dot(geometry.viewDir,vNormal));
  float fStepSize = 1.0 / nNumSamples;

  float fCurrRayHeight = 1.0;
  vec2 vCurrOffset = vec2(0,0);
  float fCurrSampledHeight = 1.;
  for (int nCurrSample = 0; nCurrSample < 50; nCurrSample++) {
    if (float(nCurrSample) > nNumSamples) break;
    fCurrSampledHeight = texture2D(tHeightMap, uv + vCurrOffset).r;
    if (fCurrSampledHeight > fCurrRayHeight) {

      vec2 deltaOffset = vMaxOffset * fStepSize * 0.5;
      float deltaHeight = fStepSize * 0.5;

      vCurrOffset -= deltaOffset;
      fCurrRayHeight += deltaHeight;

      const int numSearches = 5;
      for (int i=0; i<numSearches; i+=1) {
        deltaOffset *= 0.5;
        deltaHeight *= 0.5;
        float fCurrSampledHeight = texture2D(tHeightMap, uv + vCurrOffset).r;
        if (fCurrSampledHeight > fCurrRayHeight) {
          // below the surface
          vCurrOffset -= deltaOffset;
          fCurrRayHeight += deltaHeight;
        } else {
          // above the surface
          vCurrOffset += deltaOffset;
          fCurrRayHeight -= deltaHeight;
        }
      }
      break;
    } else {
      fCurrRayHeight -= fStepSize;
      vCurrOffset += fStepSize * vMaxOffset;
    }
  }

  uv += vCurrOffset;