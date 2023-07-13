#!/bin/bash

docker buildx build --platform=linux/amd64,linux/arm64 -t mukeunkim/node-python:16.20.0-3.10.12 -f Dockerfile-node-python --push .
