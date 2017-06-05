'use strict';

let AUTH_SID = process.env.AUTH_SID;
let AUTH_TOKEN = process.env.AUTH_TOKEN;

const twilio = require('twilio')(AUTH_SID, AUTH_TOKEN);
const twiml = require('twilio');

function sendMessage(outgoingNumber, fromNumber, body) {
    twilio.sendMessage({
        to: outgoingNumber,
        from: fromNumber,
        body: body
    }, function(err, data) {
        if (err) {
            console.log(err);
        }
        console.log("SMS ID is " + data.sid);
        console.log(data.body);
    });
}

function sendReply(response, message) {
    const twiML = twiml.TwimlResponse();
    twiML.message(message);
    response.writeHead(200, {'Content-Type': 'text/xml'});
    response.end(twiML.toString());
}

module.exports = {
    sendMessage,
    sendReply
};
