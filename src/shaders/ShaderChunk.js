import ambientFrag from './ShaderChunk/ambientFrag.glsl';
import ambientFragPars from './ShaderChunk/ambientFragPars.glsl';
import ambientHemisphereFrag from './ShaderChunk/ambientHemisphereFrag.glsl';
import ambientHemisphereFragPars from './ShaderChunk/ambientHemisphereFragPars.glsl';
import { ambientHemisphereUniforms } from './ShaderChunk/ambientHemisphereUniforms.js';
import { ambientUniforms } from './ShaderChunk/ambientUniforms.js';
import anisotropyFrag from './ShaderChunk/anisotropyFrag.glsl';
import anisotropyFragPars from './ShaderChunk/anisotropyFragPars.glsl';
import { anisotropyUniforms } from './ShaderChunk/anisotropyUniforms.js';
import aoMapFrag from './ShaderChunk/aoMapFrag.glsl';
import aoMapFragPars from './ShaderChunk/aoMapFragPars.glsl';
import { aoMapUniforms } from './ShaderChunk/aoMapUniforms.js';
import billboardDefaultVert from './ShaderChunk/billboardDefaultVert.glsl';
import billboardRotZVertEnd from './ShaderChunk/billboardRotZVertEnd.glsl';
import { billboardUniforms } from './ShaderChunk/billboardUniforms.js';
import billboardVert from './ShaderChunk/billboardVert.glsl';
import billboardVertEnd from './ShaderChunk/billboardVertEnd.glsl';
import billboardVertPars from './ShaderChunk/billboardVertPars.glsl';
import billboardYVert from './ShaderChunk/billboardYVert.glsl';
import bumpMapFrag from './ShaderChunk/bumpMapFrag.glsl';
import bumpMapFragPars from './ShaderChunk/bumpMapFragPars.glsl';
import { bumpMapUniforms } from './ShaderChunk/bumpMapUniforms.js';
import { castShadowUniforms } from './ShaderChunk/castShadowUniforms.js';
import castShadowVert from './ShaderChunk/castShadowVert.glsl';
import castShadowVertPars from './ShaderChunk/castShadowVertPars.glsl';
import clippingPlaneFrag from './ShaderChunk/clippingPlaneFrag.glsl';
import clippingPlaneFragPars from './ShaderChunk/clippingPlaneFragPars.glsl';
import { clippingPlaneUniforms } from './ShaderChunk/clippingPlaneUniforms.js';
import cloudsFrag from './ShaderChunk/cloudsFrag.glsl';
import cloudsFragPars from './ShaderChunk/cloudsFragPars.glsl';
import { cloudsUniforms } from './ShaderChunk/cloudsUniforms.js';
import colorMapAlphaFrag from './ShaderChunk/colorMapAlphaFrag.glsl';
import colorMapFrag from './ShaderChunk/colorMapFrag.glsl';
import colorMapFragPars from './ShaderChunk/colorMapFragPars.glsl';
import { colorMapUniforms } from './ShaderChunk/colorMapUniforms.js';
import common from './ShaderChunk/common.glsl';
import depthFrag from './ShaderChunk/depthFrag.glsl';
import depthFragPars from './ShaderChunk/depthFragPars.glsl';
import depthShadowFrag from './ShaderChunk/depthShadowFrag.glsl';
import depthShadowFragPars from './ShaderChunk/depthShadowFragPars.glsl';
import { depthShadowUniforms } from './ShaderChunk/depthShadowUniforms.js';
import discardFrag from './ShaderChunk/discardFrag.glsl';
import { displacementMapUniforms } from './ShaderChunk/displacementMapUniforms.js';
import displacementMapVert from './ShaderChunk/displacementMapVert.glsl';
import displacementMapVertPars from './ShaderChunk/displacementMapVertPars.glsl';
import distortionFrag from './ShaderChunk/distortionFrag.glsl';
import distortionFragPars from './ShaderChunk/distortionFragPars.glsl';
import { distortionUniforms } from './ShaderChunk/distortionUniforms.js';
import distortionVert from './ShaderChunk/distortionVert.glsl';
import distortionVertPars from './ShaderChunk/distortionVertPars.glsl';
import ditherFrag from './ShaderChunk/ditherFrag.glsl';
import ditherFragPars from './ShaderChunk/ditherFragPars.glsl';
import fogFrag from './ShaderChunk/fogFrag.glsl';
import fogFragPars from './ShaderChunk/fogFragPars.glsl';
import { fogUniforms } from './ShaderChunk/fogUniforms.js';
import fogVert from './ShaderChunk/fogVert.glsl';
import fogVertPars from './ShaderChunk/fogVertPars.glsl';
import fresnelFrag from './ShaderChunk/fresnelFrag.glsl';
import fresnelFragPars from './ShaderChunk/fresnelFragPars.glsl';
import { fresnelUniforms } from './ShaderChunk/fresnelUniforms.js';
import glassFrag from './ShaderChunk/glassFrag.glsl';
import glassFragPars from './ShaderChunk/glassFragPars.glsl';
import { glassUniforms } from './ShaderChunk/glassUniforms.js';
import glassVert from './ShaderChunk/glassVert.glsl';
import { grassUniforms } from './ShaderChunk/grassUniforms.js';
import grassVert from './ShaderChunk/grassVert.glsl';
import grassVertPars from './ShaderChunk/grassVertPars.glsl';
import heightFogFrag from './ShaderChunk/heightFogFrag.glsl';
import heightFogFragPars from './ShaderChunk/heightFogFragPars.glsl';
import heightFogMapFrag from './ShaderChunk/heightFogMapFrag.glsl';
import heightFogMapFragPars from './ShaderChunk/heightFogMapFragPars.glsl';
import { heightFogMapUniforms } from './ShaderChunk/heightFogMapUniforms.js';
import { heightFogUniforms } from './ShaderChunk/heightFogUniforms.js';
import heightFogVert from './ShaderChunk/heightFogVert.glsl';
import heightFogVertPars from './ShaderChunk/heightFogVertPars.glsl';
import innerGlowFrag from './ShaderChunk/innerGlowFrag.glsl';
import innerGlowFragPars from './ShaderChunk/innerGlowFragPars.glsl';
import innerGlowSubtractFrag from './ShaderChunk/innerGlowSubtractFrag.glsl';
import { innerGlowUniforms } from './ShaderChunk/innerGlowUniforms.js';
import instanceCastShadowVert from './ShaderChunk/instanceCastShadowVert.glsl';
import instanceCastShadowVertPars from './ShaderChunk/instanceCastShadowVertPars.glsl';
import instanceColorMapDiscardFrag from './ShaderChunk/instanceColorMapDiscardFrag.glsl';
import lambertFrag from './ShaderChunk/lambertFrag.glsl';
import lightMapFrag from './ShaderChunk/lightMapFrag.glsl';
import lightMapFragPars from './ShaderChunk/lightMapFragPars.glsl';
import { lightMapUniforms } from './ShaderChunk/lightMapUniforms.js';
import lightsDirectFrag from './ShaderChunk/lightsDirectFrag.glsl';
import { lightsDirectUniforms } from './ShaderChunk/lightsDirectUniforms.js';
import lightsFragPars from './ShaderChunk/lightsFragPars.glsl';
import lightsPointFrag from './ShaderChunk/lightsPointFrag.glsl';
import { lightsPointUniforms } from './ShaderChunk/lightsPointUniforms.js';
import lightsSpotFrag from './ShaderChunk/lightsSpotFrag.glsl';
import { lightsSpotUniforms } from './ShaderChunk/lightsSpotUniforms.js';
import lineGlowFrag from './ShaderChunk/lineGlowFrag.glsl';
import lineGlowFragPars from './ShaderChunk/lineGlowFragPars.glsl';
import { lineGlowUniforms } from './ShaderChunk/lineGlowUniforms.js';
import nolitFrag from './ShaderChunk/nolitFrag.glsl';
import normalMapFrag from './ShaderChunk/normalMapFrag.glsl';
import normalMapFragPars from './ShaderChunk/normalMapFragPars.glsl';
import { normalMapUniforms } from './ShaderChunk/normalMapUniforms.js';
import overlayFrag from './ShaderChunk/overlayFrag.glsl';
import overlayFragPars from './ShaderChunk/overlayFragPars.glsl';
import overlayNormalFrag from './ShaderChunk/overlayNormalFrag.glsl';
import overlayNormalFragPars from './ShaderChunk/overlayNormalFragPars.glsl';
import { overlayNormalUniforms } from './ShaderChunk/overlayNormalUniforms.js';
import { overlayUniforms } from './ShaderChunk/overlayUniforms.js';
import packing from './ShaderChunk/packing.glsl';
import parallaxMapFrag from './ShaderChunk/parallaxMapFrag.glsl';
import parallaxMapFragPars from './ShaderChunk/parallaxMapFragPars.glsl';
import { parallaxMapUniforms } from './ShaderChunk/parallaxMapUniforms.js';
import phongFrag from './ShaderChunk/phongFrag.glsl';
import phongFragPars from './ShaderChunk/phongFragPars.glsl';
import { phongUniforms } from './ShaderChunk/phongUniforms.js';
import projectionMapFrag from './ShaderChunk/projectionMapFrag.glsl';
import projectionMapFragPars from './ShaderChunk/projectionMapFragPars.glsl';
import { projectionMapUniforms } from './ShaderChunk/projectionMapUniforms.js';
import projectionMapVert from './ShaderChunk/projectionMapVert.glsl';
import projectionMapVertPars from './ShaderChunk/projectionMapVertPars.glsl';
import receiveShadowFrag from './ShaderChunk/receiveShadowFrag.glsl';
import receiveShadowFragPars from './ShaderChunk/receiveShadowFragPars.glsl';
import { receiveShadowUniforms } from './ShaderChunk/receiveShadowUniforms.js';
import receiveShadowVert from './ShaderChunk/receiveShadowVert.glsl';
import receiveShadowVertPars from './ShaderChunk/receiveShadowVertPars.glsl';
import reflectionFrag from './ShaderChunk/reflectionFrag.glsl';
import reflectionFragPars from './ShaderChunk/reflectionFragPars.glsl';
import { reflectionUniforms } from './ShaderChunk/reflectionUniforms.js';
import rimLightFrag from './ShaderChunk/rimLightFrag.glsl';
import rimLightFragPars from './ShaderChunk/rimLightFragPars.glsl';
import { rimLightUniforms } from './ShaderChunk/rimLightUniforms.js';
import screenVert from './ShaderChunk/screenVert.glsl';
import screenVertPars from './ShaderChunk/screenVertPars.glsl';
import skyFrag from './ShaderChunk/skyFrag.glsl';
import skyFragPars from './ShaderChunk/skyFragPars.glsl';
import { skyUniforms } from './ShaderChunk/skyUniforms.js';
import specularFrag from './ShaderChunk/specularFrag.glsl';
import specularFragPars from './ShaderChunk/specularFragPars.glsl';
import specularMapFrag from './ShaderChunk/specularMapFrag.glsl';
import specularMapFragPars from './ShaderChunk/specularMapFragPars.glsl';
import { specularMapUniforms } from './ShaderChunk/specularMapUniforms.js';
import { specularUniforms } from './ShaderChunk/specularUniforms.js';
import tangentFragPars from './ShaderChunk/tangentFragPars.glsl';
import tangentVert from './ShaderChunk/tangentVert.glsl';
import tangentVertPars from './ShaderChunk/tangentVertPars.glsl';
import timePars from './ShaderChunk/timePars.glsl';
import { timeUniforms } from './ShaderChunk/timeUniforms.js';
import toneMappingFrag from './ShaderChunk/toneMappingFrag.glsl';
import toneMappingFragPars from './ShaderChunk/toneMappingFragPars.glsl';
import { toneMappingUniforms } from './ShaderChunk/toneMappingUniforms.js';
import toonFrag from './ShaderChunk/toonFrag.glsl';
import toonFragPars from './ShaderChunk/toonFragPars.glsl';
import { toonUniforms } from './ShaderChunk/toonUniforms.js';
import uvFrag from './ShaderChunk/uvFrag.glsl';
import uvHemiSphericalFrag from './ShaderChunk/uvHemiSphericalFrag.glsl';
import uvProjectionVert from './ShaderChunk/uvProjectionVert.glsl';
import uvScaleFrag from './ShaderChunk/uvScaleFrag.glsl';
import uvScaleFragPars from './ShaderChunk/uvScaleFragPars.glsl';
import { uvScaleUniforms } from './ShaderChunk/uvScaleUniforms.js';
import { uvScrollUniforms } from './ShaderChunk/uvScrollUniforms.js';
import uvScrollVert from './ShaderChunk/uvScrollVert.glsl';
import uvScrollVertPars from './ShaderChunk/uvScrollVertPars.glsl';
import uvSphericalFrag from './ShaderChunk/uvSphericalFrag.glsl';
import uvVert from './ShaderChunk/uvVert.glsl';
import uvVertFragPars from './ShaderChunk/uvVertFragPars.glsl';
import velvetFrag from './ShaderChunk/velvetFrag.glsl';
import velvetFragPars from './ShaderChunk/velvetFragPars.glsl';
import { velvetUniforms } from './ShaderChunk/velvetUniforms.js';

export var ShaderChunk = {
	ambientFrag: ambientFrag,
	ambientFragPars: ambientFragPars,
	ambientHemisphereFrag: ambientHemisphereFrag,
	ambientHemisphereFragPars: ambientHemisphereFragPars,
	ambientHemisphereUniforms: ambientHemisphereUniforms,
	ambientUniforms: ambientUniforms,
	anisotropyFrag: anisotropyFrag,
	anisotropyFragPars: anisotropyFragPars,
	anisotropyUniforms: anisotropyUniforms,
	aoMapFrag: aoMapFrag,
	aoMapFragPars: aoMapFragPars,
	aoMapUniforms: aoMapUniforms,
	billboardDefaultVert: billboardDefaultVert,
	billboardRotZVertEnd: billboardRotZVertEnd,
	billboardUniforms: billboardUniforms,
	billboardVert: billboardVert,
	billboardVertEnd: billboardVertEnd,
	billboardVertPars: billboardVertPars,
	billboardYVert: billboardYVert,
	bumpMapFrag: bumpMapFrag,
	bumpMapFragPars: bumpMapFragPars,
	bumpMapUniforms: bumpMapUniforms,
	castShadowUniforms: castShadowUniforms,
	castShadowVert: castShadowVert,
	castShadowVertPars: castShadowVertPars,
	clippingPlaneFrag: clippingPlaneFrag,
	clippingPlaneFragPars: clippingPlaneFragPars,
	clippingPlaneUniforms: clippingPlaneUniforms,
	cloudsFrag: cloudsFrag,
	cloudsFragPars: cloudsFragPars,
	cloudsUniforms: cloudsUniforms,
	colorMapAlphaFrag: colorMapAlphaFrag,
	colorMapFrag: colorMapFrag,
	colorMapFragPars: colorMapFragPars,
	colorMapUniforms: colorMapUniforms,
	common: common,
	depthFrag: depthFrag,
	depthFragPars: depthFragPars,
	depthShadowFrag: depthShadowFrag,
	depthShadowFragPars: depthShadowFragPars,
	depthShadowUniforms: depthShadowUniforms,
	discardFrag: discardFrag,
	displacementMapUniforms: displacementMapUniforms,
	displacementMapVert: displacementMapVert,
	displacementMapVertPars: displacementMapVertPars,
	distortionFrag: distortionFrag,
	distortionFragPars: distortionFragPars,
	distortionUniforms: distortionUniforms,
	distortionVert: distortionVert,
	distortionVertPars: distortionVertPars,
	ditherFrag: ditherFrag,
	ditherFragPars: ditherFragPars,
	fogFrag: fogFrag,
	fogFragPars: fogFragPars,
	fogUniforms: fogUniforms,
	fogVert: fogVert,
	fogVertPars: fogVertPars,
	fresnelFrag: fresnelFrag,
	fresnelFragPars: fresnelFragPars,
	fresnelUniforms: fresnelUniforms,
	glassFrag: glassFrag,
	glassFragPars: glassFragPars,
	glassUniforms: glassUniforms,
	glassVert: glassVert,
	grassUniforms: grassUniforms,
	grassVert: grassVert,
	grassVertPars: grassVertPars,
	heightFogFrag: heightFogFrag,
	heightFogFragPars: heightFogFragPars,
	heightFogMapFrag: heightFogMapFrag,
	heightFogMapFragPars: heightFogMapFragPars,
	heightFogMapUniforms: heightFogMapUniforms,
	heightFogUniforms: heightFogUniforms,
	heightFogVert: heightFogVert,
	heightFogVertPars: heightFogVertPars,
	innerGlowFrag: innerGlowFrag,
	innerGlowFragPars: innerGlowFragPars,
	innerGlowSubtractFrag: innerGlowSubtractFrag,
	innerGlowUniforms: innerGlowUniforms,
	instanceCastShadowVert: instanceCastShadowVert,
	instanceCastShadowVertPars: instanceCastShadowVertPars,
	instanceColorMapDiscardFrag: instanceColorMapDiscardFrag,
	lambertFrag: lambertFrag,
	lightMapFrag: lightMapFrag,
	lightMapFragPars: lightMapFragPars,
	lightMapUniforms: lightMapUniforms,
	lightsDirectFrag: lightsDirectFrag,
	lightsDirectUniforms: lightsDirectUniforms,
	lightsFragPars: lightsFragPars,
	lightsPointFrag: lightsPointFrag,
	lightsPointUniforms: lightsPointUniforms,
	lightsSpotFrag: lightsSpotFrag,
	lightsSpotUniforms: lightsSpotUniforms,
	lineGlowFrag: lineGlowFrag,
	lineGlowFragPars: lineGlowFragPars,
	lineGlowUniforms: lineGlowUniforms,
	nolitFrag: nolitFrag,
	normalMapFrag: normalMapFrag,
	normalMapFragPars: normalMapFragPars,
	normalMapUniforms: normalMapUniforms,
	overlayFrag: overlayFrag,
	overlayFragPars: overlayFragPars,
	overlayNormalFrag: overlayNormalFrag,
	overlayNormalFragPars: overlayNormalFragPars,
	overlayNormalUniforms: overlayNormalUniforms,
	overlayUniforms: overlayUniforms,
	packing: packing,
	parallaxMapFrag: parallaxMapFrag,
	parallaxMapFragPars: parallaxMapFragPars,
	parallaxMapUniforms: parallaxMapUniforms,
	phongFrag: phongFrag,
	phongFragPars: phongFragPars,
	phongUniforms: phongUniforms,
	projectionMapFrag: projectionMapFrag,
	projectionMapFragPars: projectionMapFragPars,
	projectionMapUniforms: projectionMapUniforms,
	projectionMapVert: projectionMapVert,
	projectionMapVertPars: projectionMapVertPars,
	receiveShadowFrag: receiveShadowFrag,
	receiveShadowFragPars: receiveShadowFragPars,
	receiveShadowUniforms: receiveShadowUniforms,
	receiveShadowVert: receiveShadowVert,
	receiveShadowVertPars: receiveShadowVertPars,
	reflectionFrag: reflectionFrag,
	reflectionFragPars: reflectionFragPars,
	reflectionUniforms: reflectionUniforms,
	rimLightFrag: rimLightFrag,
	rimLightFragPars: rimLightFragPars,
	rimLightUniforms: rimLightUniforms,
	screenVert: screenVert,
	screenVertPars: screenVertPars,
	skyFrag: skyFrag,
	skyFragPars: skyFragPars,
	skyUniforms: skyUniforms,
	specularFrag: specularFrag,
	specularFragPars: specularFragPars,
	specularMapFrag: specularMapFrag,
	specularMapFragPars: specularMapFragPars,
	specularMapUniforms: specularMapUniforms,
	specularUniforms: specularUniforms,
	tangentFragPars: tangentFragPars,
	tangentVert: tangentVert,
	tangentVertPars: tangentVertPars,
	timePars: timePars,
	timeUniforms: timeUniforms,
	toneMappingFrag: toneMappingFrag,
	toneMappingFragPars: toneMappingFragPars,
	toneMappingUniforms: toneMappingUniforms,
	toonFrag: toonFrag,
	toonFragPars: toonFragPars,
	toonUniforms: toonUniforms,
	uvFrag: uvFrag,
	uvHemiSphericalFrag: uvHemiSphericalFrag,
	uvProjectionVert: uvProjectionVert,
	uvScaleFrag: uvScaleFrag,
	uvScaleFragPars: uvScaleFragPars,
	uvScaleUniforms: uvScaleUniforms,
	uvScrollUniforms: uvScrollUniforms,
	uvScrollVert: uvScrollVert,
	uvScrollVertPars: uvScrollVertPars,
	uvSphericalFrag: uvSphericalFrag,
	uvVert: uvVert,
	uvVertFragPars: uvVertFragPars,
	velvetFrag: velvetFrag,
	velvetFragPars: velvetFragPars,
	velvetUniforms: velvetUniforms,
};