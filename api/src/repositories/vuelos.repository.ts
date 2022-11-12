import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongoDataSource} from '../datasources';
import {Vuelos, VuelosRelations} from '../models';

export class VuelosRepository extends DefaultCrudRepository<
  Vuelos,
  typeof Vuelos.prototype.id,
  VuelosRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(Vuelos, dataSource);
  }
}
