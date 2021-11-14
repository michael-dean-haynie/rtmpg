# RTMPG (Real Time Multiplayer Game)

## Run Application Locally

```sh
npm run start:dev
```

## References

- https://khalilstemmler.com/blogs/typescript/node-starter-project/
- https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/
- https://khalilstemmler.com/blogs/tooling/prettier/
- https://medium.com/@nickexcell/using-typescript-project-references-with-ts-loader-and-webpack-part-1-5d0c3cd7c603

Idea for Game State Management: https://martinfowler.com/eaaDev/EventSourcing.html

## Deployment docker image to linode

```sh
sudo apt install unzip

curl -LO https://github.com/michael-dean-haynie/rtmpg/archive/master.zip

unzip master.zip

cd rtmpg

# stop the currently running container
docker stop $(docker ps -a -q)
docker rm $(docker container ls -a -q)
docker rmi $(docker images -a -q)

# build new image
sudo docker image build -t rtmpg:1.0 .

# start fresh container
sudo docker container run --publish 80:8080 --detach --name rtmpg rtmpg:1.0
```
