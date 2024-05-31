const express = require('express')
const { jwt_valid_token, jwt_get_token } = require('../middleware/jwt.js');
const { sendRequest, trackLabel, createLabel, cancelLabel } = require('../controller/requests.js');
const { createInvoice, getNit, getPDF } = require('../controller/facturas.js');
const puppeteer = require('puppeteer');
const router = express.Router()

router.use((req, res, next) => {
    if (req.path == "/get_token") {
        next();
        return;
    }
    next();

    // const token = req.header('Authorization');
    // const data = jwt_valid_token(token.split(" ")[1])
    // if (data.success) {
    //     next();
    // } else {
    //     return res.status(200).json(data);
    // }
})

router.get('/get_token', async (req, res) => {
    const user = await jwt_get_token({
        id: 1,
        user: "james"
    })
    console.log(user);
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

    const data = req.body
    const response = await getNit(data);
    res.status(response.error ? 500 : 200)
        .json(response)
})

router.post('/pdf', async (req, res) => {
    const data = req.body
    const pdf = await getPDF(data);
    console.log(data);
    if (!pdf.error){
        res.send(Buffer.from(pdf.pdf, 'binary').toString('base64'));
        // res.send(pdf.pdf);
    }else{
        res.status(500).send(pdf.error);
    }
})


module.exports = router