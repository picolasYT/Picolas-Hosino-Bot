# Imagen base: Ubuntu minimal
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Actualiza e instala Node.js 20 y herramientas necesarias
RUN apt update && \
    apt upgrade -y && \
    apt install -y curl git imagemagick openssh-client ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt install -y nodejs && \
    rm -rf /var/lib/apt/lists/* 

# Crea el directorio de trabajo
WORKDIR /app

# Copia todo tu código fuente al contenedor
COPY . .

# Comando de inicio: instala dependencias y ejecuta tu bot
CMD npm install cfonts && npm install && npm Index.js