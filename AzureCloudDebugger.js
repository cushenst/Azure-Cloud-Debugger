const {EventHubClient, delay} = require("@azure/event-hubs");

var WebSocketServer = require("websocket").server;
var http = require("http");

var express = require("express");
var app = express();

var SocketServer = http.createServer(function (request, response) {
// process HTTP request. Since we"re writing just WebSockets
// server we don"t have to implement anything.
});
SocketServer.listen(1337, function () {
});

// create the server
wsServer = new WebSocketServer({
    httpServer: SocketServer
});

// WebSocket server
wsServer.on("request", function (request) {
    var connection = request.accept(null, request.origin);
    console.log("connection requested");

// This is the most important callback for us, we"ll handle
// all messages from users here.
    connection.on("message", function (message) {
        const parameters = String(message.utf8Data);
        var json_data = JSON.parse(parameters);
        const connectionString = json_data.Endpoint;
        const topic = json_data.Topic;
        const device = json_data.Device;
        const eventHubsName = connectionString.split("=")[5];

        lastMessageTime = Math.floor(Date.now() / 1000);
        if (lastMessageTime === undefined) {
            var lastMessageTime = 0;
        }

        async function main() {

            const client = EventHubClient.createFromConnectionString(connectionString, eventHubsName);
            const allPartitionIds = await client.getPartitionIds();
            const firstPartitionId = allPartitionIds[2];
            const startTime = lastMessageTime;
            console.log("Device Connected");
            const receiveHandler = client.receive(firstPartitionId, eventData => {
                if (Math.floor((eventData.annotations["iothub-enqueuedtime"]) / 1000) > startTime &&
                    (eventData.annotations["iothub-connection-device-id"] === device || device === "") &&
                    (Object.keys(eventData._raw_amqp_mesage.application_properties)[0] === topic || topic === "")) {
                    var messageData = {
                        "Device": eventData.annotations["iothub-connection-device-id"],
                        "Topic": Object.keys(eventData._raw_amqp_mesage.application_properties)[0],
                        "Payload": String(eventData.body)
                    };
                    var responseJSON = JSON.stringify(messageData);
                    if (connection.state === "closed") {
                        receiveHandler.stop();
                        client.close();
                    }
                    connection.send(responseJSON);
                }
            }, error => {
                console.log("Error when receiving message: ", error);
            });
// Sleep for a while before stopping the receive operation.
        }

        main().catch(err => {
            console.log("Error occurred: ", err);
            connection.send(err);
            receiveHandler.stop();
            client.close();
        });


    });
    connection.on("close", function (connection) {

    });
});


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/" + "index.html");
});

var server1 = app.listen(8080, function () {
    var host = server1.address().address;
    var port = server1.address().port;

    console.log("app listening at http://%s:%s", host, port);
});
