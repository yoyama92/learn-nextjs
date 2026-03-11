FROM node:bookworm-slim

WORKDIR /app
RUN npm install -g aws-ses-v2-local@2.9.0
ENTRYPOINT ["aws-ses-v2-local", "--host=0.0.0.0"]