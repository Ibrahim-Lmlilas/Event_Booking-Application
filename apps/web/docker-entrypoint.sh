#!/bin/sh
set -e

# Create symlink for the entire @shared package in node_modules
echo "Creating symlink for @shared package..."
rm -rf node_modules/@event-booking
mkdir -p node_modules/@event-booking
ln -sf ../../shared node_modules/@event-booking/shared

echo "Symlink created:"
ls -la node_modules/@event-booking/

# Execute the main command
exec "$@"
