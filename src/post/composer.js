// COMPOSER
class Composer {

	constructor( renderer ) {

		this.renderer = renderer;
		this.passes = [];

	}

	addPass( pass, readRenderTarget, writeRenderTarget, clear, clearDepth ) {

		this.passes.push( {
			pass: pass,
			readBuffer: readRenderTarget,
			writeBuffer: writeRenderTarget,
			clear: clear,
			clearDepth: clearDepth,
		} );
		// var size = this.renderer.getSize();
		// pass.setSize(size.width, size.height);

	}

	insertPass( pass, index ) {

		this.passes.splice( index, 0, pass );

	}

	render( delta ) {

		const maskActive = false;
		for ( let i = 0; i < this.passes.length; i++ ) {

			const pass = this.passes[ i ];
			if ( pass.pass.enabled === false ) continue;

			const oldAutoClear = this.renderer.autoClear;
			const oldAutoClearDepth = this.renderer.autoClearDepth;

			if ( pass.clear !== undefined ) {

				this.renderer.autoClear = pass.clear;

			}

			if ( pass.clearDepth !== undefined ) {

				this.renderer.autoClearDepth = pass.clearDepth;

			}

			pass.pass.render( this.renderer, pass.writeBuffer, pass.readBuffer, delta, maskActive );

			this.renderer.autoClear = oldAutoClear;
			this.renderer.autoClearDepth = oldAutoClearDepth;

			// if (pass.needsSwap) {
			//   if (maskActive) {
			//     var context = this.renderer.context;
			//     context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
			//     this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);
			//     context.stencilFunc(context.EQUAL, 1, 0xffffffff);
			//   }
			//
			//   this.swapBuffers();
			// }
			//
			// if (THREE.MaskPass !== undefined) {
			//   if (pass instanceof THREE.MaskPass) {
			//     maskActive = true;
			//   } else if (pass instanceof THREE.ClearMaskPass) {
			//     maskActive = false;
			//   }
			// }

		}

	}

	// reset: function(renderTarget) {
	//
	//   if (renderTarget === undefined) {
	//     var size = renderTarget.getSize();
	//     renderTarget = this.renderTarget1.clone();
	//     renderTarget.setSize(size.width, size.height);
	//   }
	//
	//   this.renderTarget1.dispose();
	//   this.renderTarget2.dispose();
	//   this.renderTarget1 = renderTarget;
	//   this.renderTarget2 = renderTarget.clone();
	//   this.writeBuffer = this.renderTarget1;
	//   this.readBuffer = this.renderTarget2;
	// },
	//
	// setSize: function(width, height) {
	//   this.renderTarget1.setSize(width, height);
	//   this.renderTarget2.setSize(width, height);
	//
	//   for (var i=0; i<this.passes.length; i++) {
	//     this.passes[i].setSize(width, height);
	//   }
	// }

}

export { Composer };
