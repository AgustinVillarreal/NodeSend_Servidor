const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const { check } = require('express-validator')

const router = express.Router();
router.post('/',
  [
    check('nombre', 'El Nombre es Obligatorio').not().isEmpty(),
    check('email', 'Agrega un Email válido').isEmail(),
    check('password', 'El Password debe contener al menos 6 caracteres').isLength({min: 6}),
  ],
  //Controller
  usuarioController.nuevoUsuario
);

module.exports = router;
