import request from "supertest";
import { app, sequelize, setupSequelize } from "../express";

describe("E2E API tests", () => {
  beforeEach(async () => {
    await setupSequelize();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  describe("POST /products", () => {
    it("should create a product and return 201", async () => {
      const response = await request(app)
        .post("/products")
        .send({
          name: "Product 1",
          description: "Product 1 description",
          purchasePrice: 50,
          stock: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe("Product 1");
      expect(response.body.description).toBe("Product 1 description");
      expect(response.body.purchasePrice).toBe(50);
      expect(response.body.stock).toBe(10);
    });
  });

  describe("POST /clients", () => {
    it("should create a client and return 201", async () => {
      const response = await request(app)
        .post("/clients")
        .send({
          name: "Client 1",
          email: "client1@example.com",
          document: "123.456.789-00",
          address: {
            street: "Rua das Flores",
            number: "100",
            complement: "Apto 1",
            city: "São Paulo",
            state: "SP",
            zipCode: "01001-000",
          },
        });

      expect(response.status).toBe(201);
    });
  });

  describe("POST /checkout", () => {
    it("should place an order and return 201", async () => {
      await sequelize.query(
        `INSERT INTO products (id, name, description, purchasePrice, stock, salesPrice, createdAt, updatedAt)
         VALUES ('product-1', 'Product 1', 'Product 1 description', 50, 10, 100, datetime('now'), datetime('now'))`
      );

      const clientResponse = await request(app)
        .post("/clients")
        .send({
          id: "client-1",
          name: "Client 1",
          email: "client1@example.com",
          document: "123.456.789-00",
          address: {
            street: "Rua das Flores",
            number: "100",
            complement: "Apto 1",
            city: "São Paulo",
            state: "SP",
            zipCode: "01001-000",
          },
        });

      expect(clientResponse.status).toBe(201);

      const response = await request(app)
        .post("/checkout")
        .send({
          clientId: "client-1",
          products: [{ productId: "product-1" }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("invoiceId");
      expect(response.body.status).toBe("approved");
      expect(response.body.total).toBe(100);
      expect(response.body.products).toHaveLength(1);
      expect(response.body.products[0].productId).toBe("product-1");
    });
  });

  describe("GET /invoice/:id", () => {
    it("should return an invoice and status 200", async () => {
      await sequelize.query(
        `INSERT INTO products (id, name, description, purchasePrice, stock, salesPrice, createdAt, updatedAt)
         VALUES ('product-1', 'Product 1', 'Product 1 description', 50, 10, 100, datetime('now'), datetime('now'))`
      );

      await request(app)
        .post("/clients")
        .send({
          id: "client-1",
          name: "Client 1",
          email: "client1@example.com",
          document: "123.456.789-00",
          address: {
            street: "Rua das Flores",
            number: "100",
            complement: "Apto 1",
            city: "São Paulo",
            state: "SP",
            zipCode: "01001-000",
          },
        });

      const checkoutResponse = await request(app)
        .post("/checkout")
        .send({
          clientId: "client-1",
          products: [{ productId: "product-1" }],
        });

      expect(checkoutResponse.status).toBe(201);
      const invoiceId = checkoutResponse.body.invoiceId;
      expect(invoiceId).toBeTruthy();

      const response = await request(app).get(`/invoice/${invoiceId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(invoiceId);
      expect(response.body.name).toBe("Client 1");
      expect(response.body.document).toBe("123.456.789-00");
      expect(response.body.address).toBeDefined();
      expect(response.body.items).toHaveLength(1);
      expect(response.body.total).toBe(100);
    });
  });
});
