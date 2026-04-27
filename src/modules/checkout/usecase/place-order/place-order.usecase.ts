import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface from "../../../store-catalog/facade/store-catalog.facade.interface";
import Order from "../../domain/order.entity";
import OrderItem from "../../domain/order-item.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

type ProductDetails = {
  productId: string;
  name: string;
  salesPrice: number;
};

export default class PlaceOrderUseCase implements UseCaseInterface {
  constructor(
    private clientFacade: ClientAdmFacadeInterface,
    private productFacade: ProductAdmFacadeInterface,
    private catalogFacade: StoreCatalogFacadeInterface,
    private orderRepository: CheckoutGateway,
    private invoiceFacade: InvoiceFacadeInterface,
    private paymentFacade: PaymentFacadeInterface
  ) {}

  async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    const client = await this.clientFacade.find({ id: input.clientId });
    if (!client) {
      throw new Error("Client not found");
    }

    await this.validateProducts(input);

    const products = await Promise.all(
      input.products.map((p) => this.getProduct(p.productId))
    );

    const order = new Order({
      clientId: input.clientId,
      products: products.map(
        (p) =>
          new OrderItem({
            id: new Id(),
            productId: p.productId,
            salesPrice: p.salesPrice,
          })
      ),
    });

    const payment = await this.paymentFacade.process({
      orderId: order.id.id,
      amount: order.total,
    });

    let invoiceId: string = null;

    if (payment.status === "approved") {
      order.approve();
      const invoice = await this.invoiceFacade.generate({
        name: client.name,
        document: client.document,
        street: client.address.street,
        number: client.address.number,
        complement: client.address.complement,
        city: client.address.city,
        state: client.address.state,
        zipCode: client.address.zipCode,
        items: products.map((p) => ({
          id: p.productId,
          name: p.name,
          price: p.salesPrice,
        })),
      });
      invoiceId = invoice.id;
    } else {
      order.decline();
    }

    await this.orderRepository.addOrder(order);

    return {
      id: order.id.id,
      invoiceId,
      status: order.status,
      total: order.total,
      products: order.products.map((p) => ({ productId: p.productId })),
    };
  }

  private async validateProducts(input: PlaceOrderInputDto): Promise<void> {
    if (input.products.length === 0) {
      throw new Error("No products selected");
    }

    for (const p of input.products) {
      const product = await this.productFacade.checkStock({
        productId: p.productId,
      });
      if (product.stock <= 0) {
        throw new Error(
          `Product ${p.productId} is not available in stock`
        );
      }
    }
  }

  private async getProduct(productId: string): Promise<ProductDetails> {
    const product = await this.catalogFacade.find({ id: productId });
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    return {
      productId: product.id,
      name: product.name,
      salesPrice: product.salesPrice,
    };
  }
}
