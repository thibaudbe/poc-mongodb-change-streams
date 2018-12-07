[POC] Mongodb change streams
===

Using
* reactjs (CRA)
* nodejs (express)
* docker

## Setup

First, copy env vars
```
cp .env.sample .env
```

Start docker
```
docker-compose up
```

Start client (dev)
```
cd client && npm start
```

Start server (dev)
```
cd server && npm start
```

## Test vars

```
docker-compose config
```

## Ressources

* [How to Get Environment Variables Passed Through docker-compose to the Containers](https://staxmanade.com/2016/05/how-to-get-environment-variables-passed-through-docker-compose-to-the-containers/)
* [How to use environment variables in docker compose](https://stackoverflow.com/questions/29377853/how-to-use-environment-variables-in-docker-compose)
