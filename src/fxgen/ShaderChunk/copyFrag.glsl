vec4 texel = texture2D(tDiffuse, pin.uv);
pout.color = texel.rgb;
pout.opacity = texel.a;