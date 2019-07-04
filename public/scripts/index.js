$(function WebSockets(firstLoad = true) {
    //open websocket to server either with/without ssl
    if (window.location.protocol === "http:")
        var connection = new WebSocket("ws://" + window.location.host);
    else
        var connection = new WebSocket("wss://" + window.location.host);

    connection.onopen = function () {
        // connection is opened and ready to use
        console.log("connected to server");

        document.getElementById("ConnectingToServerBox").hidden = true;
        document.getElementById("WelcomeBox").hidden = false;
        document.getElementById("ErrorBox").hidden = true;

        //unlock the input boxes if connection was locked
        document.getElementById("Endpoint").disabled = false;
        document.getElementById("Device").disabled = false;
        document.getElementById("Topic").disabled = false;
        document.getElementById("button").disabled = false;
        // this is needed to stop firefox been refreshed too fast and causing it to exceed the Azure rate limit. (firefox saves the connection string. This forces it not to)
        if (firstLoad) {
            document.getElementById("Endpoint").value = "";
        }
        //Refresh the Azure connection if the socket was closed. Above is needed to slow user down.
        if (document.getElementById("Endpoint").value != "") {
            button();
        }

    };

    connection.onclose = function (error) {

        // the connection was lost with the node js server
        console.log("Connection to Server lost");

        //hide all message and display error
        document.getElementById("ConnectingToServerBox").hidden = true;
        document.getElementById("WelcomeBox").hidden = true;
        document.getElementById("ConnectionBox").hidden = true;
        document.getElementById("ConnectingBox").hidden = true;
        document.getElementById("ErrorBox").hidden = false;
        document.getElementById("ErrorMessage").innerHTML = "Connection to server lost, Reconnecting...";

        //lock all input boxes
        document.getElementById("Endpoint").disabled = true;
        document.getElementById("Device").disabled = true;
        document.getElementById("Topic").disabled = true;
        document.getElementById("button").disabled = true;
        //try to reconnect every 5 seconds
        setTimeout(function () {
            WebSockets(false)
        }, 5000);
    };


    connection.onmessage = function (message) {
        console.log(message.data);

        // try to decode json (I assume that each correct message
        // from server is json)
        try {
            var parsedMessage = JSON.parse(message.data);
            parsedMessage.Payload = JSON.stringify(parsedMessage.Payload);

            if (parsedMessage.Payload === undefined)
                parsedMessage.Payload = "";
            //check if it is connected to Azure
            if (parsedMessage.Connected === "True") {
                // hide the connecting to Azure... message
                document.getElementById("ConnectionBox").hidden = false;

                // display the successfully connecting message
                document.getElementById("ConnectingBox").hidden = true;

            } else {
                //calculate message time
                var date = new Date(parsedMessage.Time);
                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var seconds = "0" + date.getSeconds();
                //format time in correct format
                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

                // hide the connecting... message
                document.getElementById("ConnectionBox").hidden = true;

                //get the place the messages are going to be displayed
                var devicesMessagesContainer = document.querySelector('.device-messages');

                //insert the new message at the top of the page

                devicesMessagesContainer.insertAdjacentHTML('afterbegin',
                    '<div class="displaystyle-info message-container">' +
                    '<table><tr><th style="font-weight: bold">Device:</th><td>' +
                    String(parsedMessage.Device) +
                    '</td></tr><tr><th style="font-weight: bold">Topic:</th><td>' +
                    String(parsedMessage.Topic) +
                    '</td></tr><tr><th style="font-weight: bold">Message:</th><td>' +
                    parsedMessage.Payload +
                    '</td></tr><tr><th style="font-weight: bold">Time:</th><td>' +
                    String(formattedTime) +
                    '</td></tr></table></div>');

            }

        } catch (e) {
            //if an error message has been returned
            console.log("Error: ", message.data);

            //hide the connecting... message
            document.getElementById("ConnectingBox").hidden = true;

            //unlock the input boxes
            document.getElementById("Endpoint").disabled = false;
            document.getElementById("Device").disabled = false;
            document.getElementById("Topic").disabled = false;
            document.getElementById("button").disabled = false;

            //hide the welcome message
            document.getElementById("WelcomeBox").hidden = true;

            //display the error box with the error message
            document.getElementById("ErrorBox").hidden = false;
            document.getElementById("ErrorMessage").innerHTML = String(message.data);


        }
    };

    document.getElementById("button").onclick = function () {
        button();
    }

    function button() {
        //get values of the input boxes
        var Endpoint = $("#Endpoint").val();
        var Device = $("#Device").val();
        var Topic = $("#Topic").val();

        //format the inputs into a messages to be sent to the server
        var messageFormatted = {"Endpoint": Endpoint, "Device": Device, "Topic": Topic};
        var messageFormattedJSON = JSON.stringify(messageFormatted);
        console.log(messageFormattedJSON);

        //send values in json to server
        connection.send(messageFormattedJSON);

        //hide the error box an welcome box
        document.getElementById("ErrorBox").hidden = true;
        document.getElementById("WelcomeBox").hidden = false;

        //disable and un-focus the input boxes and submit button
        document.getElementById("Endpoint").disabled = true;
        document.getElementById("Endpoint").blur();
        document.getElementById("Device").disabled = true;
        document.getElementById("Device").blur();
        document.getElementById("Topic").disabled = true;
        document.getElementById("Topic").blur();
        document.getElementById("button").disabled = true;

        //hide the welcome message box
        document.getElementById("WelcomeBox").hidden = true;

        //display the connecting... message
        document.getElementById("ConnectingBox").hidden = false;

    }
});