const { generarLauValue } = require('../controller/encrypt.js');
const empresas = require('./labelJson.js');
const axios = require('axios');
const qs = require('qs');

const getToken = async () => {
    let data = qs.stringify({
        'username': process.env.USERNAMEFAC,
        'password': process.env.PASSWORDFAC,
        'grant_type': 'password'
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.ENDPOINTFAC + 'GetToken',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data
    };
    try {
        const res = await axios.request(config)
        return {
            token: res.data.access_token,
            error: false
        }
    } catch (error) {
        return {
            token: "",
            error: "fail token"
        }
    }
}

const formatData = async (order) => {
    const fs = require('fs').promises;
    const path = require('path');
    try {
        if (typeof order.accion == "undefined") {
            return {
                data: "",
                error: "invalid action"
            };
        }
        if (order.accion == "new") {
            allField = typeof order.nit != "undefined" && typeof order.nombreNit != "undefined" && typeof order.direccion != "undefined" && typeof order.municipio != "undefined" && typeof order.departamento != "undefined" && typeof order.items != "undefined" && typeof order.totalImpuesto != "undefined" && typeof order.total != "undefined"
            if (!allField) {
                return {
                    data: "",
                    error: "invalid fields"
                };
            }
            data = await fs.readFile(path.join(__dirname, './FormatosFacturas/genFac.xml'), 'utf-8');
            const formatoItems = await fs.readFile(path.join(__dirname, './FormatosFacturas/items.xml'), 'utf-8');

            order.items = await formatItems(order.items, formatoItems)

        } else {
            allField = typeof order.Doc && typeof order.Nit && typeof order.FechaEmision && typeof order.Fecha
            if (!allField) {
                return {
                    data: "",
                    error: "invalid fields"
                };
            }
            data = await fs.readFile(path.join(__dirname, './FormatosFacturas/anuFac.xml'), 'utf-8');
        }
        Object.keys(order).map(function (item, i) {
            data = data.Add(item.toCapitalize(), order[item]);
        });
        return {
            data: Buffer.from(data,'utf-8').toString('base64'),
            error: false
        };
    } catch (error) {
        if (!allField) {
            return {
                data: "",
                error: ('Error al leer el formato:' + error)
            };
        }
    }
}

const createInvoice = async (order) => {
    var url = "";
    data = {}
    if (order.accion == "new") {
        data = await formatData(order);
        url = process.env.ENDPOINTFAC + 'CertificarDte'
    } else {
        data = await formatData(order);
        url = process.env.ENDPOINTFAC + 'AnularDte'
    }
    
    error = "error request"
    if (!data.error) {
        data = await sendRequest(data, order.id, url);
        error = false
    }
    return { data, error: error }
}


const formatItems = async (items, formato) => {

    res = [];
    for (let i = 0; i < items.length; i++) {
        let format = formato
        Object.keys(items[i]).map(function (item, index) {
            try {
                val = Number(items[i][item]).toFixed(6).toString()
                console.log(item.toCapitalize());
                if ("Cantidad" == item.toCapitalize()){
                    val = Number(items[i][item]).toFixed(4).toString()
                }
                if (val == "NaN" || "Indice" == item.toCapitalize()){
                    format = format.Add(item.toCapitalize(), items[i][item].toString());   
                }else{
                    format = format.Add(item.toCapitalize(), val);
                }
                
            } catch (error) {
                format = format.Add(item.toCapitalize(), items[i][item].toString());   
            }
        });
        res=res+format
    }
    return res;
}
const sendRequest = async (data, orderId, URL) => {
    const token = await getToken()
    content = {
        "xmlDte": data.data,
    }
    if(orderId){
        content.Referencia= orderId
    }
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token.token
        },
        data: JSON.stringify(content)
    };
    console.log(content);
    try {
        res = await axios.request(config)
        return [data.data,
    res.data]
    } catch (error) {
        return error
    }
}

String.prototype.Add = function (key, data) {
    key = "{{" + key + "}}";
    return this.replace(new RegExp(key, 'g'), data);
};

String.prototype.toCapitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
module.exports = { createInvoice }