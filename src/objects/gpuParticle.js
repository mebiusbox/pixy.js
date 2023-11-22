import * as THREE from 'three';
const GPUParticleShader = {
	uniforms: {
		tDiffuse: { value: null },
		time: { value: 0.0 },
		timeRange: { value: 5.0 },
		color: { value: new THREE.Color( 1, 1, 1 ) },
		opacity: { value: 1.0 },
		particleSize: { value: 0.75 },
		screenWidth: { value: window.innerWidth },
		timeOffset: { value: 0.0 },
		numFrames: { value: 1 },
		frameDuration: { value: 1 },
		additiveFactor: { value: 0 },
		viewSize: { value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
		tDepth: { value: null },
		cameraNearFar: { value: new THREE.Vector2( 1, 100 ) },
	},

	vertexShader: [
		'precision highp float;',

		'uniform mat4 modelViewMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform float time;',
		'uniform float timeRange;',
		'uniform float timeOffset;',
		'uniform float particleSize;',
		'uniform float screenWidth;',

		'attribute vec3 position;',
		'attribute vec4 velocitySpinStart;',
		'attribute vec4 accelerationSpinSpeed;',
		'attribute vec4 startSizeEndSizeStartTimeLifeTime;',

		'varying vec4 vSpinLifeTime;',
		'varying vec4 vClipPosition;',

		'void main() {',
		'  float startSize = startSizeEndSizeStartTimeLifeTime.x;',
		'  float endSize = startSizeEndSizeStartTimeLifeTime.y;',
		'  float startTime = startSizeEndSizeStartTimeLifeTime.z;',
		'  float lifeTime = startSizeEndSizeStartTimeLifeTime.w;',
		'  vec3 velocity = velocitySpinStart.xyz;',
		'  float spinStart = velocitySpinStart.w;',
		'  vec3 acceleration = accelerationSpinSpeed.xyz;',
		'  float spinSpeed = accelerationSpinSpeed.w;',

		'  float localTime = mod((time - timeOffset - startTime), timeRange);',
		'  float percentLife = localTime / lifeTime;',

		'  vec3 newPosition = position + velocity * localTime + acceleration * localTime * localTime;',
		'  vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);',
		'  gl_Position = projectionMatrix * mvPosition;',
		'  vClipPosition = gl_Position;',

		'  float currentSize = particleSize * mix(startSize, endSize, percentLife);',
		'  currentSize *= step(0.0, percentLife);',
		'  currentSize *= step(-1.0, -percentLife);',
		'  if (currentSize == 0.0) gl_Position = vec4(-100000000.0);',

		'  vec4 projectedCorner = projectionMatrix * vec4(currentSize, currentSize, mvPosition.z, mvPosition.w);',
		'  gl_PointSize = screenWidth * projectedCorner.x / projectedCorner.w;',
		'  percentLife *= step(0.0, percentLife);',
		'  percentLife *= step(-1.0, -percentLife);',
		'  vSpinLifeTime = vec4(spinStart, spinSpeed, percentLife, localTime);',
		'}',
	].join( '\n' ),

	fragmentShader: [
		'precision highp float;',

		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tDepth;',
		'uniform vec3 color;',
		'uniform float opacity;',
		'uniform float time;',
		'uniform float numFrames;',
		'uniform float frameDuration;',
		'uniform vec2 cameraNearFar;',
		'uniform vec2 viewSize;',
		'uniform float additiveFactor;',

		'varying vec4 vSpinLifeTime;',
		'varying vec4 vClipPosition;',

		'float linearizeDepth(float depth, vec2 cameraNearFar) {',
		'  return -cameraNearFar.y * cameraNearFar.x / (depth * (cameraNearFar.y - cameraNearFar.x) - cameraNearFar.y);',
		'}',

		'void main() {',
		'  float spinStart = vSpinLifeTime.x;',
		'  float spinSpeed = vSpinLifeTime.y;',
		'  float percentLife = vSpinLifeTime.z;',
		'  float localTime = vSpinLifeTime.w;',

		'  const float frameStart = 0.0;',
		'  vec2 texcoord = vec2(gl_PointCoord.x, 1.0-gl_PointCoord.y)-0.5;',
		'  float s = sin(spinStart + spinSpeed * time);',
		'  float c = cos(spinStart + spinSpeed * time);',
		'  vec2 rotatedCoord1 = vec2(texcoord.x * c + texcoord.y * s, -texcoord.x * s + texcoord.y * c) + 0.5;',
		'  rotatedCoord1 = clamp(rotatedCoord1, 0.0, 1.0);',
		// "  vec2 rotatedCoord2 = rotatedCoord1;",

		'  float frame1 = mod(floor(localTime / frameDuration + frameStart), numFrames);',
		'  float uOffset1 = frame1 / numFrames;',
		'  rotatedCoord1.x = uOffset1 + (rotatedCoord1.x) * (1.0 / numFrames);',
		'  vec4 pixel1 = texture2D(tDiffuse, rotatedCoord1);',
		// "  pixel1.xyz *= pixel1.xyz;",

		// INTERPORATE PARTICLE FRAMES
		// "  float frame2 = mod(floor(localTime / frameDuration + frameStart + 1.0), numFrames);",
		// "  float uOffset2 = frame2 / numFrames;",
		// "  float frameTime = fract(localTime / frameDuration + frameStart);",
		// "  rotatedCoord2.x = uOffset2 + rotatedCoord2.x * (1.0 / numFrames);",
		// "  vec4 pixel2 = texture2D(tDiffuse, rotatedCoord2);",
		// "  pixel2.xyz *= pixel2.xyz;",
		// "  pixel1 = mix(pixel1, pixel2, frameTime);",

		'  if (pixel1.a < 0.001) discard;',

		'  vec2 screenCoord = gl_FragCoord.xy / viewSize;',
		'  float myDepth = vClipPosition.z / vClipPosition.w;',
		'  float myLinearDepth = linearizeDepth(myDepth, cameraNearFar);',
		'  float sceneDepth = texture2D(tDepth, screenCoord).x * 2.0 - 1.0;',
		'  float sceneLinearDepth = linearizeDepth(sceneDepth, cameraNearFar);',
		'  const float scale = 0.1;',
		'  float zFade = clamp(scale * abs(myLinearDepth - sceneLinearDepth), 0.0, 1.0);',
		'  if (myDepth > sceneDepth) discard;',

		'  vec4 particleColor = pixel1 * vec4(color, opacity);',
		'  particleColor.a *= zFade;',
		'  gl_FragColor = particleColor;',
		'}',
	].join( '\n' ),
};

class GPUParticle extends THREE.Points {

	constructor( numParticles, initCallback ) {

		const geo = new THREE.BufferGeometry();
		const positions = new Float32Array( numParticles * 3 );
		const velocitySpinStartArray = new Float32Array( numParticles * 4 );
		const accelerationSpinSpeedArray = new Float32Array( numParticles * 4 );
		const startSizeEndSizeStartTimeLifeTimeArray = new Float32Array( numParticles * 4 );

		const pars = {
			position: new THREE.Vector3(),
			velocity: new THREE.Vector3(),
			acceleration: new THREE.Vector3(),
			spinStart: 0,
			spinSpeed: 0,
			startSize: 1,
			endSize: 1,
			startTime: 0,
			lifeTime: 1,
		};

		let ofs3 = 0;
		let ofs4 = 0;
		for ( let i = 0; i < numParticles; ++i ) {

			initCallback( i, pars );

			positions[ ofs3 + 0 ] = pars.position.x;
			positions[ ofs3 + 1 ] = pars.position.y;
			positions[ ofs3 + 2 ] = pars.position.z;

			velocitySpinStartArray[ ofs4 + 0 ] = pars.velocity.x;
			velocitySpinStartArray[ ofs4 + 1 ] = pars.velocity.y;
			velocitySpinStartArray[ ofs4 + 2 ] = pars.velocity.z;

			accelerationSpinSpeedArray[ ofs4 + 0 ] = pars.acceleration.x;
			accelerationSpinSpeedArray[ ofs4 + 1 ] = pars.acceleration.y;
			accelerationSpinSpeedArray[ ofs4 + 2 ] = pars.acceleration.z;

			velocitySpinStartArray[ ofs4 + 3 ] = pars.spinStart;
			accelerationSpinSpeedArray[ ofs4 + 3 ] = pars.spinSpeed;

			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 0 ] = pars.startSize;
			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 1 ] = pars.endSize;
			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 2 ] = pars.startTime;
			startSizeEndSizeStartTimeLifeTimeArray[ ofs4 + 3 ] = pars.lifeTime;

			ofs3 += 3;
			ofs4 += 4;

		}

		geo.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geo.setAttribute( 'velocitySpinStart', new THREE.BufferAttribute( velocitySpinStartArray, 4 ) );
		geo.setAttribute( 'accelerationSpinSpeed', new THREE.BufferAttribute( accelerationSpinSpeedArray, 4 ) );
		geo.setAttribute(
			'startSizeEndSizeStartTimeLifeTime',
			new THREE.BufferAttribute( startSizeEndSizeStartTimeLifeTimeArray, 4 )
		);

		const material = new THREE.RawShaderMaterial( {
			uniforms: THREE.UniformsUtils.clone( GPUParticleShader.uniforms ),
			vertexShader: GPUParticleShader.vertexShader,
			fragmentShader: GPUParticleShader.fragmentShader,
			transparent: true,
			depthTest: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		} );

		super( geo, material );

	}

}

export { GPUParticle };
