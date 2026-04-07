import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { db } from "../index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const authRouter = Router();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me");

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
    }

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user || !user.ativo) {
      return res.status(401).json({ error: "Usuário não encontrado ou inativo" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = await new jose.SignJWT({ userId: user.id, username: user.username, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    return res.json({
      token,
      user: { id: user.id, username: user.username, nome: user.nome, role: user.role, ativo: user.ativo },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
});

authRouter.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const token = authHeader.split(" ")[1];
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId as number)).limit(1);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    return res.json({ id: user.id, username: user.username, nome: user.nome, role: user.role, ativo: user.ativo });
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
});

// Create user (admin)
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { username, password, nome, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({ username, passwordHash, nome, role: role || "operador" }).returning();
    return res.json({ id: user.id, username: user.username, nome: user.nome, role: user.role });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ error: "Usuário já existe" });
    return res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// Middleware to verify JWT
export async function authMiddleware(req: Request, res: Response, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Não autorizado" });
    }
    const token = authHeader.split(" ")[1];
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
