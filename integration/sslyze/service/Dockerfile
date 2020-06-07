FROM python:3.7-slim
WORKDIR /app
ADD ./package.json ./package.json
RUN pip install -U sslyze && apt-get update && apt-get -y install --no-install-recommends gnupg curl \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash \ 
    && apt-get -y install --no-install-recommends nodejs && npm install \
    && npm cache clean --force --loglevel=error && rm -fr ~/.cache/pip \
    && apt-get clean && rm -rf /var/lib/apt/lists/* && apt-get autoclean
ADD ./index.js ./index.js
CMD ["node", "index.js"]