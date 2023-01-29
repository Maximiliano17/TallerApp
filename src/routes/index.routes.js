const express = require('express');
const router = express.Router();
const controller = require('../controllers/index.controller');
require('../database/db');
const { Account } = require('../controllers/index.controller');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../public/img/tools');
        console.log('estoy en imagen xd');
    },

    filename: (req, file, cb) => {

        let param = req.params.name;
        
        let nameFile = file.originalname;

        cb(null, `${param}.png`);
    }
})

const upload = multer({storage});

router.get('/', controller.login);

router.get('/inicio', controller.inicio);

router.post('/auth', controller.auth);

router.get('/logout', controller.logout);

router.post('/formBE', controller.formBE);

router.get('/formulario', controller.formulario);

router.get('/facturas', controller.facturas);

router.get('/borrar/:id', controller.borrar);

router.get('/pdf/:id', controller.pdfCreate);

router.get('/codigo-de-barras/:status', controller.barcode);

router.post('/barcodePost', controller.barcodePost);

router.get('/codigo-de-barras/herramientas/:id/:estado/:tool/:n', controller.addTools);

router.post('/herramientasPost/:id', controller.herramientasPost);

router.get('/estadisticas', controller.estadisticas);

router.get('/stock', controller.stock);

router.get('/stock/info/:tool', controller.stockInfo);

router.get('/stock/delete/:id', controller.stockDelete);

router.get('/stock/add', controller.add);

router.post('/stock/add/send', controller.sendTool);

router.post('/stock/edit/send/:name', upload.single('imgTool'), controller.editTool);

router.get('/error', controller.error);

module.exports = router;