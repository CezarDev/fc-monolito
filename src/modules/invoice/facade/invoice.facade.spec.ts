import { Sequelize } from "sequelize-typescript";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";
import InvoiceItemModel from "../repository/invoice-item.model";
import InvoiceModel from "../repository/invoice.model";

describe("InvoiceFacade test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, InvoiceItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
      name: "Cliente Teste",
      document: "123.456.789-00",
      street: "Rua das Flores",
      number: "100",
      complement: "Apto 1",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001-000",
      items: [
        { id: "item-1", name: "Item 1", price: 50 },
        { id: "item-2", name: "Item 2", price: 75 },
      ],
    };

    const result = await facade.generate(input);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(input.name);
    expect(result.document).toBe(input.document);
    expect(result.street).toBe(input.street);
    expect(result.number).toBe(input.number);
    expect(result.complement).toBe(input.complement);
    expect(result.city).toBe(input.city);
    expect(result.state).toBe(input.state);
    expect(result.zipCode).toBe(input.zipCode);
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(125);
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const generateInput = {
      name: "Cliente Teste",
      document: "123.456.789-00",
      street: "Rua das Flores",
      number: "100",
      complement: "Apto 1",
      city: "São Paulo",
      state: "SP",
      zipCode: "01001-000",
      items: [
        { id: "item-1", name: "Item 1", price: 50 },
        { id: "item-2", name: "Item 2", price: 75 },
      ],
    };

    const generated = await facade.generate(generateInput);

    const result = await facade.find({ id: generated.id });

    expect(result.id).toBe(generated.id);
    expect(result.name).toBe(generateInput.name);
    expect(result.document).toBe(generateInput.document);
    expect(result.address.street).toBe(generateInput.street);
    expect(result.address.number).toBe(generateInput.number);
    expect(result.address.complement).toBe(generateInput.complement);
    expect(result.address.city).toBe(generateInput.city);
    expect(result.address.state).toBe(generateInput.state);
    expect(result.address.zipCode).toBe(generateInput.zipCode);
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(125);
    expect(result.createdAt).toBeDefined();
  });
});
