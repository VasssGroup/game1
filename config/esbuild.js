const ESBuild = require('esbuild');
const path = require('path');

ESBuild.build({
    outdir: path.resolve(__dirname, '..', 'build'),
    entryPoints: [ path.resolve(__dirname, '..', 'src', 'index.js') ],
    entryNames: 'script',
    bundle: true,
    minify: false
});