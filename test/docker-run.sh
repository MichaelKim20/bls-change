#!/bin/bash

docker run -it \
 -v "$(pwd)"/validator_keys:/app/validator_keys \
 -v "$(pwd)"/data:/app/data \
 --name bls-change \
 --rm \
bosagora/bls-change
