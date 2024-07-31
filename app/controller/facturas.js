const { generarLauValue } = require('../controller/encrypt.js');
const empresas = require('./labelJson.js');
const { formatData, formatPDF, convertirHTMLaPDF } = require('./functions.js');
const axios = require('axios');
const qs = require('qs');
const puppeteer = require('puppeteer');

const getToken = async (empresa) => {
    let firstEmpresa = Object.keys(empresas)[1]
    let empData = empresa ? empresas[empresa].cred : empresas[firstEmpresa].cred
    // console.log(empData);
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
        const pdfPath = path.join(__dirname, '../facturas/' + orderData.OrderId + '.pdf');
        console.log(pdfPath);
        const pdfBuffer = await convertirHTMLaPDF(htmlContent.data, pdfPath);
        fs.writeFileSync(pdfPath, pdfBuffer);
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
    // console.log(token);
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
    const xml2js = require('xml2js');

    var url = "";
    var data = {
        error: false
    }
    if (order.accion == "new") {
        data = await formatData(order);
        url = process.env.ENDPOINTFAC + 'CertificarDte'
    } else {
        data = await formatData(order);
        url = process.env.ENDPOINTFAC + 'AnularDte'
    }

    error = "error request"
    try {
        if (!data.error) {
            try {
                data = await sendRequest(data, order.id, url, order.empresa);
                error = false
                const parser = new xml2js.Parser();

                facData = Buffer.from(data[1].XmlDteCertificado, 'base64')
                console.log(data);
                if (order.accion == "new") {
                    console.log("#########################################");
                    parser.parseString(facData.toString().replace(/dte:/g, ""), async (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            var DataFac = {}
                            DataFac['UUID'] = data[1]['UUID'];
                            DataFac['Serie'] = data[1]['Serie'];
                            DataFac['Numero'] = data[1]['Numero'];
                            DataFac['OrderId'] = order.id,
                                DataFac['FechaHoraCertificacion'] = data[1]['FechaHoraCertificacion'];
                            pdfData = result
                            console.log("################################## DATA ###################################################");
                            console.log(pdfData);
                            console.log("################################## DATA ###################################################");
                            dataToSave = {
                                "NombreEmisor": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].Emisor[0].$.NombreEmisor,
                                "NombreCertificador": pdfData.GTDocumento.SAT[0].DTE[0].Certificacion[0].NombreCertificador[0],
                                "NITCertificador": pdfData.GTDocumento.SAT[0].DTE[0].Certificacion[0].NITCertificador[0],
                                "DireccionEmisor": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].Emisor[0].DireccionEmisor[0],
                                "NITEmisor": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].Emisor[0].$.NITEmisor,
                                "Data": DataFac,
                                "Receptor": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].Receptor[0].$,
                                "FechaHoraEmision": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].DatosGenerales[0].$.FechaHoraEmision,
                                "Direccion": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].Receptor[0].DireccionReceptor[0],
                                "Items": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].Items[0],
                                "GranTotal": pdfData.GTDocumento.SAT[0].DTE[0].DatosEmision[0].Totales[0].GranTotal[0],
                                "OrderId": order.id,
                            };
                            await getPDF(dataToSave)
                            console.log(JSON.stringify(result));
                        }
                    });
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            // console.log(data.error);
        }
    } catch (error) {
        // console.log("################ ORDEN CON ERROR ###################");
        // console.log(error);
        // console.log("################ ////ORDEN CON ERROR ###################");
    }
    //    console.log(data);
    //    console.log(data[1]);
    return { data, error: error }
}


const sendRequest = async (data, orderId, URL, empresa) => {
    const token = await getToken(empresa)
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