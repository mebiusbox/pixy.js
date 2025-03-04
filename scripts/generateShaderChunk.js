import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generate(dirname) {
    const chunks = [];
    const outfilename = path.join(dirname, 'ShaderChunk.js');

    if (fs.existsSync(outfilename)) {
        fs.unlinkSync(outfilename);
    }

    const shaderChunkDir = path.join(dirname, 'ShaderChunk');
    const files = glob.sync(path.join(shaderChunkDir, '*.*').replaceAll(path.sep, "/"));

    let output = '';
    files.forEach(filepath => {
        const filename = path.basename(filepath);
        const basename = path.parse(filename).name;
        const ext = path.parse(filename).ext;

        if (ext === '.js') {
            output = `import { ${basename} } from './ShaderChunk/${filename}';\n` + output;
            chunks.push(basename);
        } else if (ext === '.glsl') {
            output = `import ${basename} from './ShaderChunk/${filename}';\n` + output;;
            chunks.push(basename);
        }
    });

    if (chunks.length > 0) {
        output += '\nexport var ShaderChunk = {\n';
        chunks.reverse().forEach(chunk => {
            output += `\t${chunk}: ${chunk},\n`;
        });
        output += '};';
    }

    fs.writeFileSync(outfilename, output);
		console.log("Generated!");
}

const args = process.argv.slice(2);
if (args.length !== 1) {
		console.log(`Usage: node ${path.basename(__filename)} <dirname>`);
		process.exit(1);
}

console.log("Generating...");
generate(args[0]);

