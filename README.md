# Inplast Aponta — Monitoramento de Produção

Aplicativo web mobile-first (otimizado para tablets) para apontamento de produção industrial, integrado ao ERP Sankhya via n8n. Replicação fiel da interface demonstrada no PDF da proposta comercial.

## 🚀 Tecnologias

- **Frontend**: React 19, Vite, TailwindCSS 4 (Design System Industrial)
- **Backend**: Node.js 22, Express, Drizzle ORM
- **Banco de Dados**: PostgreSQL 16
- **Integração**: n8n Webhooks → Sankhya Gateway API
- **Deploy**: Docker Compose + Coolify

## 📦 Como Implantar no Coolify

1. **Crie um novo projeto** no Coolify.
2. **Crie uma nova aplicação** do tipo "Docker Compose".
3. **Cole o conteúdo** do arquivo `docker-compose.yml` na configuração.
4. **Vá em "Environment Variables"** e adicione as variáveis do arquivo `.env.example`:
   - `DB_PASSWORD`: Uma senha forte para o Postgres.
   - `JWT_SECRET`: Uma chave aleatória longa para tokens de segurança.
   - `SANKHYA_BASE_URL` e `SANKHYA_TOKEN`: Suas credenciais cloud.
5. **Clique em Deploy**.
6. Acesso via `http://vm-apps:4001` ou o domínio roteado (ex: `http://aponta.inplast.local`).

## 📊 Fluxo de Sincronização (n8n)

O app envia requisições para o n8n via webhook:

- **Listagem de OPs**: O app consome do banco local, que deve ser populado via n8n (Service: `CRUDServiceProvider.loadRecords` no Sankhya).
- **Apontamentos**: Quando confirmado no app, o n8n recebe o JSON e envia para o Sankhya (`saveRecord` nas tabelas `TPRAPA` e `TPRAMP`).
- **Execuções**: Início/Fim de atividade sincronizados via n8n (`TPREIATV`).

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev

# Gerar build de produção
npm run build
```

---
**Inplast Industrial** - PCP & Tecnologia
