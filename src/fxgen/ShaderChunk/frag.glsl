  PSInput pin;
  // [-1,1]
  pin.position = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  pin.mouse = vec2(mouse.x * 2.0 - 1.0, -mouse.y * 2.0 + 1.0);
  // [0,scrx]
  pin.coord = gl_FragCoord.xy;
  // [0,1]
  pin.uv = gl_FragCoord.xy / resolution;
  // [-0.5,0.5]
  // = (gl_FragCoord.xy - 0.5*resolution.xy) / min(resolution.x, resolution.y)
  // = pin.position*0.5

  PSOutput pout;
  pout.color = vec3(0.0);
  pout.opacity = 1.0;