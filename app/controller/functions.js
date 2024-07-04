const axios = require('axios');
const { log } = require('console');
const puppeteer = require('puppeteer');

const formatData = async (order) => {
    const fs = require('fs').promises;
    const path = require('path');
    const fechaActual = new Date();
    fechaActual.setUTCHours(fechaActual.getUTCHours() - 6);

    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const hora = String(fechaActual.getHours()).padStart(2, '0');
    const minuto = String(fechaActual.getMinutes()).padStart(2, '0');
    const segundo = String(fechaActual.getSeconds()).padStart(2, '0');
    const milisegundo = String(fechaActual.getMilliseconds()).padStart(3, '0');

    const zonaHoraria = fechaActual.getTimezoneOffset();
    const signo = zonaHoraria > 0 ? '-' : '+';
    const offsetHoras = String(Math.abs(Math.floor(zonaHoraria / 60))).padStart(2, '0');
    const offsetMinutos = String(Math.abs(zonaHoraria % 60)).padStart(2, '0');
    console.log("################   formatData   #############################");
    console.log(order);
    console.log("#############################################");
    order['Fecha'] = order['Fecha'] ? order['Fecha'] : `${año}-${mes}-${dia}T${hora}:${minuto}:${segundo}.${milisegundo}-06:00`;
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
        nit = typeof order.nit == 'undefined' ? order.Nit : order.nit;
        nit = nit.toCapitalize();
        nit = nit.replace(/\s+/g, '');
        order.nit = nit;
        order.Nit = nit;
        Object.keys(order).map(function (item, i) {
            data = data.Add(item.toCapitalize(), order[item]);
        });
        data.empresa = 
        return {
            data: Buffer.from(data, 'utf-8').toString('base64'),
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

const formatPDF = async (order, template) => {
    const fechaActual = new Date();

    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const hora = String(fechaActual.getHours()).padStart(2, '0');
    const minuto = String(fechaActual.getMinutes()).padStart(2, '0');
    const segundo = String(fechaActual.getSeconds()).padStart(2, '0');
    const milisegundo = String(fechaActual.getMilliseconds()).padStart(3, '0');

    const zonaHoraria = fechaActual.getTimezoneOffset();
    const signo = zonaHoraria > 0 ? '-' : '+';
    const offsetHoras = String(Math.abs(Math.floor(zonaHoraria / 60))).padStart(2, '0');
    const offsetMinutos = String(Math.abs(zonaHoraria % 60)).padStart(2, '0');

    // order['Fecha'] = `${año}-${mes}-${dia}T${hora}:${minuto}:${segundo}.${milisegundo}${signo}${offsetHoras}:${offsetMinutos}`;
    try {
        // order.items = await formatItems(order.items, formatoItems)
        let keys = getValues(order);

        var items = ""
        if (!order.Items.Item.length) {
            temp = []

            temp.push(order.Items.Item)
            order.Items.Item = temp
            console.log('formatPDF');
            console.log(JSON.stringify(order.Items.Item));
        }
        order.Items.Item.map((item, i) => {
            items += `<tr class="item">`;
            items += `<td>${parseFloat(item.Cantidad).toFixed(0)}</td>`;
            items += `<td>${item.Descripcion}</td>`;
            items += `<td>Q.${parseFloat(item.PrecioUnitario).toFixed(2)}</td>`;
            items += `<td>Q.${parseFloat(item.Precio).toFixed(2)}</td>`;
            items += `</tr>`;
        });

        keys["Items"] = items;
        keys["DireccionR"] = order.Direccion;
        keys["GranTotal"] = parseFloat(keys["GranTotal"]).toFixed(2)
        Object.keys(keys).map(function (item, i) {
            template = template.Add(item, keys[item]);
        });

        return {
            data: template,
            error: false
        };
    } catch (error) {
        return {
            data: "",
            error: ('Error al leer el formato:' + error)
        };

    }
}

const formatItems = async (items, formato) => {

    res = [];
    for (let i = 0; i < items.length; i++) {
        let format = formato
        Object.keys(items[i]).map(function (item, index) {
            try {
                val = Number(items[i][item]).toFixed(6).toString()
                if ("Cantidad" == item.toCapitalize()) {
                    val = Number(items[i][item]).toFixed(4).toString()
                }
                if (val == "NaN" || "Indice" == item.toCapitalize()) {
                    format = format.Add(item.toCapitalize(), items[i][item].toString());
                } else {
                    format = format.Add(item.toCapitalize(), val);
                }

            } catch (error) {
                format = format.Add(item.toCapitalize(), items[i][item].toString());
            }
        });
        res = res + format
    }
    return res;
}


async function convertirHTMLaPDF(htmlContent) {
    const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdfBuffer;
}

function getValues(objeto, resultados = {}) {
    for (let key in objeto) {
        if (typeof objeto[key] === 'object' && objeto[key] !== null) {
            getValues(objeto[key], resultados);
        } else {
            resultados[key] = objeto[key];
        }
    }
    return resultados;
}

String.prototype.Add = function (key, data) {
    key = "{{" + key + "}}";
    return this.replace(new RegExp(key, 'g'), data);
};

String.prototype.toCapitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

module.exports = { formatData, formatItems, convertirHTMLaPDF, formatPDF }
