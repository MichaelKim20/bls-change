#!/bin/bash

docker buildx build --platform=linux/amd64,linux/arm64 -t bosagora/bls-change:latest -f Dockerfile --push .
