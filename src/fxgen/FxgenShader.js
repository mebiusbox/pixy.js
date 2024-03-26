import * as THREE from 'three';
import { ShaderChunk } from './ShaderChunk';

class FxgenShader {

	constructor() {

		this.enables = {};

	}

	enable( key, value ) {

		this.enables[ key ] = value === undefined ? 1 : value;

	}

	clear() {

		this.enables = {};

	}

	checkKey( key ) {

		for ( let i in this.enables ) {

			if ( i === key ) {

				return true;

			}

		}

		return false;

	}

	// +AAA : OR
	// -BBB : NOT
	check( keys ) {

		if ( keys === null || keys.length === 0 ) {

			return true;

		}

		let check = 0;
		for ( let i in keys ) {

			if ( keys[ i ][ 0 ] === '-' ) {

				if ( this.checkKey( keys[ i ].substr( 1 ) ) ) {

					return false;

				}

			} else if ( keys[ i ][ 0 ] === '+' ) {

				if ( check === 0 ) {

					check = 1;

				}

				if ( this.checkKey( keys[ i ].substr( 1 ) ) ) {

					check = 2;

				}

			} else {

				if ( this.checkKey( keys[ i ] ) === false ) {

					return false;

				}

			}

		}

		if ( check > 0 && check < 2 ) {

			return false;

		}

		return true;

	}

	generateDefines() {

		return {
			NOISE_OCTAVE: 8,
			NOISE_PERSISTENCE: 0.5,
		};

	}

	addUniform( uniforms, keys, chunk ) {

		if ( this.check( keys ) ) {

			uniforms.push( ShaderChunk[ chunk ] );

		}

	}

	generateUniforms() {

		const uniforms = [];

		uniforms.push( {
			resolution: { value: new THREE.Vector2() },
			mouse: { value: new THREE.Vector2() },
			time: { value: 0.0 },
			cameraPos: { value: new THREE.Vector3() },
			cameraDir: { value: new THREE.Vector3() },
			tDiffuse: { value: null },
		} );

		//! UNIFORMS

		this.addUniform( uniforms, [], 'noiseUniforms' );
		this.addUniform( uniforms, [ 'DISPLACEMENT' ], 'displacementUniforms' );

		this.addUniform( uniforms, [ 'WOOD' ], 'woodUniforms' );
		this.addUniform( uniforms, [ 'CIRCLE' ], 'circleUniforms' );
		this.addUniform( uniforms, [ 'SOLAR' ], 'solarUniforms' );
		this.addUniform( uniforms, [ 'SPARK' ], 'sparkUniforms' );
		this.addUniform( uniforms, [ 'RING' ], 'ringUniforms' );
		this.addUniform( uniforms, [ 'GRADATION' ], 'gradationUniforms' );
		this.addUniform( uniforms, [ 'GRADATIONLINE' ], 'gradationLineUniforms' );
		this.addUniform( uniforms, [ 'FLASH' ], 'flashUniforms' );
		this.addUniform( uniforms, [ 'CONE' ], 'coneUniforms' );
		this.addUniform( uniforms, [ 'FLOWER' ], 'flowerUniforms' );
		this.addUniform( uniforms, [ 'FLOWERFUN' ], 'flowerFunUniforms' );
		this.addUniform( uniforms, [ 'WAVERING' ], 'waveRingUniforms' );
		this.addUniform( uniforms, [ 'COHERENTNOISE' ], 'coherentNoiseUniforms' );
		this.addUniform( uniforms, [ 'FBMNOISE2' ], 'fbmNoise2Uniforms' );
		this.addUniform( uniforms, [ 'FBMNOISE3' ], 'fbmNoise3Uniforms' );
		this.addUniform( uniforms, [ 'SEEMLESSNOISE' ], 'seemlessNoiseUniforms' );
		this.addUniform( uniforms, [ 'MARBLENOISE' ], 'marbleNoiseUniforms' );
		this.addUniform( uniforms, [ 'TESSNOISE' ], 'tessNoiseUniforms' );
		this.addUniform( uniforms, [ 'GRADIENTNOISE' ], 'gradientNoiseUniforms' );
		this.addUniform( uniforms, [ '+HEIGHT2NORMAL', '+HEIGHT2NORMALSOBEL' ], 'height2NormalUniforms' );
		this.addUniform( uniforms, [ 'COLORBALANCE' ], 'colorBalanceUniforms' );
		this.addUniform( uniforms, [ 'SMOKE' ], 'smokeUniforms' );
		this.addUniform( uniforms, [ 'CELL' ], 'cellUniforms' );
		this.addUniform( uniforms, [ 'FLAME' ], 'flameUniforms' );
		this.addUniform( uniforms, [ 'FLAMEEYE' ], 'flameEyeUniforms' );
		this.addUniform( uniforms, [ 'FIRE' ], 'fireUniforms' );
		this.addUniform( uniforms, [ 'LIGHTNING' ], 'lightningUniforms' );
		this.addUniform( uniforms, [ 'FLARE' ], 'flareUniforms' );
		this.addUniform( uniforms, [ 'FLARE2' ], 'flare2Uniforms' );
		this.addUniform( uniforms, [ 'FLARE3' ], 'flare3Uniforms' );
		this.addUniform( uniforms, [ 'MAGICCIRCLE' ], 'magicCircleUniforms' );
		this.addUniform( uniforms, [ 'CROSS' ], 'crossUniforms' );
		this.addUniform( uniforms, [ 'EXPLOSION' ], 'explosionUniforms' );
		this.addUniform( uniforms, [ 'EXPLOSION2' ], 'explosion2Uniforms' );
		this.addUniform( uniforms, [ 'CORONA' ], 'coronaUniforms' );
		this.addUniform( uniforms, [ 'LENSFLARE' ], 'lensFlareUniforms' );
		this.addUniform( uniforms, [ 'SUN' ], 'sunUniforms' );
		this.addUniform( uniforms, [ 'LASER' ], 'laserUniforms' );
		this.addUniform( uniforms, [ 'LASER2' ], 'laser2Uniforms' );
		this.addUniform( uniforms, [ 'LIGHT' ], 'lightUniforms' );
		this.addUniform( uniforms, [ 'CLOUD' ], 'cloudUniforms' );
		this.addUniform( uniforms, [ 'CLOUD2' ], 'cloud2Uniforms' );
		this.addUniform( uniforms, [ 'CLOUDS' ], 'cloudsUniforms' );
		this.addUniform( uniforms, [ 'MANDARA' ], 'mandaraUniforms' );
		this.addUniform( uniforms, [ 'TOON' ], 'toonUniforms' );
		this.addUniform( uniforms, [ 'CHECKER' ], 'checkerUniforms' );
		this.addUniform( uniforms, [ 'FLAMELANCE' ], 'flamelanceUniforms' );
		this.addUniform( uniforms, [ 'BONFIRE' ], 'bonfireUniforms' );
		this.addUniform( uniforms, [ 'SNOW' ], 'snowUniforms' );
		this.addUniform( uniforms, [ 'DIAMONDGEAR' ], 'diamondGearUniforms' );
		this.addUniform( uniforms, [ 'BRUSHSTROKE' ], 'brushStrokeUniforms' );
		this.addUniform( uniforms, [ 'SPECKLE' ], 'speckleUniforms' );
		this.addUniform( uniforms, [ 'BUBBLES' ], 'bubblesUniforms' );
		this.addUniform( uniforms, [ 'PENTAGON' ], 'pentagonUniforms' );
		this.addUniform( uniforms, [ 'GRUNGE' ], 'grungeUniforms' );
		this.addUniform( uniforms, [ 'ENERGY' ], 'energyUniforms' );
		this.addUniform( uniforms, [ 'INKSPLAT' ], 'inksplatUniforms' );
		this.addUniform( uniforms, [ 'PARTICLE' ], 'particleUniforms' );
		this.addUniform( uniforms, [ 'ELECTRIC' ], 'electricUniforms' );
		this.addUniform( uniforms, [ 'TILING' ], 'tilingUniforms' );
		this.addUniform( uniforms, [ 'CAUSTICS' ], 'causticsUniforms' );
		this.addUniform( uniforms, [ 'SQUIGGLES' ], 'squigglesUniforms' );
		this.addUniform( uniforms, [ 'WATERTURBULENCE' ], 'waterTurbulenceUniforms' );
		this.addUniform( uniforms, [ 'TRABECULUM' ], 'trabeculumUniforms' );
		this.addUniform( uniforms, [ 'TEST' ], 'testUniforms' );

		return THREE.UniformsUtils.clone( THREE.UniformsUtils.merge( uniforms ) );

	}

	addCode( codes, keys, chunk ) {

		if ( this.check( keys ) ) {

			codes.push( '//[ ' + chunk + ' ]' );
			codes.push( ShaderChunk[ chunk ] );
			codes.push( '// ' + chunk );
			// codes.push( '' );

		}

	}

	generateVertexShader() {

		const codes = [];

		// this.addCode(codes, [], "common");
		this.addCode( codes, [ 'GLSL3' ], 'glsl3Vert' );
		this.addCode( codes, [ 'DISPLACEMENT' ], 'displacementVert' );
		this.addCode( codes, [ '-DISPLACEMENT' ], 'vert' );
		return codes.join( '\n' );

	}

	generateFragmentShader() {

		//! FRAGMENT PARAMETERS

		const codes = [];
		this.addCode( codes, [ 'GLSL3' ], 'glsl3Frag' );
		this.addCode( codes, [], 'common' );
		this.addCode( codes, [], 'color' );
		this.addCode( codes, [], 'gradient' );
		this.addCode( codes, [], 'noise' );
		this.addCode( codes, [], 'raymarch' );
		this.addCode( codes, [], 'fragPars' );
		this.addCode( codes, [ 'DISPLACEMENT' ], 'displacementFragPars' );
		this.addCode( codes, [ 'WOOD' ], 'woodFragPars' );
		this.addCode( codes, [ 'CIRCLE' ], 'circleFragPars' );
		this.addCode( codes, [ 'SOLAR' ], 'solarFragPars' );
		this.addCode( codes, [ 'SPARK' ], 'sparkFragPars' );
		this.addCode( codes, [ 'RING' ], 'ringFragPars' );
		this.addCode( codes, [ 'GRADATION' ], 'gradationFragPars' );
		this.addCode( codes, [ 'GRADATIONLINE' ], 'gradationLineFragPars' );
		this.addCode( codes, [ 'FLASH' ], 'flashFragPars' );
		this.addCode( codes, [ 'CONE' ], 'coneFragPars' );
		this.addCode( codes, [ 'FLOWER' ], 'flowerFragPars' );
		this.addCode( codes, [ 'FLOWERFUN' ], 'flowerFunFragPars' );
		this.addCode( codes, [ 'WAVERING' ], 'waveRingFragPars' );
		this.addCode( codes, [ 'COHERENTNOISE' ], 'coherentNoiseFragPars' );
		this.addCode( codes, [ 'BOOLEANNOISE' ], 'booleanNoiseFragPars' );
		this.addCode( codes, [ 'CELLNOISE' ], 'cellNoiseFragPars' );
		this.addCode( codes, [ 'FBMNOISE' ], 'fbmNoiseFragPars' );
		this.addCode( codes, [ 'FBMNOISE2' ], 'fbmNoise2FragPars' );
		this.addCode( codes, [ 'FBMNOISE3' ], 'fbmNoise3FragPars' );
		this.addCode( codes, [ 'VORONOINOISE' ], 'voronoiNoiseFragPars' );
		this.addCode( codes, [ 'TURBULENTNOISE' ], 'turbulentNoiseFragPars' );
		this.addCode( codes, [ 'SPARKNOISE' ], 'sparkNoiseFragPars' );
		this.addCode( codes, [ 'RANDOMNOISE' ], 'randomNoiseFragPars' );
		this.addCode( codes, [ 'SEEMLESSNOISE' ], 'seemlessNoiseFragPars' );
		this.addCode( codes, [ 'TESSNOISE' ], 'tessNoiseFragPars' );
		this.addCode( codes, [ 'GRADIENTNOISE' ], 'gradientNoiseFragPars' );
		this.addCode( codes, [ '+HEIGHT2NORMAL', '+HEIGHT2NORMALSOBEL' ], 'height2NormalFragPars' );
		this.addCode( codes, [ 'COLORBALANCE' ], 'colorBalanceFragPars' );
		this.addCode( codes, [ 'POLARCONVERSION' ], 'polarConversionFragPars' );
		this.addCode( codes, [ 'SMOKE' ], 'smokeFragPars' );
		this.addCode( codes, [ 'FLAME' ], 'flameFragPars' );
		this.addCode( codes, [ 'FLAMEEYE' ], 'flameEyeFragPars' );
		this.addCode( codes, [ 'FIRE' ], 'fireFragPars' );
		this.addCode( codes, [ 'CELL' ], 'cellFragPars' );
		this.addCode( codes, [ 'LIGHTNING' ], 'lightningFragPars' );
		this.addCode( codes, [ 'FLARE' ], 'flareFragPars' );
		this.addCode( codes, [ 'FLARE2' ], 'flare2FragPars' );
		this.addCode( codes, [ 'FLARE3' ], 'flare3FragPars' );
		this.addCode( codes, [ 'MAGICCIRCLE' ], 'magicCircleFragPars' );
		this.addCode( codes, [ 'CROSS' ], 'crossFragPars' );
		this.addCode( codes, [ 'EXPLOSION' ], 'explosionFragPars' );
		this.addCode( codes, [ 'EXPLOSION2' ], 'explosion2FragPars' );
		this.addCode( codes, [ 'CORONA' ], 'coronaFragPars' );
		this.addCode( codes, [ 'LENSFLARE' ], 'lensFlareFragPars' );
		this.addCode( codes, [ 'SUN' ], 'sunFragPars' );
		this.addCode( codes, [ 'LASER' ], 'laserFragPars' );
		this.addCode( codes, [ 'LASER2' ], 'laser2FragPars' );
		this.addCode( codes, [ 'LIGHT' ], 'lightFragPars' );
		this.addCode( codes, [ 'CLOUD' ], 'cloudFragPars' );
		this.addCode( codes, [ 'CLOUD2' ], 'cloud2FragPars' );
		this.addCode( codes, [ 'CLOUDS' ], 'cloudsFragPars' );
		this.addCode( codes, [ 'MANDARA' ], 'mandaraFragPars' );
		this.addCode( codes, [ 'TOON' ], 'toonFragPars' );
		this.addCode( codes, [ 'CHECKER' ], 'checkerFragPars' );
		this.addCode( codes, [ 'MARBLENOISE' ], 'marbleNoiseFragPars' );
		this.addCode( codes, [ 'FLAMELANCE' ], 'flamelanceFragPars' );
		this.addCode( codes, [ 'BONFIRE' ], 'bonfireFragPars' );
		this.addCode( codes, [ 'SNOW' ], 'snowFragPars' );
		this.addCode( codes, [ 'DIAMONDGEAR' ], 'diamondGearFragPars' );
		this.addCode( codes, [ 'BRUSHSTROKE' ], 'brushStrokeFragPars' );
		this.addCode( codes, [ 'SPECKLE' ], 'speckleFragPars' );
		this.addCode( codes, [ 'BUBBLES' ], 'bubblesFragPars' );
		this.addCode( codes, [ 'PENTAGON' ], 'pentagonFragPars' );
		this.addCode( codes, [ 'GRUNGE' ], 'grungeFragPars' );
		this.addCode( codes, [ 'ENERGY' ], 'energyFragPars' );
		this.addCode( codes, [ 'INKSPLAT' ], 'inksplatFragPars' );
		this.addCode( codes, [ 'PARTICLE' ], 'particleFragPars' );
		this.addCode( codes, [ 'ELECTRIC' ], 'electricFragPars' );
		this.addCode( codes, [ 'TILING' ], 'tilingFragPars' );
		this.addCode( codes, [ 'CAUSTICS' ], 'causticsFragPars' );
		this.addCode( codes, [ 'SQUIGGLES' ], 'squigglesFragPars' );
		this.addCode( codes, [ 'WATERTURBULENCE' ], 'waterTurbulenceFragPars' );
		this.addCode( codes, [ 'TRABECULUM' ], 'trabeculumFragPars' );
		this.addCode( codes, [ 'TEST' ], 'testFragPars' );

		codes.push( '' );
		codes.push( 'void main() {' );

		this.addCode( codes, [], 'frag' );
		this.addCode( codes, [ 'DISPLACEMENT' ], 'displacementFrag' );

		//! FRAGMENT

		// this.addCode(codes, [], "");
		this.addCode( codes, [ 'WOOD' ], 'woodFrag' );
		this.addCode( codes, [ 'CIRCLE' ], 'circleFrag' );
		this.addCode( codes, [ 'SOLAR' ], 'solarFrag' );
		this.addCode( codes, [ 'SPARK' ], 'sparkFrag' );
		this.addCode( codes, [ 'RING' ], 'ringFrag' );
		this.addCode( codes, [ 'GRADATION' ], 'gradationFrag' );
		this.addCode( codes, [ 'GRADATIONLINE' ], 'gradationLineFrag' );
		this.addCode( codes, [ 'FLASH' ], 'flashFrag' );
		this.addCode( codes, [ 'CONE' ], 'coneFrag' );
		this.addCode( codes, [ 'FLOWER' ], 'flowerFrag' );
		this.addCode( codes, [ 'FLOWERFUN' ], 'flowerFunFrag' );
		this.addCode( codes, [ 'WAVERING' ], 'waveRingFrag' );
		this.addCode( codes, [ 'COHERENTNOISE' ], 'coherentNoiseFrag' );
		this.addCode( codes, [ 'PERLINNOISE' ], 'perlinNoiseFrag' );
		this.addCode( codes, [ 'BOOLEANNOISE' ], 'booleanNoiseFrag' );
		this.addCode( codes, [ 'CELLNOISE' ], 'cellNoiseFrag' );
		this.addCode( codes, [ 'FBMNOISE' ], 'fbmNoiseFrag' );
		this.addCode( codes, [ 'FBMNOISE2' ], 'fbmNoise2Frag' );
		this.addCode( codes, [ 'FBMNOISE3' ], 'fbmNoise3Frag' );
		this.addCode( codes, [ 'VORONOINOISE' ], 'voronoiNoiseFrag' );
		this.addCode( codes, [ 'TURBULENTNOISE' ], 'turbulentNoiseFrag' );
		this.addCode( codes, [ 'SPARKNOISE' ], 'sparkNoiseFrag' );
		this.addCode( codes, [ 'RANDOMNOISE' ], 'randomNoiseFrag' );
		this.addCode( codes, [ 'MANDELBLOT' ], 'mandelblotFrag' );
		this.addCode( codes, [ 'JULIA' ], 'juliaFrag' );
		this.addCode( codes, [ 'SEEMLESSNOISE' ], 'seemlessNoiseFrag' );
		this.addCode( codes, [ 'MARBLENOISE' ], 'marbleNoiseFrag' );
		this.addCode( codes, [ 'TESSNOISE' ], 'tessNoiseFrag' );
		this.addCode( codes, [ 'GRADIENTNOISE' ], 'gradientNoiseFrag' );
		this.addCode(
			codes,
			[
				'+COHERENTNOISE',
				'+PERLINNOISE',
				'+BOOLEANNOISE',
				'+CELLNOISE',
				'+FBMNOISE',
				'+FBMNOISE2',
				'+FBMNOISE3',
				'+VORONOINOISE',
				'+TURBULENTNOISE',
				'+SPARKNOISE',
				'+RANDOMNOISE',
				'+SEEMLESSNOISE',
				'+MARBLENOISE',
				'+TESSNOISE',
				'+GRADIENTNOISE'
			],
			'noiseGraphFrag'
		);
		this.addCode( codes, [ 'HEIGHT2NORMAL' ], 'height2NormalFrag' );
		this.addCode( codes, [ 'HEIGHT2NORMALSOBEL' ], 'height2NormalSobelFrag' );
		this.addCode( codes, [ 'POLARCONVERSION' ], 'polarConversionFrag' );
		this.addCode( codes, [ 'COLORBALANCE' ], 'colorBalanceFrag' );
		this.addCode( codes, [ 'SMOKE' ], 'smokeFrag' );
		this.addCode( codes, [ 'FLAME' ], 'flameFrag' );
		this.addCode( codes, [ 'FLAMEEYE' ], 'flameEyeFrag' );
		this.addCode( codes, [ 'FIRE' ], 'fireFrag' );
		this.addCode( codes, [ 'CELL' ], 'cellFrag' );
		this.addCode( codes, [ 'LIGHTNING' ], 'lightningFrag' );
		this.addCode( codes, [ 'FLARE' ], 'flareFrag' );
		this.addCode( codes, [ 'FLARE2' ], 'flare2Frag' );
		this.addCode( codes, [ 'FLARE3' ], 'flare3Frag' );
		this.addCode( codes, [ 'MAGICCIRCLE' ], 'magicCircleFrag' );
		this.addCode( codes, [ 'CROSS' ], 'crossFrag' );
		this.addCode( codes, [ 'EXPLOSION' ], 'explosionFrag' );
		this.addCode( codes, [ 'EXPLOSION2' ], 'explosion2Frag' );
		this.addCode( codes, [ 'CORONA' ], 'coronaFrag' );
		this.addCode( codes, [ 'LENSFLARE' ], 'lensFlareFrag' );
		this.addCode( codes, [ 'SUN' ], 'sunFrag' );
		this.addCode( codes, [ 'LASER' ], 'laserFrag' );
		this.addCode( codes, [ 'LASER2' ], 'laser2Frag' );
		this.addCode( codes, [ 'LIGHT' ], 'lightFrag' );
		this.addCode( codes, [ 'CLOUD' ], 'cloudFrag' );
		this.addCode( codes, [ 'CLOUD2' ], 'cloud2Frag' );
		this.addCode( codes, [ 'CLOUDS' ], 'cloudsFrag' );
		this.addCode( codes, [ 'MANDARA' ], 'mandaraFrag' );
		this.addCode( codes, [ 'COPY' ], 'copyFrag' );
		this.addCode( codes, [ 'CHECKER' ], 'checkerFrag' );
		this.addCode( codes, [ 'FLAMELANCE' ], 'flamelanceFrag' );
		this.addCode( codes, [ 'BONFIRE' ], 'bonfireFrag' );
		this.addCode( codes, [ 'SNOW' ], 'snowFrag' );
		this.addCode( codes, [ 'DIAMONDGEAR' ], 'diamondGearFrag' );
		this.addCode( codes, [ 'BRUSHSTROKE' ], 'brushStrokeFrag' );
		this.addCode( codes, [ 'SPECKLE' ], 'speckleFrag' );
		this.addCode( codes, [ 'BUBBLES' ], 'bubblesFrag' );
		this.addCode( codes, [ 'PENTAGON' ], 'pentagonFrag' );
		this.addCode( codes, [ 'GRUNGE' ], 'grungeFrag' );
		this.addCode( codes, [ 'ENERGY' ], 'energyFrag' );
		this.addCode( codes, [ 'INKSPLAT' ], 'inksplatFrag' );
		this.addCode( codes, [ 'PARTICLE' ], 'particleFrag' );
		this.addCode( codes, [ 'ELECTRIC' ], 'electricFrag' );
		this.addCode( codes, [ 'TILING' ], 'tilingFrag' );
		this.addCode( codes, [ 'CAUSTICS' ], 'causticsFrag' );
		this.addCode( codes, [ 'SQUIGGLES' ], 'squigglesFrag' );
		this.addCode( codes, [ 'WATERTURBULENCE' ], 'waterTurbulenceFrag' );
		this.addCode( codes, [ 'TRABECULUM' ], 'trabeculumFrag' );
		this.addCode( codes, [ 'BINARYMATRIX' ], 'binaryMatrixFrag' );
		this.addCode( codes, [ 'TEST' ], 'testFrag' );

		this.addCode( codes, [ 'TOON' ], 'toonFrag' );

		this.addCode( codes, [], 'fragEnd' );

		codes.push( '}' );
		return codes.join( '\n' );

	}

	createMaterial( uniforms ) {

		const material = new THREE.RawShaderMaterial( {
			uniforms: uniforms,
			vertexShader: this.generateVertexShader(),
			fragmentShader: this.generateFragmentShader(),
		} );

		if ( this.check( [ 'GLSL3' ] ) ) {

			material.glslVersion = THREE.GLSL3;

		}

		if ( this.check( [ 'INKSPLAT' ] ) ) {

			material.extensions.derivatives = true;

		}

		return material;

	}

	createMaterial( uniforms, options ) {

		const material = new THREE.RawShaderMaterial(
			Object.assign(
				{
					uniforms: uniforms,
					vertexShader: this.generateVertexShader(),
					fragmentShader: this.generateFragmentShader(),
				},
				options
			)
		);

		if ( this.check( [ 'GLSL3' ] ) ) {

			material.glslVersion = THREE.GLSL3;

		}

		if ( this.check( [ 'INKSPLAT' ] ) ) {

			material.extensions.derivatives = true;

		}

		return material;

	}

	createStandardMaterial( uniforms ) {

		const material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: this.generateVertexShader(),
			fragmentShader: this.generateFragmentShader(),
		} );

		return material;

	}

}

export { FxgenShader };
