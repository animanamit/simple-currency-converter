import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

app.use("/json/*", serveStatic({ root: "./src" }));

app.get("/currencies", (c) => {
  return c.redirect("/json/currencies.json");
});

app.get("/names", (c) => {
  return c.redirect("/json/names.json");
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 8000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
