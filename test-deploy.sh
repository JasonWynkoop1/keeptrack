#!/bin/bash

# Build the application
npm run build

# Create a directory structure that matches the expected paths
mkdir -p dist/keeptrack
cp -r dist/assets dist/keeptrack/
cp dist/vite.svg dist/keeptrack/

# Create a simple HTTP server to serve the files
cd dist
python3 -m http.server 8082
