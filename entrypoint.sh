#!/bin/sh
echo "Running database migrations..."
bunx drizzle-kit migrate
echo "Starting application..."
exec bun server.js
