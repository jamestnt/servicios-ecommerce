const express = require('express');
const jwt = require('jsonwebtoken');

const jwt_valid_token = (token) => {
    if (!token) {
        return { success: false, mensaje: 'Acceso denegado. Token no proporcionado.' };
    }

    return jwt.verify(token, process.env.ENCKEY, (err, usuario) => {
        if (err) {
            return { success: false, mensaje: 'Token inválido.' };
        }
        return { success: true, user: usuario };
    });
}

const jwt_get_token = async (user) => {
    let response = {};
    await jwt.sign({ user }, process.env.ENCKEY, { expiresIn: '3000m' }, (err, token) => {
        if (err) {
            response = { mensaje: 'Error al generar el token.' };
        } else {
            response = { token: token };
        }
    });
    return response
}


module.exports = { jwt_valid_token, jwt_get_token };