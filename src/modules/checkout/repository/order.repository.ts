import Id from "../../@shared/domain/value-object/id.value-object";
import Order from "../domain/order.entity";
import OrderItem from "../domain/order-item.entity";
import CheckoutGateway from "../gateway/checkout.gateway";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements CheckoutGateway {
  async addOrder(order: Order): Promise<void> {
    await OrderModel.create(
      {
        id: order.id.id,
        clientId: order.clientId,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        products: order.products.map((item) => ({
          id: item.id.id,
          productId: item.productId,
          salesPrice: item.salesPrice,
        })),
      },
      { include: [{ model: OrderItemModel }] }
    );
  }

  async findOrder(id: string): Promise<Order> {
    const order = await OrderModel.findOne({
      where: { id },
      include: [{ model: OrderItemModel }],
    });

    if (!order) {
      throw new Error(`Order ${id} not found`);
    }

    return new Order({
      id: new Id(order.id),
      clientId: order.clientId,
      status: order.status as "pending" | "approved" | "declined",
      products: order.products.map(
        (item) =>
          new OrderItem({
            id: new Id(item.id),
            productId: item.productId,
            salesPrice: item.salesPrice,
          })
      ),
    });
  }
}
