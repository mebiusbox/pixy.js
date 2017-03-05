float heightFogFactor = vHeightFogFactor;
heightFogFactor *= texture2D(tHeightFog, vUv).r;
outgoingLight = heightFogColor * heightFogFactor + outgoingLight * (1.0 - vHeightFogFactor);