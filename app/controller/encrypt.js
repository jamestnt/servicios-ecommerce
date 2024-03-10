const crypto = require('crypto');
const CryptoJS = require('crypto-js');

function generarLauValue(data) {
    try {
        const hmac = CryptoJS.HmacSHA256(data, process.env.SKEY);

        console.log("SKEY");
        console.log(process.env.SKEY);
        console.log("DATA");
        console.log(data);
        const resultadoBase64 = CryptoJS.enc.Base64.stringify(hmac);
        return resultadoBase64;   
    } catch (error) {
        console.log("ERROR LAU");
        console.log(error);
        return false;
    }
}

module.exports = { generarLauValue }
