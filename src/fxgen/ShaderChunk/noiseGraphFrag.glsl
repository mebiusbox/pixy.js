if (cNoiseGraphEnable) {
  graph = clamp(graph, 0.0, 1.0);
  graph = step(graph - fract(pin.uv.y), 0.0);
  pout.color = mix(vec3(0.0, 0.5, 0.0), vec3(1.0), graph);
}