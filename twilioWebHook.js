'use strict';

const http = require('http');
const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const subscriberList = require('./subscriberList');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));

app.post('/sms', function(req, res) {
    const message = req.body;
    let messageValue = message.Body;
    const twiML = twilio.TwimlResponse();
    if (messageValue) {
        messageValue = messageValue.toLowerCase();
    } else {
        //there is no message, return
        twiML.message('Invalid command. Type COMMANDS to see a list of commands.');
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiML.toString());
        return;
    }
    if (messageValue === 'subscribe') {
        twiML.message('So close! We just need a first name. Ex: \'SUBSCRIBE Jimmy\'');
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiML.toString());
    } else if (messageValue.indexOf('subscribe') >= 0) {
        //New user who wishes to subscribe to our service
        const fromNumber = message.From;
        let subscriberFirstName = messageValue.substring(messageValue.indexOf('subscribe') + 'subscribe'.length + 1);
        subscriberFirstName = subscriberFirstName.charAt(0).toUpperCase() + subscriberFirstName.substring(1);
        subscriberList.addSubscriber(fromNumber, subscriberFirstName).then(function () {
            twiML.message('Thank you for subscribing, ' + subscriberFirstName + '. Enjoy the stock quotes!');
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiML.toString());
        }).catch(function (err) {
            twiML.message(err.message);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiML.toString());
        });
    } else if (messageValue === 'unsub') {
        //Need to remove this user from the DB.
        const numberToRemove = message.From;
        subscriberList.removeSubscriber(numberToRemove).then(function(deletedUserName) {
            twiML.message('All done, ' + deletedUserName + '! Sorry to see you go.');
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiML.toString());
        }).catch(function (err) {
            twiML.message(err.message);
            res.writeHead(200, {'Content-Type': 'text/xml'});
            res.end(twiML.toString());
        });
    } else if (messageValue === 'commands') {
        let helpMessage = 'Welcome to the SMS Stock Quote Service. Here is a list of commands: ' + '\n'
                            + 'SUBSCRIBE yourFirstNameHere: You will be receiving stock quotes throughout the day \n' + 'UNSUB: No more stock quotes! You can always subscribe again later.';
        twiML.message(helpMessage);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiML.toString());
    } else {
        twiML.message('Invalid command. Type COMMANDS to see a list of commands.');
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiML.toString());
    }
});

http.createServer(app).listen(1337, function () {
    console.log("Express server listening on port 1337");
});