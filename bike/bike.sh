#!/usr/bin/env bash

DOCKER_IP=$(cat /etc/hostname)
QUEUE="bikes"

log_no=0

while true
do
    status='{
        "log_no": "'$log_no'"
        "ip": "'$DOCKER_IP'",
        "battery": 30,
    }'

    echo "Reporting"
    echo "$status"
    amqp-publish -u amqp://mq -r "$QUEUE" -p -C application/json -b "$status"
    ((log_no+=1))
    echo "Sleeping for 3 seconds"
    sleep 3
done