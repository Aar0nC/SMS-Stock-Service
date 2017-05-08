const db = require('./dbWrapper');
const crypto = require('./userDataEncryption');
const TABLE_NAME = process.env.TABLE_NAME;

db.scanTable({TableName: TABLE_NAME}).then(function(response) {
    console.log(response);
    response.Items.forEach(function(subscriber) {
        const encryptedPhoneNumber = crypto.encrypt(subscriber.phoneNumber);
        subscriber.phoneNumber = encryptedPhoneNumber;
        const updateItemParams = {
            TableName: TABLE_NAME,
            Item: subscriber
        };
        db.putItem(updateItemParams).then(function(response) {
            console.log('Succesfully encrypted ' + subscriber.userName);
        }).catch(function(err) {
            console.log(err);
        });
    });
}).catch(function(err) {
    console.error(err);
});