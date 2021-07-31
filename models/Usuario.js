const moongose = require('mongoose');
const Schema = moongose.Schema;

const usuariosSchema = new Schema({
  email:{
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  nombre:{
    type: String,
    required: true,
    trim: true
  },
  password:{
    type: String,
    required: true,
    trim: true,
  }
});

module.exports = moongose.model('Usuarios', usuariosSchema);