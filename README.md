# Azure Cloud Debugger

This is a NodeJS app that listens to the Azure IotHub Eventhub and displays the messages received by the eventhub in the app. 

## Running Locally
Make sure you have [Node.js](http://nodejs.org/) installed.

```
$ git clone https://github.com/cushenst/Azure-Cloud-Debugger.git # or clone your own fork
$ cd Azure-Cloud-Debugger
$ npm install
$ npm start
```

The app should now be running on [localhost:3000](http://localhost:3000)

## running with Docker

```$bash

$ docker pull cushenst/azure-debugger
$ docker run -p 3000:3000 -it cushenst/azure-iothub

```

The app should now be running on port [localhost:3000](http://localhost:3000).

more information can be found [here](https://hub.docker.com/r/cushenst/azure-debugger)
