if (cToonEnable) {
  vec3 dark = mix( vec3(0.0), vec3(0.5),  step(cToonDark, pout.color) ) ;
  vec3 light = mix( dark, vec3(1.0),  step(cToonLight, pout.color) ) ;
//   vec3 dark = mix( vec3(0.0), vec3( 1.0, 0.4, 0.0),  step(0.8, pout.color) ) ;
//   vec3 light = mix( dark, vec3( 1.0, 0.8, 0.0),  step(0.95, pout.color) ) ;
  pout.color = light;
}