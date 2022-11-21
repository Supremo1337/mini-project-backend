FROM postgres:14.3
ARG BUILD_CONTEXT

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn
COPY /usr/src/app/$BUILD_CONTEXT /usr/src/app/$BUILD_CONTEXT
RUN yarn build:$BUILD_CONTEXT

EXPOSE 3333

CMD [ "yarn", "dev" ]