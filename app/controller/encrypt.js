const crypto = require('crypto');
const CryptoJS = require('crypto-js');

function generarLauValue(data) {
    try {
        const hmac = CryptoJS.HmacSHA256(data, process.env.SKEY);
        const resultadoBase64 = CryptoJS.enc.Base64.stringify(hmac);
        return resultadoBase64;   
    } catch (error) {
        return false;
    }
}

module.exports = { generarLauValue }
