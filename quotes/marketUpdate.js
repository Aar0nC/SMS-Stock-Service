'use strict';

const subscriberList = require('./../users/subscriberList');
const marketData = require('./marketData');
const twilioWrapper = require('./../chat/twilioWrapper');
const co = require('co');

var getUpdatesForAllSubscribers = co.wrap(function *getUpdatesForAllSubscribers() {
    const subscribers = yield subscriberList.getSubscriberList();
    console.log('Subscriber list succesfully fetched');
    for (let i = 0; i < subscribers.length; i++) {
        const subscriber = subscribers[i];
        const update = yield marketData.getMarketData(subscriber.stockSymbols, subscriber.currencySymbols);
        console.log('Stock market data succesfully fetched');
        console.log('Sending message to ' + subscriber.userName);
        twilioWrapper.sendMessage(subscriber.phoneNumber, '6475034867', update);
    }
});

var getUpdateForSubscriber = co.wrap(function *getUpdateForSubscriber(phoneNumber) {
    const subscriber = yield subscriberList.getSubscriber(phoneNumber); //TODO: handle get subscriber exception throw
    const update = yield marketData.getMarketData(subscriber.stockSymbols, subscriber.currencySymbols);
    twilioWrapper.sendMessage(subscriber.phoneNumber, '6475034867', update);
});

module.exports = {
    getUpdatesForAllSubscribers,
    getUpdateForSubscriber
};