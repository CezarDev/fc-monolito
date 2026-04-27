import { Router } from "express";
import CheckoutFacadeFactory from "../../../modules/checkout/factory/checkout.facade.factory";

export const checkoutRoute = Router();

checkoutRoute.post("/", async (req, res) => {
  const facade = CheckoutFacadeFactory.create();
  try {
    const output = await facade.placeOrder(req.body);
    res.status(201).json(output);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
