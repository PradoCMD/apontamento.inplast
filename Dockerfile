FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
    curl git unzip zip libzip-dev oniguruma-dev \
    postgresql-dev mysql-client nginx fcgi

RUN docker-php-ext-configure zip \
    && docker-php-ext-install -j$(nproc) zip pdo pdo_mysql pgsql

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN rm -rf /var/cache/apk/*

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

COPY . .
RUN mkdir -p storage/app/public storage/logs bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache && \
    chown -R www-data:www-data /var/www/html

COPY docker/nginx.conf /etc/nginx/http.d/default.conf

EXPOSE 80

CMD ["php-fpm"]