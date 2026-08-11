FROM php:8.3-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
        libzip-dev unzip \
    && docker-php-ext-install pdo_mysql zip bcmath opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0"]