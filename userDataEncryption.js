'use strict';

const key = process.env.ENC_KEY;
const crypto = require('crypto');
const algorithm = 'aes-256-ctr';

function encrypt(userData) {
    const cipher = crypto.createCipher(algorithm, key);
    let ciphertext = cipher.update(userData, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    console.log("Encrypted user data: " + ciphertext);
    return ciphertext;
}

function decrypt(userData) {
    const decipher = crypto.createDecipher(algorithm, key);
    let plaintext = decipher.update(userData, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    console.log("Decrypted user data: " + decrypted);
    return plaintext;
}

module.exports =  {
    encrypt,
    decrypt
};