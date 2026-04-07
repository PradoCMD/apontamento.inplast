import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { db } from "../index.js";
import { anexos } from "../db/schema.js";
import { eq } from "drizzle-orm";

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

export const anexosRouter = Router();

anexosRouter.get("/ordem/:ordemId", async (req: Request, res: Response) => {
  try {
    const results = await db.select().from(anexos).where(eq(anexos.ordemId, parseInt(req.params.ordemId)));
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao listar anexos" });
  }
});

anexosRouter.post("/upload/:ordemId", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
    const ordemId = parseInt(req.params.ordemId);
    const [anexo] = await db
      .insert(anexos)
      .values({
        ordemId,
        filename: req.file.originalname,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
      })
      .returning();
    return res.json(anexo);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao fazer upload" });
  }
});
