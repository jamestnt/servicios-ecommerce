const { generarLauValue } = require('../controller/encrypt.js');
const empresas = require('./labelJson.js');
const axios = require('axios');

const getToken = async () => {
    process.env.ENCKEY
}

const formatData = async (order) => {
    const fs = require('fs');
    const xml2js = require('xml2js');

    fs.readFile('./FormatosFacturas/genFac.txt', 'utf-8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo XML:', err);
            return;
        }
        console.log("data");
        // xml2js.parseString(data, { explicitArray: false }, (err, result) => {
        //     if (err) {
        //         console.error('Error al convertir XML a JSON:', err);
        //         return;
        //     }

        //     console.log(JSON.stringify(result, null, 2));
        // });
    });
}
const createInvoice = async (order) => {
    if (!order.empresa) {
        return {
            response: "empresa es un campo requerido",
            error: true
        }
    }
    let newLabel = empresas[order.empresa];

    newLabel['Params']['DateOfSale'] = order.date
    newLabel['Params']['ContentDescription'] = order.description
    newLabel['Params']['to_address'] = order.to_address
    newLabel['Params']['Ticket_Number'] = order.order_id
    newLabel['Params']['Order_Number'] = order.order_id
    newLabel['Params']['TotalValue'] = order.total
    newLabel['Params']['parcels'][0]['amount'] = order.total
    newLabel['Params']['parcels'][0]['description'] = order.productsSKU
    newLabel['Params']['COD']['CashOnDelivery'] = order.CashOnDelivery ? true : false
    newLabel['Params']['COD']['AmmountCashOnDelivery'] = order.total
    newLabel['Params']['PaymentMethod'] = "ECommerce"

    return sendRequest(newLabel);
}

module.exports = { createInvoice }
