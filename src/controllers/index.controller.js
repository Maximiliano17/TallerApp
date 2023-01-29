const controller = {};

const fs = require('fs');
const path = require('path');
const Account = require('../../models/account');
const Formulario = require('../../models/formulario');
const Historial = require('../../models/historial');
const Stock = require('../../models/stock');
const { default: mongoose } = require('mongoose');
const http = require('http');
const { Console, log } = require('console');
const doc = require('pdfkit');
const { parse } = require('path');
;

var status = false;

controller.login = (req, res) => {
    res.render('login', {
        'sendAlert': false
    });
}


controller.auth = (req, res) => {

    const user = req.body.name;
    const pass = req.body.password;

        const usuarios = Account.findOne({'name': user, 'password': pass}, (err, data) => {
            if(err) {
                console.log("ERROR AL AUNTENTICAR AL USUARIO");
                res.redirect('/');
            } else if(!data) {
                console.log("LA CUENTA NO EXISTE");
                res.render('login', {
                    'sendAlert': true
                });
            } else {
                req.session.loggedin = true;
                
                res.render('inicio');
            }

            
        }); 

}

controller.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
}

controller.inicio = (req, res) => {

    if(!req.session.loggedin) {
        res.render('error');
    }

    res.render('inicio');
    }

controller.formBE = (req, res) => {

    var ruta = path.join(__dirname, './tools.json');
    var  toolsJSON = fs.readFileSync(ruta);
    var toolsData = JSON.parse(toolsJSON);

    var errorStock;

    // array de herramientas inicial
    var valuesArr = new Array();

    // array de herramientas final
    var herramientas = new Array();

    // array de todos los datos
    var datos = new Array();

    var contador = 0;
    let i = 0;

    const alumno = req.body.alumno;
    const docente = req.body.docente;
    const especialidad_op = req.body.especialidad_op;
    const year_op = req.body.year_op;
    const year_div_op = req.body.year_div_op;

    const tools = req.body.tools;

    // FOREACH Para Iterar Todas Las Herramientas

    tools.forEach(value => {
    
        i++;

        if(value > 0) {
            console.log(i + ' - ' + value);

            // Guardar en un array los valores mayores 0, pasandole la cantidad(value) y la id(espacio)

            valuesArr.push({"cantidad": value, "id": i});
        }
    });
    
    // FOREACH Para Iterrar Todas Las Herramientas > 0

        valuesArr.forEach(element => {

            // FOR para iterar el JSON
            console.log('iteracion');
            for(let indice = 0; indice < toolsData.length; indice++) {
           
                if(toolsData[indice].id === element.id) {
                    
                    let nombre = toolsData[indice].nombre;
                    let cantidad = element.cantidad;
                    let id = element.id;

                    herramientas.push({"nombre": nombre, "cantidad": cantidad, "id": id});

                    contador++;
                }

                

            }

            

        });

        if(herramientas.length > 0) {
            datos.push({
                "alumno": alumno,
                "docente": docente,
                "especialidad": especialidad_op,
                "curso": year_op,
                "division": year_div_op,
                "herramientas": []
            });

            datos[0].herramientas.push(herramientas);
            
  

            console.log("HERRAMIENTAS AGREGADAS");
            
            if(alumno && docente && especialidad_op != '- -' && year_op != '- -' && year_div_op != '- -') {
      

                console.log("INFORMACION ENVIADA A LA BASE DE DATOS");

                Stock.find({}, (err, data) => {
                    const stockdb = data;
                    
                    var cantToolsArr = new Array();

                    var idToolsArr = new Array();

                    var estadoError = true;

                    var numberC = 0;
                  
                        herramientas.forEach(herramienta => {
                            
                            

                            let idTools = herramienta.id;

                            let cantTools = herramienta.cantidad;
                            
                            cantToolsArr.push(cantTools);

                            idToolsArr.push(idTools);

                                    stockdb.forEach(stockdb => {

                                        let identificador = stockdb.identificador;

                                        if(identificador === idTools) {
                                           console.log('stock es de: ' + stockdb.stock);
                                        

                                            if(stockdb.stock <= 0){
                                            
                                            console.log('lo siento no hay mas de ' + stockdb.name);
                                            
                                            estadoError = false;

                                            numberC--;
                                                console.log("stockdb name: " + stockdb);
                                            
                                                Stock.find({}, (err, docs) => {
                    
                                                const documents = docs;

                                                res.render('formulario', {
                                                'sendAlert': true,
                                                'success': false,
                                                'estadoStock': 2,
                                                'herramienta': stockdb.name,
                                                'data': documents
                                            });

                                        });
                                        } 
                                        
                                        if(cantTools <= stockdb.stock) {
                                            console.log('estodo error '+ estadoError);

                                            if(estadoError != false) {


                                                   
                                                    
                                                    numberC++;
                                                    
                                                    
                                                    let toolgth = herramientas.length;

                                                    if(herramientas.length === numberC) {

                                                        Formulario.create({
                                                            "alumno": datos[0].alumno,
                                                            "docente": datos[0].docente,
                                                            "especialidad": datos[0].especialidad,
                                                            "curso": datos[0].curso,
                                                            "division": datos[0].division,
                                                            "herramientas": datos[0].herramientas,
                                                            "hours": new Date()
                                                        });

                                                        Historial.create({
                                                            "alumno": datos[0].alumno,
                                                            "docente": datos[0].docente,
                                                            "especialidad": datos[0].especialidad,
                                                            "curso": datos[0].curso,
                                                            "division": datos[0].division,
                                                            "herramientas": datos[0].herramientas,
                                                            "hours": new Date()
                                                        });

                                                        console.log('array de: ' + cantToolsArr);

                                                        for (let index = 0; index < cantToolsArr.length; index++) {

                                                        Stock.updateOne({identificador: idToolsArr[index]},
                                                            {$inc: {stock: - cantToolsArr[index]} }, function (err, docs) {
                                                            if (err){
                                                                console.log(err);
            
                                                            } else {
                                                                console.log("Updated Docs : ", docs);
                                                            }
                                                            
            
                                                        });


                                                    } // fin for
                                                    
                                                    Stock.find({}, (err, docs) => {
                    
                                                    const documents = docs;

                                                    res.render('formulario', {
                                                        'sendAlert': false,
                                                        'success': true,
                                                        'estadoStock': 0,
                                                        'herramienta': stockdb.name,
                                                        'data': documents
                                                    });

                                                });

                                                    } // fin if length herramientas
                                                    

                                            } 
                                        } else {

                                            console.log('estas pidiendo mas de lo que hay formulario manual');

                                            Stock.find({}, (err, docs) => {
                    
                                                const documents = docs;

                                                res.render('formulario', {
                                                    'sendAlert': true,
                                                    'success': false,
                                                    'estadoStock': 1,
                                                    'herramienta': stockdb.name,
                                                    'data': documents
                                                });

                                                // console.log(documents[1].name);
                                            });
                                            
                                            
                                        }
                                          
                                        }

                                   
            
                                    });
            
                    });
                   
                    
                });

                console.log(status);
                

            } else {
                console.log("INFORMACION INCORRECTA");
                
                Stock.find({}, (err, docs) => {
                    
                    const documents = docs;
                
                    res.render('formulario', {
                        'sendAlert': true,
                        'success': false,
                        'estadoStock': 0,
                        'herramienta': '',
                        'data': documents
                    });

                })

                
            }
        } else {
            console.log("NO HAY HERRAMIENTAS");

            Stock.find({}, (err, docs) => {
                    
                const documents = docs;
            
                res.render('formulario', {
                    'sendAlert': true,
                    'success': false,
                    'estadoStock': 0,
                    'herramienta': '',
                    'data': documents
                });

            })


        }

    
}

controller.formulario = async (req, res) => {
    
    if(!req.session.loggedin) {
        res.redirect('/error');
    }

    var ruta = path.join(__dirname, './tools.json');
    var  toolsJSON = fs.readFileSync(ruta);
    var toolsData = JSON.parse(toolsJSON);

    console.log(toolsData);
    
    Stock.find({}, (err, docs) => {

        const documents = docs;
    
        res.render('formulario', {
            'sendAlert': false,
            'success': false,
            'estadoStock': 0,
            'data': documents
        });

    })

   
}


controller.facturas = async (req, res) => {

    if(!req.session.loggedin) {
        res.redirect('/error');
    }


    Formulario.find({}, (err, docs) => {
        
        const data = docs;
        if(data.length > 0) {
            console.log("lleno");
            var estadoDocs = true;
        } else {
            console.log("vacio");
            var estadoDocs = false;
        }
        docs.forEach(element => {
            const arrTools = element.herramientas;
        });

        res.render('facturas', {
            dataForm: data,
            estado: estadoDocs
        });
    })

}


controller.borrar = async (req, res) => {
 

    if(req.params.id) {

        Formulario.find({_id:mongoose.Types.ObjectId(req.params.id)}, (err, data) => {

            console.log("FACTURA ENCONTRADA");

            const document = data;

            document.forEach(element => {
                
                document[0].herramientas.forEach(element => {

                    element.map(function(tool){

                        let toolName = tool.nombre;

                        let toolId = tool.id;

                        let toolCant = tool.cantidad;

                        console.log('nombre: ' + toolName + ' ID: ' + toolId + ' Cantidad: ' + toolCant);
                        
                        Stock.find({identificador:toolId}, (err, data) => {
                            console.log('encontre la herramienta de ' + toolName + ' En stockDB');

                            Stock.updateOne({identificador: toolId},
                                {$inc: {stock: + toolCant} }, function (err, docs) {
                                
                                    if (err){
                                    console.log(err);
                                    } else {
                                    console.log('Stock de ' + toolName + ' actualizado.');
                                    }

                            });

                        });

                    });

                });
            });


        });

        const DeleteOne = await Formulario.deleteOne(
            {
            _id:mongoose.Types.ObjectId(req.params.id)
            }
        );
        
        
       

        
        

    }

    res.redirect('../facturas');
    
}

// PFMAKE

controller.pdfCreate = async (req, res) => {
 
    console.log(req.params.id);

    Formulario.find({_id: req.params.id}, (err, doc) => {
        const data4 = doc;

        const PDF = require('pdfkit');

        var doc = new PDF({font: 'Times-Bold'});
        //const doc = new PDFDocument({font: 'Courier'});
        var file = doc.pipe(fs.createWriteStream(__dirname + '../../../public/pdfs/factura-de-taller.pdf'));

        let rutaImg = __dirname + '../../../public/img/logo.png'

        doc.image(rutaImg, 430, 15, {fit: [100, 100], align: 'center', valign:
'center'})


        doc.fontSize(18).text('Factura', {
            align: 'center',
            underline: true
        });

        doc.fontSize(15).text(`
        

        Alumno: ${data4[0].alumno}


        Profesor: ${data4[0].docente}


        Curso: ${data4[0].curso}


        Division: ${data4[0].division}


        Especialidad: ${data4[0].especialidad}

        
        `);

        doc.fontSize(18).text(`Herramientas`, {
            underline: true,
            align: 'center'
        })

        data4[0].herramientas.forEach((element, test) => {
            
            for( let index = 0; index < element.length; index++ ) {

                if(index == 4) {
                    doc.addPage()
                }


                doc.fontSize(15).text(`
                Herramienta: ${element[index].nombre}        |        Cantidad: ${element[index].cantidad}
                `, {
                    columnGap: 15,
                    height: 100,
                    width: 465,
                    align: 'left'
                });
            }

        })

      

        doc.end();

        res.redirect('/pdfs/factura-de-taller.pdf');

    })

    
}

controller.barcode = (req, res) => {

    if(!req.session.loggedin) {
        res.redirect('/error');
    }

    res.render('lector-de-barras', {
        status: req.params.status
    });

 
}

controller.barcodePost = (req, res) => {
    let alumno = req.body.alumno;
    let docente = req.body.docente;
    let especialidad = req.body.especialidad_op;
    let curso = req.body.year_op;
    let division = req.body.year_div_op;

    if (especialidad === '- -' || curso === '- -' || division === '- -') {
    res.redirect('codigo-de-barras/error');
    } else {
    
    Formulario.create({
        "alumno": alumno,
        "docente": docente,
        "especialidad": especialidad,
        "curso": curso,
        "division": division,
        "herramientas": [],
        "hours": new Date()
    });

    Historial.create({
        "alumno": alumno,
        "docente": docente,
        "especialidad": especialidad,
        "curso": curso,
        "division": division,
        "herramientas": [],
        "hours": new Date()
    }, (err, response) => {
        if(err) {
            console.log(err);
        } else {
            Formulario.findOne({}, (err, data) => {
                const document = data;
        
                let docId = document.id;
        
                res.redirect(`/codigo-de-barras/herramientas/${docId}/empty/empty/empty`);
         
            }).sort({$natural:-1});
        }
    });

    
}



}

controller.addTools = (req, res) => {

    console.log(req.params.id);

    let idUser = req.params.id

    let estado = req.params.estado;

    let toolParams = req.params.tool;

    let cantParams = req.params.n;

    console.log('estado: ' + estado);

    res.render('agregar', {
        id: idUser,
        estado: estado,
        tool: toolParams,
        cant: cantParams
    });
}

controller.herramientasPost = (req, res) => {

    
    var pathJSON = path.join(__dirname, './tools.json');
    var  CodeJSON = fs.readFileSync(pathJSON);
    var GetJSON = JSON.parse(CodeJSON);

    var contadorCode = 0;

    GetJSON.forEach(async element => {

        var idUpdate = req.params.id;
    
        let upc = element.codigo;
    
        let toolName = element.nombre;

        let idJSON = element.id;

        let codigoForm = req.body.codigo;

        let cantForm = req.body.cantidad;
    


        if(upc == codigoForm) {

            Stock.find({identificador: idJSON}, async (err, docs) => {
                const document = docs;
    
                console.log(document[0].stock);

            if(cantForm <= document[0].stock) {

            

            const filter = { _id: idUpdate };
            
            const update =  { herramientas: [ {nombre: toolName, cantidad: cantForm, id: idJSON} ] };
            
            console.log(
            `
            ----------------------------------

            Codigo Formulario: ${codigoForm}
            
            Codigo JSON: ${upc}
            
            Nombre: ${toolName}
            
            Cantidad: ${cantForm}

            id de la herramienta: ${idJSON}
            
            id del usuario: ${idUpdate}
            
            -----------------------------------
            `
            );
    


            const oldDocument = await Formulario.updateOne(filter,
                {
                $push:  update
                });
            ;
            const stockUpdate = await Stock.updateOne({identificador: idJSON}, {
                
                $inc: {stock: - cantForm}
                
            });
            
            console.log('actualize la id numero: ' + idJSON);

              res.redirect(`/codigo-de-barras/herramientas/${idUpdate}/success/${toolName}/0`);
            } else if(document[0].stock === 0){
                console.log('No hay mas stock, esta en 0');
                res.redirect(`/codigo-de-barras/herramientas/${idUpdate}/errorSinStock/${toolName}/0`);
            } else {

                let response = new Array();

                response.push(toolName, document[0].stock);
                
                console.log('estas pidiendo mas de lo que hay: ' + document[0].stock);

                console.log('array: ' + response);

                res.redirect(`/codigo-de-barras/herramientas/${idUpdate}/errorStock/${toolName}/${document[0].stock}`);
            }
            })
        } else {
            contadorCode++;
        }
        if(contadorCode === GetJSON.length) {

            res.redirect(`/codigo-de-barras/herramientas/${idUpdate}/error/empty/empty`);
            
        }
    });
}

controller.estadisticas = (req, res) => {
    
    if(!req.session.loggedin) {
        res.redirect('/error');
    }

    res.render('estadisticas');
}

controller.stock = (req, res) => {

    if(!req.session.loggedin) {
        res.redirect('/error');
    }

    Stock.find({}, (err, doc) => {
        const docs = doc;

        res.render('stock', {
            stockdb: doc,
            alert: 0
        });
    })
}

controller.stockInfo = (req, res) => {
    
    const name = req.params.tool;

    Stock.find({name: name}, (err, docs) => {
        const data = docs;

        data.forEach(element => {
            console.log(element.name + ' ' + element.total);
        });

        res.render('tool-info', {
            data: data
        });
    })

}

controller.stockDelete = async (req, res) => {
    const id = req.params.id;

        var ruta = path.join(__dirname, './tools.json');
        var  toolsJSON = fs.readFileSync(ruta);
        var toolsData = JSON.parse(toolsJSON);

    if(id > 0 && id >= toolsData.length) {

        console.log('mi id es: ' + id);

    const DeleteOne = await Stock.deleteOne(
        {
        identificador: id
        }
    );

        const arr = toolsData;

        const result = arr.filter(tool => tool.id != id);

        fs.writeFileSync(ruta, JSON.stringify(result), 'utf-8');

        console.log(result);
    } else {
         console.log('NO Se Puede Borrar Esta Herarmienta... ');

        // const DeleteOne = await Stock.deleteOne(
        //     {
        //     identificador: id
        //     }
        // );

        // const arr = toolsData;

        // const result = arr.filter(tool => tool.id != id);

        // fs.writeFileSync(ruta, JSON.stringify(result), 'utf-8');

    //     result.forEach(element => {
    //         if(element.id != 1) {
    //             element.id = element.id - 1;
    //         }
            
    //       });

    //         fs.writeFileSync(ruta, JSON.stringify(result), 'utf-8');
    //       const resta = 1;
          
    //       Stock.update({},
    //         {$inc: {identificador: - resta} }, function (err, docs) {
    //         if (err){
    //             console.log(err);

    //         }
    //         else{
    //             console.log("Updated Docs : ", docs);
    //         }
    //       })
            
     }

    //     Stock.update({identificador: 0}, {identificador: 1});

    res.redirect('/stock');
}


controller.add = (req, res) => {

    if(!req.session.loggedin) {

        res.redirect('/error');
    
    }

    res.render('agregar-herramienta');
}


controller.error = (req, res) => {
    res.render('error');
}

controller.sendTool = (req, res) => {

    var ruta = path.join(__dirname, './tools.json');
    var  toolsJSON = fs.readFileSync(ruta);
    var toolsData = JSON.parse(toolsJSON);
    
    var newJSON = toolsData;
    
    var identificador = toolsData.length + 1;

    var herramienta = req.body.herramienta;
    
    var stock = req.body.stock;

    function CreateTool() {

    if(herramienta.length > 0 && stock > 0) {
        
        let letter = herramienta.charAt(0).toUpperCase();

        let slice = herramienta.slice(1);

        let herramientaUpperCase = letter + slice;

        let min = 1000000000000;
        
        let max = 9999999999999;

        let code = Math.floor(Math.random()*(max-min+1)+min);

        var newData = {
            "id": identificador,
            "nombre": herramientaUpperCase,
            "imagen": `${herramienta}.png`,
            "codigo": code
        };
        
        var Convert = JSON.stringify(newData);
    
        newJSON.push(newData);
        
        console.log(newJSON);
            
        fs.writeFileSync(ruta, JSON.stringify(newJSON), 'utf-8');

        Stock.create({
            name: herramienta,
            stock: stock,
            identificador: identificador,
            total: stock,
            codebar: code
        })

        

        console.log('HERRAMIENTA CREADA');
        
        Stock.find({}, (err, doc) => {
        const docs = doc;

        res.render('stock', {
            stockdb: doc,
            alert: 1,
            herramienta: herramienta
        });

    })

    } else {
        console.log('HERRAMIENTA NO CREADA');
        Stock.find({}, (err, doc) => {
            const docs = doc;
    
            res.render('stock', {
                stockdb: doc,
                alert: 2,
                herramienta: herramienta
            });
    
        })
    }

}

    const arrTools = new Array();

    toolsData.forEach(element => {
    
        arrTools.push(element.nombre);

    });

    let letter = herramienta.charAt(0).toUpperCase();

    let slice = herramienta.slice(1);

    let herramientaUpperCase = letter + slice;

    const verificacion = arrTools.includes(herramientaUpperCase);

    console.log(verificacion);

    if(verificacion) {
        console.log('La herramienta Ya existe');
        
        Stock.find({}, (err, doc) => {
            const docs = doc;
    
            res.render('stock', {
                stockdb: doc,
                alert: 2,
                herramienta: herramienta
            });
    
        })

    } else {
        CreateTool();
    }

    }

    

    controller.editTool = (req, res) => {

        var ruta = path.join(__dirname, './tools.json');

        var pathJSON = path.join(ruta);
        var  CodeJSON = fs.readFileSync(pathJSON);
        var GetJSON = JSON.parse(CodeJSON);

        let herramientaParam = req.params.name;

        let herramienta = req.body.herramienta;

        let stockParam = req.body.stock;

        let codigo = req.body.codigo;

        let file = req.body.file;

        if(stockParam > 0 && herramienta != '' && herramienta.length >= 4) {

            Stock.updateOne({ name: req.params.name },
                { total: stockParam, stock: stockParam, name: herramienta }, function (err, docs) {
                    
                    if (err){

                        console.log(err);
    
                    } else {

                        var arrJSON = new Array();

                        console.log("Updated Docs : ", docs);

                        GetJSON.forEach(element => {

                            let toolUpper = herramientaParam.slice(0, 1).toUpperCase();

                            let toolLower = herramientaParam.slice(1, herramientaParam.length).toLowerCase();

                            let toolEnd = toolUpper + toolLower;

                            // console.log("====================================================");
                            // console.log("element nombre: " + element.nombre);
                            // console.log("herramienta actual: " + toolEnd);
                            // console.log("====================================================");

                            arrJSON.push(element);

                            if(element.nombre == toolEnd) {
                                console.log("encontre la herramienta" + element.nombre);

                                let toolUpper = herramienta.slice(0, 1).toUpperCase();

                                let toolLower = herramienta.slice(1, herramienta.length).toLowerCase();

                                let toolEnd = toolUpper + toolLower;

                                element.nombre = toolEnd;

                                element.imagen = herramienta + ".png";

                                

                            }

                        });

                        fs.writeFileSync(ruta, JSON.stringify(arrJSON), 'utf-8');
                        
                        console.log("Updated Docs : ", docs);
                    
                    }

                });

        }

        if(stockParam > 0 ) {
            
            Stock.updateOne({ name: req.params.name },
                { total: stockParam, stock: stockParam}, function (err, docs) {
                    if (err){

                        console.log(err);
    
                    } else {

                        console.log("Updated Docs : ", docs);
                    
                    }
                });

        }


        if(herramienta != '' && herramienta.length >= 4) {

            Stock.updateOne({ name: req.params.name },
                { name: herramienta}, function (err, docs) {
                    
                    if (err){

                        console.log(err);
    
                    } else {

                        var arrJSON = new Array();

                        console.log("Updated Docs : ", docs);

                        GetJSON.forEach(element => {

                            let toolUpper = herramientaParam.slice(0, 1).toUpperCase();

                            let toolLower = herramientaParam.slice(1, herramientaParam.length).toLowerCase();

                            let toolEnd = toolUpper + toolLower;

                            // console.log("====================================================");
                            // console.log("element nombre: " + element.nombre);
                            // console.log("herramienta actual: " + toolEnd);
                            // console.log("====================================================");

                            arrJSON.push(element);

                            if(element.nombre == toolEnd) {
                                console.log("encontre la herramienta" + element.nombre);

                                let toolUpper = herramienta.slice(0, 1).toUpperCase();

                                let toolLower = herramienta.slice(1, herramienta.length).toLowerCase();

                                let toolEnd = toolUpper + toolLower;

                                element.nombre = toolEnd;

                                element.imagen = herramienta + ".png";

                            }

                        });

                        fs.writeFileSync(ruta, JSON.stringify(arrJSON), 'utf-8');

                    }
                });
            
        }

            res.redirect('/stock');

    }
   
    

module.exports = controller;


