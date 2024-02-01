const express = require('express');
const routes = require('./routes/routes.js');
require('dotenv').config();

const app = express();
const jwt = require('jsonwebtoken');

const port = 80;
app.use(express.json());

app.use('/', routes)


app.listen(port, () => {
  console.log(`La aplicación está escuchando en http://localhost:${port}`);
});