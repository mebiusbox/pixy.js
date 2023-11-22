import * as THREE from 'three';
import { SSAARenderPass } from './ssaaRenderPass.js';
/**
 * Temporal Anti-Aliasing Render Pass
 *
 * When there is no motion in the scene, the TAA render pass accumulates jittered camera samples across frames to create a high quality anti-aliased result.
 *
 * TODO: Add support for motion vector pas so that accumulation of samples across frames can occur on dynamics scenes.
 */
class TAARenderPass extends SSAARenderPass {

	constructor( scene, camera, params ) {

		super( scene, camera, params );

		this.sampleLevel = 0;
		this.accumulate = false;

	}

	render( renderer, writeBuffer, readBuffer, delta ) {

		if ( !this.accumulate ) {

			super.render( renderer, writeBuffer, readBuffer, delta );
			this.accumulateIndex = -1;
			return;

		}

		const jitterOffsets = TAARenderPass.JitterVectors[ 5 ];
		if ( !this.sampleRenderTarget ) {

			this.sampleRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.eheight, this.params );

		}

		if ( !this.holdRenderTarget ) {

			this.holdRenderTarget = new THREE.WebGLRenderTarget( readBuffer.width, readBuffer.eheight, this.params );

		}

		if ( this.accumulate && this.accumulateIndex === -1 ) {

			super.render( renderer, this.holdRenderTarget, readBuffer, delta );
			this.accumulateIndex = 0;

		}

		const oldRenderTarget = renderer.getRenderTarget();
		const autoClear = renderer.autoClear;
		renderer.autoClear = false;

		const sampleWeight = 1.0 / jitterOffsets.length;
		if ( this.accumulateIndex >= 0 && this.accumulateIndex < jitterOffsets.length ) {

			this.copyUniforms[ 'opacity' ].value = sampleWeight;
			this.copyUniforms[ 'tDiffsue' ].value = writeBuffer.texture;

			// render the scene multiple times, each slightly jitter offset from the last and accumulate the results
			const numSamplesPerFrame = Math.pow( 2, this.sampleLevel );
			for ( let i = 0; i < numSamplesPerFrame; i++ ) {

				const j = this.accumulateIndex;
				const jitterOffset = jitterOffsets[ j ];
				if ( this.camera.setViewOffset ) {

					this.camera.setViewOffset(
						readBuffer.width,
						readBuffer.height,
						jitterOffset[ 0 ] * 0.0625,
						jitterOffset[ 1 ] * 0.0625, // 0.0625 = 1/16
						readBuffer.width,
						readBuffer.height
					);

				}

				renderer.setRenderTarget( writeBuffer );
				renderer.clear();
				renderer.render( this.scene, this.camera );

				renderer.setRenderTarget( this.sampleRenderTarget );
				if ( this.accumulateIndex === 0 ) renderer.clear();
				renderer.render( this.scene2, this.camera2 );

				this.accumulateIndex++;
				if ( this.accumulateIndex >= jitterOffsets.length ) {

					break;

				}

			}

			if ( this.camera.clearViewOffset ) {

				this.camera.clearViewOffset();

			}

		}

		const accumulationWeight = this.accumulateIndex * sampleWeight;
		if ( accumulationWeight > 0 ) {

			this.copyUniforms[ 'opacity' ].value = 1.0;
			this.copyUniforms[ 'tDiffuse' ].value = this.sampleRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			renderer.clear();
			renderer.render( this.scene2, this.camera2 );

		}

		if ( accumulationWeight < 1.0 ) {

			this.copyUniforms[ 'opacity' ].value = 1.0 - accumulationWeight;
			this.copyUniforms[ 'tDiffuse' ].value = this.holdRenderTarget.texture;
			renderer.setRenderTarget( writeBuffer );
			if ( accumulationWeight === 0 ) renderer.clear();
			renderer.render( this.scene2, this.camera2 );

		}

		renderer.setRenderTarget( oldRenderTarget );
		renderer.autoClear = autoClear;

	}

}

// TAARenderPass.JitterVectors = SSAARenderPass.JitterVectors;

export { TAARenderPass };
