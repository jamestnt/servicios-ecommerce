const { generarLauValue } = require('../controller/encrypt.js');
const empresas = require('./labelJson.js');
const { formatData, formatPDF, convertirHTMLaPDF } = require('./functions.js');
const axios = require('axios');
const qs = require('qs');
const puppeteer = require('puppeteer');

const getToken = async (empresa) => {
    let firstEmpresa = Object.keys(empresas)[0]
    let empData = empresa ? empresas[empresa].cred : empresas[firstEmpresa].cred
    let data = qs.stringify({
        'username': empData.USERNAMEFAC,
        'password': empData.PASSWORDFAC,
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

const getPDF = async (orderData) => {
    const path = require('path');
    const fs = require('fs');

    var htmlContent = await fs.promises.readFile(path.join(__dirname, '../assets/templatecmw.html'), 'utf-8');

    htmlContent = await formatPDF(orderData, htmlContent)
    try {
        const pdfBuffer = await convertirHTMLaPDF(htmlContent.data);
        // const pdfPath = path.join(__dirname, 'archivo.pdf');
        // fs.writeFileSync(pdfPath, pdfBuffer);
        return {
            pdf: pdfBuffer,
            error: false,
        };
    } catch (error) {

        return {
            file: "",
            error: 'Error al generar PDF:' + error
        }
    }
}


const getNit = async (nit) => {
    const token = await getToken(false)

    const axios = require('axios');
    let data = JSON.stringify({
        "Nit": "81599595"
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.ENDPOINTFAC + 'ConsultarNit',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token.token,
        },
        data: nit
    };

    try {
        res = await axios.request(config)
        return res.data
    } catch (error) {
        return error
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
    console.log(data);
    try {
        if (!data.error) {
            try {
                data = await sendRequest(data, order.id, url);
                error = false
                console.log(data);
                console.log(data[1].Errores);
            } catch (error) {

            }
        }
    } catch (error) {
        console.log("################ ORDEN CON ERROR ###################");
        order
        console.log("################ ////ORDEN CON ERROR ###################");
    }
    //    console.log(data);
    //    console.log(data[1].Errores);
    return { data, error: error }
}


const sendRequest = async (data, orderId, URL) => {
    const token = await getToken(data.empresa)
    content = {
        "xmlDte": data.data,
    }
    if (orderId) {
        content.Referencia = orderId
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
    try {
        res = await axios.request(config)
        return [data.data,
        res.data]
    } catch (error) {
        return error
    }
}

module.exports = { createInvoice, getNit, getPDF }
