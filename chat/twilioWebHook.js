'use strict';

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const twilioWrapper = require('./twilioWrapper');
const subscriberList = require('./../users/subscriberList');
const marketUpdate = require('./../quotes/marketUpdate');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));

app.post('/sms', function(req, res) {
    const message = req.body;
    let messageValue = message.Body;
    if (messageValue) {
        messageValue = messageValue.toLowerCase();
    } else {
        //there is no message, return
        twilioWrapper.sendReply(res, chatStrings.invalidCommand);
        return;
    }
    if (messageValue === 'subscribe') {
        twilioWrapper.sendReply(res, chatStrings.subscriberNoName);
    } else if (messageValue.indexOf('subscribe') >= 0) {
        const fromNumber = message.From;
        let subscriberFirstName = messageValue.substring(messageValue.indexOf('subscribe') + 'subscribe'.length + 1);
        subscriberFirstName = subscriberFirstName.charAt(0).toUpperCase() + subscriberFirstName.substring(1);
        subscriberList.addSubscriber(fromNumber, subscriberFirstName).then(function () {
            twilioWrapper.sendReply(res, 'Thank you for subscribing, ' + subscriberFirstName + '. Enjoy the stock quotes!');
        }).catch(function (err) {
            twilioWrapper.sendReply(res, err.message);
        });
    } else if (messageValue === 'unsub') {
        const numberToRemove = message.From;
        subscriberList.removeSubscriber(numberToRemove).then(function(deletedUserName) {
            twilioWrapper.sendReply(res, 'All done, ' + deletedUserName + '! Sorry to see you go.');
        }).catch(function (err) {
            twilioWrapper.sendReply(res, err.message);
        });
    } else if (messageValue === 'commands') {
        twilioWrapper.sendReply(res, chatStrings.commands);
    } else if (messageValue === 'update') {
        marketUpdate.getUpdateForSubscriber(message.From).catch(function(err) {
            twilioWrapper.sendReply(err.message);
        });
    } else {
        twilioWrapper.sendReply(res, chatStrings.invalidCommand);
    }
});

http.createServer(app).listen(1337, function () {
    console.log("Express server listening on port 1337");
});