var chapinmall = {
    "Method": "GetServiceByHeaderCodeRequest",
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
            "name": "Shopi.gt",
            "phone": "48542951",
            "email": "admin@shopi.gt",
            "HeaderCodeTownship": "0103",
            "address1": "Carretera a Mataquescuintla, Valles de Navarra, sector Hacienda Navarra manzana B casa 39",
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
        "CodeOfReference": "460543",
        "CountPieces": 1,
        "TotalWeight": "1",
        "TotalValue": "100.00",
        "Currency": "GTQ",
        "ProductInsuranceAmount ": 0,
        "InsuranceCurrency": "GTQ",
        "Collected": false,
        "COD": {
            "CashOnDelivery": false,
            "CreditNumber": "460543",
            "AmmountCashOnDelivery": 0,
            "CashOnDeliveryCurrency": "GTQ",
            "BankAccountName": "Shopi.gt",
            "BankId": 33,
            "BankAccountType": "Monetaria",
            "BankAccountId": "030-012167-0",
            "Identification": "3850479590101"
        },
        "BillAccountNumber": "119760215",
        "PaymentMethod": "Qpay",
        "Note": ""
    }
}

module.exports = { chapinmall }