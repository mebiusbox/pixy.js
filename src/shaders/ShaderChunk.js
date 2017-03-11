import accumulateFrag from './ShaderChunk/accumulateFrag.glsl';
import ambientFrag from './ShaderChunk/ambientFrag.glsl';
import ambientFragPars from './ShaderChunk/ambientFragPars.glsl';
import ambientHemisphereFrag from './ShaderChunk/ambientHemisphereFrag.glsl';
import ambientHemisphereFragPars from './ShaderChunk/ambientHemisphereFragPars.glsl';
import { ambientHemisphereUniforms } from './ShaderChunk/ambientHemisphereUniforms.js';
import { ambientUniforms } from './ShaderChunk/ambientUniforms.js';
import anisotropyFrag from './ShaderChunk/anisotropyFrag.glsl';
import anisotropyFragPars from './ShaderChunk/anisotropyFragPars.glsl';
import { anisotropyUniforms } from './ShaderChunk/anisotropyUniforms.js';
import antiAliasFrag from './ShaderChunk/antiAliasFrag.glsl';
import { antiAliasUniforms } from './ShaderChunk/antiAliasUniforms.js';
import antiAliasVert from './ShaderChunk/antiAliasVert.glsl';
import aoMapFrag from './ShaderChunk/aoMapFrag.glsl';
import aoMapFragPars from './ShaderChunk/aoMapFragPars.glsl';
import { aoMapUniforms } from './ShaderChunk/aoMapUniforms.js';
import beginFrag from './ShaderChunk/beginFrag.glsl';
import billboardDefaultVert from './ShaderChunk/billboardDefaultVert.glsl';
import billboardRotZVertEnd from './ShaderChunk/billboardRotZVertEnd.glsl';
import { billboardUniforms } from './ShaderChunk/billboardUniforms.js';
import billboardVert from './ShaderChunk/billboardVert.glsl';
import billboardVertEnd from './ShaderChunk/billboardVertEnd.glsl';
import billboardVertPars from './ShaderChunk/billboardVertPars.glsl';
import billboardYVert from './ShaderChunk/billboardYVert.glsl';
import bokehFrag from './ShaderChunk/bokehFrag.glsl';
import { bokehUniforms } from './ShaderChunk/bokehUniforms.js';
import bokehVert from './ShaderChunk/bokehVert.glsl';
import bsdfs from './ShaderChunk/bsdfs.glsl';
import bumpMapFrag from './ShaderChunk/bumpMapFrag.glsl';
import bumpMapFragPars from './ShaderChunk/bumpMapFragPars.glsl';
import { bumpMapUniforms } from './ShaderChunk/bumpMapUniforms.js';
import castShadowFrag from './ShaderChunk/castShadowFrag.glsl';
import castShadowFragPars from './ShaderChunk/castShadowFragPars.glsl';
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
import copyFrag from './ShaderChunk/copyFrag.glsl';
import { copyUniforms } from './ShaderChunk/copyUniforms.js';
import copyVert from './ShaderChunk/copyVert.glsl';
import deferredGeometryFrag from './ShaderChunk/deferredGeometryFrag.glsl';
import { deferredGeometryUniforms } from './ShaderChunk/deferredGeometryUniforms.js';
import deferredGeometryVert from './ShaderChunk/deferredGeometryVert.glsl';
import deferredLightFrag from './ShaderChunk/deferredLightFrag.glsl';
import { deferredLightUniforms } from './ShaderChunk/deferredLightUniforms.js';
import deferredLightVert from './ShaderChunk/deferredLightVert.glsl';
import depthFrag from './ShaderChunk/depthFrag.glsl';
import depthFragPars from './ShaderChunk/depthFragPars.glsl';
import depthShadowFrag from './ShaderChunk/depthShadowFrag.glsl';
import depthShadowFragPars from './ShaderChunk/depthShadowFragPars.glsl';
import depthShadowReceiveFrag from './ShaderChunk/depthShadowReceiveFrag.glsl';
import { depthShadowReceiveUniforms } from './ShaderChunk/depthShadowReceiveUniforms.js';
import depthShadowReceiveVert from './ShaderChunk/depthShadowReceiveVert.glsl';
import { depthShadowUniforms } from './ShaderChunk/depthShadowUniforms.js';
import depthShadowVert from './ShaderChunk/depthShadowVert.glsl';
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
import edgeCompositeFrag from './ShaderChunk/edgeCompositeFrag.glsl';
import { edgeCompositeUniforms } from './ShaderChunk/edgeCompositeUniforms.js';
import edgeCompositeVert from './ShaderChunk/edgeCompositeVert.glsl';
import edgeExpandFrag from './ShaderChunk/edgeExpandFrag.glsl';
import { edgeExpandUniforms } from './ShaderChunk/edgeExpandUniforms.js';
import edgeExpandVert from './ShaderChunk/edgeExpandVert.glsl';
import edgeFrag from './ShaderChunk/edgeFrag.glsl';
import edgeIDFrag from './ShaderChunk/edgeIDFrag.glsl';
import { edgeIDUniforms } from './ShaderChunk/edgeIDUniforms.js';
import edgeIDVert from './ShaderChunk/edgeIDVert.glsl';
import { edgeUniforms } from './ShaderChunk/edgeUniforms.js';
import edgeVert from './ShaderChunk/edgeVert.glsl';
import endFrag from './ShaderChunk/endFrag.glsl';
import fakeSunFrag from './ShaderChunk/fakeSunFrag.glsl';
import { fakeSunUniforms } from './ShaderChunk/fakeSunUniforms.js';
import fakeSunVert from './ShaderChunk/fakeSunVert.glsl';
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
import godRayCompositeFrag from './ShaderChunk/godRayCompositeFrag.glsl';
import { godRayCompositeUniforms } from './ShaderChunk/godRayCompositeUniforms.js';
import godRayCompositeVert from './ShaderChunk/godRayCompositeVert.glsl';
import godRayFrag from './ShaderChunk/godRayFrag.glsl';
import { godRayUniforms } from './ShaderChunk/godRayUniforms.js';
import godRayVert from './ShaderChunk/godRayVert.glsl';
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
import idFrag from './ShaderChunk/idFrag.glsl';
import { idUniforms } from './ShaderChunk/idUniforms.js';
import idVert from './ShaderChunk/idVert.glsl';
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
import lightsAreaLightFrag from './ShaderChunk/lightsAreaLightFrag.glsl';
import lightsAreaLightFragUnroll from './ShaderChunk/lightsAreaLightFragUnroll.glsl';
import { lightsAreaLightUniforms } from './ShaderChunk/lightsAreaLightUniforms.js';
import lightsDirectFrag from './ShaderChunk/lightsDirectFrag.glsl';
import lightsDirectFragUnroll from './ShaderChunk/lightsDirectFragUnroll.glsl';
import { lightsDirectUniforms } from './ShaderChunk/lightsDirectUniforms.js';
import lightsFragPars from './ShaderChunk/lightsFragPars.glsl';
import lightsPars from './ShaderChunk/lightsPars.glsl';
import lightsPointFrag from './ShaderChunk/lightsPointFrag.glsl';
import lightsPointFragUnroll from './ShaderChunk/lightsPointFragUnroll.glsl';
import { lightsPointUniforms } from './ShaderChunk/lightsPointUniforms.js';
import { lightsRectLightUniforms } from './ShaderChunk/lightsRectLightUniforms.js';
import lightsSpotFrag from './ShaderChunk/lightsSpotFrag.glsl';
import lightsSpotFragUnroll from './ShaderChunk/lightsSpotFragUnroll.glsl';
import { lightsSpotUniforms } from './ShaderChunk/lightsSpotUniforms.js';
import lightsStandardDisneyFrag from './ShaderChunk/lightsStandardDisneyFrag.glsl';
import lightsStandardFrag from './ShaderChunk/lightsStandardFrag.glsl';
import lightsTubeLightFrag from './ShaderChunk/lightsTubeLightFrag.glsl';
import lightsTubeLightFragUnroll from './ShaderChunk/lightsTubeLightFragUnroll.glsl';
import { lightsTubeLightUniforms } from './ShaderChunk/lightsTubeLightUniforms.js';
import lineGlowFrag from './ShaderChunk/lineGlowFrag.glsl';
import lineGlowFragPars from './ShaderChunk/lineGlowFragPars.glsl';
import { lineGlowUniforms } from './ShaderChunk/lineGlowUniforms.js';
import luminosityFrag from './ShaderChunk/luminosityFrag.glsl';
import luminosityHighPassFrag from './ShaderChunk/luminosityHighPassFrag.glsl';
import { luminosityHighPassUniforms } from './ShaderChunk/luminosityHighPassUniforms.js';
import luminosityHighPassVert from './ShaderChunk/luminosityHighPassVert.glsl';
import { luminosityUniforms } from './ShaderChunk/luminosityUniforms.js';
import luminosityVert from './ShaderChunk/luminosityVert.glsl';
import metalnessFrag from './ShaderChunk/metalnessFrag.glsl';
import metalnessMapFrag from './ShaderChunk/metalnessMapFrag.glsl';
import metalnessMapFragPars from './ShaderChunk/metalnessMapFragPars.glsl';
import { metalnessMapUniforms } from './ShaderChunk/metalnessMapUniforms.js';
import nolitFrag from './ShaderChunk/nolitFrag.glsl';
import normalMapFrag from './ShaderChunk/normalMapFrag.glsl';
import normalMapFragPars from './ShaderChunk/normalMapFragPars.glsl';
import { normalMapUniforms } from './ShaderChunk/normalMapUniforms.js';
import opacityFrag from './ShaderChunk/opacityFrag.glsl';
import { opacityUniforms } from './ShaderChunk/opacityUniforms.js';
import opacityVert from './ShaderChunk/opacityVert.glsl';
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
import reflectionStandardFrag from './ShaderChunk/reflectionStandardFrag.glsl';
import { reflectionUniforms } from './ShaderChunk/reflectionUniforms.js';
import rimLightFrag from './ShaderChunk/rimLightFrag.glsl';
import rimLightFragPars from './ShaderChunk/rimLightFragPars.glsl';
import { rimLightUniforms } from './ShaderChunk/rimLightUniforms.js';
import roughnessFrag from './ShaderChunk/roughnessFrag.glsl';
import roughnessMapFrag from './ShaderChunk/roughnessMapFrag.glsl';
import roughnessMapFragPars from './ShaderChunk/roughnessMapFragPars.glsl';
import { roughnessMapUniforms } from './ShaderChunk/roughnessMapUniforms.js';
import screenVert from './ShaderChunk/screenVert.glsl';
import screenVertPars from './ShaderChunk/screenVertPars.glsl';
import skyDomeFrag from './ShaderChunk/skyDomeFrag.glsl';
import skyDomeFragPars from './ShaderChunk/skyDomeFragPars.glsl';
import { skyDomeUniforms } from './ShaderChunk/skyDomeUniforms.js';
import skyFrag from './ShaderChunk/skyFrag.glsl';
import skyFragPars from './ShaderChunk/skyFragPars.glsl';
import { skyUniforms } from './ShaderChunk/skyUniforms.js';
import specularFrag from './ShaderChunk/specularFrag.glsl';
import specularFragPars from './ShaderChunk/specularFragPars.glsl';
import specularMapFrag from './ShaderChunk/specularMapFrag.glsl';
import specularMapFragPars from './ShaderChunk/specularMapFragPars.glsl';
import { specularMapUniforms } from './ShaderChunk/specularMapUniforms.js';
import { specularUniforms } from './ShaderChunk/specularUniforms.js';
import ssaoFrag from './ShaderChunk/ssaoFrag.glsl';
import { ssaoUniforms } from './ShaderChunk/ssaoUniforms.js';
import ssaoVert from './ShaderChunk/ssaoVert.glsl';
import standardAreaLightFrag from './ShaderChunk/standardAreaLightFrag.glsl';
import standardDisneyFrag from './ShaderChunk/standardDisneyFrag.glsl';
import standardDisneyFragPars from './ShaderChunk/standardDisneyFragPars.glsl';
import standardFrag from './ShaderChunk/standardFrag.glsl';
import standardFragPars from './ShaderChunk/standardFragPars.glsl';
import standardOrenNayarFrag from './ShaderChunk/standardOrenNayarFrag.glsl';
import standardTubeLightFrag from './ShaderChunk/standardTubeLightFrag.glsl';
import { standardUniforms } from './ShaderChunk/standardUniforms.js';
import tangentFragPars from './ShaderChunk/tangentFragPars.glsl';
import tangentVert from './ShaderChunk/tangentVert.glsl';
import tangentVertPars from './ShaderChunk/tangentVertPars.glsl';
import timePars from './ShaderChunk/timePars.glsl';
import { timeUniforms } from './ShaderChunk/timeUniforms.js';
import toneMapFrag from './ShaderChunk/toneMapFrag.glsl';
import toneMappingFrag from './ShaderChunk/toneMappingFrag.glsl';
import toneMappingFragPars from './ShaderChunk/toneMappingFragPars.glsl';
import { toneMappingUniforms } from './ShaderChunk/toneMappingUniforms.js';
import { toneMapUniforms } from './ShaderChunk/toneMapUniforms.js';
import toneMapVert from './ShaderChunk/toneMapVert.glsl';
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
import viewFrag from './ShaderChunk/viewFrag.glsl';
import { viewUniforms } from './ShaderChunk/viewUniforms.js';
import worldPositionVert from './ShaderChunk/worldPositionVert.glsl';
import worldPositionVertFragPars from './ShaderChunk/worldPositionVertFragPars.glsl';

export var ShaderChunk = {
	accumulateFrag: accumulateFrag,
	ambientFrag: ambientFrag,
	ambientFragPars: ambientFragPars,
	ambientHemisphereFrag: ambientHemisphereFrag,
	ambientHemisphereFragPars: ambientHemisphereFragPars,
	ambientHemisphereUniforms: ambientHemisphereUniforms,
	ambientUniforms: ambientUniforms,
	anisotropyFrag: anisotropyFrag,
	anisotropyFragPars: anisotropyFragPars,
	anisotropyUniforms: anisotropyUniforms,
	antiAliasFrag: antiAliasFrag,
	antiAliasUniforms: antiAliasUniforms,
	antiAliasVert: antiAliasVert,
	aoMapFrag: aoMapFrag,
	aoMapFragPars: aoMapFragPars,
	aoMapUniforms: aoMapUniforms,
	beginFrag: beginFrag,
	billboardDefaultVert: billboardDefaultVert,
	billboardRotZVertEnd: billboardRotZVertEnd,
	billboardUniforms: billboardUniforms,
	billboardVert: billboardVert,
	billboardVertEnd: billboardVertEnd,
	billboardVertPars: billboardVertPars,
	billboardYVert: billboardYVert,
	bokehFrag: bokehFrag,
	bokehUniforms: bokehUniforms,
	bokehVert: bokehVert,
	bsdfs: bsdfs,
	bumpMapFrag: bumpMapFrag,
	bumpMapFragPars: bumpMapFragPars,
	bumpMapUniforms: bumpMapUniforms,
	castShadowFrag: castShadowFrag,
	castShadowFragPars: castShadowFragPars,
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
	copyFrag: copyFrag,
	copyUniforms: copyUniforms,
	copyVert: copyVert,
	deferredGeometryFrag: deferredGeometryFrag,
	deferredGeometryUniforms: deferredGeometryUniforms,
	deferredGeometryVert: deferredGeometryVert,
	deferredLightFrag: deferredLightFrag,
	deferredLightUniforms: deferredLightUniforms,
	deferredLightVert: deferredLightVert,
	depthFrag: depthFrag,
	depthFragPars: depthFragPars,
	depthShadowFrag: depthShadowFrag,
	depthShadowFragPars: depthShadowFragPars,
	depthShadowReceiveFrag: depthShadowReceiveFrag,
	depthShadowReceiveUniforms: depthShadowReceiveUniforms,
	depthShadowReceiveVert: depthShadowReceiveVert,
	depthShadowUniforms: depthShadowUniforms,
	depthShadowVert: depthShadowVert,
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
	edgeCompositeFrag: edgeCompositeFrag,
	edgeCompositeUniforms: edgeCompositeUniforms,
	edgeCompositeVert: edgeCompositeVert,
	edgeExpandFrag: edgeExpandFrag,
	edgeExpandUniforms: edgeExpandUniforms,
	edgeExpandVert: edgeExpandVert,
	edgeFrag: edgeFrag,
	edgeIDFrag: edgeIDFrag,
	edgeIDUniforms: edgeIDUniforms,
	edgeIDVert: edgeIDVert,
	edgeUniforms: edgeUniforms,
	edgeVert: edgeVert,
	endFrag: endFrag,
	fakeSunFrag: fakeSunFrag,
	fakeSunUniforms: fakeSunUniforms,
	fakeSunVert: fakeSunVert,
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
	godRayCompositeFrag: godRayCompositeFrag,
	godRayCompositeUniforms: godRayCompositeUniforms,
	godRayCompositeVert: godRayCompositeVert,
	godRayFrag: godRayFrag,
	godRayUniforms: godRayUniforms,
	godRayVert: godRayVert,
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
	idFrag: idFrag,
	idUniforms: idUniforms,
	idVert: idVert,
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
	lightsAreaLightFrag: lightsAreaLightFrag,
	lightsAreaLightFragUnroll: lightsAreaLightFragUnroll,
	lightsAreaLightUniforms: lightsAreaLightUniforms,
	lightsDirectFrag: lightsDirectFrag,
	lightsDirectFragUnroll: lightsDirectFragUnroll,
	lightsDirectUniforms: lightsDirectUniforms,
	lightsFragPars: lightsFragPars,
	lightsPars: lightsPars,
	lightsPointFrag: lightsPointFrag,
	lightsPointFragUnroll: lightsPointFragUnroll,
	lightsPointUniforms: lightsPointUniforms,
	lightsRectLightUniforms: lightsRectLightUniforms,
	lightsSpotFrag: lightsSpotFrag,
	lightsSpotFragUnroll: lightsSpotFragUnroll,
	lightsSpotUniforms: lightsSpotUniforms,
	lightsStandardDisneyFrag: lightsStandardDisneyFrag,
	lightsStandardFrag: lightsStandardFrag,
	lightsTubeLightFrag: lightsTubeLightFrag,
	lightsTubeLightFragUnroll: lightsTubeLightFragUnroll,
	lightsTubeLightUniforms: lightsTubeLightUniforms,
	lineGlowFrag: lineGlowFrag,
	lineGlowFragPars: lineGlowFragPars,
	lineGlowUniforms: lineGlowUniforms,
	luminosityFrag: luminosityFrag,
	luminosityHighPassFrag: luminosityHighPassFrag,
	luminosityHighPassUniforms: luminosityHighPassUniforms,
	luminosityHighPassVert: luminosityHighPassVert,
	luminosityUniforms: luminosityUniforms,
	luminosityVert: luminosityVert,
	metalnessFrag: metalnessFrag,
	metalnessMapFrag: metalnessMapFrag,
	metalnessMapFragPars: metalnessMapFragPars,
	metalnessMapUniforms: metalnessMapUniforms,
	nolitFrag: nolitFrag,
	normalMapFrag: normalMapFrag,
	normalMapFragPars: normalMapFragPars,
	normalMapUniforms: normalMapUniforms,
	opacityFrag: opacityFrag,
	opacityUniforms: opacityUniforms,
	opacityVert: opacityVert,
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
	reflectionStandardFrag: reflectionStandardFrag,
	reflectionUniforms: reflectionUniforms,
	rimLightFrag: rimLightFrag,
	rimLightFragPars: rimLightFragPars,
	rimLightUniforms: rimLightUniforms,
	roughnessFrag: roughnessFrag,
	roughnessMapFrag: roughnessMapFrag,
	roughnessMapFragPars: roughnessMapFragPars,
	roughnessMapUniforms: roughnessMapUniforms,
	screenVert: screenVert,
	screenVertPars: screenVertPars,
	skyDomeFrag: skyDomeFrag,
	skyDomeFragPars: skyDomeFragPars,
	skyDomeUniforms: skyDomeUniforms,
	skyFrag: skyFrag,
	skyFragPars: skyFragPars,
	skyUniforms: skyUniforms,
	specularFrag: specularFrag,
	specularFragPars: specularFragPars,
	specularMapFrag: specularMapFrag,
	specularMapFragPars: specularMapFragPars,
	specularMapUniforms: specularMapUniforms,
	specularUniforms: specularUniforms,
	ssaoFrag: ssaoFrag,
	ssaoUniforms: ssaoUniforms,
	ssaoVert: ssaoVert,
	standardAreaLightFrag: standardAreaLightFrag,
	standardDisneyFrag: standardDisneyFrag,
	standardDisneyFragPars: standardDisneyFragPars,
	standardFrag: standardFrag,
	standardFragPars: standardFragPars,
	standardOrenNayarFrag: standardOrenNayarFrag,
	standardTubeLightFrag: standardTubeLightFrag,
	standardUniforms: standardUniforms,
	tangentFragPars: tangentFragPars,
	tangentVert: tangentVert,
	tangentVertPars: tangentVertPars,
	timePars: timePars,
	timeUniforms: timeUniforms,
	toneMapFrag: toneMapFrag,
	toneMappingFrag: toneMappingFrag,
	toneMappingFragPars: toneMappingFragPars,
	toneMappingUniforms: toneMappingUniforms,
	toneMapUniforms: toneMapUniforms,
	toneMapVert: toneMapVert,
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
	viewFrag: viewFrag,
	viewUniforms: viewUniforms,
	worldPositionVert: worldPositionVert,
	worldPositionVertFragPars: worldPositionVertFragPars,
};