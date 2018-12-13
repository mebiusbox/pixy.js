import os
import os.path
import sys
import glob

def generate(dirname):
    chunks = [];
    
    outfilename = os.path.join(dirname, 'ShaderChunk.js')
    if os.path.exists(outfilename):
        os.remove(outfilename)
    outfile = open(outfilename, 'w')
    
    shaderChunkDir = os.path.join(dirname, 'ShaderChunk')
    files = glob.glob(os.path.join(shaderChunkDir, '*.*'))
    for path in files:
        dirname,filename = os.path.split(path)
        basename,ext = os.path.splitext(filename)
        if ext == '.js':
            outfile.write("import {{ {0} }} from './ShaderChunk/{1}';\n".format(basename, filename))
            chunks.append(basename)
        elif ext == '.glsl':
            outfile.write("import {0} from './ShaderChunk/{1}';\n".format(basename, filename))
            chunks.append(basename)
    
    if len(chunks) > 0:
        outfile.write('\nexport var ShaderChunk = {\n')
        for chunk in chunks:
            outfile.write('\t{0}: {0},\n'.format(chunk))
        outfile.write('};')
    
    outfile.close()

if __name__ == '__main__':
    args = sys.argv
    argc = len(args)
    if (argc != 2):
        print('Usage: # python %s <dirname>' % args[0])
        quit()
    
    generate(args[1])
    