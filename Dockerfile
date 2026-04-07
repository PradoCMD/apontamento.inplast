FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    curl git unzip zip libzip-dev oniguruma-dev \
    postgresql-dev mysql-client nginx fcgi

RUN docker-php-ext-configure zip \
    && docker-php-ext-install -j$(nproc) zip pdo pdo_mysql pdo_pgsql

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN mkdir -p /var/www/html && rm -rf /var/cache/apk/*

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

COPY . .
RUN chmod -R 775 storage bootstrap/cache && chown -R www-data:www-data /var/www/html

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker-entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]