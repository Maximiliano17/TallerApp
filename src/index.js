const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const fs = require('fs');
const session = require('express-session');
const conecction = require('./database/db');
const bodyParser = require('body-parser');
const app = express();

// SETTINGS

// VAR ENTORN

dotenv.config({path: '../env/.env'});

// SESSION

app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));

// SET URLENCODED TO CATCH DATA

app.use(bodyParser.urlencoded({extended:true}));

app.use(bodyParser.json());

// VIEWS

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ROUTES

const routes = require('./routes/index.routes');

app.use(routes);

// STARTING SERVER

app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor a la espera de conexiones');
});

// STATIC FILES


app.use(express.static(path.join(__dirname, '../public')));










