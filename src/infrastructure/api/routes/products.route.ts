import { Router } from "express";
import ProductAdmFacadeFactory from "../../../modules/product-adm/factory/facade.factory";

export const productsRoute = Router();

productsRoute.post("/", async (req, res) => {
  const facade = ProductAdmFacadeFactory.create();
  try {
    const output = await facade.addProduct(req.body);
    res.status(201).json(output);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
