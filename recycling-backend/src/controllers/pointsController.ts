import {json, Request, Response} from 'express';
import HttpStatus from 'http-status-codes';
import knex from '../database/connection';

class PointsController {
  async create(request: Request, response: Response) {
    const {
      name, email, whatsapp, latitude, longitude, city, uf, items,
    } = request.body;

    const trx = await knex.transaction();

    const point = {
      image: 'image-fake', name, email, whatsapp, latitude, longitude, city, uf,
    };

    const insertedIds = await trx('points').insert(point);

    const point_id = insertedIds[0];

    const pointItems = items.map((item_id: number) => {
      return {
        item_id,
        point_id,
      };
    });

    await trx('points_items').insert(pointItems);
    await trx.commit();

    response.status(HttpStatus.OK).json({id: point_id, ...point});
  }

  async show(request: Request, response: Response) {
    const {id} = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(HttpStatus.NOT_FOUND).json({message: 'Point not found.'});
    }

    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id)
      .select('items.title');

    return response.status(HttpStatus.OK).json({point, items});
  }

  async index(request: Request, response: Response) {
    const {city, uf, items} = request.query;
    const parsedItems = String(items).split(',').map(item => Number(item.trim()));
    const points = await knex('points')
      .join('points_items', 'points.id', '=', 'points_items.point_id')
      .whereIn('points_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');
    return response.status(HttpStatus.OK).json(points);
  }
}

export default PointsController;
