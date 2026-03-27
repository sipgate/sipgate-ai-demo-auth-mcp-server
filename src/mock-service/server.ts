import * as express from "express";
import * as jwt from "jsonwebtoken";
import { customers, contracts } from "./data";

const app = express();
app.use(express.json());

const JWT_SECRET = "mock-service-secret-key";
const PORT = parseInt(process.env.MOCK_SERVICE_PORT ?? "3001", 10);

interface TokenPayload {
  customerId: string;
  customerName: string;
}

function verifyToken(authHeader: string | undefined): TokenPayload | null {
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    return jwt.verify(authHeader.slice(7), JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

app.post("/auth/verify-pin", (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    res.status(400).json({ error: "PIN is required" });
    return;
  }

  const customer = customers.find((c) => c.pin === pin);

  if (!customer) {
    res.status(401).json({ error: "Invalid PIN" });
    return;
  }

  const token = jwt.sign(
    { customerId: customer.id, customerName: customer.name } as TokenPayload,
    JWT_SECRET,
    { expiresIn: "1h" },
  );

  res.json({
    token,
    customerId: customer.id,
    customerName: customer.name,
  });
});

app.get("/contracts", (req, res) => {
  const payload = verifyToken(req.headers.authorization);

  if (!payload) {
    res.status(401).json({ error: "Invalid or missing token" });
    return;
  }

  res.json({
    contracts: contracts.filter((c) => c.customerId === payload.customerId),
  });
});

app.get("/contracts/:id", (req, res) => {
  const payload = verifyToken(req.headers.authorization);

  if (!payload) {
    res.status(401).json({ error: "Invalid or missing token" });
    return;
  }

  const contract = contracts.find(
    (c) => c.id === req.params.id && c.customerId === payload.customerId,
  );

  if (!contract) {
    res.status(404).json({ error: "Contract not found" });
    return;
  }

  res.json({ contract });
});

app.listen(PORT, () => {
  console.log(`Mock Auth Service running on http://localhost:${PORT}`);
});
