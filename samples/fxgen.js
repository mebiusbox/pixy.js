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
	controls: undefined,
	scene: undefined,
	renderer: undefined,
	noise: {
		scene: undefined,
		sphere: undefined,
		uniforms: undefined,
		material: undefined,
		texture: undefined,
	},
	grungeTexture: undefined,
	gui: {
		root: undefined,
		tiling: undefined,
		tone: undefined,
		normalMap: undefined,
		cb: undefined,
		pars: undefined,
		parsItems: undefined,
	},
	stats: undefined,
	clock: new THREE.Clock(),
	effectController: undefined,
	layers: [],
	spriteSheet: {},
	alphaOptions: {},
	shaderDefines: undefined,
	preventSave: false,

	init() {
		this.initGraphics();
		this.initScene();
		this.setupGui();
		this.initLayers();

		console.log( '[fxgen] initialized' );
	},

	initGraphics() {
		console.log( '[fxgen] initializing graphics...' );

		//! RENDERER

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( 512, 512 );
		if ( this.renderer.capabilities.isWebGL2 ) {
			console.log( '[fxgen] WebGL2' );
		}

		this.canvas = this.renderer.domElement;
		this.canvas.addEventListener( 'mousemove', ( e ) => {
			this.mouse.x = e.offsetX / this.canvas.width;
			this.mouse.y = e.offsetY / this.canvas.height;
		} );
		document.body.appendChild( this.canvas );

		// for alpha
		this.alphaCanvas = document.createElement( 'canvas' );
		this.alphaCanvas.style.display = 'none';
		document.body.appendChild( this.alphaCanvas );

		// for save as png
		this.saveCanvas = document.createElement( 'canvas' );

		// for blur
		this.blur50 = document.createElement( 'canvas' );
		this.blur25 = document.createElement( 'canvas' );

		//! STATS

		this.stats = new Stats();
		document.body.appendChild( this.stats.dom );
	},

	initScene() {
		console.log( '[fxgen] initializing scene...' );

		this.scene = new THREE.Scene();
		this.noise.scene = new THREE.Scene();

		//! CAMERA

		this.camera = new THREE.PerspectiveCamera( 45.0, 1.0, 1.0, 1000.0 );
		this.camera.position.set( 0.0, 0.0, 3.8 );
		this.dummyCamera = new THREE.Camera();

		//! CONTROLS

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.target.set( 0, 0, 0 );
		this.controls.addEventListener( 'change', this.render.bind( this ) );

		//! TEXTUERS

		//! MATERIALS

		//! MODELS

		let geo, mesh, stdShader;

		geo = new THREE.PlaneGeometry( 2, 2 );
		mesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial() );
		this.scene.add( mesh );

		//! TEXTUER MAP

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
		this.noise.uniforms = stdShader.generateUniforms();
		this.noise.material = stdShader.createStandardMaterial( this.noise.uniforms );
		this.noise.sphere = new THREE.Mesh( geo, this.noise.material );
		this.noise.scene.add( this.noise.sphere );
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());

		//! LAYERS

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
		this.spriteSheet.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), this.spriteSheet.material );
		this.spriteSheet.dimension = 8;
		this.spriteSheet.time = 0.0;
		this.spriteSheet.timeLength = 3.0;
		this.spriteSheet.timeStep = 0.1;
		this.spriteSheet.scene.add( this.spriteSheet.quad );
	},

	initLayers() {
		console.log( '[fxgen] initializing layers...' );

		this.layers = [];
		let layer = {};

		layer.name = 'Base';
		// layer.renderTarget = null;
		layer.renderTarget = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			stencilBuffer: false,
		} );

		let stdShader = new PIXY.FxgenShader();
		let type = this.effectController.type;
		stdShader.enable( type.toUpperCase() );
		stdShader.enable( 'TOON' );
		stdShader.enable( 'GLSL3' );
		layer.uniforms = stdShader.generateUniforms();
		layer.defaultUniforms = THREE.UniformsUtils.clone( layer.uniforms );
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());
		// console.log(layer.material.fragmentShader);

		this.resetParameters( layer.defaultUniforms );
		this.layers.push( layer );

		//! POLAR CONVERSION

		layer = {};
		layer.name = 'PolarConversion';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.renderTarget = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			stencilBuffer: false,
		} );

		stdShader.clear();
		stdShader.enable( 'POLARCONVERSION' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		this.layers.push( layer );

		//! COLOR BALANCE

		layer = {};
		layer.name = 'ColorBalance';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.renderTarget = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			stencilBuffer: false,
		} );

		stdShader.clear();
		stdShader.enable( 'COLORBALANCE' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());
		this.layers.push( layer );

		//! TILING

		layer = {};
		layer.name = 'Tiling';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.tDiffuse.wrapS = layer.tDiffuse.wrapT = THREE.RepeatWrapping;
		layer.renderTarget = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			stencilBuffer: false,
		} );

		stdShader.clear();
		stdShader.enable( 'TILING' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		// console.log(stdShader.generateVertexShader());
		// console.log(stdShader.generateFragmentShader());
		this.layers.push( layer );

		//! NORMAL MAP

		layer = {};
		layer.name = 'NormalMap';
		layer.tDiffuse = this.layers[ this.layers.length - 1 ].renderTarget.texture;
		layer.renderTarget = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			stencilBuffer: false,
		} );

		stdShader.clear();
		// stdShader.enable("HEIGHT2NORMAL");
		stdShader.enable( 'HEIGHT2NORMALSOBEL' );
		layer.uniforms = stdShader.generateUniforms();
		layer.material = stdShader.createMaterial( layer.uniforms );
		layer.material.defines = this.shaderDefines;
		this.layers.push( layer );

		//! COPY

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

		this.spriteSheet.renderTarget = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			stencilBuffer: false,
		} );
	},

	setupGui() {
		console.log( '[fxgen] setup GUI...' );

		this.fileInput = document.createElement( 'input' );
		this.fileInput.type = 'file';
		this.fileInput.addEventListener( 'change', ( _event ) => {
			let reader = new FileReader();
			reader.addEventListener(
				'load',
				( event ) => {
					let contents = event.target.result;
					let json = JSON.parse( contents );

					this.canvas.width = json.resolution;
					this.canvas.height = json.resolution;
					onWindowResize();

					let stdShader = new PIXY.FxgenShader();
					stdShader.enable( json.type.toUpperCase() );
					stdShader.enable( 'TOON' );
					stdShader.enable( 'GLSL3' );
					this.layers[ 0 ].uniforms = stdShader.generateUniforms();
					this.layers[ 0 ].defaultUniforms = THREE.UniformsUtils.clone( this.layers[ 0 ].uniforms );
					this.layers[ 0 ].material = stdShader.createMaterial( this.layers[ 0 ].uniforms, {
						defines: stdShader.generateDefines(),
					} );

					this.effectController.type = json.type;
					this.resetParameters( this.layers[ 0 ].defaultUniforms );

					for ( let i in json ) {
						this.effectController[ i ] = json[ i ];
					}

					for ( let i in this.gui.root.controllers ) {
						this.gui.root.controllers[ i ].updateDisplay();
					}

					for ( let i in this.gui.pars.controllers ) {
						this.gui.pars.controllers[ i ].updateDisplay();
					}

					for ( let i in this.gui.tone.controllers ) {
						this.gui.tone.controllers[ i ].updateDisplay();
					}

					for ( let i in this.gui.tiling.controllers ) {
						this.gui.tiling.controllers[ i ].updateDisplay();
					}

					for ( let i in this.gui.normalMap.controllers ) {
						this.gui.normalMap.controllers[ i ].updateDisplay();
					}

					for ( let i in this.gui.cb.controllers ) {
						this.gui.cb.controllers[ i ].updateDisplay();
					}
				},
				false
			);
			reader.readAsText( this.fileInput.files[ 0 ] );
		} );

		this.fileInput.addEventListener( 'click', ( _event ) => {
			this.value = null;
		} );

		this.effectController = {
			animate: false,
			time: 0.0,

			// freeCamera: false,
			resolution: '512',
			polarConversion: false,

			cHeightScale: 2.0,
			normalMap: false,
			tiling: false,
			cRadialMask: 1.0,

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

		this.resetEffectParameters();

		let h;
		this.gui.root = new GUI();
		this.gui.root.add( this, 'load' );
		this.gui.root.add( this, 'save' );

		// material (attributes)

		h = this.gui.root;

		// Parameters

		h.add( this.effectController, 'resolution', [ '8', '16', '32', '64', '128', '256', '512', '1024', '2048' ] ).onChange(
			( value ) => {
				this.canvas.width = value;
				this.canvas.height = value;
				onWindowResize();
			}
		);

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
			'CoherentNoise',
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
			'BinaryMatrix',
		] ).onChange( ( value ) => {
			const stdShader = new PIXY.FxgenShader();
			stdShader.enable( value.toUpperCase() );
			stdShader.enable( 'TOON' );
			stdShader.enable( 'GLSL3' );
			this.layers[ 0 ].uniforms = stdShader.generateUniforms();
			this.layers[ 0 ].defaultUniforms = THREE.UniformsUtils.clone( this.layers[ 0 ].uniforms );
			this.layers[ 0 ].material = stdShader.createMaterial( this.layers[ 0 ].uniforms );
			this.layers[ 0 ].material.defines = stdShader.generateDefines();
			// console.log( context.layers[ 0 ].material.extensions );
			// console.log( context.layers[ 0 ].material.glslVersion );
			// console.log( context.layers[ 0 ].material.vertexShader );
			// console.log( context.layers[ 0 ].material.fragmentShader );

			this.resetParameters( this.layers[ 0 ].defaultUniforms );
		} );

		this.gui.root.add( this.effectController, 'time', 0, 100.0 );
		this.gui.root.add( this.effectController, 'animate' );

		this.gui.pars = this.gui.root.addFolder( 'Parameters' );
		this.gui.pars.add(this, 'onResetEffectParameters').name('reset');
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
		h.add( this.effectController, 'cColorBalanceShadowsR', -1.0, 1.0, 0.025 ).name( 'Shadows-R' );
		h.add( this.effectController, 'cColorBalanceShadowsG', -1.0, 1.0, 0.025 ).name( 'Shadows-G' );
		h.add( this.effectController, 'cColorBalanceShadowsB', -1.0, 1.0, 0.025 ).name( 'Shadows-B' );
		h.add( this.effectController, 'cColorBalanceMidtonesR', -1.0, 1.0, 0.025 ).name( 'Midtones-R' );
		h.add( this.effectController, 'cColorBalanceMidtonesG', -1.0, 1.0, 0.025 ).name( 'Midtones-G' );
		h.add( this.effectController, 'cColorBalanceMidtonesB', -1.0, 1.0, 0.025 ).name( 'Midtones-B' );
		h.add( this.effectController, 'cColorBalanceHighlightsR', -1.0, 1.0, 0.025 ).name( 'Highlights-R' );
		h.add( this.effectController, 'cColorBalanceHighlightsG', -1.0, 1.0, 0.025 ).name( 'Highlights-G' );
		h.add( this.effectController, 'cColorBalanceHighlightsB', -1.0, 1.0, 0.025 ).name( 'Highlights-B' );
		h.add( this, 'onResetColorBalance' ).name('reset');
		h.open( false );
		// h.add(this.effectController, "colorBlanacePreserveLuminosity");
		this.gui.cb = h;

		h = this.gui.root.addFolder( 'SpriteSheet' );
		h.add( this.spriteSheet, 'dimension', 2, 32 ).step( 1 );
		h.add( this.spriteSheet, 'time', 0.0, 1000.0 );
		h.add( this.spriteSheet, 'timeLength', 0.1, 1000.0 );
		h.add( this.spriteSheet, 'timeStep', 0.0001, 100.0 );
		h.add( this, 'onSaveSpriteSheet' ).name( 'Save (SpriteSheet)' );
		h.add( this, 'onSaveSpriteSheetPng' ).name( 'Save (SpriteSheet with alpha)' );
		h.add( this, 'onDownloadSpriteSheetPng' ).name( 'Download (SpriteSheet with alpha)' );
		h.open( false );

		this.alphaOptions.threshold = 0.0;
		this.alphaOptions.tolerance = 1.0;
		this.alphaOptions.blur = 0;
		this.alphaOptions.visible = false;
		this.alphaOptions.update = false;
		h = this.gui.root.addFolder( 'Image with alpha (PNG)' );
		h.add( this.alphaOptions, 'threshold', 0.0, 1.0 ).onChange( ( _value ) => {
			this.alphaOptions.update = true;
		} );
		h.add( this.alphaOptions, 'tolerance', 0.0, 1.0 ).onChange( ( _value ) => {
			this.alphaOptions.update = true;
		} );
		h.add( this.alphaOptions, 'blur', 0, 10, 1 ).onChange( ( _value ) => {
			this.alphaOptions.update = true;
		} );
		h.add( this.alphaOptions, 'visible' ).onChange( ( value ) => {
			if ( value ) {
				this.canvas.style.display = 'none';
				this.alphaCanvas.style.display = null;
				this.alphaOptions.update = true;
			} else {
				this.canvas.style.display = null;
				this.alphaCanvas.style.display = 'none';
			}
		} );
		h.add( this, 'onSavePng' ).name( 'Save (PNG)' );
		h.add( this, 'onDownloadPng' ).name( 'Download (PNG)' );
		h.open( false );

		this.gui.root.add( this, 'onSaveImage' ).name( 'Save' );
	},

	resetEffectParameters() {
			//MARK: parameters
		this.effectController.cFrequency = 30.0;
		this.effectController.cAmplitude = 0.01;
		this.effectController.cIntensity = 0.5;
		this.effectController.cDirectionX = 0.0;
		this.effectController.cDirectionY = 1.0;
		this.effectController.cPowerExponent = 1.0;
		this.effectController.cRadius = 1.0;
		this.effectController.cInnerRadius = 1.0;
		this.effectController.cInnerRadius2 = 1.0;
		this.effectController.cSize = 1.0;
		this.effectController.cWidth = 1.0;
		this.effectController.cHeight = 1.0;
		this.effectController.cDepth = 1.0;
		this.effectController.cColor = 1.0;
		this.effectController.cRadius = 0.5;
		this.effectController.cPetals = 6.0;
		this.effectController.cOffset = 0.2;
		this.effectController.cVolume = 3.0;
		this.effectController.cBeta = 4.0;
		this.effectController.cDelta = 0.05;
		this.effectController.cScale = 1.0;
		this.effectController.cInnerWidth = 0.4;
		this.effectController.cStrength = 1.0;
		this.effectController.cPower = 1.0;
		this.effectController.cRange = 2.0;
		this.effectController.cEmission = 1.0;
		this.effectController.cBloom = 1.0;
		this.effectController.cLightX = 1.0;
		this.effectController.cLightY = 1.0;
		this.effectController.cLightZ = 1.0;
		this.effectController.cAmbient = 1.0;
		this.effectController.cSmoothness = 1.0;
		this.effectController.cSmoothnessPower = 1.0;
		this.effectController.cThickness = 1.0;
		this.effectController.cThicknessPower = 1.0;
		this.effectController.cCameraTilt = 0.0;
		this.effectController.cCameraPan = 0.0;
		this.effectController.cSpeed = 1.0;
		this.effectController.cAngle = 0.0;
		this.effectController.cDensity = 1.0;
		this.effectController.cAlpha = 1.0;
		this.effectController.cRepeat = 1.0;
		this.effectController.cScaleShift = 0.0;
		this.effectController.cBias = 0.0;
		this.effectController.cGain = 0.0;
		this.effectController.cInvert = 0.0;
		this.effectController.cThreshold = 0.0;

		this.effectController.cDiamondGearTeeth = 18.0;
		this.effectController.cDiamondGearMid = 0.8;

		this.effectController.cBrushStrokeX1 = -0.4;
		this.effectController.cBrushStrokeY1 = 0.0;
		this.effectController.cBrushStrokeX2 = 1.1;
		this.effectController.cBrushStrokeY2 = 0.8;

		this.effectController.cBubblesVariation = 1.0;

		this.effectController.cFlameEyeInnerFade = 1.0;
		this.effectController.cFlameEyeOuterFade = 1.0;
		this.effectController.cFlameEyeBorder = 1.0;

		this.effectController.cSplatLines = 20;
		this.effectController.cSplatSpotStep = 0.04;

		this.effectController.cTrabeculumVariation = 2.0;

		this.effectController.cLifeTime = 0.9;
		this.effectController.cGravity = 0.26;
		this.effectController.cCount = 300;

		// this.effectController.circleRadius = 1.1;
		// this.effectController.ringRadius: 0.5,
		// this.effectController.ringWidth: 0.1,
		// this.effectController.flowerPetals: 6.0,
		// this.effectController.flowerRadius: 0.5,
		// this.effectController.flowerOffset: 0.2,
		// this.effectController.gradationOffset: 0.0001,
		// this.effectController.smokeVolume: 3.0,
		// this.effectController.smokeBeta: 4.0,
		// this.effectController.smokeDelta: 0.05,
		// this.effectController.flameWidth: 1.0,
		// this.effectController.flameSthis.effectController.cale = 1.0;
		// this.effectController.this.effectController.cellSize = 1.0;
		// this.effectController.lightningFrequenthis.effectController.cy = 1.0;
		// this.effectController.lightningWidth: 7.0,
		// this.effectController.coronaRadius = 0.3;
		// this.effectController.coronaSize = 1.0;
		//
		// this.effectController.lensFlareRadius: 1.0,
		// this.effectController.lensFlareLength: 1.0,
		// this.effectController.lensFlareColor: 0.0,
		//
		// this.effectController.sunRadius: 1.0,
		// this.effectController.sunColor: 0.0,
		//
		// this.effectController.laserWidth: 0.5,
		// this.effectController.laserInnerWidth: 0.4,
		// this.effectController.laserColor: 1.0,

		this.effectController.cToonEnable = false;
		this.effectController.cToonDark = 0.8;
		this.effectController.cToonLight = 0.95;

		// this.effectController.fireStrength: 1.0,
		// this.effectController.firePower: 1.0,
		// this.effectController.fireRange: 2.0,
		// this.effectController.fireWidth: 0.1,
		// this.effectController.fireColor: 0.0001,

		this.effectController.cExplosionRadius = 1.75;
		this.effectController.cExplosionDownScale = 1.25;
		this.effectController.cExplosionGrain = 2.0;
		this.effectController.cExplosionSpeed = 0.3;
		this.effectController.cExplosionBallness = 2.0;
		this.effectController.cExplosionGrowth = 2.2;
		this.effectController.cExplosionFade = 1.6;
		this.effectController.cExplosionDensity = 1.35;
		this.effectController.cExplosionContrast = 1.0;
		this.effectController.cExplosionRollingInitDamp = 0.3;
		this.effectController.cExplosionRollingSpeed = 2.0;
		this.effectController.cExplosionDelayRange = 0.25;
		this.effectController.cExplosionBallSpread = 1.0;
		this.effectController.cExplosionBloom = 0.0;
		this.effectController.cExplosionEmission = 0.2;
		this.effectController.cExplosionColor = 1.0;

		this.effectController.cNoiseOctave = 8;
		this.effectController.cNoiseFrequency = 1.0;
		this.effectController.cNoiseAmplitude = 0.65;
		this.effectController.cNoisePersistence = 0.5;
		this.effectController.cNoiseScale = 1.0;
		this.effectController.cNoiseSphereEnable = false;
		this.effectController.cNoiseGraphEnable = false;
		this.effectController.cNoiseStrength = 1.0;
		this.effectController.cNoiseDepth = 3;
		this.effectController.cNoiseSize = 8.0;
		this.effectController.cNoiseLacunarity = 2.0;
		this.effectController.cTurbulence = 0.0;
		this.effectController.cRidge = 0.0;
		this.effectController.cRidgeOffset = 0.9;
		this.effectController.cGradientNoise = 0.0;
		this.effectController.cValueNoise = 0.0;
		this.effectController.cVoronoiNoise = 0.0;
		this.effectController.cVoronoiCell = 0.0;
		this.effectController.cSimplexNoise = 1.0;
	},

	onResetEffectParameters() {
		this.resetEffectParameters();
		this.resetParameters( this.layers[ 0 ].defaultUniforms );
	},

	onSaveImage() {
		this.render();
		// window.open( context.canvas.toDataURL() );
		let dataUrl = this.canvas.toDataURL();
		let w = window.open( 'about:blank' );
		w.document.write( "<img src='" + dataUrl + "'/>" );
	},

	onSavePng() {
		this.render();
		this.updateSaveBuffer();
		this.saveCanvas.toBlob( async function ( result ) {
			const options = {
				types: [
					{
						description: 'Images',
						accept: {
							'image/png': [ '.png' ],
						},
					},
				],
				suggestedName: 'image.png',
			};
			const imgFileHandle = await window.showSaveFilePicker( options );
			const writable = await imgFileHandle.createWritable();
			await writable.write( result );
			await writable.close();
		} );
	},

	onDownloadPng() {
		this.render();
		this.updateSaveBuffer();
		this.saveCanvas.toBlob( ( blob ) => {
			const dl = document.createElement( 'a' );
			dl.href = window.URL.createObjectURL( blob );
			dl.download = 'image.png';
			dl.click();
		} );
	},

	onSaveSpriteSheet() {
		let width = Math.floor( this.canvas.width / this.spriteSheet.dimension );
		let size = width / this.canvas.width;
		let time = this.spriteSheet.time;
		// var time = 0.0;

		this.renderer.setRenderTarget( this.spriteSheet.renderTarget );
		this.renderer.clear();
		this.renderer.setRenderTarget( null );

		for ( let i = 0; i < this.spriteSheet.dimension; i++ ) {
			for ( let j = 0; j < this.spriteSheet.dimension; j++ ) {
				let len = this.spriteSheet.timeStep * this.spriteSheet.dimension * i + this.spriteSheet.timeStep * j;
				if ( len >= this.spriteSheet.timeLength ) break;

				this.effectController.time = time + len;
				this.render();

				this.spriteSheet.uniforms.tDiffuse.value = this.layers[ this.layers.length - 2 ].renderTarget.texture;

				this.spriteSheet.quad.scale.set( size, size, 1.0 );
				this.spriteSheet.quad.position.set( -1 + 2.0 * size * j + size, 1 - 2.0 * size * i - size, 0.0 );

				this.renderer.autoClear = false;
				this.renderer.setRenderTarget( this.spriteSheet.renderTarget );
				this.renderer.render( this.spriteSheet.scene, this.spriteSheet.camera );
				this.renderer.setRenderTarget( null );
				this.renderer.autoClear = true;
			}
		}

		this.spriteSheet.quad.scale.set( 1.0, 1.0, 1.0 );
		this.spriteSheet.quad.position.set( 0.0, 0.0, 0.0 );
		this.spriteSheet.uniforms.tDiffuse.value = this.spriteSheet.renderTarget.texture;
		this.renderer.render( this.spriteSheet.scene, this.spriteSheet.camera );

		this.effectController.time = time;

		if ( !this.preventSave ) {
			let dataUrl = this.canvas.toDataURL();
			let w = window.open( 'about:blank' );
			w.document.write( "<img src='" + dataUrl + "'/>" );
		}
	},

	onSaveSpriteSheetPng() {
		this.preventSave = true;
		this.onSaveSpriteSheet();
		this.preventSave = false;

		this.updateSaveBuffer();
		this.saveCanvas.toBlob( async function ( result ) {
			const options = {
				types: [
					{
						description: 'Images',
						accept: {
							'image/png': [ '.png' ],
						},
					},
				],
				suggestedName: 'image.png',
			};
			const imgFileHandle = await window.showSaveFilePicker( options );
			const writable = await imgFileHandle.createWritable();
			await writable.write( result );
			await writable.close();
		} );
	},

	onDownloadSpriteSheetPng() {
		this.preventSave = true;
		this.onSaveSpriteSheet();
		this.preventSave = false;

		this.updateSaveBuffer();
		this.saveCanvas.toBlob( ( blob ) => {
			const dl = document.createElement( 'a' );
			dl.href = window.URL.createObjectURL( blob );
			dl.download = 'image.png';
			dl.click();
		} );
	},

	onResetColorBalance() {
		this.effectController.cColorBalanceShadowsR = 0.0;
		this.effectController.cColorBalanceShadowsG = 0.0;
		this.effectController.cColorBalanceShadowsB = 0.0;
		this.effectController.cColorBalanceMidtonesR = 0.0;
		this.effectController.cColorBalanceMidtonesG = 0.0;
		this.effectController.cColorBalanceMidtonesB = 0.0;
		this.effectController.cColorBalanceHighlightsR = 0.0;
		this.effectController.cColorBalanceHighlightsG = 0.0;
		this.effectController.cColorBalanceHighlightsB = 0.0;
		for ( let i in this.gui.cb.controllers ) {
			this.gui.cb.controllers[ i ].updateDisplay();
		}
	},

	load() {
		this.fileInput.click();
	},

	save() {
		let output;
		try {
			output = JSON.stringify( this.effectController, null, '\t' );
			output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
		} catch ( e ) {
			output = JSON.stringify( this.effectController );
		}

		saveString( output, 'EffectTextureMaker_Untitled.json' );
	},

	resetParameters( uniforms ) {
		for ( let i in this.gui.parsItems ) {
			this.gui.parsItems[ i ].destroy();
		}

		this.gui.parsItems = [];

		// for ( let key in uniforms ) {
		// 	if (
		// 		key === 'resolution' ||
		// 		key === 'mouse' ||
		// 		key === 'time' ||
		// 		key === 'cameraPos' ||
		// 		key === 'cameraDir' ||
		// 		key === 'tDiffuse' ||
		// 		key.indexOf( 'toon' ) === 0 ||
		// 		key.indexOf( 'Enable' ) >= 0
		// 	)
		// 		continue;

		// 	const keys = Object.keys( this.effectController );
		// 	for ( let key of keys ) {
		// 		if ( key in uniforms ) {
		// 			this.effectController[ key ] = uniforms[ key ].value;
		// 		}
		// 	}
		// }

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
			cNoiseLacunarity: { minValue: 1, maxValue: 4, step: 1, name: 'NoiseLacunarity' },
			cRepeat: { minValue: 1, maxValue: 8, step: 1, name: 'Repeat' },
			cScaleShift: { minValue: 0.0, maxValue: 1.0, name: 'ScaleShift' },
			cBias: { minValue: -1.0, maxValue: 1.0, name: 'Bias' },
			cGain: { minValue: -1.0, maxValue: 1.0, name: 'Gain' },
			cInvert: { minValue: 0.0, maxValue: 1.0, name: 'Invert' },
			cThreshold: { minValue: 0.0, maxValue: 1.0, name: 'Threshold' },
			cTurbulence: { minValue: 0.0, maxValue: 1.0, name: 'Turbulence' },
			cRidge: { minValue: 0.0, maxValue: 1.0, name: 'Ridge' },
			cRidgeOffset: { minValue: 0.0, maxValue: 1.0, name: 'RidgeOffset' },
			cGradientNoise: { minValue: 0.0, maxValue: 1.0, name: 'GradientNoise' },
			cValueNoise: { minValue: 0.0, maxValue: 1.0, name: 'ValueNoise' },
			cVoronoiNoise: { minValue: 0.0, maxValue: 1.0, name: 'VoronoiNoise' },
			cVoronoiCell: { minValue: 0.0, maxValue: 1.0, name: 'VoronoiCell' },
			cSimplexNoise: { minValue: 0.0, maxValue: 1.0, name: 'SimplexNoise' }
		};

		//MARK: override items
		let overrideItems = {
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
			CoherentNoise: {
				cPowerExponent: { minValue: 0.0, maxValue: 5.0, defaultValue: 1.0 },
				cNoiseOctave: { minValue: 1.0, maxValue: 6.0, step: 1.0, defaultValue: 6.0 },
				cNoiseFrequency: { minValue: 1.0, maxValue: 32.0, step: 1.0, defaultValue: 4.0 },
				cNoiseAmplitude: { minValue: 0.0, maxValue: 2.0, defaultValue: 1.0 },
				cNoisePersistence: { minValue: 0.0,	maxValue: 1.0, defaultValue: 0.5 },
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
			GradationLine: [ 'cDirectionX', 'cDirectionY', 'cOffset', 'cPowerExponent' ],
			Flash: [ 'cFrequency', 'cPowerExponent' ],
			Cone: [ 'cDirectionX', 'cDirectionY', 'cPowerExponent' ],
			Flower: [ 'cPetals', 'cRadius', 'cIntensity', 'cPowerExponent' ],
			FlowerFun: [ 'cPetals', 'cRadius', 'cOffset', 'cIntensity', 'cPowerExponent' ],
			WaveRing: [ 'cRadius', 'cWidth', 'cFrequency', 'cAmplitude', 'cPowerExponent' ],
			Flame: [ 'cIntensity', 'cWidth', 'cScale' ],
			FlameEye: [ 'cSpeed', 'cFlameEyeInnerFade', 'cFlameEyeOuterFade', 'cFlameEyeBorder', 'cColor' ],
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
			Explosion2: [ 'cCameraPan', 'cExplosionSpeed', 'cExplosionDensity', 'cEmission', 'cBloom', 'cColor' ],
			Corona: [ 'cIntensity', 'cRadius', 'cSize' ],
			Fire: [ 'cIntensity', 'cStrength', 'cPower', 'cRange', 'cWidth', 'cColor' ],
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

			CoherentNoise: [
				'cNoiseOctave',
				'cNoiseFrequency',
				'cNoiseAmplitude',
				'cNoiseLacunarity',
				'cNoisePersistence',
				'cGradientNoise',
				'cValueNoise',
				'cVoronoiNoise',
				'cVoronoiCell',
				'cSimplexNoise',
				'cRepeat',
				'cTurbulence',
				'cRidge',
				'cRidgeOffset',
				'cScaleShift',
				'cPowerExponent',
				'cBias',
				'cGain',
				'cThreshold',
				'cInvert',
				'cNoiseSphereEnable',
				'cNoiseGraphEnable',
			],
			PerlinNoise: [ 'cNoiseOctave', 'cNoisePersistence', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			SeemlessNoise: [ 'cNoiseOctave', 'cNoisePersistence', 'cNoiseScale', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			BooleanNoise: [ 'cNoiseFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			CellNoise: [ 'cNoiseFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			RandomNoise: [ 'cNoiseFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			FbmNoise: [ 'cNoiseOctave', 'cNoiseAmplitude', 'cNoiseFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
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
			TurbulentNoise: [ 'cNoiseOctave', 'cNoiseAmplitude', 'cNoiseFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			SparkNoise: [ 'cNoiseFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			VoronoiNoise: [ 'cNoiseFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			MarbleNoise: [ 'cScale', 'cFrequency', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			TessNoise: [ 'cNoiseFrequency', 'cOffset', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],
			GradientNoise: [ 'cNoiseScale', 'cColor', 'cNoiseSphereEnable', 'cNoiseGraphEnable' ],

			Checker: [ 'cWidth', 'cHeight' ],
			FlameLance: [ 'cSize', 'cSpeed', 'cPower', 'cAngle', 'cColor', 'cNoiseSize', 'cNoiseStrength', 'cNoiseDepth' ],
			Bonfire: [ 'cSpeed', 'cIntensity', 'cStrength', 'cDensity', 'cSize', 'cColor' ],
			Snow: [ 'cSpeed', 'cScale', 'cDensity', 'cRange' ],
			DiamondGear: [ 'cScale', 'cWidth', 'cRadius', 'cDiamondGearTeeth', 'cDiamondGearMid' ],
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
			Bubbles: [ 'cRadius', 'cWidth', 'cThickness', 'cColor', 'cBubblesVariation' ],
			Pentagon: [ 'cScale', 'cAlpha', 'cWidth' ],
			Grunge: [ 'cRadius', 'cScale' ],
			Energy: [ 'cPower', 'cDensity', 'cThickness', 'cScale', 'cFrequency', 'cColor' ],
			InkSplat: [ 'cSplatLines', 'cSplatSpotStep' ],
			Particle: [ 'cSize', 'cLifeTime', 'cGravity', 'cCount' ],
			Electric: [ 'cFrequency', 'cScale' ],
			Caustics: [ 'cScale', 'cSpeed', 'cColor' ],
			Squiggles: [ 'cSize', 'cScale', 'cDensity' ],
			WaterTurbulence: [ 'cScale', 'cIntensity' ],
			Trabeculum: [ 'cDensity', 'cScale', 'cIntensity', 'cTrabeculumVariation', 'cCameraTilt', 'cCameraPan', 'cColor' ],
			BinaryMatrix: [],
			//MARK: add new pars here

			Test: [],
		};

		let pars = parsTable[ this.effectController.type ];
		for ( let i = 0; i < pars.length; i++ ) {
			if ( pars[ i ] in uniforms ) {
				this.effectController[ pars[ i ] ] = uniforms[ pars[ i ] ].value;
			}

			let item = items[ pars[ i ] ];
			if ( pars[ i ].indexOf( 'Enable' ) >= 0 ) {
				this.gui.parsItems.push( this.gui.pars.add( this.effectController, pars[ i ] ).name( item.name ) );
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
						.add( this.effectController, pars[ i ], overrideItem.minValue, overrideItem.maxValue )
						.name( item.name );
					if ( 'step' in item ) {
						guiItem.step( item.step );
					}

					if ( 'step' in overrideItem ) {
						guiItem.step( overrideItem.step );
					}

					this.gui.parsItems.push( guiItem );
				} else {
					let guiItem = this.gui.pars.add( this.effectController, pars[ i ], item.minValue, item.maxValue ).name( item.name );
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
			const r = buffer[ i + 0 ] > tolerance ? 255 : buffer[ i + 0 ] < threshold ? 0 : buffer[ i + 0 ];
			const g = buffer[ i + 1 ] > tolerance ? 255 : buffer[ i + 1 ] < threshold ? 0 : buffer[ i + 1 ];
			const b = buffer[ i + 2 ] > tolerance ? 255 : buffer[ i + 2 ] < threshold ? 0 : buffer[ i + 2 ];
			const mono = Math.round( Math.max( r, g, b ) ); // max
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

		const time = this.effectController.time;
		let str = time.toString() + '0000000';
		if ( time === 0 ) str = '0.00000000';
		document.getElementById( 'time' ).innerHTML = str.slice( 0, 8 );

		requestAnimationFrame( this.animate.bind( this ) );
		this.render();

		if ( this.alphaOptions.visible && ( this.effectController.animate || this.alphaOptions.update ) ) {
			this.updateAlphaBuffer();
		}
	},

	render() {
		this.stats.update();

		for ( let i = 0; i < this.layers.length; i++ ) {
			let layer = this.layers[ i ];
			let target = layer.renderTarget;
			let texture = layer.tDiffuse;

			if ( layer.name === 'NormalMap' && this.effectController.normalMap === false ) {
				layer = this.layers[ this.layers.length - 1 ];
			}

			if ( layer.name === 'PolarConversion' && this.effectController.polarConversion === false ) {
				layer = this.layers[ this.layers.length - 1 ];
			}

			if ( layer.name === 'Tiling' && this.effectController.tiling === false ) {
				layer = this.layers[ this.layers.length - 1 ];
			}

			layer.uniforms.resolution.value = new THREE.Vector2( this.canvas.width, this.canvas.height );
			this.camera.getWorldPosition( layer.uniforms.cameraPos.value );
			this.camera.getWorldDirection( layer.uniforms.cameraDir.value );
			layer.uniforms.mouse.value.copy( this.mouse );
			// layer.uniforms.time.value = effectController.time;
			layer.uniforms.tDiffuse.value = texture;
			const keys = Object.keys( this.effectController );
			for ( let i in keys ) {
				const key = keys[ i ];
				if ( key === 'resolution' ) continue;
				PIXY.FxgenShaderUtils.SetShaderParameter( layer.uniforms, key, this.effectController[ key ] );
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
				new THREE.Vector2( this.effectController.cDirectionX, this.effectController.cDirectionY )
			);
			// PIXY.FxgenShaderUtils.SetShaderParameter(layer.uniforms, "tNoise", noiseTexture);
			PIXY.FxgenShaderUtils.SetShaderParameter( layer.uniforms, 'tGrunge', this.grungeTexture );

			this.scene.overrideMaterial = layer.material;
			this.renderer.setRenderTarget( target );
			this.renderer.render( this.scene, this.dummyCamera );
			this.renderer.setRenderTarget( null );
			this.scene.overrideMaterial = null;
		}

		if ( this.effectController.cNoiseSphereEnable ) {
			this.noise.uniforms.tDisplacement.value = this.layers[ this.layers.length - 2 ].renderTarget.texture;
			this.renderer.render( this.noise.scene, this.camera );
		}
	},
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
		for ( let i = 0; i < app.layers.length; i++ ) {
			if ( app.layers[ i ].renderTarget ) {
				app.layers[ i ].renderTarget = new THREE.WebGLRenderTarget( app.canvas.width, app.canvas.height, {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					stencilBuffer: false,
				} );
			}

			if ( app.layers[ i ].tDiffuse ) {
				app.layers[ i ].tDiffuse = app.layers[ i - 1 ].renderTarget.texture;
			}

			if ( app.layers[ i ].name === 'Tiling' ) {
				app.layers[ i ].tDiffuse.wrapS = app.layers[ i ].tDiffuse.wrapT = THREE.RepeatWrapping;
			}
		}
	}

	app.spriteSheet.renderTarget = new THREE.WebGLRenderTarget( app.canvas.width, app.canvas.height, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		stencilBuffer: false,
	} );

	// app.camera.aspect = window.innerWidth / window.innerHeight;
	// app.camera.updateProjectionMatrix();

	app.render();
}

window.addEventListener( 'resize', onWindowResize, false );

console.log( '[fxgen] ready' );
