// https://www.shadertoy.com/view/Xd3GWn

// downscale = 1.75;
// grain = 2.7;
// rolling_init_damp = 0.2;
// ball_spread = 0.4;

#ifdef LOW_Q
  grain *= 1.0 + 0.1 * float(LOW_Q);
  growth *= 1.0 - 0.1 * float(LOW_Q);
  ballness *= 0.85;
#endif

  float t = getTime();

// some global initialization.
  setup();

// get aspect corrected normalized pixel coordinate
//   vec2 q = fragCoord.xy / resolution.xy;
//   vec2 p = -1.0 + 2.0*q;
//   p.x *= resolution.x / resolution.y;
    
  vec3 rayDir, cameraPos;
  rayDir = computePixelRay( pin.position, cameraPos );
	
  vec4 col = vec4(0.);
  float d = 4000.0;
    
// does pixel ray intersect with exp bounding sphere?
  vec2 boundingSphereInter = iSphere( cameraPos, rayDir, cExplosionRadius );
  if ( boundingSphereInter.x > 0. ) {
		// yes, cast ray
    col = raymarch( cameraPos, rayDir, boundingSphereInter, t, d );
  }
	
// smoothstep final color to add contrast
//col.xyz = col.xyz*col.xyz*(3.0-2.0*col.xyz);
//col.xyz = col.xyz*col.xyz*(2.0-col.xyz);	// darker contrast
  col.xyz = col.xyz*col.xyz*(1.0+cExplosionContrast*(1.0-col.xyz));

// gamma
//col.xyz = pow( col.xyz, vec3(1.25) );
//col.a = pow( col.a, 1.5 );

// from https://www.shadertoy.com/view/XdSXDc
//col.rgb = clamp(pow(col.rgb, vec3(0.416667))*1.055 - 0.055,0.,1.); //cheap sRGB approx
  
// vec3 cloudcolor = vec3(.8,.8,.8);
    
//  #ifdef WITH_FUN
//     // day-night cycling
//     float dnt = fract(iGlobalTime / DAY_NIGHT_CYCLE_TIME);
//     float day = 1.-smoothstep(.3, .5, dnt);
//     float night = smoothstep(.8, 1., dnt);
//     day += night;
//     night = 1.-day;
// 
//     // night setting
//     float gray = back.r+back.g+back.b;
//     vec3 corridorlight = night < .9 ? vec3(0.) :
//         smoothstep( 1., 0., gray ) * (CORRIDOR_LIGHT);	// this is so cute looking
//     //vec3 nightcolor = pow(back.b, 5. * clamp(rayDir.y+.7, 1. - (ENLIGHTEN_PASSAGE), 1.)) * (NIGHT_COLORING);
//     vec3 nightcolor = pow(back.b, 4.) * (NIGHT_COLORING);
//     nightcolor *= smoothstep( -1., 1., -(gray-1.7) ) + .1;
//     
//  #ifdef STARS
//     if ( gray > 2.999 )	// luck, practically just the sky in the cubemap is pure white
//     	nightcolor += stars( rayDir );
//  #endif
// 
//     // faking some light on the floor from the explosion
//     vec3 floorlight = (smoothstep( .3, .99, -rayDir.y ) * (FLOOR_LIGHT_STRENGTH) * smoothstep(.6, .0, t)) * colBottom.rgb;
// 
//     cloudcolor *= smoothstep( -.5, 1., day );
//     
//     back.rgb = back.rgb * day + nightcolor * night + corridorlight + floorlight;
//  #endif
// 
// #ifdef WITH_FUN
// #ifdef FOG
//     back.rgb = clouds(back.rgb,cameraPos+vec3(0.,40.,0.), rayDir, /*d*/ 4000.0, iGlobalTime*3., cloudcolor);
// #endif
// #endif
    
// fragColor.xyz = mix( back.xyz, col.xyz, col.a );
  pout.color = vec3(rgb2gray(mix( vec3(0.0), col.xyz, col.a )));
//  fragColor.xyz = rayDir;
//  fragColor.xyz = cameraPos;

//fragColor.rgb = clouds(fragColor.rgb,cameraPos, rayDir, d, iGlobalTime*3., cloudcolor);

// vignette
// fragColor.rgb *= pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.1);