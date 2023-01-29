const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FormularioSchema = new Schema({
    alumno: { type: String, required: true },
    docente: { type: String, required: true },
    especialidad: { type: String, required: true },
    curso: { type: String, required: true },
    division: { type: String, required: true },
    herramientas: { type: Object, required: true },
    hours: { type: String, required: false }
});

const Formulario = mongoose.model('formulario', FormularioSchema);

module.exports = Formulario;