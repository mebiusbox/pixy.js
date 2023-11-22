import * as THREE from 'three';
class ScreenSprite {

	constructor( material, canvas ) {

		this.sw = window.innerWidth;
		this.sh = window.innerHeight;
		if ( canvas ) {

			this.sw = canvas.width;
			this.sh = canvas.height;

		}

		const scope = this;
		const frame = {
			x: 10,
			y: 10,
			width: this.sw,
			height: this.sh,
		};

		this.camera = new THREE.OrthographicCamera( -this.sw / 2, this.sw / 2, this.sh / 2, -this.sh / 2, 1, 10 );
		this.camera.position.set( 0, 0, 2 );
		this.scene = new THREE.Scene();
		const plane = new THREE.PlaneGeometry( frame.width, frame.height );
		const mesh = new THREE.Mesh( plane, material );
		this.scene.add( mesh );

		function resetPosition() {

			scope.position.set( scope.position.x, scope.position.y );

		}

		// API

		// Set to false to disable displaying this sprite
		this.enabled = true;

		// Set the size of the displayed sprite on the HUD
		this.size = {
			width: frame.width,
			height: frame.height,
			set: function ( width, height ) {

				this.width = width;
				this.height = height;
				mesh.scale.set( this.width / frame.width, this.height / frame.height, 1 );

				// Reset the position as it is off when we scale stuff
				resetPosition();

			},
		};

		// Set the position of the displayed sprite on the HUD
		this.position = {
			x: frame.x,
			y: frame.y,
			set: function ( x, y ) {

				this.x = x;
				this.y = y;
				const width = scope.size.width;
				const height = scope.size.height;
				mesh.position.set( -scope.sw / 2 + width / 2 + this.x, scope.sh / 2 - height / 2 - this.y, 0 );

			},
		};

		// Force an update to set position/size
		this.update();

	}

	render( renderer ) {

		if ( this.enabled ) {

			renderer.render( this.scene, this.camera );

		}

	}

	updateForWindowResize() {

		if ( this.enabled ) {

			this.sw = window.innerWidth;
			this.sh = window.innerHeight;
			this.camera.left = -window.innerWidth / 2;
			this.camera.right = window.innerWidth / 2;
			this.camera.top = window.innerHeight / 2;
			this.camera.bottom = -window.innerHeight / 2;

		}

	}

	updateForCanvasResize( canvas ) {

		if ( this.enabled ) {

			this.sw = canvas.width;
			this.sh = canvas.height;
			this.camera.left = -canvas.width / 2;
			this.camera.right = canvas.width / 2;
			this.camera.top = canvas.height / 2;
			this.camera.bottom = -canvas.height / 2;

		}

	}

	update() {

		this.position.set( this.position.x, this.position.y );
		this.size.set( this.size.width, this.size.height );

	}

}

export { ScreenSprite };
