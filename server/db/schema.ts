import { pgTable, serial, text, integer, timestamp, boolean, decimal, varchar } from "drizzle-orm/pg-core";

// ===== Users =====
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nome: varchar("nome", { length: 200 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("operador"),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== Ordens de Produção =====
export const ordensProducao = pgTable("ordens_producao", {
  id: serial("id").primaryKey(),
  nroOp: varchar("nro_op", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 30 }).notNull().default("Criado"),
  produto: text("produto").notNull(),
  qtdProduzir: decimal("qtd_produzir", { precision: 15, scale: 2 }).notNull(),
  lote: varchar("lote", { length: 50 }),
  atividade: text("atividade"),
  sankhyaId: varchar("sankhya_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== Execuções =====
export const execucoes = pgTable("execucoes", {
  id: serial("id").primaryKey(),
  ordemId: integer("ordem_id").notNull().references(() => ordensProducao.id),
  tipo: varchar("tipo", { length: 20 }).notNull().default("Normal"),
  motivoParadaId: integer("motivo_parada_id").references(() => motivosParada.id),
  dhInicio: timestamp("dh_inicio").defaultNow().notNull(),
  dhFinal: timestamp("dh_final"),
  observacao: text("observacao"),
});

// ===== Apontamentos =====
export const apontamentos = pgTable("apontamentos", {
  id: serial("id").primaryKey(),
  ordemId: integer("ordem_id").notNull().references(() => ordensProducao.id),
  nroApontamento: varchar("nro_apontamento", { length: 50 }).notNull(),
  dataHora: timestamp("data_hora").defaultNow().notNull(),
  situacao: varchar("situacao", { length: 20 }).notNull().default("Pendente"),
  syncedSankhya: boolean("synced_sankhya").notNull().default(false),
});

// ===== Produtos Acabados =====
export const produtosAcabados = pgTable("produtos_acabados", {
  id: serial("id").primaryKey(),
  apontamentoId: integer("apontamento_id").notNull().references(() => apontamentos.id),
  produto: text("produto").notNull(),
  unMedida: varchar("un_medida", { length: 20 }).notNull(),
  controle: varchar("controle", { length: 100 }),
  quantidade: decimal("quantidade", { precision: 15, scale: 2 }).notNull(),
  qtdProduzida: decimal("qtd_produzida", { precision: 15, scale: 2 }).notNull().default("0"),
  qtdPerda: decimal("qtd_perda", { precision: 15, scale: 2 }).notNull().default("0"),
  motivoPerdaId: integer("motivo_perda_id").references(() => motivosPerda.id),
});

// ===== Matérias Primas =====
export const materiasPrimas = pgTable("materias_primas", {
  id: serial("id").primaryKey(),
  apontamentoId: integer("apontamento_id").notNull().references(() => apontamentos.id),
  produto: text("produto").notNull(),
  unMedida: varchar("un_medida", { length: 20 }).notNull(),
  controle: varchar("controle", { length: 100 }),
  quantidade: decimal("quantidade", { precision: 15, scale: 2 }).notNull(),
});

// ===== Motivos de Parada =====
export const motivosParada = pgTable("motivos_parada", {
  id: serial("id").primaryKey(),
  codigo: integer("codigo").notNull().unique(),
  descricao: text("descricao").notNull(),
});

// ===== Motivos de Perda =====
export const motivosPerda = pgTable("motivos_perda", {
  id: serial("id").primaryKey(),
  codigo: integer("codigo").notNull().unique(),
  descricao: text("descricao").notNull(),
});

// ===== Anexos =====
export const anexos = pgTable("anexos", {
  id: serial("id").primaryKey(),
  ordemId: integer("ordem_id").notNull().references(() => ordensProducao.id),
  filename: text("filename").notNull(),
  filepath: text("filepath").notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ===== Sync Log =====
export const syncLog = pgTable("sync_log", {
  id: serial("id").primaryKey(),
  entidade: varchar("entidade", { length: 50 }).notNull(),
  acao: varchar("acao", { length: 30 }).notNull(),
  payload: text("payload"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
