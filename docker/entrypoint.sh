#!/bin/sh

set -e

echo "🏭 Inplast Aponta - Starting..."

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

echo "Starting PHP-FPM and Nginx..."
php-fpm &

nginx -g 'daemon off;'