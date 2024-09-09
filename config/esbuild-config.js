const path = require('path');

module.exports = {
    outdir: path.resolve(__dirname, '..', 'build'),
    entryPoints: [ path.resolve(__dirname, '..', 'src', 'index.js') ],
    entryNames: 'script',
    bundle: true,
    minify: false,
    tsconfig: path.resolve(__dirname, '..', 'tsconfig.json'),
    sourcemap: true,
    loader: {
        '.jpg': 'file',
        '.png': 'file',
        '.svg': 'file'
    }
};