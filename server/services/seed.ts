import { db } from "../index.js";
import { motivosParada, motivosPerda, users, ordensProducao } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const MOTIVOS_PARADA = [
  { codigo: 9, descricao: "AGUARDANDO CARRO TRANSFER" },
  { codigo: 13, descricao: "AGUARDANDO ONDULADEIRA" },
  { codigo: 21, descricao: "AJUSTES MESA DE ALIMENTAÇÃO" },
  { codigo: 16, descricao: "DEFEITO ELÉTRICO" },
  { codigo: 15, descricao: "DEFEITO MECÂNICO" },
  { codigo: 28, descricao: "ENROSCO DE CHAPA" },
  { codigo: 10, descricao: "ESTEIRA DE PALETES CHEIA" },
  { codigo: 11, descricao: "FALHA DE PROGRAMAÇÃO DO PCP" },
  { codigo: 20, descricao: "FALHA DO SLOTTER" },
  { codigo: 27, descricao: "FALHA OPERACIONAL" },
  { codigo: 14, descricao: "FALHA SISTEMA (TI)" },
  { codigo: 6, descricao: "FALTA DE ÁGUA/AR" },
  { codigo: 35, descricao: "FALTA DE ENERGIA - CONCESSIONÁRIA" },
  { codigo: 1, descricao: "SETUP / TROCA DE PEDIDO" },
  { codigo: 2, descricao: "MANUTENÇÃO PREVENTIVA" },
  { codigo: 3, descricao: "ALMOÇO / INTERVALO" },
  { codigo: 4, descricao: "REUNIÃO" },
  { codigo: 5, descricao: "LIMPEZA DA MÁQUINA" },
  { codigo: 7, descricao: "FALTA DE MATÉRIA PRIMA" },
  { codigo: 8, descricao: "FALTA DE OPERADOR" },
  { codigo: 12, descricao: "TESTE DE QUALIDADE" },
];

const MOTIVOS_PERDA = [
  { codigo: 9, descricao: "ABAULAMENTO" },
  { codigo: 18, descricao: "BOLHAS" },
  { codigo: 1, descricao: "CAIXAS DE AJUSTE" },
  { codigo: 2, descricao: "CAIXAS SUJAS E DANIFICADAS" },
  { codigo: 11, descricao: "CHAPA DESALINHADA" },
  { codigo: 12, descricao: "CHAPA DESCOLADA / RESSECADA" },
  { codigo: 13, descricao: "CHAPA FORA DE MEDIDA / ESPECIFICAÇÃO" },
  { codigo: 10, descricao: "CHAPAS AMASSADAS / RASGADAS" },
  { codigo: 20, descricao: "CHAPAS COM REBARBAS" },
  { codigo: 22, descricao: "CHAPAS SUJAS" },
  { codigo: 3, descricao: "DIMENSIONAL FORA DO ESPECIFICADO" },
  { codigo: 14, descricao: "FACE SIMPLES (KQM)" },
  { codigo: 21, descricao: "FICHA / CORDÃO DE AR" },
  { codigo: 4, descricao: "GRAMATURA FORA" },
  { codigo: 5, descricao: "IMPRESSÃO BORRADA" },
  { codigo: 6, descricao: "IMPRESSÃO FORA DE REGISTRO" },
  { codigo: 7, descricao: "RISCO NA IMPRESSÃO" },
  { codigo: 8, descricao: "VINCO FORA DE POSIÇÃO" },
  { codigo: 15, descricao: "COLAGEM DEFEITUOSA" },
  { codigo: 16, descricao: "CORTE IRREGULAR" },
  { codigo: 17, descricao: "EMPENAMENTO" },
  { codigo: 19, descricao: "DELAMINAÇÃO" },
];

export async function seedMotivos() {
  try {
    // Seed motivos de parada
    for (const m of MOTIVOS_PARADA) {
      const existing = await db.select().from(motivosParada).where(eq(motivosParada.codigo, m.codigo)).limit(1);
      if (existing.length === 0) {
        await db.insert(motivosParada).values(m);
      }
    }

    // Seed motivos de perda
    for (const m of MOTIVOS_PERDA) {
      const existing = await db.select().from(motivosPerda).where(eq(motivosPerda.codigo, m.codigo)).limit(1);
      if (existing.length === 0) {
        await db.insert(motivosPerda).values(m);
      }
    }

    // Seed admin user
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    if (existingAdmin.length === 0) {
      const hash = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({ username: "admin", passwordHash: hash, nome: "Administrador", role: "admin" });
    }

    // Seed demo operator
    const existingOp = await db.select().from(users).where(eq(users.username, "operador")).limit(1);
    if (existingOp.length === 0) {
      const hash = await bcrypt.hash("op123", 10);
      await db.insert(users).values({ username: "operador", passwordHash: hash, nome: "Operador Demo", role: "operador" });
    }

    // Seed demo OPs
    const existingOps = await db.select().from(ordensProducao).limit(1);
    if (existingOps.length === 0) {
      const demoOps = [
        { nroOp: "2644", status: "Em andamento", produto: "COLA BHS - ITA", qtdProduzir: "9421.28", lote: "124", atividade: "APONTAMENTO" },
        { nroOp: "2643", status: "Em andamento", produto: "CHAPA C2MC2 B P CS 374 X 809 mm", qtdProduzir: "2222.00", lote: "124", atividade: "APONTAMENTO CHAPAS" },
        { nroOp: "2642", status: "Em andamento", produto: "21/235216 (PP)", qtdProduzir: "2222.00", lote: "124", atividade: "IMPRIMIR / CORTAR / COLAR" },
        { nroOp: "2641", status: "Em andamento", produto: "21/235216", qtdProduzir: "2222.00", lote: "124", atividade: "PALETIZAR" },
        { nroOp: "2640", status: "Criado", produto: "K 150 M 150 K 150 CH PP 1422 X 613", qtdProduzir: "2000.00", lote: "64016-1", atividade: "" },
        { nroOp: "2627", status: "Criado", produto: "CHAPA PP C1MC1.B N CS 400 X 600 MM", qtdProduzir: "6000.00", lote: "63503-1", atividade: "" },
        { nroOp: "2626", status: "Finalizado", produto: "CHAPA PA C1MC1.B N CS 400 X 600 MM", qtdProduzir: "6000.00", lote: "63496-1", atividade: "" },
        { nroOp: "2625", status: "Em andamento", produto: "CHAPA PP C1MC1.B N CS 400 X 600 MM", qtdProduzir: "6000.00", lote: "63496-1", atividade: "APONTAMENTO CHAPAS" },
        { nroOp: "2624", status: "Criado", produto: "CHAPA PA C1MC1.B N CS 400 X 500 MM", qtdProduzir: "6000.00", lote: "63496-1", atividade: "" },
        { nroOp: "2623", status: "Criado", produto: "CHAPA PP C1MC1.B N CS 400 X 600 MM", qtdProduzir: "6000.00", lote: "63496-1", atividade: "" },
      ];
      for (const op of demoOps) {
        await db.insert(ordensProducao).values(op);
      }
    }
  } catch (err) {
    console.error("Seed error:", err);
  }
}
