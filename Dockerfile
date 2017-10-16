FROM node
MAINTAINER ugurarpaci
RUN npm install --global speed-test
CMD speed-test
