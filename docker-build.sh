#!/bin/bash

echo "start build new az-group-sync docker image"

docker build --no-cache -t az-group-sync .

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "Docker image built successfully."
    # Run the docker container
    echo "Starting the application on port 8080..."
    docker run -d --name az-group-sync-container -p 8080:8080 az-group-sync
else
    echo "Docker image build failed."
fi

