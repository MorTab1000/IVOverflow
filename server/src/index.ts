import "dotenv/config";
import cors from "cors";
import express from "express";
import authRouter from "./routes/auth";
import questionsRouter from "./routes/questions";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authRouter);
app.use(questionsRouter);

app.listen(PORT, () => {
  console.log(`IVOverflow API running on http://localhost:${PORT}`);
});
