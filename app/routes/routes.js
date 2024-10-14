const express = require('express')
const { jwt_valid_token, jwt_get_token } = require('../middleware/jwt.js');
const { sendRequest, trackLabel, createLabel, cancelLabel } = require('../controller/requests.js');
const { createInvoice, getNit, getPDF } = require('../controller/facturas.js');
const { decrypt } = require('../controller/functions.js');;
const path = require('path');
const router = express.Router()

router.use((req, res, next) => {
    if (req.path == "/get_token") {
        next();
        return;
    }
    next();
})

router.get('/', async (req, res) => {
    console.log("HELLO WORLD");
    res.send("HELLO WORLD")
});

router.get('/get_token', async (req, res) => {
    const user = await jwt_get_token({
        id: 1,
        user: "james"
    })
    return res.status(200).json(user);
})


router.get('/get_departamento', async (req, res) => {
    const data = {
        "Method": "GetListProvincesByHeaderCode",
        "Params": { "HeaderCode": -1, "IdCountry": "GT" }
    };
    const response = await sendRequest(data);
    res.json(response)
})

router.get('/get_municipios', async (req, res) => {
    const data = {
        "Method": "GetListTownshipByHeaderCode",
        "Params": { "HeaderCode": -1, "IdCountry": "GT" }
    };
    const response = await sendRequest(data);
    res.json(response)
})

router.get('/get_banks', async (req, res) => {
    const data = {
        "Method": "GetBankName",
        "Params": { "ValName": -1, "IdCountry": "GT" }
    };
    const response = await sendRequest(data);
    res.json(response)
})

router.get('/anular_guia', async (req, res) => {
    
    const data = req.body
    const response = await cancelLabel(data);
    res.json(response)
})

router.get('/tracking', async (req, res) => {
    
    const data = req.body
    const response = await trackLabel(data);
    res.status(response.error ? 500 : 200)
    res.json(response)
})

router.get('/get_status_label', async (req, res) => {
    
    const data = req.body
    const response = await getStatusLabel(data);
    res.status(response.error ? 500 : 200)
    .json(response)
})

router.get('/crear_guia', async (req, res) => {
    
    const data = req.body    
    const response = await createLabel(data);
    res.status(response.error ? 500 : 200)
    res.json(response)
})

router.get('/crear_invoice', async (req, res) => {
    const data = req.body
    const response = await createInvoice(data);
    res.status(response.error ? 500 : 200)
        .json(response)
})

router.get('/cancelar_invoice', async (req, res) => {
    const data = req.body
    const response = await cancelInvoice(data);
    res.status(response.error ? 500 : 200)
        .json(response)
})

router.get('/nit', async (req, res) => {

    const { Nit, empresa } = req.body
    const response = await getNit(Nit,empresa);
    res.status(response.error ? 500 : 200)
        .json(response)
})

router.post('/pdf', async (req, res) => {
    const data = req.body
    const pdf = await getPDF(data);
    // console.log(data);
    if (!pdf.error){
        res.send(Buffer.from(pdf.pdf, 'binary').toString('base64'));
        // res.send(pdf.pdf);
    }else{
        res.status(500).send(pdf.error);
    }
})

function myMiddleware(req, res, next) {
    next(); // Llama al siguiente middleware o ruta
}

router.use(myMiddleware);


router.get('/download-pdf/*', async (req, res) => {
    const fs = require('fs');
    try {
        const order = decrypt(req.params[0], process.env.keyOrder);
        let data = JSON.parse(order)
        const pdfPath = path.join(__dirname, '../facturas/', `${data.id_orden}.pdf`); 
        if (fs.existsSync(pdfPath)) {
            res.setHeader('Content-Type', 'application/pdf');
            console.error('SUCCES INVOICE');
            console.error(pdfPath);
            const pdfStream = fs.createReadStream(pdfPath);
            pdfStream.pipe(res);
        } else {
            console.error('404 INVOICE ');
            res.status(404).send('Factura no encontrado.');
        }
    } catch (error) {
        console.error('Error al descargar el archivo PDF:', error);
        res.status(500).send('Error interno del servidor.');
    }
});


module.exports = router