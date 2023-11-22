import * as THREE from 'three';
import { Pass } from './pass.js';
class ScreenPass extends Pass {

	constructor() {

		super();

		this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
		this.scene = new THREE.Scene();
		this.quad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), null );
		this.scene.add( this.quad );

	}

	render( renderer, writeBuffer, _readBuffer, _delta, _maskActive ) {

		const oldRenderTarget = renderer.getRenderTarget();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;
		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );
		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = oldAutoClear;

	}

}

export { ScreenPass };
