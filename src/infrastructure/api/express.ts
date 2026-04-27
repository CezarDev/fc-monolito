import express from "express";
import { Sequelize } from "sequelize-typescript";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import OrderItemModel from "../../modules/checkout/repository/order-item.model";
import OrderModel from "../../modules/checkout/repository/order.model";
import InvoiceItemModel from "../../modules/invoice/repository/invoice-item.model";
import InvoiceModel from "../../modules/invoice/repository/invoice.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";
import { ProductModel as ProductAdmModel } from "../../modules/product-adm/repository/product.model";
import ProductModel from "../../modules/store-catalog/repository/product.model";
import { checkoutRoute } from "./routes/checkout.route";
import { clientsRoute } from "./routes/clients.route";
import { invoiceRoute } from "./routes/invoice.route";
import { productsRoute } from "./routes/products.route";

export const app = express();
app.use(express.json());

export let sequelize: Sequelize;

export async function setupSequelize() {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });

  sequelize.addModels([
    ClientModel,
    ProductAdmModel,
    ProductModel,
    TransactionModel,
    InvoiceModel,
    InvoiceItemModel,
    OrderModel,
    OrderItemModel,
  ]);

  // Sync models individually; both product models share the same table
  // so we sync ProductAdmModel first, then add salesPrice manually
  await ClientModel.sync({ force: true });
  await ProductAdmModel.sync({ force: true });
  await sequelize.query(
    "ALTER TABLE products ADD COLUMN salesPrice REAL DEFAULT NULL"
  );
  await TransactionModel.sync({ force: true });
  await InvoiceModel.sync({ force: true });
  await InvoiceItemModel.sync({ force: true });
  await OrderModel.sync({ force: true });
  await OrderItemModel.sync({ force: true });
}

app.use("/products", productsRoute);
app.use("/clients", clientsRoute);
app.use("/checkout", checkoutRoute);
app.use("/invoice", invoiceRoute);
