'use strict';

const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2'
});

const db = new AWS.DynamoDB.DocumentClient();

function putItem(putItemParams) {
    return db.put(putItemParams).promise();
}

function scanTable(scanParams) {
    return db.scan(scanParams).promise();
}

function deleteItem(deleteItemParams) {
    return db.delete(deleteItemParams).promise();
}

module.exports = {
    putItem,
    scanTable,
    deleteItem
};