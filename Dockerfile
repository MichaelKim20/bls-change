FROM mukeunkim/node-python:16.20.0-3.10.12

WORKDIR /app/

COPY agora-deposit-cli/requirements.txt agora-deposit-cli/setup.py ./
COPY agora-deposit-cli/staking_deposit ./staking_deposit

RUN apk add --update gcc libc-dev linux-headers

RUN pip3 install -r requirements.txt

RUN python3 setup.py install

COPY bin ./bin
COPY data ./data
COPY docker ./docker
COPY src ./src
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm ci --prefix /app/

ENTRYPOINT [ "/app/docker/entrypoint.sh" ]
