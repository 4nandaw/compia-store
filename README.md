## COMPIA Store — Monorepo

Loja Virtual de uma Editora de Inteligência Artificial (COMPIA). 
Este repositório segue o modelo **monorepo**, agrupando backend (API), 
frontend (SPA).

### Stack Principal

- **Backend**: Python + FastAPI + Uvicorn
- **Frontend**: React + Vite + JavaScript (JSX)
- **Gestão de ambiente**: arquivos `.env` (base em `.env.example`)

---

### Como Rodar o Projeto (Desenvolvimento)

#### 1. Pré-requisitos

- **Python** 3.11+ (recomendado)
- **Node.js** 18+ (ou versão LTS recente)
- Gerenciador de pacotes: `npm`, `yarn` ou `pnpm` (exemplos abaixo usam `npm`)

---

#### 2. Configurar variáveis de ambiente

Na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` se necessário (portas, URL da API, etc.).

---

#### 3. Backend (FastAPI)

No diretório `backend/`:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

A API ficará acessível em `http://localhost:8000`.

---

#### 4. Frontend (React + Vite + TS)

No diretório `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

O frontend ficará acessível em `http://localhost:5173`.

Certifique-se de que o backend esteja rodando na porta configurada
em `VITE_API_BASE_URL` (por padrão, `http://localhost:8000/api/v1`).

---

### Rodando com Docker Compose (Backend)

O `docker-compose.yml` da raiz já sobe o banco MySQL e o backend FastAPI.

#### Pré-requisitos

- Docker
- Docker Compose (plugin `docker compose`)
- Arquivo `.env` na raiz do projeto

#### 1. Criar `.env` (se ainda não existir)

```bash
cp .env.example .env
```

#### 2. Subir apenas backend + banco

Na raiz do projeto:

```bash
docker compose up -d mysql backend
```

#### 3. Acompanhar logs do backend

```bash
docker compose logs -f backend
```

#### 4. Verificar se está no ar

- API: `http://localhost:8000`
- Docs Swagger: `http://localhost:8000/docs`

#### 5. Parar os serviços

```bash
docker compose stop backend mysql
```

Para remover containers/rede e limpar tudo:

```bash
docker compose down
```

Se quiser remover também o volume do MySQL:

```bash
docker compose down -v
```

#### Comando opcional (stack completa)

Para subir frontend + backend + mysql:

```bash
docker compose up -d
```

---

### Pagamentos

O checkout agora possui integração de pagamento via API backend (`/api/v1/payments`) com suporte a:

- Gateways: **PagSeguro**, **Mercado Pago**, **Stripe** e **PayPal**
- Cartão de crédito com bandeiras: **Visa**, **MasterCard**, **Elo**, **Amex** e **Hipercard**
- **PIX** com geração de **QR Code** e **chave aleatória**
- Chave PIX aleatória validada no padrão **UUID (EVP)**

#### Fluxos implementados

- **Cartão**: cria pagamento e conclui o pedido imediatamente quando aprovado.
- **PIX**: gera QR Code/chave aleatória, depois permite confirmação do pagamento para concluir o pedido.
- **PIX**: BR Code é gerado com CRC16 válido para leitura em apps bancários e confirmação posterior no checkout.

#### Endpoints de pagamento

- `GET /api/v1/payments/options` — lista métodos, gateways e bandeiras.
- `POST /api/v1/payments` — cria pagamento (cartão ou PIX).
- `POST /api/v1/payments/{transaction_id}/confirm` — confirma pagamento PIX.