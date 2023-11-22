import * as THREE from 'three';
export const FxgenShaderUtils = {

	SetShaderParameter( uniforms, key, value ) {

		if ( key in uniforms ) {

			if ( uniforms[ key ].value instanceof THREE.Color ) {

				if ( value instanceof THREE.Color ) {

					uniforms[ key ].value.copy( value );

				} else {

					uniforms[ key ].value.copy( new THREE.Color( value ) );

				}

			} else if (
				uniforms[ key ].value instanceof THREE.Color ||
				uniforms[ key ].value instanceof THREE.Vector2 ||
				uniforms[ key ].value instanceof THREE.Vector3 ||
				uniforms[ key ].value instanceof THREE.Vector4 ||
				uniforms[ key ].value instanceof THREE.Matrix3 ||
				uniforms[ key ].value instanceof THREE.Matrix4
			) {

				uniforms[ key ].value.copy( value );

			} else if ( uniforms[ key ].value instanceof THREE.CubeTexture || uniforms[ key ].value instanceof THREE.Texture ) {

				uniforms[ key ].value = value;

			} else if ( uniforms[ key ].value instanceof Array ) {

				for ( let i = 0; i < value.length; ++i ) {

					uniforms[ key ].value[ i ] = value[ i ];

				}

			} else {

				uniforms[ key ].value = value;

			}

		}

	},

	SetShaderArrayParameter( uniforms, arrayKey, index, key, value ) {

		if ( arrayKey in uniforms ) {

			if ( key in uniforms[ arrayKey ].value[ index ] ) {

				if (
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.Color ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.Vector2 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.Vector3 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.Vector4 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.Matrix3 ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.Matrix4
				) {

					uniforms[ arrayKey ].value[ index ][ key ].copy( value );

				} else if (
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.CubeTexture ||
					uniforms[ arrayKey ].value[ index ][ key ] instanceof THREE.Texture
				) {

					uniforms[ arrayKey ].value[ index ][ key ] = value;

				} else if ( uniforms[ arrayKey ].value[ index ][ key ] instanceof Array ) {

					for ( let i = 0; i < value.length; ++i ) {

						uniforms[ arrayKey ].value[ index ][ key ][ i ] = value[ i ];

					}

				} else {

					uniforms[ arrayKey ].value[ index ][ key ] = value;

				}

			}

		}

	},

	GetDefaultShaderParameters() {

		return {
			time: 0.0,
		};

	},

};
