// vec3 color = vec3(1.0, 1.0, 0.86);
vec3 color = vec3(0.0);
vec2 uv = pin.position;
float dist;

// 0.8, 0.1, 0.0
vec3 brushColor = mix(vec3(1.0), vec3(0.8, 0.1, 0.0), cColor);
color = colorBrushStroke(uv, color, vec4(brushColor, 0.9),
  vec2(cBrushStrokeX1, cBrushStrokeY1), vec2(cBrushStrokeX2, cBrushStrokeY2), cWidth);
  // vec2(-0.4, 0.0), vec2(1.1, 0.8), 0.3);

// rec-orangeish signature
// dist = sdAxisAlignedRect(uv, vec2(-0.68), vec2(-0.55));
// float amt = 90.0 + (brushRand(uv.y) * 100.0) + (brushRand(uv.x / 4.0) * 90.0);
// float vary = sin(uv.x * uv.y * 50.0) * 0.0047;
// dist = opS(dist - 0.028 + vary, dist - 0.019 - vary); // round edges, and hollow it out
// color = mix(color, vec3(0.99, 0.4, 0.0), dtoa(dist, amt) * 0.7);
// color = mix(color, vec3(0.85, 0.0, 0.0), dtoa(dist, 700.0));

// grain
color.rgb += (brushRand(uv) - 0.5) * 0.08;
color.rgb = clamp(color.rgb, vec3(0.0), vec3(1.0));

// uv -= 1.0;
// float vigentteAmt = 1.0 - dot(uv * 0.5, uv * 0.12);
// color *= vigentteAmt;

pout.color = color;