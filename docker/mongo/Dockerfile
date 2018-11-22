FROM mongo:4

ENV MONGO_HOST localhost
ENV MONGO_PORT 27017
ENV MONGO_DATABASE defaultDatabase
ENV MONGO_REPLSET_ID defaultReplsetId
ENV MONGO_ADMIN_USER defaultAdmin
ENV MONGO_ADMIN_PASS defaultAdminPass
ENV MONGO_USER defaultUser
ENV MONGO_PASS defaultPass

ARG MONGO_GID=1000
ARG MONGO_UID=1000

RUN groupmod \
  -g $MONGO_GID \
  mongodb \
  && usermod \
  -u $MONGO_UID \
  -g $MONGO_GID \
  mongodb

RUN mkdir -p /docker-entrypoint-initdb.d

ADD *.sh /docker-entrypoint-initdb.d/
ADD *.conf /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/*.sh
