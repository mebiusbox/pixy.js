if ( THREE.WEBGL.isWebGLAvailable() === false ) {

	document.body.appendChild( THREE.WEBGL.getWebGLErrorMessage() );

}

var camera, controls, scene, postScene, renderer, canvas;
var deferred = {};
var stats,
	clock = new THREE.Clock();
var numMaxLights = 300;
var lights = [];
var textures = {};
var objects = {};
var post = {};
var shader;
var gui, parameters;
var ready = false;
var time = 0.0;

init();
// render();
animate();

function init() {

	initGraphics();
	initDeferred();
	initScene();
	initPost();
	initGui();

	// EVENTS

	window.addEventListener( 'resize', onWindowResize, false );

	THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {

		var bar = 250;
		bar = Math.floor( ( bar * loaded ) / total );
		document.getElementById( 'bar' ).style.width = bar + 'px';

		console.log( item, loaded, total );

		if ( loaded == total ) {

			ready = true;
			document.getElementById( 'message' ).style.display = 'none';
			document.getElementById( 'progressbar' ).style.display = 'none';
			document.getElementById( 'progress' ).style.display = 'none';
			console.log( 'ready' );

		}

	};

}

function initGraphics() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// RENDERER

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0x999999 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	if ( !renderer.extensions.get( 'OES_texture_float' ) ) {

		alert( 'No OES_texture_float support for float textures.' );
		return;

	}

	if ( !renderer.extensions.get( 'WEBGL_draw_buffers' ) ) {

		alert( 'not support WEBGL_draw_buffers.' );
		return;

	}

	if ( !renderer.extensions.get( 'EXT_shader_texture_lod' ) ) {

		alert( 'not support EXT_shader_texture_lod.' );
		return;

	}

	// renderer.gammaInput = false;
	// renderer.gammaOutput = false;

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	canvas = renderer.domElement;
	container.appendChild( canvas );

	// STATS

	stats = new Stats();
	container.appendChild( stats.dom );

}

function initScene() {

	// scene itself
	scene = new THREE.Scene();

	// MARK: CAMERA

	camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 500 );
	camera.position.set( 0.0, 34.74, 61.33 );
	scene.add( camera );

	// MARK: RENDER TARGET

	renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
	renderTarget.texture.format = THREE.RGBFormat;
	( renderTarget.texture.minFilter = THREE.NearestFilter ),
	( renderTarget.texture.magFilter = THREE.NearestFilter ),
	( renderTarget.texture.generateMipmaps = false );
	renderTarget.stencilBuffer = false;
	renderTarget.depthBuffer = true;
	renderTarget.depthTexture = new THREE.DepthTexture();
	renderTarget.depthTexture.type = THREE.UnsignedShortType;

	// MARK: CONTROLS

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 13, 0 );
	controls.update();
	// controls.addEventListener('change', render);

	// MARK: LIGHTS

	// lights.ambient = new THREE.AmbientLight(0x333333);
	// scene.add(lights.ambient);

	// lights.direct = new THREE.DirectionalLight(0xFFFFFF, 1.0);
	// scene.add(lights.direct);
	// lights.directHelper = new THREE.DirectionalLightHelper(lights.direct, 0.5);
	// scene.add(lights.directHelper);

	// MARK: MATERIALS

	// MARK: TEXTURES

	var loadTexture = function ( loader, path ) {

		return loader.load( path, function ( texture ) {

			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;

		} );

	};

	var textureLoader = new THREE.TextureLoader();
	textures.diffuse = loadTexture( textureLoader, 'assets/textures/brick_diffuse.jpg' );
	textures.normal = loadTexture( textureLoader, 'assets/textures/brick_bump.jpg' );
	textures.roughness = loadTexture( textureLoader, 'assets/textures/brick_roughness.jpg' );

	// MARK: ENVIRONMENT MAP

	var path = 'assets/textures/cube/skybox/';
	var urls = [ path + 'px.jpg', path + 'nx.jpg', path + 'py.jpg', path + 'ny.jpg', path + 'pz.jpg', path + 'nz.jpg' ];

	textures.envMap = new THREE.CubeTextureLoader().load( urls, function ( texture ) {

		texture.generateMipmaps = true;
		texture.needsUpdate = true;
		// scene.background = texture;

	} );

	deferred.geometryShader.uniforms.tDiffuse.value = textures.diffuse;
	deferred.geometryShader.uniforms.tNormal.value = textures.normal;
	deferred.geometryShader.uniforms.tRoughness.value = textures.roughness;
	deferred.geometryShader.uniforms.bumpiness.value = 0.01;
	deferred.lightShader.uniforms.tEnvMap.value = textures.envMap;

	// MARK: MODELS

	geometry = new THREE.PlaneBufferGeometry( 50, 50 );
	THREE.BufferGeometryUtils.computeTangents( geometry );
	mesh = new THREE.Mesh( geometry, deferred.geometryShader.material );
	mesh.rotation.x = -Math.PI * 0.5;
	scene.add( mesh );

	mesh = new THREE.Mesh( geometry, deferred.geometryShader.material );
	mesh.position.y = 25.0;
	mesh.position.z = -25.0;
	scene.add( mesh );

	mesh = new THREE.Mesh( geometry, deferred.geometryShader.material );
	mesh.position.y = 25.0;
	mesh.position.z = 25.0;
	mesh.rotation.y = Math.PI;
	scene.add( mesh );

	mesh = new THREE.Mesh( geometry, deferred.geometryShader.material );
	mesh.position.x = -25.0;
	mesh.position.y = 25.0;
	mesh.rotation.y = Math.PI * 0.5;
	scene.add( mesh );

	mesh = new THREE.Mesh( geometry, deferred.geometryShader.material );
	mesh.position.x = 25.0;
	mesh.position.y = 25.0;
	mesh.rotation.y = -Math.PI * 0.5;
	scene.add( mesh );

	geometry = new THREE.SphereBufferGeometry( 8, 32, 32 );
	THREE.BufferGeometryUtils.computeTangents( geometry );
	mesh = new THREE.Mesh( geometry, deferred.geometryShader.material );
	mesh.position.y = 15;
	scene.add( mesh );

	postScene = new THREE.Scene();
	// postScene.add(new THREE.AxisHelper(20));

	var geo = new THREE.SphereBufferGeometry( 1.0, 8, 8 );
	var numLights = 200;
	for ( var i = 0; i < numLights; ++i ) {

		var light = {};
		light.position = new THREE.Vector3();
		light.position.x = Math.random() * 50.0 - 25.0;
		light.position.y = 10.0 + Math.random() * 10.0;
		light.position.z = Math.random() * 50.0 - 25.0;
		light.color = new THREE.Color();
		light.color.setRGB( Math.random(), Math.random(), Math.random() );
		light.time = Math.random() * Math.PI;
		light.mesh = new THREE.Mesh( geo, new THREE.MeshBasicMaterial( { color: light.color.getHex(), wireframe: true } ) );
		light.mesh.position.copy( light.position );
		light.mesh.scale.multiplyScalar( 0.1 );
		postScene.add( light.mesh );
		lights.push( light );

	}

	// scene.add(new THREE.AxisHelper(10));
	// scene.add(new THREE.GridHelper(20,20));

}

function initDeferred() {

	deferred.depthTexture = new THREE.DepthTexture();

	var pars = {
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		generateMipmaps: false,
		stencilBuffer: false,
		depthTexture: deferred.depthTexture,
	};

	// gbuf
	deferred.gbuf = new THREE.WebGLMultiRenderTarget( window.innerWidth, window.innerHeight, pars );
	deferred.gbuf.attachments.push( deferred.gbuf.texture.clone() );
	deferred.gbuf.attachments[ 0 ].name = 'normal';
	deferred.gbuf.attachments[ 1 ].name = 'albedo+roughness';

	deferred.geometryShader = new PIXY.Shader();
	deferred.geometryShader.enable( 'DEFERRED_GEOMETRY' );
	deferred.geometryShader.build();
	// console.log(deferred.geometryShader.uniforms);
	// console.log(deferred.geometryShader._generateVertexShader());
	// console.log(deferred.geometryShader._generateFragmentShader());

	deferred.lightShader = new PIXY.Shader();
	deferred.lightShader.enable( 'DEFERRED_LIGHT' );
	deferred.lightShader.build( { defines: { NUM_POINT_LIGHT: numMaxLights } } );
	deferred.lightShader.uniforms.gbuf0.value = deferred.gbuf.attachments[ 0 ];
	deferred.lightShader.uniforms.gbuf1.value = deferred.gbuf.attachments[ 1 ];
	deferred.lightShader.uniforms.tDepth.value = deferred.depthTexture;
	// console.log(deferred.lightShader.uniforms);
	// console.log(deferred.lightShader._generateVertexShader());
	// console.log(deferred.lightShader._generateFragmentShader());

	for ( var i = 0; i < numMaxLights; ++i ) {

		deferred.lightShader.uniforms.pointLights.value.push( {
			position: new THREE.Vector3(),
			color: new THREE.Color(),
		} );

	}

	deferred.scene = new THREE.Scene();
	deferred.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	deferred.scene.add( new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), deferred.lightShader.material ) );

	deferred.viewShader = new PIXY.Shader();
	deferred.viewShader.enable( 'VIEW' );
	deferred.viewShader.build( { depthTest: false, depthWrite: false } );
	// console.log(deferred.viewShader.uniforms);
	// console.log(deferred.viewShader._generateVertexShader());
	// console.log(deferred.viewShader._generateFragmentShader());

	deferred.views = [];

	function createView( x, y, texture, type ) {

		var sprite = new PIXY.ScreenSprite( deferred.viewShader.material, canvas );
		sprite.position.set( x, y );
		sprite.size.set( 100, 100 );
		sprite.update();
		return { sprite: sprite, texture: texture, type: type };

	}

	// deferred.views.push(createView(10, 10, deferred.gbuf.attachments[2], 6));
	deferred.views.push( createView( 10, 10, deferred.depthTexture, PIXY.ViewDepth ) );
	// deferred.views.push(createView(10, 10, deferred.gbuf.attachments[0], 1));
	deferred.views.push( createView( 10, 120, deferred.gbuf.attachments[ 0 ], PIXY.ViewRGB ) );
	deferred.views.push( createView( 10, 230, deferred.gbuf.attachments[ 1 ], PIXY.ViewAlpha ) );
	deferred.views.push( createView( 10, 340, deferred.gbuf.attachments[ 1 ], PIXY.ViewRGB ) );
	// deferred.views.push(createView(10, 450, deferred.gbuf.attachments[2], 0));
	// deferred.views.push(createView(120, 10, deferred.lbuf.attachments[0], 0));
	// deferred.views.push(createView(120, 120, deferred.lbuf.attachments[1], 0));

}

function initGui() {

	parameters = {
		metalness: 0.5,
		cutoffDistance: 25.0,
		decay: 2.0,
		numLights: 50,
		bumpiness: 0.3,
		reflectionStrength: 1.0,
		aoStrength: 1.0,
		aoPower: 1.0,
		bloom: true,
		bloomStrength: 1.5,
		bloomRadius: 0.4,
		bloomThreshold: 0.85,
		toneMapping: true,
		exposure: 3.0,
		whitePoint: 5.0,
		debug: false,
	};

	var gui = new dat.GUI();
	gui.add( parameters, 'metalness', 0.0, 1.0 );
	gui.add( parameters, 'cutoffDistance', 1.0, 50.0 );
	gui.add( parameters, 'decay', 1.0, 10.0 );
	gui.add( parameters, 'numLights', 1, 200 );
	gui.add( parameters, 'bumpiness', 0.0, 1.0 );
	gui.add( parameters, 'reflectionStrength', 0.0, 2.0 );
	gui.add( parameters, 'bloom' );
	gui.add( parameters, 'bloomRadius', 0.0, 2.0 );
	gui.add( parameters, 'bloomStrength', 0.0, 5.0 );
	gui.add( parameters, 'bloomThreshold', 0.0, 1.0 );
	gui.add( parameters, 'toneMapping' );
	gui.add( parameters, 'exposure', 0.0, 10.0 );
	gui.add( parameters, 'whitePoint', 0.0, 10.0 );
	gui.add( parameters, 'debug' );

	// results = PIXY.ShaderUtils.GenerateShaderParametersGUI(shader);
	// gui = results.gui;
	// parameters = results.parameters;

}

function initPost() {

	var pars = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false,
	};

	var parsF = {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBAFormat,
		stencilBuffer: false,
		type: THREE.FloatType,
	};

	post.rtScene = new THREE.WebGLRenderTarget( canvas.width, canvas.height, parsF );
	post.rtBloom = new THREE.WebGLRenderTarget( canvas.width, canvas.height, parsF );
	post.copyPass = new PIXY.CopyPass();
	post.copyPass.uniforms.tDiffuse.value = post.rtScene.texture;
	post.bloomPass = new PIXY.UnrealBloomPass( new THREE.Vector2( canvas.width, canvas.height ), 1.5, 0.4, 0.85 );
	post.toneMapPass = new PIXY.ShaderPass( PIXY.ShaderLib.toneMap );
	post.toneMapPass.uniforms.tDiffuse.value = post.rtScene.texture;
	post.composer = new PIXY.Composer( renderer );
	post.composer.addPass( post.bloomPass, post.rtScene, post.rtScene );
	post.composer.addPass( post.toneMapPass, post.rtScene, null );
	post.composer.addPass( post.copyPass, post.rtScene, null );

}

// EVENT HANDLERS

function onWindowResize() {

	renderer.setSize( window.innerWidth, window.innerHeight );

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	render();

}

function animate() {

	time += clock.getDelta();
	requestAnimationFrame( animate, renderer.domElement );
	render();

}

function render() {

	if ( !ready ) return;

	stats.update();

	camera.updateMatrix(); // update local matrix
	camera.updateMatrixWorld(); // update world matrix
	camera.updateProjectionMatrix();
	camera.matrixWorldInverse.getInverse( camera.matrixWorld );

	var viewProjection = new THREE.Matrix4();
	viewProjection.identity();
	viewProjection.multiply( camera.projectionMatrix );
	viewProjection.multiply( camera.matrixWorldInverse );

	var pos = new THREE.Vector3();
	for ( var i = 0; i < lights.length; ++i ) {

		pos.copy( lights[ i ].position );
		pos.x += Math.sin( time + lights[ i ].time ) * 5.0;
		pos.y += Math.sin( time + lights[ i ].time * 2.0 ) * 10.0;
		pos.z += Math.cos( time + lights[ i ].time ) * 5.0;
		deferred.lightShader.uniforms.pointLights.value[ i ].position.copy( pos );
		deferred.lightShader.uniforms.pointLights.value[ i ].color.copy( lights[ i ].color );

		if ( i < parameters.numLights ) {

			lights[ i ].mesh.position.copy( pos );
			lights[ i ].mesh.visible = true;

		} else {

			lights[ i ].mesh.visible = false;

		}

	}

	deferred.geometryShader.uniforms.bumpiness.value = parameters.bumpiness;
	deferred.lightShader.uniforms.numPointLights.value = parameters.numLights;
	deferred.lightShader.uniforms.cutoffDistance.value = parameters.cutoffDistance;
	deferred.lightShader.uniforms.decayExponent.value = parameters.decay;
	deferred.lightShader.uniforms.viewInverse.value.copy( camera.matrixWorld );
	deferred.lightShader.uniforms.viewProjectionInverse.value.getInverse( viewProjection );
	deferred.lightShader.uniforms.viewPosition.value.copy( camera.position );
	deferred.lightShader.uniforms.metalness.value = parameters.metalness;
	deferred.lightShader.uniforms.reflectionStrength.value = parameters.reflectionStrength;

	/// GEOMETRY PASS

	renderer.setClearColor( 0x0 );
	renderer.setClearAlpha( 0 );
	renderer.render( scene, camera, deferred.gbuf );

	/// LIGHT PASS

	// renderer.autoClear = false;
	// renderer.render(deferred.scene, deferred.camera);
	renderer.render( deferred.scene, deferred.camera, post.rtScene );

	/// BLOOM + TONE MAPPING

	post.bloomPass.enabled = parameters.bloom;
	post.bloomPass.strength = parameters.bloomStrength;
	post.bloomPass.radius = parameters.bloomRadius;
	post.bloomPass.threshold = parameters.bloomThreshold;
	post.toneMapPass.enabled = parameters.toneMapping;
	post.toneMapPass.uniforms.exposure.value = parameters.exposure;
	post.toneMapPass.uniforms.whitePoint.value = parameters.whitePoint;
	post.copyPass.enabled = !parameters.toneMapping;
	post.composer.render();

	/// POST PASS

	renderer.autoClear = false;
	renderer.clearDepth();
	renderer.render( postScene, camera );

	/// DEBUG VIEW PASS

	renderer.clearDepth();
	for ( var i = 0; i < deferred.views.length; ++i ) {

		deferred.viewShader.uniforms.tDiffuse.value = deferred.views[ i ].texture;
		deferred.viewShader.uniforms.type.value = deferred.views[ i ].type;
		deferred.viewShader.uniforms.cameraNear.value = camera.near;
		deferred.viewShader.uniforms.cameraFar.value = camera.far;
		deferred.views[ i ].sprite.render( renderer );

	}

	renderer.autoClear = true;

}
