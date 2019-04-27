#!/bin/bash

echo "$(date +"%T") [] ***** START INIT DATA *****"

if [[ -a /data/db/$MONGO_DATABASE-data-initialized ]]; then
  echo "$(date +"%T") [] ***** DATA ALREADY INITIALIZED *****"
  exit 0
fi

echo "$(date +"%T") [] ***** CREATE DATA *****"

COLLECTION=tasks
FILE=/data/task.json

mongoimport \
  --host $MONGO_REPLSET_ID/$MONGO_HOST:$MONGO_PORT \
  --db $MONGO_DATABASE \
  --username $MONGO_USER \
  --password $MONGO_PASS \
  --collection $COLLECTION \
  --drop \
  --mode upsert \
  --type json \
  --file $FILE \
  --jsonArray

echo "$(date +"%T") [] ***** ALL DONE *****"

touch /data/db/$MONGO_DATABASE-data-initialized
