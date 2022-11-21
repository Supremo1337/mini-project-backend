FROM postgres:14.3

RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y nodejs yarn postgresql-client
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
COPY yarn.lock /usr/src/app/
RUN yarn dev
COPY . $HOME/usr/src/app

EXPOSE 3333

CMD [ "yarn", "dev" ]

# FROM postgres:14.3
# ARG BUILD_CONTEXT

# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app
# COPY package.json /usr/src/app/
# COPY yarn.lock /usr/src/app/
# RUN yarn
# COPY ./ngcash-project-backend/$BUILD_CONTEXT ./ngcash-project-backend/usr/src/app/$BUILD_CONTEXT
# RUN yarn build:$BUILD_CONTEXT

# EXPOSE 3333

# CMD [ "yarn", "dev" ]