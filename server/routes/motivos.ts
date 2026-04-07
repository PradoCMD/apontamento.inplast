import { Router, Request, Response } from "express";
import { db } from "../index.js";
import { motivosParada, motivosPerda } from "../db/schema.js";

export const motivosRouter = Router();

motivosRouter.get("/parada", async (_req: Request, res: Response) => {
  try {
    const results = await db.select().from(motivosParada).orderBy(motivosParada.codigo);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar motivos de parada" });
  }
});

motivosRouter.get("/perda", async (_req: Request, res: Response) => {
  try {
    const results = await db.select().from(motivosPerda).orderBy(motivosPerda.codigo);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar motivos de perda" });
  }
});
