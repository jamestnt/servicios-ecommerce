const { generarLauValue } = require('../controller/encrypt.js');
const empresas = require('./labelJson.js');
const { formatData, formatPDF, convertirHTMLaPDF } = require('./functions.js');
const axios = require('axios');
const qs = require('qs');
const puppeteer = require('puppeteer');

const getToken = async (empresa) => {
    let firstEmpresa = Object.keys(empresas)[1]
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
        const pdfPath = path.join(__dirname, '../facturas/' + orderData.OrderId + '.pdf');
        const pdfBuffer = await convertirHTMLaPDF(htmlContent.data, pdfPath);
        fs.writeFileSync(pdfPath, pdfBuffer);
        return {
            pdf: pdfBuffer,
            error: false,
        };
    } catch (error) {
        console.log('Error al generar PDF:' + error);
        return {
            file: "",
            error: 'Error al generar PDF:' + error
        }
    }
}


const getNit = async (nit, empresa) => {
    const token = await getToken(empresa)
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
        data: { Nit: nit }
    };

    try {
        res = await axios.request(config)
        return res.data
    } catch (error) {
        console.log("ERROR GET NIT");
        console.log(JSON.stringify(error));
        return error
    }

}

const createInvoice = async (order) => {
    const { XMLParser } = require('fast-xml-parser');
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
                const parser = new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: "",  
                });
                facData = Buffer.from(data[1].XmlDteCertificado, 'base64')
                const jsonObj = parser.parse(facData.toString().replace(/dte:/g, "").replace(/@attributes/g, "attributes"));

                if (order.accion == "new") {
                    try {
                        var DataFac = {}
                        DataFac['UUID'] = data[1]['UUID'];
                        DataFac['Serie'] = data[1]['Serie'];
                        DataFac['Numero'] = data[1]['Numero'];
                        DataFac['OrderId'] = order.id,
                            console.log(JSON.stringify(jsonObj));

                        DataFac['FechaHoraCertificacion'] = data[1]['FechaHoraCertificacion'];
                        pdfData = jsonObj.GTDocumento.SAT.DTE
                        dataToSave = {
                            "empresa": order.empresa,
                            "NombreEmisor": pdfData.DatosEmision.Emisor.NombreEmisor,
                            "NombreCertificador": pdfData.Certificacion.NombreCertificador,
                            "NITCertificador": pdfData.Certificacion.NITCertificador,
                            "DireccionEmisor": pdfData.DatosEmision.Emisor.DireccionEmisor,
                            "NITEmisor": pdfData.DatosEmision.Emisor.NITEmisor,
                            "Data": DataFac,
                            "Receptor": pdfData.DatosEmision.Receptor,
                            "FechaHoraEmision": pdfData.DatosEmision.DatosGenerales.FechaHoraEmision,
                            "Direccion": pdfData.DatosEmision.Receptor.DireccionReceptor,
                            "Items": pdfData.DatosEmision.Items,
                            "GranTotal": pdfData.DatosEmision.Totales.GranTotal,
                            "OrderId": order.id,
                        };
                        await getPDF(dataToSave)
                    } catch (error) {
                        console.log("ERROR formatear para generar pdf");
                        console.log(JSON.stringify(error));
                    }
                    
                }
            } catch (error) {
                console.log("ERROR formatear respuesta");
                console.log(JSON.stringify(error));
            }
        } else {
            console.log("ERROR formatear peticion");
            console.log(data.error);
        }
    } catch (error) {
        console.log("ERROR Crear Factura");
        console.log(JSON.stringify(error));
    }
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
        console.log("ERROR EN REQUEST");
        console.log(JSON.stringify(error));
        return error
    }
}

module.exports = { createInvoice, getNit, getPDF }