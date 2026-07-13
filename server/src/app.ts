import cors from "cors";
import express from "express";
import helmet from "helmet";
import answersRouter from "./routes/answers";
import authRouter from "./routes/auth";
import questionsRouter from "./routes/questions";

const app = express();

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authRouter);
app.use(questionsRouter);
app.use(answersRouter);

export default app;
