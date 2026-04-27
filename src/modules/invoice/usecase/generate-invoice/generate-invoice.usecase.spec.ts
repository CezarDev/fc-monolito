import GenerateInvoiceUseCase from "./generate-invoice.usecase";

const MockRepository = () => {
  return {
    generate: jest.fn().mockImplementation((invoice) => Promise.resolve(invoice)),
    find: jest.fn(),
  };
};

describe("GenerateInvoiceUseCase unit test", () => {
  it("should generate an invoice", async () => {
    const repository = MockRepository();
    const usecase = new GenerateInvoiceUseCase(repository);

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

    const result = await usecase.execute(input);

    expect(repository.generate).toHaveBeenCalled();
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
    expect(result.items[0].id).toBe("item-1");
    expect(result.items[0].name).toBe("Item 1");
    expect(result.items[0].price).toBe(50);
    expect(result.total).toBe(125);
  });
});
