const { generarLauValue } = require('../controller/encrypt.js');
const empresas = require('./labelJson.js');
const axios = require('axios');

const createLabel = async (order) => {
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

const cancelLabel = async (order) => {
    if (!order.empresa) {
        return {
            response: "empresa es un campo requerido",
            error: true
        }
    }
    if (!order.guia) {
        return {
            response: "Guia es un campo requerido",
            error: true
        }
    }
    let LabelData = empresas[order.empresa];
    var arr = order.guia.split(/([a-zA-Z]+|\d+)/);
    arr = arr.filter(Boolean);

    // Filtra elementos vacíos
    const label = {
        "Method": "SetCancelGuides",
        "Params": {
            "IdClient": LabelData.Params.COD.CreditNumber,
            "Token": process.env.CODAPP,
            "Guides": [
                {
                    "Serie": arr[0],
                    "Number": arr[1]
                },
            ]
        }
    }
    // return label;
    return sendRequest(label);
}

const trackLabel = async (order) => {
    if (!order.empresa) {
        return {
            response: "empresa es un campo requerido",
            error: true
        }
    }
    if (!order.guia) {
        return {
            response: "Guia es un campo requerido",
            error: true
        }
    }
    let LabelData = empresas[order.empresa];
    var arr = order.guia.split(/([a-zA-Z]+|\d+)/);
    arr = arr.filter(Boolean);

    // Filtra elementos vacíos
    const label = {
        "Method": "GetTrackOrderDetail",
        "Params": {
            "GuideSerie": arr[0],
            "GuideNumber": arr[1]
        }
    }
// return label;
return sendRequest(label);
}

const sendRequest = async (request) => {
console.log(process.env.ENDPOINT);
    const jsonString = JSON.stringify(request)
    let data = JSON.stringify({
        "CodApp": process.env.CODAPP,
        "PayLoad": Buffer.from(jsonString).toString('base64')
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.ENDPOINT + request.Method,
        headers: {
            'LauValue': generarLauValue(jsonString),
            'Content-Type': 'application/json'
        },
        data: JSON.parse(data)
    };

    console.log("REQUEST");
    console.log(config);
    const resp = await axios.request(config)
        .then((response) => {
            console.log("RESPONSE0");
            return {
                response: JSON.parse(Buffer.from(response.data.PayLoad, 'base64').toString('utf-8')),
                error: false
            }
        })
        .catch((error) => {
            console.log("RESPONSE1");
            console.log(error.response.data.PayLoad);
            return {
                response: JSON.parse(Buffer.from(error.response.data.PayLoad, 'base64').toString('utf-8')),
                error: true
            }

        });
    console.log("RESPONSE2");
    return resp
}

module.exports = { sendRequest, createLabel, cancelLabel, trackLabel }
