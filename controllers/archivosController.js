const multer = require('multer');
const shortid = require('shortid');
const Enlaces = require('../models/Enlace');
const fs = require('fs');



exports.subirArchivo = async (req, res, next) => {

  const configuracionMulter = {
    limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 }, //Limite de 1MB para aquellos usuarios no loggeados
    storage: fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname+'/../uploads')
      },
      filename: (req, file, cb) => {
        const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        cb(null, `${shortid.generate()}${extension}`)
      },
    }) 
  }
  

  const upload = multer(configuracionMulter).single('archivo')

  upload(req, res, async (error) => {

    if(!error){
      res.json({archivo: req.file.filename})
    } else {
      console.log(error)
      return next()
    }
  })
}

exports.eliminarArchivo = async (req, res) => {
  try {
    fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`)
    await Enlaces.findOneAndRemove(req.params.url)
  } catch (error) {
    console.log(error) 
  }
}

//Descarga un archivo
exports.descargar = async (req, res, next) => {

  //Obtiene el enlace
  const {archivo} =  req.params
  const enlace = await Enlaces.findOne({nombre:archivo})

  const archivoDescarga = __dirname + '/../uploads/' + archivo;
  res.download(archivoDescarga)

  //Eliminar el archivo y la entrada a la db
  
  const {descargas, nombre } = enlace

  if(descargas === 1){

    //Eliinar el archivo
    req.archivo = nombre

    await Enlaces.findOneAndRemove(enlace.id)
    next() //Pasa al proximo middleware siempre y cuando las descargas sean 1, si son mas simplemente se resta por eso no tiene next()

    //Eliminar la entrada a la bd

  } else {
    //Si son mayores a 1 hay que restar
    enlace.descargas--
    await enlace.save()
  }

}