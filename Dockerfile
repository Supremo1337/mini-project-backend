FROM postgres:14.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN yarn install
COPY . /usr/src/app

EXPOSE 3333

CMD [ "yarn", "dev" ]