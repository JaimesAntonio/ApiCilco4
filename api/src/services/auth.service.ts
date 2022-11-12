import { injectable, /* inject, */ BindingScope } from '@loopback/core';
// Nuevas librerias
const generator = require("password-generator");
const cryptoJS = require("crypto-js");
import { configuracion } from '../config/config';
import { Usuario } from '../models';
const jwt = require('jsonwebtoken');
import { UsuarioRepository } from '../repositories';
import { repository } from '@loopback/repository';

@injectable({ scope: BindingScope.TRANSIENT })
export class AuthService {
  //en el parentesis del constructorse inserta @repository(UsuarioRepository) public usuarioRepository: UsuarioRepository
  //public usuarioRepository: UsuarioRepository
  constructor(@repository(UsuarioRepository) public usuarioRepository: UsuarioRepository) { }

  generarClave() {
    const clave = generator(8, false);
    return clave;
  }

  cifrarClave(clave: String) {
    const claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
  }
  //JWT
  generarTokenJWT(usuario: Usuario) {
    let token = jwt.sign({
      data: {
        id: usuario.id,
        correo: usuario.correo,
        nombres: usuario.nombres + " " + usuario.apellidos
      }
    }, configuracion.claveJWT)

    return token
  }
  validarTokenJWT(token: string) {
    try {
      let datos = jwt.verify(token, configuracion.claveJWT);
      return datos;
    } catch (error) {
      return false;
    }
  }

  //Autenticacion  cambié password por contrasena
  identificarPersona(correo: string, contrasena: string) {

    try {
      console.log(correo)
      console.log(contrasena)
      let user = this.usuarioRepository.findOne({
        where:
        {
          correo: correo,
          contrasena: contrasena
        }
      })
      if (user) {
        return user;
      }
      return false;
    } catch {
      return false;
    }
  }
  /*
   * Add service methods here
   */
}
