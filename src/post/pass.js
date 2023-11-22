// BASE PASS
class Pass {

	constructor() {

		// if set to true, the pass is processes by the composer
		this.enabled = true;

		// if set to true, the pass indicates to swap read and write buffer after rendering
		this.needsSwap = true;

		// if set to true, the pass clears its buffer before rendering
		this.clear = false;

		// if set to true, the result of the pass is rendering to screen
		this.renderToScreen = false;

	}

	setSize( _width, _height ) {}

	render( _renderer, _writeBuffer, _readBuffer, _delta, _maskActive ) {

		console.error( 'PIXY.Pass: .render() must be implemented in derived pass.' );

	}

}

export { Pass };
