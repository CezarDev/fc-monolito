import { Router } from "express";
import Address from "../../../modules/@shared/domain/value-object/address";
import ClientAdmFacadeFactory from "../../../modules/client-adm/factory/client-adm.facade.factory";

export const clientsRoute = Router();

clientsRoute.post("/", async (req, res) => {
  const facade = ClientAdmFacadeFactory.create();
  try {
    const { name, email, document, address } = req.body;
    await facade.add({
      name,
      email,
      document,
      address: new Address(
        address.street,
        address.number,
        address.complement,
        address.city,
        address.state,
        address.zipCode
      ),
    });
    res.status(201).send();
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
