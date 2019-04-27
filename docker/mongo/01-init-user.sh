#!/bin/bash

echo "$(date +"%T") [] ***** START INIT USER *****"

if [[ -a /data/db/$MONGO_DATABASE-user-initialized ]]; then
  echo "$(date +"%T") [] ***** USERS ALREADY INITIALIZED *****"
  exit 0
fi

echo "$(date +"%T") [] ***** CREATE USERS *****"

mongod --dbpath /data/db/ --shutdown \
  && mongod --storageEngine wiredTiger \
  --fork \
  --logpath /log/mongod-user.log \
  && mongo <<-EOF
  use admin;

  db.createUser({
    user: "$MONGO_ADMIN_USER",
    pwd: "$MONGO_ADMIN_PASS",
    roles: [
      { role: "root", db: "admin" }
    ]
  });

  use $MONGO_DATABASE;

  db.createUser({
    user: "$MONGO_USER",
    pwd: "$MONGO_PASS",
    roles: [
      { role: "readWrite", db: "$MONGO_DATABASE" }
    ]
  });
EOF

echo "$(date +"%T") [] ***** CREATE REPLICA *****"

mongod --dbpath /data/db/ --shutdown \
  && mongod --auth \
  --port $MONGO_PORT \
  --storageEngine wiredTiger \
  --fork \
  --logpath /log/mongod-replica.log \
  --replSet "$MONGO_REPLSET_ID" \
  && mongo --port $MONGO_PORT <<-EOF
  use admin;

  db.auth("$MONGO_ADMIN_USER", "$MONGO_ADMIN_PASS");

  var cfg = {
    "_id": "$MONGO_REPLSET_ID",
    "members": [
      { _id: 0, host: "$MONGO_HOST:$MONGO_PORT" }
    ]
  };

  rs.initiate(cfg, { force: true });
  rs.config();
EOF

echo "$(date +"%T") [] ***** ALL DONE *****"

touch /data/db/$MONGO_DATABASE-user-initialized
