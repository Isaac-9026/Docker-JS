# Usamos la imagen oficial de Nginx basada en Alpine
FROM nginx:alpine

# Eliminar la configuración por defecto que trae Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiamos nuestra configuración personalizada (Proxy inverso)
COPY nginx.conf /etc/nginx/conf.d/

# Copiamos todo el contenido estático de nuestro frontend
# a la carpeta pública por defecto que usa Nginx para servir archivos
COPY public/ /usr/share/nginx/html/

# Exponemos el puerto 80 (puerto estandar para HTTP)
EXPOSE 80

# Nota: No necesitamos agregar un comando CMD porque la imagen base de Nginx 
# ya incluye el comando para arrancar el servidor automáticamente.
