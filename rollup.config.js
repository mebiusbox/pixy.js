import terser from '@rollup/plugin-terser';

function glsl() {

	return {
		transform( code, id ) {

			if ( /\.glsl$/.test( id ) === false ) return;

			var transformedCode = 'export default ' +	JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' )
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
					.replace( /\n{2,}/g, '\n' )
			) +	';';
			return {
				code: transformedCode,
				map: { mappings: '' },
			};

		},
	};

}

const externals = [
	'three',
	'three/addons/libs/lil-gui.module.min.js',
];

const globals = {
	'three': 'THREE',
	'three/addons/libs/lil-gui.module.min.js': 'GUI',
};

const builds = [
	{
		input: 'samples/fxgen.js',
		plugins: [ terser() ],
		output: [
			{
				format: 'esm',
				file: 'samples/fxgen.module.min.js',
			},
		],
		external: [
			...externals,
			'pixy',
			'three/addons/capabilities/WebGL.js',
			'three/addons/libs/stats.module.js',
			'three/addons/libs/lil-gui.module.min.js',
			'three/addons/shaders/CopyShader.js',
			'three/addons/controls/OrbitControls.js'
		],
	},
	{
		input: 'src/pixy.js',
		plugins: [ glsl() ],
		output: [
			{
				format: 'esm',
				file: 'build/pixy.module.js',
			},
		],
		external: externals,
	},
	{
		input: 'src/pixy.js',
		plugins: [ glsl(), terser() ],
		output: [
			{
				format: 'esm',
				file: 'build/pixy.module.min.js',
			},
		],
		external: externals,
	},
	{
		input: 'src/pixy.js',
		plugins: [ glsl() ],
		output: [
			{
				format: 'cjs',
				name: 'PIXY',
				indent: '\t',
				file: 'build/pixy.cjs',
			},
		],
		external: externals,
	},
	{
		// @deprecated
		input: 'src/pixy.js',
		plugins: [ glsl() ],
		output: [
			{
				format: 'umd',
				name: 'PIXY',
				indent: '\t',
				file: 'build/pixy.js',
				globals: globals,
			},
		],
		external: externals,
	},
	{
		// @deprecated
		input: 'src/pixy.js',
		plugins: [ glsl(), terser() ],
		output: [
			{
				format: 'umd',
				name: 'PIXY',
				file: 'build/pixy.min.js',
				globals: globals,
			},
		],
		external: externals,
	},
];

export default ( _args ) => builds;
