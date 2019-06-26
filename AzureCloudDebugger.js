//import libraries
const {EventHubClient} = require("@azure/event-hubs");
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

//create the express app
const app = express();
//set the port for the http and webSocket server to listen on
const port = 3000;

//create http server
const httpServer = http.createServer(app);

//create websocket server
const webSocketServer = new WebSocket.Server({
    'server': httpServer
});

//return the home page
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/" + "index.html");
});

//return the css and other static files
app.get("/static/:page", function (req, res) {
    res.sendFile(__dirname + "/public/" + req.params["page"]);
});

//send status at /health
app.get("/health", function (req, res) {
    res.sendStatus(200);
});


// WebSocket server
webSocketServer.on("connection", function connection(connection) {
    console.log(Date().toString().slice(0, 24) + " - client connected");

    //handles when the client send the connection information to the server
    connection.on("message", function (message) {

        //Parse the connection information
        const parameters = String(message);
        const json_data = JSON.parse(parameters);

        //set the connection string, topic, and device variables
        const connectionString = json_data.Endpoint;
        const topic = json_data.Topic;
        const device = json_data.Device;

        //get the eventhub name from the last part of the connections string.
        const eventHubsName = connectionString.split("=")[5];

        //get the current time
        let currentTime = Math.floor(Date.now() / 1000);
        async function main() {

            //start the azure client listening to the eventhub
            const client = EventHubClient.createFromConnectionString(connectionString, eventHubsName);
            //get the number of partitions
            const allPartitionIds = await client.getPartitionIds();

            connection.on('close', function close() {
                client.close();
                console.log(Date().toString().slice(0, 24) + " - Device Disconnected from Azure");
            });

            //loop through all partitions.
            for (i = 0; i < allPartitionIds.length; i++) {

                const partitionId = allPartitionIds[i];
                const startTime = currentTime;

                //set connected to the partition to false
                let connectedToPartition = false;

                //start the eventHandler on current partition
                const receiveHandler = client.receive(partitionId, eventData => {

                    //send message to client that we have connected to at least 1 partition.
                    if (connectedToPartition === false) {
                        connection.send('{"Connected":"True"}');
                        connectedToPartition = true;
                        console.log(Date().toString().slice(0, 24) + " - Device Connected to Azure");
                    }

                    //check if the message received is after the connection time of the client
                    // is the device the client is looking to receive
                    // and/or is the topic the client specified
                    if (Math.floor((eventData.annotations["iothub-enqueuedtime"]) / 1000) > startTime &&
                        (eventData.annotations["iothub-connection-device-id"] === device || device === "") &&
                        (Object.keys(eventData._raw_amqp_mesage.application_properties)[0] === topic || topic === "")) {
                        if (Buffer.isBuffer(eventData.body))
                            eventData.body = eventData.body.toString('utf8');

                        //format the message data to return to the client
                        var messageData = {
                            "Device": eventData.annotations["iothub-connection-device-id"],
                            "Topic": Object.keys(eventData._raw_amqp_mesage.application_properties)[0],
                            "Payload": eventData.body,
                            "Time": Math.floor((eventData.annotations["iothub-enqueuedtime"]))
                        };

                        //format it in a json string
                        var responseJSON = JSON.stringify(messageData);

                        //check to see if the connection has been closed by the client
                        if (connection.readyState === 3) {
                            receiveHandler.stop();
                            client.close();
                            console.log(Date().toString().slice(0, 24) + " - Device Disconnected from Azure");
                        } else {
                            //send the message back to the client
                            connection.send(responseJSON);
                            console.log(Date().toString().slice(0, 24) + " - " + responseJSON);
                        }

                    }
                    // there was an error receiving a message from a partition.
                }, error => {
                    console.log(Date().toString().slice(0, 24) + " - Error when receiving message: " + error);
                    if (String(error).includes("Exceeded the maximum number of allowed receivers per")) {
                        connection.send(String("You have connected the maximum number of devices. Please close some devices and send a message to the IoT hub to clear any old connections"));
                    } else {
                        connection.send(String(error));
                    }

                });
            }

        }

        // there was an error connection to the eventhub
        main().catch(err => {
            //print the error
            console.log(Date().toString().slice(0, 24) + " - Error occurred: ", err);

            //send error to the client
            connection.send(String(err));
        });

    });

});

//start the server on specified port and print the connection details
const details = httpServer.listen(port, function () {
    const host = details.address().address;
    const port = details.address().port;
    console.log(Date().toString().slice(0, 24) + " - app listening at http://%s:%s", host, port);
});
