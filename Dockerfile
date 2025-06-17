# Imagen base de Node 20
FROM node:20

# Evita interacción en los comandos apt
ENV DEBIAN_FRONTEND=noninteractive

# Directorio de trabajo
WORKDIR /app

# Actualiza sistema e instala herramientas necesarias
RUN apt update && \
    apt upgrade -y && \
    apt install -y git imagemagick openssh-client ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copia package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala dependencias del proyecto
RUN npm install

# Copia el resto del proyecto
COPY . .

# Comando de inicio (cámbialo si usas otro archivo)
CMD ["node", "index.js"]
