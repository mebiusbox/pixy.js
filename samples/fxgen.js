import * as THREE from 'three';
import * as PIXY from 'pixy';
import WebGL from 'three/addons/capabilities/WebGL.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

if ( WebGL.isWebGLAvailable() === false ) {

	document.body.appendChild( WebGL.getWebGLErrorMessage() );

}

const app = {
	mouse: new THREE.Vector2( 0.5, 0.5 ),
	canvas: undefined,
	camera: undefined,
	dummyCamera: undefined,
	constrols: undefined,
	scene: undefined,
	renderer: undefined,
	noise: {
		scene: undefined,
		sphere: undefined,
		uniforms: undefined,
		material: undefined,
		texture: undefined
	},
	grungeTexture: undefined,
	gui: {
		root: undefined,
		tiling: undefined,
		tone: undefined,
		normalMap: undefined,
		cb: undefined,
		pars: undefined,
		parsItems: undefined
	},
	stats: undefined,
	clock: new THREE.Clock(),
	effectController: undefined,
	layers: [],
	spriteSheet: {},
	alphaOptions: {},
	shaderDefines: undefined,

	init() {

		this.initGraphics();
		this.initScene();
		this.setupGui();
		this.initLayers();

		console.log( "[fxgen] initialized" );

	},

	initGraphics() {

		console.log( "[fxgen] initializing graphics..." );

		// RENDERER

		this.renderer = new THREE.WebGLRenderer();
		// this.renderer = new THREE.WebGLRenderer({antialias: true});
		// this.renderer.setClearColor(0xAAAAAA);
		// this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize( 512, 512 );
		// this.renderer.setSize(window.innerWidth, window.innerHeight);
		// this.renderer.gammaInput = true;
		// this.renderer.gammaOutput = true;
		// this.renderer.autoClear = false;
		// container.appendChild(this.renderer.domElement);
		// this.renderer.context.getExtension( 'OES_standard_derivatives' );
		if ( this.renderer.capabilities.isWebGL2 ) {

			console.log( "WebGL2" );

		}

		let context = this;
		this.canvas = this.renderer.domElement;
		this.canvas.addEventListener( 'mousemove', ( e ) => {

			context.mouse.x = e.offsetX / context.canvas.width;
			context.mouse.y = e.offsetY / context.canvas.height;

		} );
		document.body.appendChild( this.canvas );

		// for alpha
		this.alphaCanvas = document.createElement( 'canvas' );
		this.alphaCanvas.style.display = "none";
		document.body.appendChild( this.alphaCanvas );

		// for save as png
		this.saveCanvas = document.createElement( 'canvas' );

		// for blur
		this.blur50 = document.createElement( 'canvas' );
		this.blur25 = document.createElement( 'canvas' );

		// STATS

		this.stats = new Stats();
		document.body.appendChild( this.stats.dom );

	},

	initScene() {

		console.log( "[fxgen] initializing scene..." );

		// scene itself
		this.scene = new THREE.Scene();
		this.noise.scene = new THREE.Scene();

		// CAMERA

		this.camera = new THREE.PerspectiveCamera( 45.0, 1.0, 1.0, 1000.0 );
		this.camera.position.set( 0.0, 0.0, 3.8 );
		// this.camera.lookAt(new THREE.Vector3(0.0, -0.3, 1.0));
		this.dummyCamera = new THREE.Camera();

		// CONTROLS

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.target.set( 0, 0, 0 );
		this.controls.addEventListener( 'change', this.render.bind( this ) );

		// TEXTUERS

		// MATERIALS

		// MODELS

		let geo, mesh, stdShader;

		geo = new THREE.PlaneGeometry( 2, 2 );
		mesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial() );
		this.scene.add( mesh );

		// TEXTUER MAP
		// Noise Texture (for CLOUDS)
		// noiseTexture = new THREE.TextureLoader().load('assets/textures/shadertoy/tex16.png');
		// noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;
		// noiseTexture.minFilter = THREE.LinearFilter;
		// noiseTexture.magFilter = THREE.LinearFilter;
		// noiseTexture.anisotropy = 16;

		// Grunge Texture
		this.grungeTexture = new THREE.TextureLoader().load( 'images/grunge.png' );
		this.grungeTexture.wrapS = this.grungeTexture.wrapT = THREE.RepeatWrapping;
		this.grungeTexture.minFilter = THREE.LinearFilter;
		this.grungeTexture.magFilter = THREE.LinearFilter;
		this.grungeTexture.anisotropy = 16;

		geo = new THREE.SphereGeometry( 1, 1024, 1024 );

		stdShader = new PIXY.FxgenShader();
		stdShader.enable( 'DISPLACEMENT' );
		stdShader.enable( 'GLSL3' );
		this.noise.uniforms = stdShader.generateUniforms();
		this.noise.material = stdShader.createStandardMaterial( this.noise.uniforms );
		this.noise.sphere = new THREE.Mesh( geo, this.noise.material );
		this.noise.scene.add( this.noise.sphere );
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());

		// LAYERS

		// noise = {};
		// noise.octave = 8;
		// noise.persistence = 0.5;

		stdShader = new PIXY.FxgenShader();
		this.shaderDefines = stdShader.generateDefines();
		this.spriteSheet.uniforms = THREE.UniformsUtils.clone( CopyShader.uniforms );
		this.spriteSheet.material = new THREE.ShaderMaterial( {
			uniforms: this.spriteSheet.uniforms,
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			depthTest: false,
			depthWrite: false,
		} );
		// spriteSheet.uniforms.tDiffuse.value = spriteSheet.renderTarget.texture;
		this.spriteSheet.uniforms.opacity.value = 1.0;

		this.spriteSheet.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		this.spriteSheet.scene = new THREE.Scene();
		this.spriteSheet.quad = new THREE.Mesh(
			new THREE.PlaneGeometry( 2, 2 ),
			this.spriteSheet.material
		);
		this.spriteSheet.dimension = 8;
		this.spriteSheet.time = 0.0;
		this.spriteSheet.timeLength = 3.0;
		this.spriteSheet.timeStep = 0.1;
		this.spriteSheet.scene.add( this.spriteSheet.quad );

	},

	initLayers() {

		console.log( "[fxgen] initializing layers..." );

		this.layers = [];
		let layer = {};

		layer.name = 'Base';
		// layer.renderTarget = null;
		layer.renderTarget = new THREE.WebGLRenderTarget(
			this.canvas.width,
			this.canvas.height,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				// format: THREE.RGBFormat,
				stencilBuffer: false,
			}
		);

		let stdShader = new PIXY.FxgenShader();
		let type = this.effectController.type;
		stdShader.enable( type.toUpperCase() );
		stdShader.enable( 'TOON' );
		stdShader.enable( 'GLSL3' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());
		// console.log(layer.material.fragmentShader);

		this.resetParameters( layer.uniforms );
		this.layers.push( layer );

		//// POLAR CONVERSION

		layer = {};
		layer.name = 'PolarConversion';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.renderTarget = new THREE.WebGLRenderTarget(
			this.canvas.width,
			this.canvas.height,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				// format: THREE.RGBFormat,
				stencilBuffer: false,
			}
		);

		stdShader.clear();
		stdShader.enable( 'POLARCONVERSION' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		this.layers.push( layer );

		//// COLOR BALANCE

		layer = {};
		layer.name = 'ColorBalance';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.renderTarget = new THREE.WebGLRenderTarget(
			this.canvas.width,
			this.canvas.height,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				// format: THREE.RGBFormat,
				stencilBuffer: false,
			}
		);

		stdShader.clear();
		stdShader.enable( 'COLORBALANCE' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());
		this.layers.push( layer );

		//// TILING

		layer = {};
		layer.name = 'Tiling';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.tDiffuse.wrapS = layer.tDiffuse.wrapT = THREE.RepeatWrapping;
		layer.renderTarget = new THREE.WebGLRenderTarget(
			this.canvas.width,
			this.canvas.height,
			{
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				// format: THREE.RGBFormat,
				stencilBuffer: false,
			}
		);

		stdShader.clear();
		stdShader.enable( 'TILING' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());
		this.layers.push( layer );

		//// NORMAL MAP

		layer = {};
		layer.name = 'NormalMap';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.renderTarget = new THREE.WebGLRenderTarget(
			this.canvas.width,
			this.canvas.height,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				// format: THREE.RGBFormat,
				stencilBuffer: false,
			}
		);

		stdShader.clear();
		// stdShader.enable("HEIGHT2NORMAL");
		stdShader.enable( 'HEIGHT2NORMALSOBEL' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		this.layers.push( layer );

		//// COPY

		layer = {};
		layer.name = 'Copy';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.renderTarget = null;

		stdShader.clear();
		stdShader.enable( 'COPY' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		this.layers.push( layer );

		this.spriteSheet.renderTarget = new THREE.WebGLRenderTarget(
			this.canvas.width,
			this.canvas.height,
			{
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				// format: THREE.RGBFormat,
				stencilBuffer: false,
			}
		);

	},

	setupGui() {

		console.log( "[fxgen] setup GUI..." );

		const context = this;
		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.addEventListener( 'change', function ( _event ) {

			let reader = new FileReader();
			reader.addEventListener(
				'load',
				function ( event ) {

					let contents = event.target.result;
					let json = JSON.parse( contents );

					context.canvas.width = json.resolution;
					context.canvas.height = json.resolution;
					onWindowResize();

					let stdShader = new PIXY.FxgenShader();
					stdShader.enable( json.type.toUpperCase() );
					stdShader.enable( 'TOON' );
					stdShader.enable( 'GLSL3' );
					context.layers[ 0 ].uniforms = stdShader.generateUniforms();
					context.layers[ 0 ].material = stdShader.createMaterial(
						context.layers[ 0 ].uniforms,
						{ defines: stdShader.generateDefines() }
					);

					context.effectController.type = json.type;
					context.resetParameters( context.layers[ 0 ].uniforms );

					for ( var i in json ) {

						context.effectController[ i ] = json[ i ];

					}

					for ( var i in context.gui.root.controllers ) {

						context.gui.root.controllers[ i ].updateDisplay();

					}

					for ( var i in context.gui.pars.controllers ) {

						context.gui.pars.controllers[ i ].updateDisplay();

					}

					for ( var i in context.gui.tone.controllers ) {

						context.gui.tone.controllers[ i ].updateDisplay();

					}

					for ( var i in context.gui.tiling.controllers ) {

						context.gui.tiling.controllers[ i ].updateDisplay();

					}

					for ( var i in context.gui.normalMap.controllers ) {

						context.gui.normalMap.controllers[ i ].updateDisplay();

					}

					for ( var i in context.gui.cb.controllers ) {

						context.gui.cb.controllers[ i ].updateDisplay();

					}

				},
				false
			);
			reader.readAsText( fileInput.files[ 0 ] );

		} );

		fileInput.addEventListener( 'click', function ( _event ) {

			this.value = null;

		} );

		this.effectController = {
			saveImage() {

				context.render();
				// window.open( context.canvas.toDataURL() );
				let dataUrl = context.canvas.toDataURL();
				let w = window.open( 'about:blank' );
				w.document.write( "<img src='" + dataUrl + "'/>" );

			},

			savePng() {

				context.render();
				context.updateSaveBuffer();
				context.saveCanvas.toBlob( async function ( result ) {

					const options = {
						types: [
							{
								description: 'Images',
								accept: {
									'image/png': [ '.png' ],
								}
							}
						],
						suggestedName: 'image.png',
					};
					const imgFileHandle = await window.showSaveFilePicker( options );
					const writable = await imgFileHandle.createWritable();
					await writable.write( result );
					await writable.close();

				} );

			},

			downloadPng() {

				const dl = document.createElement("a");

				context.render();
				context.updateSaveBuffer();
				context.saveCanvas.toBlob((blob) => {
					dl.href = window.URL.createObjectURL(blob);
					dl.download = "image.png";
					dl.click();
				});
			},

			saveSpriteSheet() {

				let width = Math.floor( context.canvas.width / context.spriteSheet.dimension );
				let size = width / context.canvas.width;
				let time = context.spriteSheet.time;
				// var time = 0.0;

				context.renderer.setRenderTarget( context.spriteSheet.renderTarget );
				context.renderer.clear();
				context.renderer.setRenderTarget( null );

				for ( let i = 0; i < context.spriteSheet.dimension; i++ ) {

					for ( let j = 0; j < context.spriteSheet.dimension; j++ ) {

						let len =
						context.spriteSheet.timeStep * context.spriteSheet.dimension * i +
						context.spriteSheet.timeStep * j;
						if ( len >= context.spriteSheet.timeLength ) {

							break;

						}

						context.effectController.time = time + len;
						context.render();

						context.spriteSheet.uniforms.tDiffuse.value =
						context.layers[ context.layers.length - 2 ].renderTarget.texture;

						context.spriteSheet.quad.scale.set( size, size, 1.0 );
						context.spriteSheet.quad.position.set(
							-1 + 2.0 * size * j + size,
							1 - 2.0 * size * i - size,
							0.0
						);

						context.renderer.autoClear = false;
						context.renderer.setRenderTarget( context.spriteSheet.renderTarget );
						context.renderer.render( context.spriteSheet.scene, context.spriteSheet.camera );
						context.renderer.setRenderTarget( null );
						context.renderer.autoClear = true;

					}

				}

				context.spriteSheet.quad.scale.set( 1.0, 1.0, 1.0 );
				context.spriteSheet.quad.position.set( 0.0, 0.0, 0.0 );
				context.spriteSheet.uniforms.tDiffuse.value =
				context.spriteSheet.renderTarget.texture;
				context.renderer.render( context.spriteSheet.scene, context.spriteSheet.camera );

				context.effectController.time = time;
				// window.open(canvas.toDataURL());
				let dataUrl = context.canvas.toDataURL();
				let w = window.open( 'about:blank' );
				w.document.write( "<img src='" + dataUrl + "'/>" );

			},

			resetColorBalance() {

				context.effectController.cColorBalanceShadowsR = 0.0;
				context.effectController.cColorBalanceShadowsG = 0.0;
				context.effectController.cColorBalanceShadowsB = 0.0;
				context.effectController.cColorBalanceMidtonesR = 0.0;
				context.effectController.cColorBalanceMidtonesG = 0.0;
				context.effectController.cColorBalanceMidtonesB = 0.0;
				context.effectController.cColorBalanceHighlightsR = 0.0;
				context.effectController.cColorBalanceHighlightsG = 0.0;
				context.effectController.cColorBalanceHighlightsB = 0.0;
				for ( let i in context.gui.cb.controllers ) {

					context.gui.cb.controllers[ i ].updateDisplay();

				}

			},

			load() {

				fileInput.click();

			},

			save() {

				let output;
				try {

					output = JSON.stringify( context.effectController, null, '\t' );
					output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );

				} catch ( e ) {

					output = JSON.stringify( context.effectController );

				}

				saveString( output, 'EffectTextureMaker_Untitled.json' );

			},

			animate: false,
			time: 0.0,

			// freeCamera: false,
			resolution: '512',
			polarConversion: false,

			cHeightScale: 2.0,
			normalMap: false,
			tiling: false,
			cRadialMask: 1.0,

			//MARK: parameters
			cFrequency: 30.0,
			cAmplitude: 0.01,
			cIntensity: 0.5,
			cDirectionX: 0.0,
			cDirectionY: 1.0,
			cPowerExponent: 1.0,
			cRadius: 1.0,
			cInnerRadius: 1.0,
			cInnerRadius2: 1.0,
			cSize: 1.0,
			cWidth: 1.0,
			cHeight: 1.0,
			cDepth: 1.0,
			cColor: 1.0,
			cRadius: 0.5,
			cPetals: 6.0,
			cOffset: 0.2,
			cVolume: 3.0,
			cBeta: 4.0,
			cDelta: 0.05,
			cScale: 1.0,
			cInnerWidth: 0.4,
			cStrength: 1.0,
			cPower: 1.0,
			cRange: 2.0,
			cEmission: 1.0,
			cBloom: 1.0,
			cLightX: 1.0,
			cLightY: 1.0,
			cLightZ: 1.0,
			cAmbient: 1.0,
			cSmoothness: 1.0,
			cSmoothnessPower: 1.0,
			cThickness: 1.0,
			cThicknessPower: 1.0,
			cCameraTilt: 0.0,
			cCameraPan: 0.0,
			cSpeed: 1.0,
			cAngle: 0.0,
			cDensity: 1.0,
			cAlpha: 1.0,

			cDiamondGearTeeth: 18.0,
			cDiamondGearMid: 0.8,

			cBrushStrokeX1: -0.4,
			cBrushStrokeY1: 0.0,
			cBrushStrokeX2: 1.1,
			cBrushStrokeY2: 0.8,

			cBubblesVariation: 1.0,

			cFlameEyeInnerFade: 1.0,
			cFlameEyeOuterFade: 1.0,
			cFlameEyeBorder: 1.0,

			cSplatLines: 20,
			cSplatSpotStep: 0.04,

			cTrabeculumVariation: 2.0,

			cLifeTime: 0.9,
			cGravity: 0.26,
			cCount: 300,

			// circleRadius: 1.1,
			// ringRadius: 0.5,
			// ringWidth: 0.1,
			// flowerPetals: 6.0,
			// flowerRadius: 0.5,
			// flowerOffset: 0.2,
			// gradationOffset: 0.0001,
			// smokeVolume: 3.0,
			// smokeBeta: 4.0,
			// smokeDelta: 0.05,
			// flameWidth: 1.0,
			// flameScale: 1.0,
			// cellSize: 1.0,
			// lightningFrequency: 1.0,
			// lightningWidth: 7.0,
			// coronaRadius: 0.3,
			// coronaSize: 1.0,
			//
			// lensFlareRadius: 1.0,
			// lensFlareLength: 1.0,
			// lensFlareColor: 0.0,
			//
			// sunRadius: 1.0,
			// sunColor: 0.0,
			//
			// laserWidth: 0.5,
			// laserInnerWidth: 0.4,
			// laserColor: 1.0,

			cToonEnable: false,
			cToonDark: 0.8,
			cToonLight: 0.95,

			// fireStrength: 1.0,
			// firePower: 1.0,
			// fireRange: 2.0,
			// fireWidth: 0.1,
			// fireColor: 0.0001,

			cExplosionRadius: 1.75,
			cExplosionDownScale: 1.25,
			cExplosionGrain: 2.0,
			cExplosionSpeed: 0.3,
			cExplosionBallness: 2.0,
			cExplosionGrowth: 2.2,
			cExplosionFade: 1.6,
			cExplosionDensity: 1.35,
			cExplosionContrast: 1.0,
			cExplosionRollingInitDamp: 0.3,
			cExplosionRollingSpeed: 2.0,
			cExplosionDelayRange: 0.25,
			cExplosionBallSpread: 1.0,
			cExplosionBloom: 0.0,
			cExplosionEmission: 0.2,
			cExplosionColor: 1.0,

			cNoiseOctave: 8,
			cNoiseFrequency: 1.0,
			cNoiseAmplitude: 0.65,
			cNoisePersistence: 0.5,
			cNoiseScale: 1.0,
			cNoiseSphereEnable: false,
			cNoiseGraphEnable: false,
			cNoiseStrength: 1.0,
			cNoiseDepth: 3,
			cNoiseSize: 8.0,

			cColorBalanceShadowsR: 0.0,
			cColorBalanceShadowsG: 0.0,
			cColorBalanceShadowsB: 0.0,
			cColorBalanceMidtonesR: 0.0,
			cColorBalanceMidtonesG: 0.0,
			cColorBalanceMidtonesB: 0.0,
			cColorBalanceHighlightsR: 0.0,
			cColorBalanceHighlightsG: 0.0,
			cColorBalanceHighlightsB: 0.0,

			type: 'Wood',
			// type: "Test",
		};

		let h;
		this.gui.root = new GUI();
		this.gui.root.add( this.effectController, 'load' );
		this.gui.root.add( this.effectController, 'save' );

		// material (attributes)

		h = this.gui.root;

		// Parameters

		// h.add(this.effectController, 'freeCamera');
		h.add( this.effectController, 'resolution', [
			'8',
			'16',
			'32',
			'64',
			'128',
			'256',
			'512',
			'1024',
			'2048',
		] ).onChange( function ( value ) {

			context.canvas.width = value;
			context.canvas.height = value;
			onWindowResize();

		} );

		//MARK: type
		h.add( this.effectController, 'type', [
			'Wood',
			'Circle',
			'Solar',
			'Corona',
			'Spark',
			'Ring',
			'Gradation',
			'GradationLine',
			'Flash',
			'Cone',
			'Flower',
			'FlowerFun',
			'WaveRing',
			'Smoke',
			'Flame',
			'FlameEye',
			'Fire',
			'Cell',
			'Lightning',
			'Flare',
			'Flare2',
			'Flare3',
			'LensFlare',
			'Sun',
			'MagicCircle',
			'Mandara',
			'Explosion',
			'Explosion2',
			'Cross',
			'Laser',
			'Laser2',
			'Light',
			'Cloud',
			'Cloud2',
			'PerlinNoise',
			'SeemlessNoise',
			'BooleanNoise',
			'CellNoise',
			'TurbulentNoise',
			'FbmNoise',
			'FbmNoise2',
			'FbmNoise3',
			'RandomNoise',
			'VoronoiNoise',
			'SparkNoise',
			'MarbleNoise',
			'TessNoise',
			'GradientNoise',
			'Checker',
			'FlameLance',
			'Bonfire',
			'Snow',
			'DiamondGear',
			'BrushStroke',
			'Speckle',
			'Bubbles',
			'Pentagon',
			'Grunge',
			'Energy',
			'InkSplat',
			'Particle',
			'Electric',
			'Caustics',
			'Squiggles',
			'WaterTurbulence',
			'Trabeculum',
		] ).onChange( function ( value ) {

			const stdShader = new PIXY.FxgenShader();
			stdShader.enable( value.toUpperCase() );
			stdShader.enable( 'TOON' );
			stdShader.enable( 'GLSL3' );
			context.layers[ 0 ].uniforms = stdShader.generateUniforms();
			context.layers[ 0 ].material = stdShader.createMaterial( context.layers[ 0 ].uniforms );
			context.layers[ 0 ].material.defines = stdShader.generateDefines();
			// console.log( context.layers[ 0 ].material.extensions );
			// console.log( context.layers[ 0 ].material.glslVersion );
			// console.log( context.layers[ 0 ].material.vertexShader );
			// console.log( context.layers[ 0 ].material.fragmentShader );

			context.resetParameters( context.layers[ 0 ].uniforms );

		} );

		this.gui.root.add( this.effectController, 'time', 0, 100.0 );
		this.gui.root.add( this.effectController, 'animate' );

		this.gui.pars = this.gui.root.addFolder( 'Parameters' );
		this.gui.parsItems = [];
		// this.resetParameters();

		this.gui.root.add( this.effectController, 'polarConversion' );

		h = this.gui.root.addFolder( 'Toon' );
		h.add( this.effectController, 'cToonEnable' ).name( 'enable' );
		h.add( this.effectController, 'cToonDark', 0.0, 1.0 ).name( 'dark' );
		h.add( this.effectController, 'cToonLight', 0.0, 1.0 ).name( 'light' );
		h.open( false );
		this.gui.tone = h;

		h = this.gui.root.addFolder( 'Tiling' );
		h.add( this.effectController, 'tiling' ).name( 'enable' );
		h.add( this.effectController, 'cRadialMask', 0.0, 1.0 ).name( 'radial mask' );
		h.open( false );
		this.gui.tiling = h;

		h = this.gui.root.addFolder( 'NormalMap' );
		h.add( this.effectController, 'normalMap' ).name( 'Generate' );
		h.add( this.effectController, 'cHeightScale', 0.0, 10.0 );
		h.open( false );
		this.gui.normalMap = h;

		h = this.gui.root.addFolder( 'ColorBalance' );
		h.add( this.effectController, 'cColorBalanceShadowsR', -1.0, 1.0, 0.025 ).name(
			'Shadows-R'
		);
		h.add( this.effectController, 'cColorBalanceShadowsG', -1.0, 1.0, 0.025 ).name(
			'Shadows-G'
		);
		h.add( this.effectController, 'cColorBalanceShadowsB', -1.0, 1.0, 0.025 ).name(
			'Shadows-B'
		);
		h.add(
			this.effectController,
			'cColorBalanceMidtonesR',
			-1.0,
			1.0,
			0.025
		).name( 'Midtones-R' );
		h.add(
			this.effectController,
			'cColorBalanceMidtonesG',
			-1.0,
			1.0,
			0.025
		).name( 'Midtones-G' );
		h.add(
			this.effectController,
			'cColorBalanceMidtonesB',
			-1.0,
			1.0,
			0.025
		).name( 'Midtones-B' );
		h.add(
			this.effectController,
			'cColorBalanceHighlightsR',
			-1.0,
			1.0,
			0.025
		).name( 'Highlights-R' );
		h.add(
			this.effectController,
			'cColorBalanceHighlightsG',
			-1.0,
			1.0,
			0.025
		).name( 'Highlights-G' );
		h.add(
			this.effectController,
			'cColorBalanceHighlightsB',
			-1.0,
			1.0,
			0.025
		).name( 'Highlights-B' );
		h.add( this.effectController, 'resetColorBalance' );
		h.open( false );
		// h.add(this.effectController, "colorBlanacePreserveLuminosity");
		this.gui.cb = h;

		h = this.gui.root.addFolder( 'SpriteSheet' );
		h.add( this.spriteSheet, 'dimension', 2, 32 ).step( 1 );
		h.add( this.spriteSheet, 'time', 0.0, 1000.0 );
		h.add( this.spriteSheet, 'timeLength', 0.1, 1000.0 );
		h.add( this.spriteSheet, 'timeStep', 0.0001, 100.0 );
		h.add( this.effectController, 'saveSpriteSheet' ).name( 'Save (SpriteSheet)' );
		h.open( false );

		this.alphaOptions.threshold = 0.0;
		this.alphaOptions.tolerance = 1.0;
		this.alphaOptions.blur = 0;
		this.alphaOptions.visible = false;
		this.alphaOptions.update = false;
		h = this.gui.root.addFolder( 'Image with alpha (PNG)' );
		h.add( this.alphaOptions, 'threshold', 0.0, 1.0 ).onChange( ( _value ) => {

			context.alphaOptions.update = true;

		} );
		h.add( this.alphaOptions, 'tolerance', 0.0, 1.0 ).onChange( ( _value ) => {

			context.alphaOptions.update = true;

		} );
		h.add( this.alphaOptions, 'blur', 0, 10, 1 ).onChange( ( _value ) => {

			context.alphaOptions.update = true;

		} );
		h.add( this.alphaOptions, 'visible' ).onChange( ( value ) => {

			if ( value ) {

				context.canvas.style.display = 'none';
				context.alphaCanvas.style.display = null;
				context.alphaOptions.update = true;

			} else {

				context.canvas.style.display = null;
				context.alphaCanvas.style.display = 'none';

			}

		} );
		h.add( this.effectController, 'savePng' ).name( 'Save (PNG)' );
		h.add( this.effectController, 'downloadPng' ).name( 'Download (PNG)' );
		h.open( false );

		this.gui.root.add( this.effectController, 'saveImage' ).name( 'Save' );

	},

	resetParameters( uniforms ) {

		for ( let i in this.gui.parsItems ) {

			this.gui.parsItems[ i ].destroy();

		}

		this.gui.parsItems = [];

		for ( let key in uniforms ) {

			if (
				key === 'resolution' ||
				key === 'mouse' ||
				key === 'time' ||
				key === 'cameraPos' ||
				key === 'cameraDir' ||
				key === 'tDiffuse' ||
				key.indexOf( 'toon' ) === 0 ||
				key.indexOf( 'Enable' ) >= 0
			)
				continue;

			const keys = Object.keys( this.effectController );
			for ( let key of keys ) {

				if ( key in uniforms ) {

					this.effectController[ key ] = uniforms[ key ].value;

				}

			}

		}

		//MARK: items
		let items = {
			cFrequency: { minValue: 0.0, maxValue: 50.0, name: 'Frequency' },
			cPowerExponent: {
				minValue: 0.0,
				maxValue: 5.0,
				name: 'PowerExponent',
			},
			cAmplitude: { minValue: 0.0, maxValue: 0.2, name: 'Amplitude' },
			cIntensity: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'Intensity',
				step: 0.01,
			},
			cDirectionX: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'Direction X',
				step: 0.1,
			},
			cDirectionY: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'Direction Y',
				step: 0.1,
			},
			cRadius: { minValue: 0.0, maxValue: 2.0, name: 'Radius', step: 0.01 },
			cInnerRadius: { minValue: 0.0, maxValue: 2.0, name: 'InnerRadius' },
			cInnerRadius2: { minValue: 0.0, maxValue: 2.0, name: 'InnerRadius2' },
			cWidth: { minValue: 0.0, maxValue: 1.0, name: 'Width', step: 0.01 },
			cHeight: { minValue: 0.0, maxValue: 1.0, name: 'Height' },
			cDepth: { minValue: 0.0, maxValue: 1.0, name: 'Depth' },
			cOffset: { minValue: 0.0, maxValue: 1.0, name: 'Offset', step: 0.1 },
			cPetals: { minValue: 1, maxValue: 20, name: 'Petals' },
			cVolume: { minValue: 1, maxValue: 10, name: 'Volume' },
			cBeta: { minValue: 1, maxValue: 10, name: 'Beta' },
			cDelta: { minValue: 0.01, maxValue: 0.2, name: 'Delta' },
			cScale: { minValue: 0.1, maxValue: 1.0, name: 'Scale' },
			cSize: { minValue: 0.1, maxValue: 5.0, name: 'Size' },
			cColor: { minValue: 0.0, maxValue: 1.0, name: 'Color', step: 0.1 },
			cInnerWidth: { minValue: 0.0, maxValue: 1.0, name: 'Inner Width' },
			cStrength: { minValue: 0.0, maxValue: 5.0, name: 'Strength' },
			cPower: { minValue: 0.0, maxValue: 1.0, name: 'Power' },
			cRange: { minValue: 0.0, maxValue: 5.0, name: 'Range' },
			cEmission: { minValue: 0.0, maxValue: 1.0, name: 'Emission' },
			cBloom: { minValue: 0.0, maxValue: 1.0, name: 'Bloom', step: 0.1 },
			cLightX: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'Light X',
				step: 0.01,
			},
			cLightY: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'Light Y',
				step: 0.01,
			},
			cLightZ: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'Light Z',
				step: 0.01,
			},
			cAmbient: { minValue: 0.0, maxValue: 1.0, name: 'Ambient' },
			cSmoothness: { minValue: 0.0, maxValue: 1.0, name: 'Smoothness' },
			cSmoothnessPower: {
				minValue: 1.0,
				maxValue: 5.0,
				name: 'Smoothness Power',
			},
			cThickness: { minValue: 0.0, maxValue: 1.0, name: 'Thickness' },
			cThicknessPower: {
				minValue: 1.0,
				maxValue: 5.0,
				name: 'Thickness Power',
			},
			cCameraTilt: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'CameraTilt',
				step: 0.01,
			},
			cCameraPan: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'CameraPan',
				step: 0.01,
			},
			cSpeed: { minValue: 0.0, maxValue: 10.0, name: 'Speed' },
			cAngle: { minValue: 0.0, maxValue: 360.0, name: 'Angle', step: 0.01 },
			cDensity: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'Density',
				step: 0.01,
			},
			cAlpha: { minValue: 0.0, maxValue: 1.0, name: 'Alpha', step: 0.01 },

			cDiamondGearTeeth: {
				minValue: 8.0,
				maxValue: 32.0,
				name: 'Teeth',
				step: 1.0,
			},
			cDiamondGearMid: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'Mid',
				step: 0.01,
			},

			cBrushStrokeX1: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'X1',
				step: 0.01,
			},
			cBrushStrokeY1: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'Y1',
				step: 0.01,
			},
			cBrushStrokeX2: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'X2',
				step: 0.01,
			},
			cBrushStrokeY2: {
				minValue: -1.0,
				maxValue: 1.0,
				name: 'Y2',
				step: 0.01,
			},

			cBubblesVariation: {
				minValue: 1.0,
				maxValue: 2.0,
				name: 'Variation',
				step: 1.0,
			},

			cFlameEyeInnerFade: {
				minValue: 0.01,
				maxValue: 1.0,
				name: 'InnerFade',
				step: 0.01,
			},
			cFlameEyeOuterFade: {
				minValue: 0.01,
				maxValue: 1.0,
				name: 'OuterFade',
				step: 0.01,
			},
			cFlameEyeBorder: {
				minValue: 0.01,
				maxValue: 1.0,
				name: 'Border',
				step: 0.01,
			},

			cSplatLines: { minValue: 1, maxValue: 100, name: 'Lines' },
			cSplatSpotStep: {
				minValue: 0.02,
				maxValue: 0.1,
				name: 'Spot Step',
				step: 0.02,
			},

			cTrabeculumVariation: {
				minValue: 0,
				maxValue: 2,
				name: 'Variation',
				step: 1,
			},

			cLifeTime: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'Life Time',
				step: 0.01,
			},
			cGravity: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'Gravity',
				step: 0.01,
			},
			cCount: { minValue: 0.0, maxValue: 500.0, name: 'Count', step: 1.0 },

			cExplosionRadius: { minValue: 1.0, maxValue: 2.0, name: 'Radius' },
			cExplosionDownScale: {
				minValue: 1.0,
				maxValue: 2.0,
				name: 'DownScale',
			},
			cExplosionGrain: { minValue: 1.0, maxValue: 5.0, name: 'Grain' },
			cExplosionSpeed: { minValue: 0.1, maxValue: 2.0, name: 'Speed' },
			cExplosionBallness: {
				minValue: 2.0,
				maxValue: 50.0,
				name: 'Ballness',
			},
			cExplosionGrowth: { minValue: 0.1, maxValue: 3.0, name: 'Growth' },
			cExplosionFade: { minValue: 1.0, maxValue: 5.0, name: 'Fade' },
			cExplosionDensity: { minValue: 0.1, maxValue: 4.0, name: 'Density' },
			cExplosionContrast: {
				minValue: 0.1,
				maxValue: 4.0,
				name: 'Contrast',
			},
			cExplosionRollingInitDamp: {
				minValue: 0.1,
				maxValue: 2.0,
				name: 'RollingInitDamp',
			},
			cExplosionRollingSpeed: {
				minValue: 0.0,
				maxValue: 4.0,
				name: 'RollingSpeed',
			},
			cExplosionDelayRange: {
				minValue: 0.1,
				maxValue: 2.0,
				name: 'DelayRange',
			},
			cExplosionBallSpread: {
				minValue: 0.1,
				maxValue: 5.0,
				name: 'BallSpread',
			},

			cNoiseOctave: { minValue: 1, maxValue: 8, name: 'NoiseOctave' },
			cNoiseFrequency: {
				minValue: 0.0,
				maxValue: 2.0,
				name: 'NoiseFrequency',
				step: 0.01,
			},
			cNoisePersistence: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'NoisePersistence',
			},
			cNoiseAmplitude: {
				minValue: 0.0,
				maxValue: 1.0,
				name: 'NoiseAmplitude',
				step: 0.01,
			},
			cNoiseScale: { minValue: 0.0, maxValue: 1.0, name: 'NoiseScale' },
			cNoiseSphereEnable: { name: 'NoiseSphere' },
			cNoiseGraphEnable: { name: 'NoiseGraph' },
			cNoiseSize: { minValue: 0.1, maxValue: 10.0, name: 'NoiseSize' },
			cNoiseStrength: {
				minValue: 0.1,
				maxValue: 1.0,
				name: 'NoiseStrength',
			},
			cNoiseDepth: { minValue: 1, maxValue: 5, name: 'NoiseDepth' },
		};

		//MARK: override items
		var overrideItems = {
			Circle: {
				cPowerExponent: { minValue: 0.0, maxValue: 50.0 },
			},
			Gradation: {
				cPowerExponent: { minValue: 0.0, maxValue: 50.0 },
			},
			GradationLine: {
				cPowerExponent: { minValue: 0.0, maxValue: 50.0 },
			},
			Cone: {
				cPowerExponent: { minValue: 0.0, maxValue: 50.0 },
			},
			Cell: {
				cPowerExponent: { minValue: 0.0, maxValue: 50.0 },
			},
			Flame: {
				cWidth: { minValue: 0.1, maxValue: 2.0 },
			},
			Lightning: {
				cFrequency: { minValue: 0.0, maxValue: 2.0 },
				cWidth: { minValue: 1.0, maxValue: 10.0 },
			},
			Cloud: {
				cCameraPan: { minValue: 0.0, maxValue: 1.0, defaultValue: 0.0 },
				cCameraTilt: { minValue: 0.0, maxValue: 1.0, defaultValue: 0.0 },
			},
			Checker: {
				cWidth: { minValue: 1.0, maxValue: 100.0 },
				cHeight: { minValue: 1.0, maxValue: 100.0 },
			},
			FbmNoise2: {
				cNoiseOctave: { minValue: 1.0, maxValue: 3.0, defaultValue: 3.0 },
				cNoiseAmplitude: {
					minValue: 0.0,
					maxValue: 0.5,
					defaultValue: 0.25,
				},
				cNoiseFrequency: {
					minValue: 0.0,
					maxValue: 1.0,
					defaultValue: 1.0,
				},
			},
			FbmNoise3: {
				cNoiseOctave: { minValue: 1.0, maxValue: 8.0, defaultValue: 5.0 },
				cNoiseAmplitude: {
					minValue: 0.5,
					maxValue: 1.5,
					defaultValue: 1.0,
				},
				cNoiseFrequency: {
					minValue: 0.0,
					maxValue: 2.0,
					defaultValue: 0.5,
				},
				cNoiseScale: { minValue: 0.01, maxValue: 1.0 },
			},
			MarbleNoise: {
				cScale: { minValue: 1.0, maxValue: 100.0 },
				cFrequency: { minValue: 1.0, maxValue: 100.0 },
			},
			TessNoise: {
				cNoiseFrequency: {
					minValue: 0.0,
					maxValue: 1.0,
					defaultValue: 0.1,
				},
			},
			FlameEye: {
				cSpeed: { minValue: 0.1, maxValue: 1.0 },
			},
			FlameLance: {
				cSize: { minValue: 1.0, maxValue: 100.0 },
				cSpeed: { minValue: 0.1, maxValue: 5.0 },
				cPower: { minValue: 0.1, maxValue: 10.0 },
				cAngle: { minValue: -1.0, maxValue: 1.0 },
			},
			Bonfire: {
				cSpeed: { minValue: 0.1, maxValue: 1.0 },
				cIntensity: { minValue: 0.1, maxValue: 5.0 },
				cStrength: { minValue: 0.1, maxValue: 1.0 },
				cDensity: { minValue: 0.1, maxValue: 4.0 },
				cSize: { minValue: 0.0, maxValue: 10.0 },
			},
			Snow: {
				cDensity: { minValue: 0.1, maxValue: 6.0 },
				cRange: { minValue: 0.1, maxValue: 1.0 },
			},
			DiamondGear: {
				cWidth: { minValue: 0.1, maxValue: 8.0 },
			},
			BrushStroke: {
				cWidth: { minValue: 0.0, maxValue: 1.0, defaultValue: 0.3 },
				cAlpha: { minValue: 0.0, maxValue: 1.0, defaultValue: 0.58 },
				cStrength: { minValue: 0.1, maxValue: 1.0, defaultValue: 0.6 },
				cAngle: { minValue: 0.0, maxValue: 1.0 },
				cAmplitude: { minValue: 0.0, maxValue: 1.0 },
			},
			Speckle: {
				cRadius: { minValue: 0.01, maxValue: 1.0, defaultValue: 1.0 },
				cDensity: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.1 },
				cScale: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.01 },
			},
			Pentagon: {
				cWidth: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.02 },
				cScale: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.5 },
				cAlpha: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.38 },
			},
			Grunge: {
				cRadius: { minValue: 0.01, maxValue: 1.0 },
			},
			Energy: {
				cPower: { minValue: 0.0, maxValue: 1.0 },
				cFrequency: { minValue: 0.0, maxValue: 1.0 },
			},
			Particle: {
				cSize: { minValue: 0.01, maxValue: 0.5 },
			},
			Electric: {
				cFrequency: { minValue: 10.0, maxValue: 50.0 },
				cScale: { minValue: 0.01, maxValue: 1.0 },
			},
			Caustics: {
				cScale: { minValue: 1.0, maxValue: 10.0 },
				cSpeed: { minValue: 1.0, maxValue: 4.0 },
			},
			Squiggles: {
				cSize: { minValue: 1.0, maxValue: 8.0 },
				cScale: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.5 },
				cDensity: { minValue: 1.0, maxValue: 16.0 },
			},
			WaterTurbulence: {
				cSize: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.4 },
				cIntensity: { minValue: 0.01, maxValue: 1.0, defaultValue: 0.15 },
			},
			Trabeculum: {
				cDensity: { minValue: 0.0, maxValue: 1.0, defaultValue: 1.0 },
				cScale: { minValue: 0.01, maxValue: 1.0, defaultValue: 1.0 },
				cCameraPan: { minValue: 0.0, maxValue: 1.0, defaultValue: 0.5 },
				cCameraTilt: { minValue: 0.0, maxValue: 1.0, defaultValue: 0.5 },
			},
		};

		//MARK: parsTable
		let parsTable = {
			Wood: [ 'cFrequency', 'cPowerExponent' ],
			Circle: [ 'cRadius', 'cPowerExponent' ],
			Solar: [ 'cIntensity', 'cPowerExponent' ],
			Spark: [ 'cIntensity', 'cPowerExponent' ],
			Ring: [ 'cRadius', 'cWidth', 'cPowerExponent' ],
			Gradation: [ 'cDirectionX', 'cDirectionY', 'cPowerExponent' ],
			GradationLine: [
				'cDirectionX',
				'cDirectionY',
				'cOffset',
				'cPowerExponent',
			],
			Flash: [ 'cFrequency', 'cPowerExponent' ],
			Cone: [ 'cDirectionX', 'cDirectionY', 'cPowerExponent' ],
			Flower: [ 'cPetals', 'cRadius', 'cIntensity', 'cPowerExponent' ],
			FlowerFun: [
				'cPetals',
				'cRadius',
				'cOffset',
				'cIntensity',
				'cPowerExponent',
			],
			WaveRing: [
				'cRadius',
				'cWidth',
				'cFrequency',
				'cAmplitude',
				'cPowerExponent',
			],
			Flame: [ 'cIntensity', 'cWidth', 'cScale' ],
			FlameEye: [
				'cSpeed',
				'cFlameEyeInnerFade',
				'cFlameEyeOuterFade',
				'cFlameEyeBorder',
				'cColor',
			],
			Cell: [ 'cIntensity', 'cPowerExponent', 'cSize' ],
			Smoke: [ 'cVolume', 'cBeta', 'cDelta' ],
			Lightning: [ 'cIntensity', 'cFrequency', 'cWidth' ],
			Flare: [ 'cIntensity', 'cPowerExponent' ],
			Flare2: [ 'cIntensity', 'cPowerExponent' ],
			Flare3: [ 'cIntensity', 'cPowerExponent' ],
			MagicCircle: [],
			Mandara: [ 'cRadius', 'cInnerRadius', 'cInnerRadius2' ],
			Cross: [ 'cIntensity', 'cPowerExponent' ],
			Explosion: [
				'cCameraTilt',
				'cCameraPan',
				'cExplosionRadius',
				'cExplosionDownScale',
				'cExplosionGrain',
				'cExplosionSpeed',
				'cExplosionBallness',
				'cExplosionGrowth',
				'cExplosionFade',
				'cExplosionDensity',
				'cExplosionContrast',
				'cExplosionRollingInitDamp',
				'cExplosionRollingSpeed',
				'cExplosionDelayRange',
				'cExplosionBallSpread',
			],
			Explosion2: [
				'cCameraPan',
				'cExplosionSpeed',
				'cExplosionDensity',
				'cEmission',
				'cBloom',
				'cColor',
			],
			Corona: [ 'cIntensity', 'cRadius', 'cSize' ],
			Fire: [
				'cIntensity',
				'cStrength',
				'cPower',
				'cRange',
				'cWidth',
				'cColor',
			],
			LensFlare: [ 'cRadius', 'cRange', 'cColor', 'cPowerExponent' ],
			Sun: [ 'cRadius', 'cColor' ],
			Laser: [ 'cWidth', 'cColor' ],
			Laser2: [ 'cWidth', 'cInnerWidth' ],
			Light: [ 'cRadius', 'cPowerExponent', 'cColor' ],
			Cloud: [
				'cWidth',
				'cHeight',
				'cDepth',
				'cIntensity',
				'cLightX',
				'cLightY',
				'cLightZ',
				'cAmbient',
				'cSmoothness',
				'cSmoothnessPower',
				'cThickness',
				'cThicknessPower',
				'cCameraTilt',
				'cCameraPan',
			],
			Cloud2: [ 'cIntensity', 'cDensity', 'cThickness', 'cColor' ],

			PerlinNoise: [
				'cNoiseOctave',
				'cNoisePersistence',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			SeemlessNoise: [
				'cNoiseOctave',
				'cNoisePersistence',
				'cNoiseScale',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			BooleanNoise: [
				'cNoiseFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			CellNoise: [
				'cNoiseFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			RandomNoise: [
				'cNoiseFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			FbmNoise: [
				'cNoiseOctave',
				'cNoiseAmplitude',
				'cNoiseFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			FbmNoise2: [
				'cNoiseOctave',
				'cNoiseAmplitude',
				'cNoiseFrequency',
				'cScale',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			FbmNoise3: [
				'cNoiseOctave',
				'cNoiseAmplitude',
				'cNoiseFrequency',
				'cNoiseScale',
				'cOffset',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			TurbulentNoise: [
				'cNoiseOctave',
				'cNoiseAmplitude',
				'cNoiseFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			SparkNoise: [
				'cNoiseFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			VoronoiNoise: [
				'cNoiseFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			MarbleNoise: [
				'cScale',
				'cFrequency',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			TessNoise: [
				'cNoiseFrequency',
				'cOffset',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			GradientNoise: [
				'cNoiseScale',
				'cColor',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],

			Checker: [ 'cWidth', 'cHeight' ],
			FlameLance: [
				'cSize',
				'cSpeed',
				'cPower',
				'cAngle',
				'cColor',
				'cNoiseSize',
				'cNoiseStrength',
				'cNoiseDepth',
			],
			Bonfire: [
				'cSpeed',
				'cIntensity',
				'cStrength',
				'cDensity',
				'cSize',
				'cColor',
			],
			Snow: [ 'cSpeed', 'cScale', 'cDensity', 'cRange' ],
			DiamondGear: [
				'cScale',
				'cWidth',
				'cRadius',
				'cDiamondGearTeeth',
				'cDiamondGearMid',
			],
			BrushStroke: [
				'cWidth',
				'cStrength',
				'cAlpha',
				'cAngle',
				'cAmplitude',
				'cBrushStrokeX1',
				'cBrushStrokeY1',
				'cBrushStrokeX2',
				'cBrushStrokeY2',
				'cColor',
			],
			Speckle: [ 'cRadius', 'cScale', 'cDensity' ],
			Bubbles: [
				'cRadius',
				'cWidth',
				'cThickness',
				'cColor',
				'cBubblesVariation',
			],
			Pentagon: [ 'cScale', 'cAlpha', 'cWidth' ],
			Grunge: [ 'cRadius', 'cScale' ],
			Energy: [
				'cPower',
				'cDensity',
				'cThickness',
				'cScale',
				'cFrequency',
				'cColor',
			],
			InkSplat: [ 'cSplatLines', 'cSplatSpotStep' ],
			Particle: [ 'cSize', 'cLifeTime', 'cGravity', 'cCount' ],
			Electric: [ 'cFrequency', 'cScale' ],
			Caustics: [ 'cScale', 'cSpeed', 'cColor' ],
			Squiggles: [ 'cSize', 'cScale', 'cDensity' ],
			WaterTurbulence: [ 'cScale', 'cIntensity' ],
			Trabeculum: [
				'cDensity',
				'cScale',
				'cIntensity',
				'cTrabeculumVariation',
				'cCameraTilt',
				'cCameraPan',
				'cColor',
			],
			//MARK: add new pars here

			Test: [],
		};

		let pars = parsTable[ this.effectController.type ];
		for ( let i = 0; i < pars.length; i++ ) {

			let item = items[ pars[ i ] ];
			if ( pars[ i ].indexOf( 'Enable' ) >= 0 ) {

				this.gui.parsItems.push(
					this.gui.pars.add( this.effectController, pars[ i ] ).name( item.name )
				);

			} else {

				let override = false;
				if ( this.effectController.type in overrideItems ) {

					if ( pars[ i ] in overrideItems[ this.effectController.type ] ) {

						override = true;

					}

				}

				if ( override ) {

					let overrideItem = overrideItems[ this.effectController.type ][ pars[ i ] ];
					if ( 'defaultValue' in overrideItem ) {

						this.effectController[ pars[ i ] ] = overrideItem.defaultValue;

					}

					let guiItem = this.gui.pars
						.add(
							this.effectController,
							pars[ i ],
							overrideItem.minValue,
							overrideItem.maxValue
						)
						.name( item.name );
					if ( 'step' in item ) {

						guiItem.step( item.step );

					}

					if ( 'step' in overrideItem ) {

						guiItem.step( override.step );

					}

					this.gui.parsItems.push( guiItem );

				} else {

					var guiItem = this.gui.pars
						.add( this.effectController, pars[ i ], item.minValue, item.maxValue )
						.name( item.name );
					if ( 'step' in item ) {

						guiItem.step( item.step );

					}

					this.gui.parsItems.push( guiItem );

				}

			}

		}

	},

	updateSaveBuffer() {

		this.saveCanvas.width = this.canvas.width;
		this.saveCanvas.height = this.canvas.height;
		const ctx = this.saveCanvas.getContext( '2d', { willReadFrequently: true } );

		if ( this.alphaOptions.blur > 0 ) {

			this.blur50.width = this.canvas.width * 0.5;
			this.blur50.height = this.canvas.height * 0.5;
			this.blur25.width = this.canvas.width * 0.25;
			this.blur25.height = this.canvas.height * 0.25;

			let blur1 = this.blur50;
			let blur2 = this.blur25;
			let blur1ctx = blur1.getContext( '2d' );
			let blur2ctx = blur2.getContext( '2d' );

			blur2ctx.drawImage( this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, blur2.width, blur2.height );
			blur1ctx.drawImage( blur2, 0, 0, blur2.width, blur2.height, 0, 0, blur1.width, blur1.height );

			for ( let i = 0; i < this.alphaOptions.blur; i++ ) {

				blur2ctx.drawImage( blur1, 0, 0, blur1.width, blur1.height, 0, 0, blur2.width, blur2.height );
				blur1ctx.drawImage( blur2, 0, 0, blur2.width, blur2.height, 0, 0, blur1.width, blur1.height );
				[ blur1, blur2, blur1ctx, blur2ctx ] = [ blur2, blur1, blur2ctx, blur1ctx ];

			}

			ctx.drawImage( blur1, 0, 0, blur1.width, blur1.height, 0, 0, this.canvas.width, this.canvas.height );

		} else {

			ctx.drawImage( this.canvas, 0, 0 );

		}

		const threshold = Math.round( this.alphaOptions.threshold * 255.0 );
		const tolerance = Math.round( this.alphaOptions.tolerance * 255.0 );
		const imageData = ctx.getImageData( 0, 0, this.canvas.width, this.canvas.height );
		let buffer = imageData.data;
		for ( let i = 0; i < buffer.length; i += 4 ) {

			const r = ( buffer[ i + 0 ] > tolerance ) ? 255 : ( buffer[ i + 0 ] < threshold ) ? 0 : buffer[ i + 0 ];
			const g = ( buffer[ i + 1 ] > tolerance ) ? 255 : ( buffer[ i + 1 ] < threshold ) ? 0 : buffer[ i + 1 ];
			const b = ( buffer[ i + 2 ] > tolerance ) ? 255 : ( buffer[ i + 2 ] < threshold ) ? 0 : buffer[ i + 2 ];
			const mono = Math.round( Math.max( r, g, b ) );	// max
			// const mono = Math.round((r+g+b)/3.0);	// average
			// const mono = Math.round(0.2989*r + 0.5870*g + 0.114*b);	// weighted average
			// const mono = Math.round(0.21*r + 0.72*r + 0.07*b);	// luminosity
			buffer[ i + 3 ] = mono;

		}

		imageData.data.set( buffer );
		ctx.putImageData( imageData, 0, 0 );

	},

	updateAlphaBuffer() {

		this.updateSaveBuffer();

		this.alphaCanvas.width = this.canvas.width;
		this.alphaCanvas.height = this.canvas.height;
		const ctx2d = this.alphaCanvas.getContext( '2d', { willReadFrequently: true } );
		ctx2d.drawImage( this.saveCanvas, 0, 0 );

		const imageData = ctx2d.getImageData( 0, 0, this.canvas.width, this.canvas.height );
		const buffer = imageData.data;
		for ( let i = 0; i < buffer.length; i += 4 ) {

			buffer[ i + 0 ] = buffer[ i + 1 ] = buffer[ i + 2 ] = buffer[ i + 3 ];
			buffer[ i + 3 ] = 255;

		}

		imageData.data.set( buffer );
		ctx2d.putImageData( imageData, 0, 0 );

	},

	animate() {

		if ( this.effectController.animate ) {

			this.effectController.time += this.clock.getDelta();
			// console.log(this.effectController.time);

		}

		var time = this.effectController.time;
		var str = time.toString() + '0000000';
		if ( time === 0 ) str = '0.00000000';
		document.getElementById( 'time' ).innerHTML = str.substr( 0, 8 );

		requestAnimationFrame( this.animate.bind( this ) );
		this.render();

		if ( this.alphaOptions.visible && ( this.effectController.animate || this.alphaOptions.update ) ) {

			this.updateAlphaBuffer();

		}

	},

	render() {

		this.stats.update();

		for ( var i = 0; i < this.layers.length; i++ ) {

			var layer = this.layers[ i ];
			var target = layer.renderTarget;
			var texture = layer.tDiffuse;

			if (
				layer.name === 'NormalMap' &&
				this.effectController.normalMap === false
			) {

				layer = this.layers[ this.layers.length - 1 ];

			}

			if (
				layer.name === 'PolarConversion' &&
				this.effectController.polarConversion === false
			) {

				layer = this.layers[ this.layers.length - 1 ];

			}

			if ( layer.name === 'Tiling' && this.effectController.tiling === false ) {

				layer = this.layers[ this.layers.length - 1 ];

			}

			layer.uniforms.resolution.value = new THREE.Vector2(
				this.canvas.width,
				this.canvas.height
			);
			this.camera.getWorldPosition( layer.uniforms.cameraPos.value );
			this.camera.getWorldDirection( layer.uniforms.cameraDir.value );
			layer.uniforms.mouse.value.copy( this.mouse );
			// layer.uniforms.time.value = effectController.time;
			layer.uniforms.tDiffuse.value = texture;
			const keys = Object.keys( this.effectController );
			for ( let i in keys ) {

				const key = keys[ i ];
				if ( key === 'resolution' ) continue;
				PIXY.FxgenShaderUtils.SetShaderParameter(
					layer.uniforms,
					key,
					this.effectController[ key ]
				);

			}

			// PIXY.FxgenShaderUtils.SetShaderParameter(layer.uniforms, "heightScale", effectController.heightScale);
			PIXY.FxgenShaderUtils.SetShaderParameter(
				layer.uniforms,
				'cColorBalanceShadows',
				new THREE.Vector3(
					this.effectController.cColorBalanceShadowsR,
					this.effectController.cColorBalanceShadowsG,
					this.effectController.cColorBalanceShadowsB
				)
			);
			PIXY.FxgenShaderUtils.SetShaderParameter(
				layer.uniforms,
				'cColorBalanceMidtones',
				new THREE.Vector3(
					this.effectController.cColorBalanceMidtonesR,
					this.effectController.cColorBalanceMidtonesG,
					this.effectController.cColorBalanceMidtonesB
				)
			);
			PIXY.FxgenShaderUtils.SetShaderParameter(
				layer.uniforms,
				'cColorBalanceHighlights',
				new THREE.Vector3(
					this.effectController.cColorBalanceHighlightsR,
					this.effectController.cColorBalanceHighlightsG,
					this.effectController.cColorBalanceHighlightsB
				)
			);
			PIXY.FxgenShaderUtils.SetShaderParameter(
				layer.uniforms,
				'cDirection',
				new THREE.Vector2(
					this.effectController.cDirectionX,
					this.effectController.cDirectionY
				)
			);
			// PIXY.FxgenShaderUtils.SetShaderParameter(layer.uniforms, "tNoise", noiseTexture);
			PIXY.FxgenShaderUtils.SetShaderParameter(
				layer.uniforms,
				'tGrunge',
				this.grungeTexture
			);

			this.scene.overrideMaterial = layer.material;
			this.renderer.setRenderTarget( target );
			this.renderer.render( this.scene, this.dummyCamera );
			this.renderer.setRenderTarget( null );
			this.scene.overrideMaterial = null;

		}

		if ( this.effectController.cNoiseSphereEnable ) {

			this.noise.uniforms.tDisplacement.value =
			this.layers[ this.layers.length - 2 ].renderTarget.texture;
			this.renderer.render( this.noise.scene, this.camera );

		}

	}

};

// Save Helper

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link ); // Firefox workaround, see #6594

function save( blob, filename ) {

	link.href = URL.createObjectURL( blob );
	link.download = filename || 'data.json';
	link.click();
	// URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString( text, filename ) {

	save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}

app.init();
app.animate();

function onWindowResize() {

	console.log( '[fxgen] onWindowResize' );
	app.renderer.setSize( app.canvas.width, app.canvas.height );

	if ( app.layers ) {

		for ( var i = 0; i < app.layers.length; i++ ) {

			if ( app.layers[ i ].renderTarget ) {

				app.layers[ i ].renderTarget = new THREE.WebGLRenderTarget(
					app.canvas.width,
					app.canvas.height,
					{
						minFilter: THREE.LinearFilter,
						magFilter: THREE.LinearFilter,
						// format: THREE.RGBFormat,
						stencilBuffer: false,
					}
				);

			}

			if ( app.layers[ i ].tDiffuse ) {

				app.layers[ i ].tDiffuse = app.layers[ i - 1 ].renderTarget.texture;

			}

			if ( app.layers[ i ].name === 'Tiling' ) {

				app.layers[ i ].tDiffuse.wrapS = app.layers[ i ].tDiffuse.wrapT =
					THREE.RepeatWrapping;

			}

		}

	}

	app.spriteSheet.renderTarget = new THREE.WebGLRenderTarget(
		app.canvas.width,
		app.canvas.height,
		{
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			// format: THREE.RGBFormat,
			stencilBuffer: false,
		}
	);

	// app.camera.aspect = window.innerWidth / window.innerHeight;
	// app.camera.updateProjectionMatrix();

	app.render();

}

window.addEventListener( 'resize', onWindowResize, false );

console.log( "[fxgen] ready" );