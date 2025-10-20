// server/index.js (dev server)
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`API on http://localhost:${port}`));