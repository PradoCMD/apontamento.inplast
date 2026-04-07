import { Router, Request, Response } from "express";
import { db } from "../index.js";
import { ordensProducao } from "../db/schema.js";
import { eq, desc, ilike, or } from "drizzle-orm";

export const ordensRouter = Router();

// List all ordens with optional search
ordensRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    let query = db.select().from(ordensProducao).orderBy(desc(ordensProducao.updatedAt));

    const results = await query;

    let filtered = results;
    if (search) {
      const s = (search as string).toLowerCase();
      filtered = filtered.filter(
        (op) =>
          op.nroOp.toLowerCase().includes(s) ||
          op.produto.toLowerCase().includes(s) ||
          (op.lote && op.lote.toLowerCase().includes(s))
      );
    }
    if (status) {
      filtered = filtered.filter((op) => op.status === status);
    }

    return res.json(filtered);
  } catch (err) {
    console.error("Error listing ordens:", err);
    return res.status(500).json({ error: "Erro ao listar ordens" });
  }
});

// Get single ordem
ordensRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const [ordem] = await db.select().from(ordensProducao).where(eq(ordensProducao.id, parseInt(req.params.id)));
    if (!ordem) return res.status(404).json({ error: "Ordem não encontrada" });
    return res.json(ordem);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar ordem" });
  }
});

// Update status
ordensRouter.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const [updated] = await db
      .update(ordensProducao)
      .set({ status, updatedAt: new Date() })
      .where(eq(ordensProducao.id, parseInt(req.params.id)))
      .returning();
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

// Upsert (for n8n sync)
ordensRouter.post("/sync", async (req: Request, res: Response) => {
  try {
    const ordens = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];

    for (const op of ordens) {
      const existing = await db.select().from(ordensProducao).where(eq(ordensProducao.nroOp, op.nroOp)).limit(1);
      if (existing.length > 0) {
        const [updated] = await db
          .update(ordensProducao)
          .set({ ...op, updatedAt: new Date() })
          .where(eq(ordensProducao.nroOp, op.nroOp))
          .returning();
        results.push(updated);
      } else {
        const [created] = await db.insert(ordensProducao).values(op).returning();
        results.push(created);
      }
    }

    return res.json({ synced: results.length, results });
  } catch (err) {
    console.error("Sync error:", err);
    return res.status(500).json({ error: "Erro na sincronização" });
  }
});
