FROM node:8

# Copy app
RUN mkdir /app
COPY . / app/

# Install app dependencies
RUN cd /app; npm install

# Install pm2
RUN npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "start", "/app/process.json"]
