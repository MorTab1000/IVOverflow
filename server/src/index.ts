import "dotenv/config";
import app from "./app";

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, () => {
  console.log(`IVOverflow API running on http://localhost:${PORT}`);
});
