function glsl() {
  return {
    transform(code, id) {
      if ( /\.glsl$/.test(id) === false) return;
      
      var transformedCode = 'export default ' + JSON.stringify(
        code
          .replace(/[ \t]*\/\/.*\n/g, '')
          .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '')
          .replace(/\n{2,}/g, '\n')
        ) + ';';
        return {
          code: transformedCode,
          map: {mappings: ''}
        };
    }
  };
}

export default {
  entry: 'src/pixy.js',
  indent: '\t',
  plugins: [
    glsl()
  ],
  targets: [
    {
      format: 'umd',
      moduleName: 'PIXY',
      dest: 'build/pixy.js'
    },
    {
      format: 'es',
      dest: 'build/pixy.module.js'
    }
  ]
};