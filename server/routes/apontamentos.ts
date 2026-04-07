import { Router, Request, Response } from "express";
import { db } from "../index.js";
import { apontamentos, produtosAcabados, materiasPrimas } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export const apontamentosRouter = Router();

// List apontamentos by ordem
apontamentosRouter.get("/ordem/:ordemId", async (req: Request, res: Response) => {
  try {
    const ordemId = parseInt(req.params.ordemId);
    const results = await db.select().from(apontamentos).where(eq(apontamentos.ordemId, ordemId)).orderBy(desc(apontamentos.dataHora));
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar apontamentos" });
  }
});

// Create apontamento
apontamentosRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { ordemId } = req.body;
    const nroApontamento = nanoid(8).toUpperCase();
    const [apontamento] = await db
      .insert(apontamentos)
      .values({ ordemId, nroApontamento })
      .returning();
    return res.json({ message: "Apontamento criado!", apontamento });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar apontamento" });
  }
});

// Get apontamento details (with PA and MP)
apontamentosRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [apontamento] = await db.select().from(apontamentos).where(eq(apontamentos.id, id));
    if (!apontamento) return res.status(404).json({ error: "Apontamento não encontrado" });

    const pa = await db.select().from(produtosAcabados).where(eq(produtosAcabados.apontamentoId, id));
    const mp = await db.select().from(materiasPrimas).where(eq(materiasPrimas.apontamentoId, id));

    return res.json({ ...apontamento, produtosAcabados: pa, materiasPrimas: mp });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar apontamento" });
  }
});

// Confirm apontamento
apontamentosRouter.post("/:id/confirmar", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(apontamentos)
      .set({ situacao: "Confirmado" })
      .where(eq(apontamentos.id, id))
      .returning();
    return res.json({ message: "Apontamento Confirmado", apontamento: updated });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao confirmar apontamento" });
  }
});

// === Produtos Acabados ===
apontamentosRouter.get("/:id/pa", async (req: Request, res: Response) => {
  try {
    const results = await db.select().from(produtosAcabados).where(eq(produtosAcabados.apontamentoId, parseInt(req.params.id)));
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar PA" });
  }
});

apontamentosRouter.post("/:id/pa", async (req: Request, res: Response) => {
  try {
    const apontamentoId = parseInt(req.params.id);
    const [pa] = await db.insert(produtosAcabados).values({ ...req.body, apontamentoId }).returning();
    return res.json(pa);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao adicionar PA" });
  }
});

apontamentosRouter.patch("/pa/:paId", async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(produtosAcabados)
      .set(req.body)
      .where(eq(produtosAcabados.id, parseInt(req.params.paId)))
      .returning();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar PA" });
  }
});

// === Matérias Primas ===
apontamentosRouter.get("/:id/mp", async (req: Request, res: Response) => {
  try {
    const results = await db.select().from(materiasPrimas).where(eq(materiasPrimas.apontamentoId, parseInt(req.params.id)));
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar MP" });
  }
});

apontamentosRouter.post("/:id/mp", async (req: Request, res: Response) => {
  try {
    const apontamentoId = parseInt(req.params.id);
    const [mp] = await db.insert(materiasPrimas).values({ ...req.body, apontamentoId }).returning();
    return res.json(mp);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao adicionar MP" });
  }
});
