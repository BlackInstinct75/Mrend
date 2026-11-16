# --- Fase 1: Compilación (Builder) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Compilar la aplicación para producción (genera la carpeta dist)
RUN npm run build


# --- Fase 2: Servidor Web de Producción (Nginx) ---
FROM nginx:alpine

# Copiar los archivos compilados desde la fase anterior al directorio público de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80 donde Nginx servirá la web
EXPOSE 80

# Arrancar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]