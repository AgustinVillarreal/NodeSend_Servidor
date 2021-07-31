const Enlaces = require('../models/Enlace');
const shortid = require('shortid')
const bcrypt = require('bcrypt')
const {validationResult} = require('express-validator')


exports.nuevoEnlace = async (req, res, next) => {
  //Revisar si hay errores
  const errores = validationResult(req);
  if(!errores.isEmpty()){
    return res.status(400).json({errores: errores.array()})
  }

  //Crear un objeto de enlace
  console.log(req.body)
  const { nombre_original, nombre } = req.body;

  const enlace = new Enlaces();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
  enlace.nombre_original = nombre_original;

  if(req.usuario){
    console.log(req.usuario)
    const {password, descargas} = req.body;
    if(descargas){
      enlace.descargas = descargas;
    }
    if(password){
      const salt = await bcrypt.genSalt(10)
      enlace.password = await bcrypt.hash(password, salt);
    }
    enlace.autor = req.usuario.id
  }

  //Almacenar el enlace en la db
  try {
    await enlace.save();
    res.json({msg: `${enlace.url}`})
    return next();
  } catch (error) {
    console.log(error)
  }
}

//Obtiene un listado de todos los enlaces
exports.todosEnlaces = async (req, res) => {
  try {
    const enlaces = await Enlaces.find({}).select('url -_id')
    res.json({enlaces})
  } catch (error) {
    console.log(error)
  }
}

exports.obtenerEnlace = async (req, res, next) => {

  const { url } = req.params

  //Verificar si existe el enlace
  const enlace = await Enlaces.findOne({ url })
  if(!enlace){
    res.status(404).json({msg: "El Enlace no existe"})
    return next();
  }

  //Si el enlace existe, 
  // utiliza content-disposition si le pongo download, sin embargo ya como tenemos hecho el codigo no podemos 
  // res.download({archivo: enlace.nombre})
  
  res.json({archivo: enlace.nombre, password: false})

  next();

}

//Retorna si el enlace tiene password o no
exports.tienePassword = async (req, res, next) => {

  const { url } = req.params

  //Verificar si existe el enlace
  const enlace = await Enlaces.findOne({ url })

  if(!enlace){
    res.status(404).json({msg: "El Enlace no existe"})
    return next();
  }

  if(enlace.password){
    return res.json({ password: true, enlace: enlace.url});
  }

  next();
}

exports.verificarPassword = async (req, res, next) => {
  const { url } = req.params;
  const {password} = req.body;

  const enlace = await Enlaces.findOne({url})

  //Verificar el password

  if(bcrypt.compareSync(password, enlace.password)){
    //Permitirle al usuario descargar el archivo
    next()
  } else {
    return res.status(401).json({msg: "Password incorrecto"})
  }

}