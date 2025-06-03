#!/bin/bash

# Build the application
npm run build

# Create a simple HTTP server to serve the files
cd dist
python3 -m http.server 8080