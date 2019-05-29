# Azure Cloud Debugger

This is a NodeJS app that listens to the Azure IotHub Eventhub and displays the messages received by the eventhub in the app. 

## Running Locally
Make sure you have [Node.js](http://nodejs.org/) installed.

```
$ git clone https://github.com/stephen100/Azure-Cloud-Debugger.git # or clone your own fork
$ cd Azure-Cloud-Debugger
$ npm install
$ npm start
```

The app should now be running on [localhost:8080](http://localhost:8080)

## running with Docker

```$bash

$ docker pull cushenst/azure-debugger
$ docker run -p 8080:8080 -p 1337:1337 -it cushenst/azure-iothub

```

more information can be found [here](https://hub.docker.com/r/cushenst/azure-iothub)
