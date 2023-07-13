#!/bin/sh

docker run -it -v "$(pwd)"/data:/app/data --rm mukeunkim/bls-change
