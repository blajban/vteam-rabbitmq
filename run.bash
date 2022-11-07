#!/usr/bin/env bash

echo "++++ CLOSING RUNNING CONTAINERS ++++"
docker-compose down

echo "++++ STARTING CONTAINERS ++++"
docker-compose up -d mq
docker-compose up -d db



echo "++++ STARTING EMITTER ++++"
# later
