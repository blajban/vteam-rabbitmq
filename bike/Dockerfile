FROM alpine:3.16

RUN apk update && apk upgrade --available && sync 

RUN apk add --no-cache bash && apk add --no-cache rabbitmq-c-utils

COPY bike.sh .

ENTRYPOINT [ "./bike.sh" ]