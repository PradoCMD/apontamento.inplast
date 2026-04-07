import { Router, Request, Response } from "express";
import { db } from "../index.js";
import { execucoes, ordensProducao, motivosParada } from "../db/schema.js";
import { eq, desc, isNull, and } from "drizzle-orm";

export const execucoesRouter = Router();

// List execuções by ordem
execucoesRouter.get("/ordem/:ordemId", async (req: Request, res: Response) => {
  try {
    const ordemId = parseInt(req.params.ordemId);
    const results = await db
      .select({
        id: execucoes.id,
        ordemId: execucoes.ordemId,
        tipo: execucoes.tipo,
        motivoParadaId: execucoes.motivoParadaId,
        dhInicio: execucoes.dhInicio,
        dhFinal: execucoes.dhFinal,
        observacao: execucoes.observacao,
        motivoParadaDescricao: motivosParada.descricao,
      })
      .from(execucoes)
      .leftJoin(motivosParada, eq(execucoes.motivoParadaId, motivosParada.id))
      .where(eq(execucoes.ordemId, ordemId))
      .orderBy(desc(execucoes.dhInicio));
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar execuções" });
  }
});

// Iniciar atividade
execucoesRouter.post("/iniciar", async (req: Request, res: Response) => {
  try {
    const { ordemId } = req.body;
    // Update ordem status
    await db.update(ordensProducao).set({ status: "Em andamento", updatedAt: new Date() }).where(eq(ordensProducao.id, ordemId));
    // Create execution
    const [exec] = await db.insert(execucoes).values({ ordemId, tipo: "Normal" }).returning();
    return res.json({ message: "Ordem de Produção Inicializada com sucesso!", execucao: exec });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao iniciar atividade" });
  }
});

// Parar atividade
execucoesRouter.post("/parar", async (req: Request, res: Response) => {
  try {
    const { ordemId, motivoParadaId, observacao } = req.body;
    // Close current normal execution
    const activeExecs = await db
      .select()
      .from(execucoes)
      .where(and(eq(execucoes.ordemId, ordemId), eq(execucoes.tipo, "Normal"), isNull(execucoes.dhFinal)));
    
    for (const exec of activeExecs) {
      await db.update(execucoes).set({ dhFinal: new Date() }).where(eq(execucoes.id, exec.id));
    }

    // Create parada execution
    const [parada] = await db
      .insert(execucoes)
      .values({ ordemId, tipo: "Parada", motivoParadaId, observacao })
      .returning();

    // Update status
    await db.update(ordensProducao).set({ status: "Parado", updatedAt: new Date() }).where(eq(ordensProducao.id, ordemId));

    return res.json({ message: "Ordem de Produção parada com sucesso!", execucao: parada });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao parar atividade" });
  }
});

// Continuar atividade (após parada)
execucoesRouter.post("/continuar", async (req: Request, res: Response) => {
  try {
    const { ordemId } = req.body;
    // Close parada
    const paradas = await db
      .select()
      .from(execucoes)
      .where(and(eq(execucoes.ordemId, ordemId), eq(execucoes.tipo, "Parada"), isNull(execucoes.dhFinal)));
    
    for (const p of paradas) {
      await db.update(execucoes).set({ dhFinal: new Date() }).where(eq(execucoes.id, p.id));
    }

    // Start new normal
    const [exec] = await db.insert(execucoes).values({ ordemId, tipo: "Normal" }).returning();
    await db.update(ordensProducao).set({ status: "Em andamento", updatedAt: new Date() }).where(eq(ordensProducao.id, ordemId));

    return res.json({ message: "Atividade continuada com sucesso!", execucao: exec });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao continuar atividade" });
  }
});

// Finalizar atividade
execucoesRouter.post("/finalizar", async (req: Request, res: Response) => {
  try {
    const { ordemId } = req.body;
    // Close all open executions
    const opens = await db
      .select()
      .from(execucoes)
      .where(and(eq(execucoes.ordemId, ordemId), isNull(execucoes.dhFinal)));
    
    for (const e of opens) {
      await db.update(execucoes).set({ dhFinal: new Date() }).where(eq(execucoes.id, e.id));
    }

    await db.update(ordensProducao).set({ status: "Finalizado", updatedAt: new Date() }).where(eq(ordensProducao.id, ordemId));

    return res.json({ message: "Atividade Finalizada com sucesso!" });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao finalizar atividade" });
  }
});
