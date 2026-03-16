import express from "express";
import cors from "cors";
import { router } from "./api/routes.js";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`Engine service listening on port ${PORT}`);
});

export default app;
