import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
import {service} from '@loopback/core';
import {AuthService} from '../services';
import axios from 'axios';
import {configuracion} from '../config/config';
import {Credenciales} from '../models';
import { HttpErrors} from '@loopback/rest';
import {authenticate} from '@loopback/authentication';

//para protección. se necesita un token
@authenticate("admin")


export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository : UsuarioRepository,
    @service(AuthService)  //este es el servicio de autenticación
    public servicioAuth: AuthService

  ) {}
  @authenticate.skip()
  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {
     //Creamos la clave antes de guardar el usuario
     const clave = this.servicioAuth.generarClave();
      const claveCifrada = this.servicioAuth.cifrarClave(clave);
      usuario.contrasena = claveCifrada;

      let tipo = '';
      tipo = configuracion.tipoComunicacion; //Definimos el tipo de comunicacion
      let servicioWeb = '';
      let destino = '';

      if(tipo == "sms"){
        destino = usuario.telefono;
        servicioWeb = 'send_sms';
      }else{
        destino = usuario.correo;
        servicioWeb = 'send_email';
      }

      const asunto = 'Registro de usuario en plataforma';
      const contenido = `Hola, ${usuario.nombres} ${usuario.apellidos} su contraseña en el portal es: ${clave}`
      axios({
        method: 'post',
        url: configuracion.baseURL + servicioWeb,

        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        data: {
          destino: destino,
          asunto: asunto,
          contenido: contenido
        }
      }).then((data) => {
        console.log(data)
      }).catch((err) => {
        console.log(err)
      });

      const user = await this.usuarioRepository.create(usuario);
    return user;
  }

  //Servicio de login
  @authenticate.skip()
  @post('/login', {
    responses: {
      '200': {
        description: 'Identificación de usuarios'
      }
    }
  })
  async login(
    @requestBody() credenciales: Credenciales
  ) {
    console.log(credenciales.usuario)
    console.log(credenciales.contrasena)
    let user = await this.servicioAuth.identificarPersona(credenciales.usuario, credenciales.contrasena);
    if (user) {
      let token = this.servicioAuth.generarTokenJWT(user);
 
      return {
        status: "success",
        data: {
          nombre: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          id: user.id
        },
        token: token
      }
    } else {
      throw new HttpErrors[401]("Datos invalidos")
    }
  }



  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }
}
