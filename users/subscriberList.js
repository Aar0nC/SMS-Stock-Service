'use strict';

const dbWrapper = require('./../dal/dbWrapper');
const co = require('co');
const userDataEncryption = require('./userDataEncryption');
const TABLE_NAME = process.env.TABLE_NAME;

var addSubscriber = co.wrap(function *addSubscriber(phoneNumber, userName) {
    const encryptedPhoneNumber = userDataEncryption.encrypt(phoneNumber);
    const subscriberObject = {
        phoneNumber: encryptedPhoneNumber,
        userName: userName,
        stockSymbols: [
            {
                "name": "DOW",
                "symbol": "INDEXDJX: .DJI"
            },
            {
                "name": "S&P 500",
                "symbol": "INDEXSP: .INX"
            },
            {
                "name": "TSX/S&P",
                "symbol": "INDEXTSI: OSPTX"
            },
            {
                "name": "NASDAQ",
                "symbol": "NASDAQ: NDAQ"
            },
            {
                "name": "SHOPIFY",
                "symbol": "TSE:SHOP"
            }
        ],
        currencySymbols: ["CAD", "GBP", "EUR"]
    };

    const addSubscriberParams = {
        TableName: TABLE_NAME,
        Item: subscriberObject,
        ReturnValues: 'ALL_OLD'
    };

    const oldSubscriberInfo = yield dbWrapper.putItem(addSubscriberParams).catch(function(err) {
        console.log(err);
    });

    if (oldSubscriberInfo.Attributes) {
        //the user is already subscribed
        throw new Error('Woah there, ' + userName + '! You are already subscribed.');
    }
});

var removeSubscriber = co.wrap(function *removeSubscriber(phoneNumber) {
    const encryptedPhoneNumber = userDataEncryption.encrypt(phoneNumber);
    const deleteSubscriberParams = {
        TableName: TABLE_NAME,
        Key: {
            'phoneNumber': encryptedPhoneNumber
        },
        ReturnValues: 'ALL_OLD'
    };
    const deletedUser = yield dbWrapper.deleteItem(deleteSubscriberParams).catch(function(err) {
        console.log(err);
    });

    if (!deletedUser.Attributes) {
        //nothing to delete
        throw new Error('You are already unsubscribed.');
    }

    return deletedUser.Attributes.userName;
});

var getSubscriberList = co.wrap(function *getSubscriberList() {
    console.log('Getting subscriber list');
    const scanParams = {
        TableName: TABLE_NAME
    };

    const subscriberList = yield dbWrapper.scanTable(scanParams).catch(function(err) {
        console.log(err);
    });

    subscriberList.Items.forEach(function(subscription) {
        subscription.phoneNumber = userDataEncryption.decrypt(subscription.phoneNumber);
    });

    return subscriberList.Items;
});

var getSubscriber = co.wrap(function *getSubscriber(phoneNumber) {
    const encryptedPhoneNumber = userDataEncryption.encrypt(phoneNumber);
    const getSubscriberParams = {
        TableName: TABLE_NAME,
        Key: {
            'phoneNumber': encryptedPhoneNumber
        }
    };

    const subscriber = yield dbWrapper.getItem(getSubscriberParams).catch(function(err) {
        console.log(err);
    });

    if (!subscriber.Item) {
        throw new Error("Woah! You aren't subscribed yet");
    }

    subscriber.Item.phoneNumber = userDataEncryption.decrypt(subscriber.Item.phoneNumber);

    return subscriber.Item;
});

module.exports = {
    addSubscriber,
    removeSubscriber,
    getSubscriberList,
    getSubscriber
};