import AggregateRoot from "../../@shared/domain/entity/aggregate-root.interface";
import BaseEntity from "../../@shared/domain/entity/base.entity";
import Id from "../../@shared/domain/value-object/id.value-object";
import OrderItem from "./order-item.entity";

type OrderStatus = "pending" | "approved" | "declined";

type OrderProps = {
  id?: Id;
  clientId: string;
  products: OrderItem[];
  status?: OrderStatus;
};

export default class Order extends BaseEntity implements AggregateRoot {
  private _clientId: string;
  private _products: OrderItem[];
  private _status: OrderStatus;

  constructor(props: OrderProps) {
    super(props.id);
    this._clientId = props.clientId;
    this._products = props.products;
    this._status = props.status || "pending";
  }

  get clientId(): string {
    return this._clientId;
  }

  get products(): OrderItem[] {
    return this._products;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get total(): number {
    return this._products.reduce((acc, item) => acc + item.salesPrice, 0);
  }

  approve(): void {
    this._status = "approved";
  }

  decline(): void {
    this._status = "declined";
  }
}
