import * as THREE from 'three';
import * as PIXY from 'pixy';
import WebGL from 'three/addons/capabilities/WebGL.js';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

if ( WebGL.isWebGLAvailable() === false ) {

	document.body.appendChild( WebGL.getWebGLErrorMessage() );

}

const app = {
	camera: undefined,
	controls: undefined,
	scene: undefined,
	renderer: undefined,
	canvas: undefined,
	stats: undefined,
	clock: new THREE.Clock(),
	lights: {},
	textures: {},
	shader: undefined,
	gui: undefined,
	parameters: undefined,
	post: {},
	time: 0.0,
	ready: false,

	init() {

		this.initGraphics();
		this.initScene();
		this.initPost();
		this.initGui();

	},

	initGraphics() {

		// RENDERER

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setClearColor( 0x999999 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );

		// if (!this.renderer.extensions.get( "OES_texture_float")) {
		//   alert('No OES_texture_float support for float textures.' );
		//   return;
		// }
		//
		// if (!this.renderer.extensions.get('WEBGL_draw_buffers')) {
		//   alert('not support WEBGL_draw_buffers.');
		//   return;
		// }
		//
		// if (!this.renderer.extensions.get('EXT_shader_texture_lod')) {
		//   alert('not support EXT_shader_texture_lod.');
		//   return;
		// }

		// this.renderer.gammaInput = false;
		// this.renderer.gammaOutput = false;

		const container = document.createElement( 'div' );
		document.body.appendChild( container );

		this.canvas = this.renderer.domElement;
		container.appendChild( this.canvas );

		// STATS

		this.stats = new Stats();
		container.appendChild( this.stats.dom );

	},

	initScene() {

		// scene itself
		this.scene = new THREE.Scene();

		// MARK: CAMERA

		this.camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 500 );
		this.camera.position.set( 0.0, 34.74, 61.33 );
		this.scene.add( this.camera );

		// MARK: RENDER TARGET

		// MARK: CONTROLS

		this.controls = new OrbitControls( this.camera, this.renderer.domElement );
		this.controls.target.set( 0, 13, 0 );
		this.controls.update();
		// this.controls.addEventListener('change', this.render);

		// MARK: LIGHTS

		// this.lights.ambient = new THREE.AmbientLight(0x333333);
		// this.scene.add(this.lights.ambient);

		this.lights.direct = new THREE.DirectionalLight( 0xffffff, 1.0 );
		this.scene.add( this.lights.direct );
		this.lights.directHelper = new THREE.DirectionalLightHelper( this.lights.direct, 0.5 );
		this.scene.add( this.lights.directHelper );

		// MARK: MATERIALS

		this.shader = new PIXY.Shader();
		this.shader.enable( 'DIRECTLIGHT', 1 );
		// this.shader.enable("POINTLIGHT", 1);
		this.shader.enable( 'STANDARD' );
		this.shader.enable( 'COLORMAP' );
		this.shader.enable( 'BUMPMAP' );
		this.shader.enable( 'ROUGHNESSMAP' );
		this.shader.enable( 'REFLECTION' );
		this.shader.build();
		// console.log(this.shader.uniforms);
		// console.log(this.shader._generateVertexShader());
		// console.log(this.shader._generateFragmentShader());

		// MARK: TEXTURES

		const loadTexture = function ( loader, path ) {

			return loader.load( path, function ( texture ) {

				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;

			} );

		};

		const textureLoader = new THREE.TextureLoader();
		this.textures.diffuse = loadTexture( textureLoader, 'assets/textures/brick_diffuse.jpg' );
		this.textures.normal = loadTexture( textureLoader, 'assets/textures/brick_bump.jpg' );
		this.textures.roughness = loadTexture( textureLoader, 'assets/textures/brick_roughness.jpg' );

		// MARK: ENVIRONMENT MAP

		const path = 'assets/textures/cube/skybox/';
		const urls = [ path + 'px.jpg', path + 'nx.jpg', path + 'py.jpg', path + 'ny.jpg', path + 'pz.jpg', path + 'nz.jpg' ];

		// const context = this;
		this.textures.envMap = new THREE.CubeTextureLoader().load( urls, function ( texture ) {

			texture.generateMipmaps = true;
			texture.needsUpdate = true;
			// context.scene.background = texture;

		} );

		this.shader.uniforms.tDiffuse.value = this.textures.diffuse;
		this.shader.uniforms.tNormal.value = this.textures.normal;
		this.shader.uniforms.tRoughness.value = this.textures.roughness;
		this.shader.uniforms.bumpiness.value = 0.01;
		this.shader.uniforms.tEnvMap.value = this.textures.envMap;

		// MARK: MODELS

		let geometry = new THREE.PlaneGeometry( 50, 50 );
		geometry.computeTangents();
		let mesh = new THREE.Mesh( geometry, this.shader.material );
		mesh.rotation.x = -Math.PI * 0.5;
		this.scene.add( mesh );

		mesh = new THREE.Mesh( geometry, this.shader.material );
		mesh.position.y = 25.0;
		mesh.position.z = -25.0;
		this.scene.add( mesh );

		mesh = new THREE.Mesh( geometry, this.shader.material );
		mesh.position.y = 25.0;
		mesh.position.z = 25.0;
		mesh.rotation.y = Math.PI;
		this.scene.add( mesh );

		mesh = new THREE.Mesh( geometry, this.shader.material );
		mesh.position.x = -25.0;
		mesh.position.y = 25.0;
		mesh.rotation.y = Math.PI * 0.5;
		this.scene.add( mesh );

		mesh = new THREE.Mesh( geometry, this.shader.material );
		mesh.position.x = 25.0;
		mesh.position.y = 25.0;
		mesh.rotation.y = -Math.PI * 0.5;
		this.scene.add( mesh );

		geometry = new THREE.SphereGeometry( 8, 32, 32 );
		geometry.computeTangents();
		mesh = new THREE.Mesh( geometry, this.shader.material );
		mesh.position.y = 15;
		this.scene.add( mesh );

		// this.postScene = new THREE.Scene();
		// this.postScene.add(new THREE.AxisHelper(20));

		// this.scene.add(new THREE.AxisHelper(10));
		// this.scene.add(new THREE.GridHelper(20,20));

	},

	initGui() {

		const results = PIXY.ShaderUtils.GenerateShaderParametersGUI( this.shader );
		this.gui = results.gui;
		this.parameters = results.parameters;
		this.parameters.depthView = false;

		this.parameters.ssaoLumInfluence = this.post.ssaoPass.uniforms.lumInfluence.value;
		this.parameters.ssaoRadius = this.post.ssaoPass.uniforms.radius.value;
		this.parameters.ssaoDiffArea = this.post.ssaoPass.uniforms.diffArea.value;
		this.parameters.ssaoGDisplace = this.post.ssaoPass.uniforms.gDisplace.value;

		this.parameters.ssao = true;
		this.parameters.ssaoOnly = false;
		const context = this;
		const h = this.gui.addFolder( 'SSAO' );
		h.add( this.parameters, 'ssao' ).onChange( function ( value ) {

			context.post.ssaoPass.enabled = value;
			context.post.copyPass.enabled = !value;

		} );
		h.add( this.parameters, 'ssaoOnly' ).onChange( function ( value ) {

			context.post.ssaoPass.uniforms.onlyAO.value = value;

		} );
		h.add( this.parameters, 'depthView' ).onChange( function ( value ) {

			context.post.ssaoPass.enabled = !value;
			context.post.viewPass.enabled = value;

		} );
		h.add( this.parameters, 'ssaoLumInfluence', 0.1, 1.0, 0.01 )
			.name( 'lumInfluence' )
			.onChange( function ( value ) {

				context.post.ssaoPass.uniforms.lumInfluence.value = value;

			} );
		h.add( this.parameters, 'ssaoDiffArea', 0.1, 1.0, 0.01 )
			.name( 'diffArea' )
			.onChange( function ( value ) {

				context.post.ssaoPass.uniforms.diffArea.value = value;

			} );
		h.add( this.parameters, 'ssaoGDisplace', 0.1, 1.0, 0.01 )
			.name( 'gDisplace' )
			.onChange( function ( value ) {

				context.post.ssaoPass.uniforms.gDisplace.value = value;

			} );

	},

	initPost() {

		this.post.depthTexture = new THREE.DepthTexture(this.canvas.width, this.canvas.height);
		// this.post.depthTexture.minFilter = THREE.NearestFilter;
		// this.post.depthTexture.magFilter = THREE.NearestFilter;
		// this.post.depthTexture.type = THREE.UnsignedShortType;

		const pars = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			generateMipmaps: false,
			stencilBuffer: false,
			depthTexture: this.post.depthTexture,
		};
		//
		// var parsF = {
		//   minFilter: THREE.LinearFilter,
		//   magFilter: THREE.LinearFilter,
		//   format: THREE.RGBAFormat,
		//   stencilBuffer: false,
		//   type: THREE.FloatType
		// };
		//

		this.post.rtScene = new THREE.WebGLRenderTarget( this.canvas.width, this.canvas.height, pars );
		this.post.ssaoPass = new PIXY.ShaderPass( PIXY.ShaderLib.ssao, 'tDiffuse' );
		this.post.ssaoPass.uniforms.tDepth.value = this.post.depthTexture;
		this.post.ssaoPass.uniforms.size.value = new THREE.Vector2( this.canvas.width, this.canvas.height );
		this.post.ssaoPass.uniforms.cameraNear.value = this.camera.near;
		this.post.ssaoPass.uniforms.cameraFar.value = this.camera.far;
		this.post.copyPass = new PIXY.CopyPass();
		this.post.copyPass.enabled = false;
		this.post.copyPass.uniforms.tDiffuse.value = this.post.depthTexture;
		this.post.viewPass = new PIXY.ShaderPass( PIXY.ShaderLib.view, 'dummy' );
		this.post.viewPass.uniforms.tDiffuse.value = this.post.depthTexture;
		this.post.viewPass.uniforms.type.value = PIXY.ViewDepth;
		this.post.viewPass.uniforms.cameraNear.value = this.camera.near;
		this.post.viewPass.uniforms.cameraFar.value = this.camera.far;
		this.post.viewPass.enabled = false;
		this.post.composer = new PIXY.Composer( this.renderer );
		this.post.composer.addPass( new PIXY.RenderPass( this.scene, this.camera ), null, this.post.rtScene );
		this.post.composer.addPass( this.post.copyPass, this.post.rtScene, null );
		this.post.composer.addPass( this.post.ssaoPass, this.post.rtScene, null );
		this.post.composer.addPass( this.post.viewPass, this.post.rtScene, null );

	},

	// function updateSSAO() {
	//   var rad = post.ssaoPass.uniforms.radius.value;
	//   var rad2 = rad*rad;
	//   var negInvRad2 = -1.0 / rad2;
	//
	//   var angleBias = PIXY.radians(post.ssaoPass.uniforms.angleBias.value);
	//   var tanAngleBias = Math.tan(angleBias);
	//
	//   var resX = canvas.width;
	//   var resY = canvas.height;
	//   // if (ssaoHalfResolution) {
	//   //   resX /= 2;
	//   //   resY /= 2;
	//   // }
	//
	//   var maxRadius = post.ssaoPass.maxRadius * Math.min(resX, resY);
	//   var invAoResX = 1.0 / resX;
	//   var invAoResY = 1.0 / resY;
	//   var focal1 = 1.0 / Math.tan(PIXY.radians(camera.fov)) * (resY / resX);
	//   var focal2 = 1.0 / Math.tan(PIXY.radians(camera.fov));
	//   var invFocal1 = 1.0/focal1;
	//   var invFocal2 = 1.0/focal2;
	//   var uvToVA0 = 2.0 * invFocal1;
	//   var uvToVA1 = -2.0 * invFocal2;
	//   var uvToVB0 = -1.0 * invFocal1;
	//   var uvToVB1 = 1.0 * invFocal2;
	//
	//   post.ssaoPass.uniforms.radiusParams.value.set(rad, rad2, negInvRad2, maxRadius);
	//   post.ssaoPass.uniforms.biasParams.value.set(angleBias, tanAngleBias, post.ssaoPass.uniforms.strength.value, 1.0);
	//   post.ssaoPass.uniforms.screenParams.value.set(resX, resY, invAoResX, invAoResY);
	//   post.ssaoPass.uniforms.uvToViewParams.value.set(uvToVA0, uvToVA1, uvToVB0, uvToVB1);
	//   post.ssaoPass.uniforms.focalParams.value.set(focal1, focal2, invFocal1, invFocal2);
	//   post.ssaoPass.uniforms.cameraNearFar.value.set(camera.near, camera.far);
	//
	//   var INV_LN2 = 1.44269504;
	//   var SQRT_LN2 = 0.832554611;
	//   var blurSigma = (4.0 + 1.0) * 0.5;
	//   var blurFalloff = INV_LN2 / (2.0 * blurSigma * blurSigma);
	//   var blurDepthThreshold = 2.0 * SQRT_LN2 * 0.2;
	//   var texSizeInvWidth = 1.0 / canvas.width;
	//   var texSizeInvHeight = 1.0 / canvas.height;
	//   post.ssaoBlurHPass.uniforms.blurParams.value.set(texSizeInvWidth, 0.0, blurFalloff, 1.0);
	//   post.ssaoBlurVPass.uniforms.blurParams.value.set(0.0, texSizeInvWidth, blurFalloff, 1.0);
	// }

	animate() {

		this.time += this.clock.getDelta();
		requestAnimationFrame( this.animate.bind( this ) );
		this.render();

	},

	render() {

		if ( !this.ready ) return;

		this.stats.update();

		this.lights.direct.position.copy( this.shader.uniforms.directLights.value[ 0 ].direction );
		this.lights.direct.position.transformDirection( this.camera.matrixWorld );
		this.lights.direct.position.multiplyScalar( 5.0 );
		this.lights.direct.color.copy( this.shader.uniforms.directLights.value[ 0 ].color );
		this.lights.directHelper.update();

		this.camera.updateMatrix();
		this.camera.updateMatrixWorld();
		this.camera.updateProjectionMatrix();
		this.camera.matrixWorldInverse.copy( this.camera.matrixWorld ).invert();

		var viewProjectionInverse = new THREE.Matrix4();
		viewProjectionInverse.copy( this.camera.projectionMatrix );
		viewProjectionInverse.multiply( this.camera.matrixWorldInverse );
		// post.ssaoPass.uniforms.projectionInverse.value.getInverse(viewProjectionInverse);
		// post.ssaoPass.uniforms.projectionInverse.value.getInverse(camera.projectionMatrix);

		PIXY.ShaderUtils.UpdateShaderParameters( this.shader, this.parameters, this.camera );

		this.renderer.setClearColor( 0x0 );
		this.renderer.setClearAlpha( 0 );
		// this.renderer.render(scene, camera, post.rtScene);

		// this.post.ssaoPass.uniforms.cameraNear.value = camera.near;
		// this.post.ssaoPass.uniforms.cameraFar.value = camera.far;
		this.post.composer.render();

		/// LIGHT PASS

		// this.renderer.autoClear = false;
		// this.renderer.render(this.deferred.scene, this.deferred.camera);
		// this.renderer.render(this.deferred.scene, this.deferred.camera, this.post.rtScene);

		/// BLOOM + TONE MAPPING

		// this.post.bloomPass.enabled = this.parameters.bloom;
		// this.post.bloomPass.strength = this.parameters.bloomStrength;
		// this.post.bloomPass.radius = this.parameters.bloomRadius;
		// this.post.bloomPass.threshold = this.parameters.bloomThreshold;
		// this.post.toneMapPass.enabled = this.parameters.toneMapping;
		// this.post.toneMapPass.uniforms.exposure.value = this.parameters.exposure;
		// this.post.toneMapPass.uniforms.whitePoint.value = this.parameters.whitePoint;
		// this.post.copyPass.enabled = !parameters.toneMapping;
		// this.post.composer.render();

		/// POST PASS

		// this.renderer.autoClear = false;
		// this.renderer.clearDepth();
		// this.renderer.render(this.postScene, this.camera);

		/// DEBUG VIEW PASS

		// this.renderer.clearDepth();
		// for (var i=0; i<deferred.views.length; ++i) {
		//   this.deferred.viewShader.uniforms.tDiffuse.value = this.deferred.views[i].texture;
		//   this.deferred.viewShader.uniforms.type.value = this.deferred.views[i].type;
		//   this.deferred.viewShader.uniforms.cameraNear.value = this.camera.near;
		//   this.deferred.viewShader.uniforms.cameraFar.value = this.camera.far;
		//   this.deferred.views[i].sprite.render(renderer);
		// }
		//
		// this.renderer.autoClear = true;

	},
};

app.init();
app.animate();

// EVENTS

window.addEventListener( 'resize', onWindowResize, false );

// EVENT HANDLERS

function onWindowResize() {

	app.renderer.setSize( window.innerWidth, window.innerHeight );

	app.camera.aspect = window.innerWidth / window.innerHeight;
	app.camera.updateProjectionMatrix();

	app.render();

}

THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {

	let bar = 250;
	bar = Math.floor( ( bar * loaded ) / total );
	document.getElementById( 'bar' ).style.width = bar + 'px';

	console.log( item, loaded, total );

	if ( loaded == total ) {

		app.ready = true;
		document.getElementById( 'message' ).style.display = 'none';
		document.getElementById( 'progressbar' ).style.display = 'none';
		document.getElementById( 'progress' ).style.display = 'none';
		console.log( 'ready' );

	}

};
