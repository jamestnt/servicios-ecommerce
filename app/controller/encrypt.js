const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const empresas = require('./labelJson.js');

function generarLauValue(data, empresa) {
    try {
        let skey = empresas[empresa].cred.SKEY
        console.log(empresas[empresa]);
        const hmac = CryptoJS.HmacSHA256(data, skey);
        const resultadoBase64 = CryptoJS.enc.Base64.stringify(hmac);
        data.cred = {};
        return resultadoBase64;   
    } catch (error) {
        console.log("ERROR LAU");
        console.log(error);
        data.cred = {};
        return false;
    }
}

module.exports = { generarLauValue }
