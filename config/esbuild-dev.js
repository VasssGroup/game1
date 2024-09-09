const ESBuild = require('esbuild');
const config = require('./esbuild-config');

const PORT = 3000;
ESBuild.context({ ...config }).then(ctx => {
    ctx.serve({
        servedir: config.outdir,
        port: PORT
    });
    console.log(`Satrt devServer: http://localhost:${PORT}`);
});
