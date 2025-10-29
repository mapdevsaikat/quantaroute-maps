#!/usr/bin/env node

/**
 * Production Build Script for QuantaRoute Demo
 * 
 * This script:
 * 1. Reads demo.js (development version with console logs)
 * 2. Minifies the JavaScript code
 * 3. Removes all console.log/console.warn/console.error statements
 * 4. Outputs to demo.min.js (production version)
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const INPUT_FILE = path.join(__dirname, 'static/js/demo.js');
const OUTPUT_FILE = path.join(__dirname, 'static/js/demo.min.js');

console.log('🚀 Building production version of demo.js...\n');

// Read the source file
const sourceCode = fs.readFileSync(INPUT_FILE, 'utf-8');
console.log(`✅ Read source file: ${INPUT_FILE}`);
console.log(`📊 Original size: ${(sourceCode.length / 1024).toFixed(2)} KB\n`);

// Minify with Terser
(async () => {
    try {
        const result = await minify(sourceCode, {
            compress: {
                // Remove console.* statements
                drop_console: true,
                // Remove debugger statements
                drop_debugger: true,
                // Additional optimizations
                dead_code: true,
                unused: true,
                // Keep function names for better debugging if needed
                keep_fnames: false,
                // Remove comments
                passes: 2
            },
            mangle: {
                // Mangle variable names for smaller size
                // But keep class names for debugging
                keep_classnames: true,
            },
            format: {
                // Remove comments
                comments: false,
                // Compact output
                beautify: false
            },
            sourceMap: {
                // Generate source map for debugging production issues
                filename: 'demo.min.js',
                url: 'demo.min.js.map'
            }
        });

        // Write minified file
        fs.writeFileSync(OUTPUT_FILE, result.code, 'utf-8');
        console.log(`✅ Minified code written to: ${OUTPUT_FILE}`);
        console.log(`📊 Minified size: ${(result.code.length / 1024).toFixed(2)} KB`);
        
        // Write source map
        if (result.map) {
            const sourceMapFile = OUTPUT_FILE + '.map';
            fs.writeFileSync(sourceMapFile, result.map, 'utf-8');
            console.log(`✅ Source map written to: ${sourceMapFile}`);
        }
        
        // Calculate size reduction
        const reduction = ((1 - result.code.length / sourceCode.length) * 100).toFixed(1);
        console.log(`\n🎉 Size reduction: ${reduction}%`);
        console.log(`💾 Saved: ${((sourceCode.length - result.code.length) / 1024).toFixed(2)} KB`);
        
        console.log('\n✅ Production build complete!');
        console.log('\n📝 Next steps:');
        console.log('   1. Update index.html to use demo.min.js in production');
        console.log('   2. Test the minified version thoroughly');
        console.log('   3. Deploy to production\n');
        
    } catch (error) {
        console.error('❌ Error during minification:', error);
        process.exit(1);
    }
})();

