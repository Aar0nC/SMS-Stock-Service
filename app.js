'use strict';

let AUTH_SID = process.env.AUTH_SID;
let AUTH_TOKEN = process.env.AUTH_TOKEN;

const twilio = require('twilio')(AUTH_SID, AUTH_TOKEN);
let cronJob = require('cron').CronJob;
let stockData = require('./marketData');
let subscriberListDAO = require('./subscriberList');
require('./twilioWebHook'); //serves incoming messages to the twilio number

const stockSymbols = [{name: 'DOW', symbol: 'INDEXDJX: .DJI'}, {name: 'S&P 500', symbol: 'INDEXSP: .INX'},
    {name: 'TSX/S&P', symbol: 'INDEXTSI: OSPTX'}, {name: 'NASDAQ', symbol: 'NASDAQ: NDAQ'}];

const currencySymbols = ['CAD', 'GBP', 'EUR'];

const prodCronTimeStamps = ['30 9 * * 1-7', '30 10 * * 1-7', '30 11 * * 1-7',  '30 12 * * 1-7', '30 13 * * 1-7', '30 14 * * 1-7', '30 15 * * 1-7', '30 16 * * 1-7'];

prodCronTimeStamps.forEach(function(timeStamp) {
    publishCronMarketData(timeStamp);
});

function publishCronMarketData(cronTimeStamp){
    let subscriberList;
    let textJob = new cronJob(cronTimeStamp, function() {
        console.log('Cron job executing');
        subscriberListDAO.getSubscriberList().then(function(response) {
            console.log('Subscriber list succesfully fetched');
            subscriberList = response;
            return stockData.getMarketData(stockSymbols, currencySymbols)
        }).then(function(stockPrices){
            console.log('Stock market data succesfully fetched');
            subscriberList.forEach(function(subscriber) {
                console.log('Sending message to ' + subscriber.userName + ' ' + subscriber.phoneNumber);
                twilio.sendMessage({
                    to: subscriber.phoneNumber,
                    from: '6475034867',
                    body: stockPrices
                }, function(err, data) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("SMS succesfully sent to " + subscriber.phoneNumber);
                    console.log("SMS ID is " + data.sid);
                    console.log(data.body);
                });
            });
        }).catch(function(err) {
            console.log(err);
        });
    }, null, true);
}