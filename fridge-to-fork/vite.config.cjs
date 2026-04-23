const { defineConfig } = require('vite');

module.exports = defineConfig({
    plugins: [],
    build: {
        rollupOptions: {
            input: {
                app: 'D:/sofretna/fridge-to-fork/resources/js/App.jsx',
                css: 'D:/sofretna/fridge-to-fork/resources/css/app.css',
            },
            output: {
                dir: 'D:/sofretna/fridge-to-fork/public/build',
            }
        }
    }
});