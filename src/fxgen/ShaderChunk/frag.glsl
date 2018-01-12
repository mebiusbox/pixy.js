  PSInput pin;
  pin.position = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  pin.mouse = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);
  pin.coord = gl_FragCoord.xy;
  pin.uv = gl_FragCoord.xy / resolution;

  PSOutput pout;
  pout.color = vec3(0.0);
  pout.opacity = 1.0;