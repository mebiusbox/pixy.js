var HeightField = function() {
  
  this.generate = function(img, scale) {
    var data = this.__getHeightData(img, scale);
    var geo = new THREE.PlaneBufferGeometry(img.width, img.height, img.width-1, img.height-1);
    geo.rotateX(-Math.PI / 2);
    var vertices = geo.attributes.position.array;
    for (var i=0; i<data.length; i++) {
      vertices[i*3+1] = data[i];
    }
    geo.computeVertexNormals();
    return geo;
  };
  
  this.__getHeightData = function(img, scale) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');
    var size = img.width * img.height;
    var data = new Float32Array(size);
    
    context.drawImage(img, 0, 0);
    
    for (var i=0; i<size; i++) {
      data[i] = 0;
    }
    
    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;
    
    var j=0;
    for (var i=0; i<pix.length; i += 4) {
      var all = pix[i] + pix[i+1] + pix[i+2];
      data[j++] = all / (12*scale);
    }
    
    return data;
  };
  
  this.generateHeight = function(params) {
    
    function optionalParameter(value, defaultValue) {
      return value !== undefined ? value : defaultValue;
    }
    
    params = params || {};
    
    this.widthExtents = optionalParameter(params.widthExtents, 100);
    this.depthExtents = optionalParameter(params.depthExtents, 100);
    this.width = optionalParameter(params.width, 128);
    this.depth = optionalParameter(params.depth, 128);
    this.maxHeight = optionalParameter(params.maxHeight, 2);
    this.minHeight = optionalParameter(params.minHeight, -2);
    this.heightData = this.__generateHeight(this.width, this.depth, this.minHeight, this.maxHeight);
    
    var geo = new THREE.PlaneBufferGeometry(this.widthExtents, this.depthExtents, this.width - 1, this.depth - 1);
    geo.rotateX(-Math.PI / 2);
    var vertices = geo.attributes.position.array;
    for (var i=0, j=0, l=vertices.length; i<l; i++, j += 3) {
      // j + 1 because it is the y component that we modify
      vertices[j+1] = this.heightData[i];
    }
    geo.computeVertexNormals();
    return geo;
  };
  
  this.__generateHeight = function(width, depth, minHeight, maxHeight) {
    // Generates the height data (a sinus wave)
    var size = width * depth;
    var data = new Float32Array(size);
    var hRange = maxHeight - minHeight;
    var w2 = width / 2;
    var d2 = depth / 2;
    var phaseMult = 24;
    
    var p = 0;
    for (var j=0; j<depth; j++) {
      for (var i=0; i<width; i++) {
        var radius = Math.sqrt(Math.pow((i-w2)/w2, 2.0) + Math.pow((j-d2)/d2, 2.0));
        var height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight;
        data[p] = height;
        p++;
      }
    }
    
    return data;
  };
};

export { HeightField };