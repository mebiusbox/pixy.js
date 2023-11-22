const fs = require( 'fs-extra' );

fs.copy( 'node_modules/three/examples/jsm', 'samples/jsm', err => {

	if ( err ) return console.error( err );

} );

const dirname = 'node_modules/three/build';
fs.copy( dirname, 'samples/jsm', {
	filter: ( src, _dst ) => {

		if ( dirname === src ) return true;
		return src.endsWith( '.js' );

	}
},
err => {

	if ( err ) return console.error( err );

} );
