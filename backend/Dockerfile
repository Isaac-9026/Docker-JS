# Usar imagen oficial de Nodejs basada en Alpine Linux (una versión muy ligera)
FROM node:20-alpine

# el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de dependencias antes del código fuente
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar todo el código fuente de la app al directorio de trabajo en el contenedor
COPY . .

# Expone el puerto que usa Express internamente
EXPOSE 3000

# Definir el comando por defecto al iniciar el contenedor
CMD ["npm", "start"]
