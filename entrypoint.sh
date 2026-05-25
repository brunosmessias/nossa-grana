#!/bin/sh
echo "Running database migrations..."
bun run db:migrate
echo "Starting application..."
exec bun server.js
