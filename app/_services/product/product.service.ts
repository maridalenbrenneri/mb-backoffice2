import { dataSource } from '~/db.server';
import { ProductEntity } from './product.entity';

export class ProductService {
  private manager = dataSource.manager;

  async getProductById(id: number) {
    return this.manager.findOne(ProductEntity, {
      where: { id },
    });
  }

  async getProducts(filter: any = {}) {
    const { orderBy = { name: 'ASC' }, take, where } = filter;
    return this.manager.find(ProductEntity, {
      where,
      order: orderBy,
      take,
    });
  }

  async upsertProduct(id: number | null, data: Partial<ProductEntity>) {
    return this.manager.save(ProductEntity, {
      id: id || undefined,
      ...data,
      updatedAt: new Date(),
    });
  }
}
