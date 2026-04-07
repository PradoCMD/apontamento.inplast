#!/bin/sh
set -e

echo "🏭 Inplast Aponta - Starting..."

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting PHP-FPM..."
exec php-fpm