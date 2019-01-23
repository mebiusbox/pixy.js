uniform float parallaxScale;
uniform sampler2D tHeightMap;

// vec3 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {

//     vec2 texDx = dFdx( vUv );
//     vec2 texDy = dFdy( vUv );

//     vec3 vSigmaX = dFdx( surfPosition );
//     vec3 vSigmaY = dFdy( surfPosition );
//     vec3 vR1 = cross( vSigmaY, surfNormal );
//     vec3 vR2 = cross( surfNormal, vSigmaX );
//     float fDet = dot( vSigmaX, vR1 );

//     vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );
//     vec3 vProjVtex;
//     vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;
//     vProjVtex.z = dot( surfNormal, viewPosition );
//     return vProjVtex;
// }