'use strict';

const cronJob = require('cron').CronJob;
const marketUpdate = require('./quotes/marketUpdate');
require('./chat/twilioWebHook'); //initaties the webhook server

const prodTimeStamp = '30 9,12,16 * * 1-5';
const job = new cronJob({
    cronTime: prodTimeStamp,
    onTick: function() {
        console.log('Cron job executing');
        marketUpdate.getUpdatesForAllSubscribers().catch(function(err) {
            console.log(err);
        });
    },
    start: false
});
job.start();