import { Router } from "express";
import InvoiceFacadeFactory from "../../../modules/invoice/factory/invoice.facade.factory";

export const invoiceRoute = Router();

invoiceRoute.get("/:id", async (req, res) => {
  const facade = InvoiceFacadeFactory.create();
  try {
    const output = await facade.find({ id: req.params.id });
    res.status(200).json(output);
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});
