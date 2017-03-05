//-------------------------------------------------------------------------
// http://stackoverflow.com/questions/23674744/what-is-the-equivalent-of-python-any-and-all-functions-in-javascript
export function any(iterable) {
	for (var i=0; i<iterable.length; ++i) {
		if (iterable[i]) {
			return true;
		}
	}
	return false;
}

export function all(iterable) {
	for (var i=0; i<iterable.length; ++i) {
		if (!iterable[i]) {
			return false;
		}
	}
	return true;
}
//-------------------------------------------------------------------------
export function radians(deg) {
  return deg * Math.PI / 180;
}

export function degrees(rad) {
  return rad * 180 / Math.PI;
}

export function pow2(x) {
  return x*x;
}
//-------------------------------------------------------------------------
// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.
export function gauss(x, sigma) {
	return Math.exp(-(x * x) / (2.0 * sigma * sigma));
}
//-------------------------------------------------------------------------
export function buildKernel(sigma) {
	var kMaxKernelSize = 25;
	var kernelSize = 2 * Math.ceil(sigma * 3.0) + 1;
	if (kernelSize > kMaxKernelSize) {
		kernelSize = kMaxKernelSize;
	}
	var halfWidth = (kernelSize - 1) * 0.5;

	var values = new Array(kernelSize);
	var sum = 0.0;
	var i;
	for (i=0; i<kernelSize; ++i) {
		values[i] = gauss(i - halfWidth, sigma);
		sum += values[i];
	}

	// normalize the kenrel
	for (i=0; i<kernelSize; ++i) {
		values[i] /= sum;
	}

	return values;
}
//-------------------------------------------------------------------------
export function buildGause(sigma, num) {
	var weights = new Array(num);
	var t = 0.0;
	var d = sigma * sigma;
	for (i=0; i<weights.length; ++i) {
		var r = 1.0 + 2.0 * i;
		weights[i] = Math.exp(-0.5 * (r*r)/d);
		t += weights[i];
	}
	for (i=0; i<weights.length; ++i) {
		weights[i] /= t;
	}
	return weights;
}
//-------------------------------------------------------------------------
export function createCubeMap() {
	var path = "assets/textures/cubemap/parliament/";
	var format = '.jpg';
	var urls = [
		path + "posx" + format, path + 'negx' + format,
		path + "posy" + format, path + 'negy' + format,
		path + "posz" + format, path + 'negz' + format
	];

	var textureCube = THREE.ImageUtils.loadTextureCube(urls);
	return textureCube;
}
//-------------------------------------------------------------------------
export function createMesh(geom, texture, normal) {
	geom.computeVertexNormals();
	if (normal) {
		var t = THREE.ImageUtils.loadTexture("assets/textures/general/" + texture);
		var m = THREE.ImageUtils.loadTexture("assets/textures/general/" + normal);
		var mat2 = new THREE.MeshPhongMaterial({
			map: t,
			normalMap: m
		});
		var mesh = new THREE.Mesh(geom, mat2);
		return mesh;
	} else {
		var t = THREE.ImageUtils.loadTexture("assets/textures/general/" + texture);
		var mat1 = new THREE.MeshPhongMaterial({});
		var mesh = new THREE.Mesh(geom, mat1);
		return mesh;
	}

	// geom.computeTangents();

	return mesh;
}
//-------------------------------------------------------------------------
export function createPlaneReflectMatrix(n, d) {
	var matrix = new THREE.Matrix4();
	matrix.set(
		1 - Math.pow(2*n.x, 2.0), -2*n.x*n.y, -2*n.x*n.z, 0,
		-2*n.x*n.y, 1-Math.pow(2*n.y, 2.0), -2*n.y*n.z, 0,
		-2*n.x*n.z, -2*n.y*n.z, 1-Math.pow(2*n.z,2.0), 0,
		-2*d*n.x, -2*d*n.y, -2*d*n.z, 1
	);
	return matrix;
}
//-------------------------------------------------------------------------
function createShaderMaterial(uniforms, shader) {
	return new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	});
}
//-------------------------------------------------------------------------
export function createShadowedLight(x, y, z, color, intensity) {
	var light = new THREE.DirectionalLight(color, intensity);
	var d = 1;
	light.position.set(x, y, z);
	light.castShadow = true;
	light.shadow.camera.left = -d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = -d;
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 4;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	light.shadow.bias = -0.005;
	return light;
}
//-------------------------------------------------------------------------
export function clearTextOut(id) {
	document.getElementById(id).innerHTML = "";
}
//-------------------------------------------------------------------------
export function textOut(id, text) {
	document.getElementById(id).innerHTML += text + "<br>";
}
//-------------------------------------------------------------------------
export function textOutMatrix4(matrix) {
	var s = "";
	for (i=0; i<4; ++i) {
		s += ("        " + matrix.elements[i*4+0]).substr(-8) + ", ";
		s += ("        " + matrix.elements[i*4+1]).substr(-8) + ", ";
		s += ("        " + matrix.elements[i*4+2]).substr(-8) + ", ";
		s += ("        " + matrix.elements[i*4+3]).substr(-8) + "<br>";
	}
	textOut(s.replace(/\ /g, "&nbsp;"));
}
//-------------------------------------------------------------------------
export function floatFormat(number, n) {
	var _pow = Math.pow(10, n);
	return Math.ceil(number * _pow) / _pow;
}
//-------------------------------------------------------------------------
export function dumpMatrix4(matrix) {
	var s = "";
	for (i=0; i<4; ++i) {
		// s += ("        " + matrix.elements[i*4+0]).substr(-8) + ", ";
		// s += ("        " + matrix.elements[i*4+1]).substr(-8) + ", ";
		// s += ("        " + matrix.elements[i*4+2]).substr(-8) + ", ";
		// s += ("        " + matrix.elements[i*4+3]).substr(-8) + "\n";
		s += ("        " + floatFormat(matrix.elements[i*4+0], 5)).substr(-8) + ", ";
		s += ("        " + floatFormat(matrix.elements[i*4+1], 5)).substr(-8) + ", ";
		s += ("        " + floatFormat(matrix.elements[i*4+2], 5)).substr(-8) + ", ";
		s += ("        " + floatFormat(matrix.elements[i*4+3], 5)).substr(-8) + "\n";
	}
	console.log(s);
}
