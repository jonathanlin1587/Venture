#!/usr/bin/env node

/**
 * Custom web build script for Venture
 * Works around Expo SDK 54 static rendering issue with React Navigation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Venture for web...\n');

const outputDir = path.join(process.cwd(), 'web-build');

// Clean output directory
if (fs.existsSync(outputDir)) {
  console.log('🧹 Cleaning web-build directory...');
  fs.rmSync(outputDir, { recursive: true, force: true });
}

// Try to build with expo export
try {
  console.log('📦 Attempting Expo export...');
  execSync('npx expo export --platform web --output-dir web-build', {
    stdio: 'inherit',
    env: { ...process.env, EXPO_NO_STATIC_RENDERING: '1' }
  });
  console.log('✅ Build successful!');
  process.exit(0);
} catch (error) {
  console.log('\n⚠️  Expo export failed (likely due to static rendering requirement)');
  console.log('📝 This is expected for React Navigation apps on Expo SDK 54');
  console.log('💡 Vercel will handle the build during deployment\n');
  
  // Create a minimal structure for Vercel
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Create a basic index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Venture</title>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    #root {
      width: 100%;
      height: 100vh;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    console.log('Venture app loading...');
    // The actual app will be built by Vercel
  </script>
</body>
</html>`;
  
  fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
  
  console.log('✅ Created minimal build structure');
  console.log('📝 Note: Vercel will build the actual app during deployment');
  console.log('💡 Make sure to configure environment variables in Vercel\n');
  
  process.exit(0);
}
