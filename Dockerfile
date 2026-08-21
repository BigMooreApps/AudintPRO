# ==========================================
# STAGE 1: Build Frontend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de paquetes
COPY package.json package-lock.json ./

# Instalar todas las dependencias
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Compilar la aplicación para producción
RUN npm run build

# ==========================================
# STAGE 2: Servidor Web Nginx de Producción
# ==========================================
FROM nginx:alpine

# Copiar archivos compilados a la raíz de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx para SPA (Single Page Application)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, no-transform"; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
