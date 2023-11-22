import { ShaderLib } from '../shaders/ShaderLib.js';
import { ShaderPass } from './shaderPass.js';

class CopyPass extends ShaderPass {

	constructor() {

		super( ShaderLib.copy );

	}

}

export { CopyPass };
