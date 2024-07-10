var guatehogar = {
    "Method": "GetServiceByHeaderCodeRequest",
    "cred": {
        "CODAPP": "SICHMALLAPIECOM060720231805",
        "ENCKEY": "uF66eqh7gysgIstqRWkkIlwU2o3hMvIi",
        "SKEY": "-cVN3aTOInLA~=B0tJ$87X]2YG;cJ1CV",
        "ENDPOINT": "https://apicore.forzadelivery.io/ecommerce/",
        "ENDPOINTFAC": "https://testws.ccgfel.gt/Api/",
        "USERNAMEFAC": "81599595",
        "PASSWORDFAC": "Hogar01#",
    },
    "Params": {
        "DateOfSale": "2020-08-13 11:51",
        "ContentDescription": "",
        "to_address": {
            "name": "John Doe",
            "phone": "5551231234",
            "email": "johndoe@gmail.com",
            "contact": "Max Ross",
            "HeaderCodeTownship": "0103",
            "address1": "15 Calle C 13-52",
            "address2": "Zona 5 Villa Nueva",
            "city": "Guatemala"
        },
        "from_address": {
            "name": "Importadora CMW",
            "phone": "48551704",
            "email": "admin@guatehogar.com",
            "HeaderCodeTownship": "0103",
            "address1": "Km. 27 carr a Palencia, San Jose Pinula, Villa Montecinos 1, casa 1B",
            "address2": "",
            "city": "Guatemala"
        },
        "parcels": [
            {
                "length": 1,
                "width": 1,
                "height": 1,
                "weight": 1,
                "amount": "40.00",
                "currency": "GTQ",
                "description": "Consola VDGAME",
                "fragil": true
            }
        ],
        "Ticket_Number": "4575154",
        "Order_Number": 4575154,
        "IdCountry": "GT",
        "CodeOfReference": "224160",
        "CountPieces": 1,
        "TotalWeight": "1",
        "TotalValue": "100.00",
        "Currency": "GTQ",
        "ProductInsuranceAmount ": 0,
        "InsuranceCurrency": "GTQ",
        "Collected": false,
        "COD": {
            "CashOnDelivery": false,
            "CreditNumber": "224160",
            "AmmountCashOnDelivery": 0,
            "CashOnDeliveryCurrency": "GTQ",
            "BankAccountName": "IMPORTADORA CMW",
            "BankId": 33,
            "BankAccountType": "Monetaria",
            "BankAccountId": "030-0110350",
            "Identification": "2662916511501"
        },
        "BillAccountNumber": "119244225",
        "PaymentMethod": "Qpay",
        "Note": ""
    }
}

module.exports = { guatehogar }