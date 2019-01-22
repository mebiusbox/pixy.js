  vec3 vv = -geometry.viewDir * mat3(vTangent, vBinormal, vNormal);
  // vec3 vv = perturbUv(-vViewPosition, normalize(vNormal), normalize(vViewPosition));
  float parallaxLimit = -length(vv.xy) / vv.z;
  parallaxLimit *= parallaxScale;

  vec2 vOffsetDir = normalize(vv.xy);
  vec2 vMaxOffset = vOffsetDir * parallaxLimit;

  float nNumSamples = mix(20.0, 10.0, dot(geometry.viewDir,vNormal));
  float fStepSize = 1.0 / nNumSamples;

  // debugColor = vec3(vv.xy * 0.5 + vec2(0.5), 0.0);

  // vec2 dPdx = dFdx(uv);
  // vec2 dPdy = dFdy(uv);

  float fCurrRayHeight = 1.0;
  vec2 vCurrOffset = vec2(0,0);
  vec2 vLastOffset = vec2(0.0);
  float fLastSampledHeight = 1.;
  float fCurrSampledHeight = 1.;
  for (int nCurrSample = 0; nCurrSample < 50; nCurrSample++) {
    if (float(nCurrSample) > nNumSamples) break;
    // fCurrSampledHeight = textureGrad(tDiffuse, uv + vCurrOffset, dPdx, dPdy).a;
    // fCurrSampledHeight = texture2DGradEXT(tDiffuse, uv + vCurrOffset, dPdx, dPdy).a;
    fCurrSampledHeight = texture2D(tDiffuse, uv + vCurrOffset).a;
    if (fCurrSampledHeight > fCurrRayHeight) {
      float delta1 = fCurrSampledHeight - fCurrRayHeight;
      float delta2 = (fCurrRayHeight + fStepSize) - fLastSampledHeight;
      float ratio = delta1 / (delta1 + delta2);
      vCurrOffset = ratio * vLastOffset + (1.0-ratio) * vCurrOffset;
      break;
    } else {
      fCurrRayHeight -= fStepSize;
      vLastOffset = vCurrOffset;
      vCurrOffset += fStepSize * vMaxOffset;
      fLastSampledHeight = fCurrSampledHeight;
    }
  }

  uv += vCurrOffset;