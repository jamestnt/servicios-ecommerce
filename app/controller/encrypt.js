const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const empresas = require('./labelJson.js');

function generarLauValue(data, empresa) {
    try {
        let skey = empresas[empresa].cred.SKEY
        const hmac = CryptoJS.HmacSHA256(data, skey);
        const resultadoBase64 = CryptoJS.enc.Base64.stringify(hmac);
        return resultadoBase64;   
    } catch (error) {
        console.log("ERROR LAU");
        console.log(error);
        return false;
    }
}

module.exports = { generarLauValue }
