# Usa Node.js 20 como base
FROM node:20

ENV DEBIAN_FRONTEND=noninteractive

# Establece el directorio de trabajo
WORKDIR /app

# Actualiza e instala paquetes necesarios
RUN apt update && \
    apt upgrade -y && \
    apt install -y git imagemagick openssh-client ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copia todo el código fuente
COPY . .

# Ejecuta npm install y luego inicia tu app
CMD yarn install && npm install && npm start