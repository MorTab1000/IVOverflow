import cors from "cors";
import express from "express";
import authRouter from "./routes/auth";
import questionsRouter from "./routes/questions";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authRouter);
app.use(questionsRouter);

export default app;
