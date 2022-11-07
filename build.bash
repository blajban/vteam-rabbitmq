#!/usr/bin/env bash


echo "++++ CLOSING RUNNING CONTAINERS ++++"
docker-compose down

echo "++++ DOCKER LOGIN ++++"
docker login

echo "++++ BUILDING CONTAINERS ++++"
docker build -t blajban/bike:latest ./bike/.

echo "++++ PUSHING CONTAINERS ++++" 
docker push blajban/bike:latest
