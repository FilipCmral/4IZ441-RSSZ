import express from "express";

const app = express();
app.use(express.json());


// API endpoint: SPARQL to Fuseki
const FUSEKI_QUERY_URL = "http://localhost:3030/rssz/sparql";
app.post("/api/query", async (request, response) => {
  const { query } = request.body;
  if (!query) return response.status(400).json({ error: "Missing query" });

  try {
    const queryResult = await fetch(FUSEKI_QUERY_URL, {
      method: "POST",
      headers: {
        "content-type": "application/sparql-query",
        "accept": "application/sparql-results+json"
      },
      body: query
    });

    const text = await queryResult.text();
    if (!queryResult.ok) return response.status(queryResult.status).send(text);

    response.type("json").send(text);
  } catch (e) {
    response.status(500).json({ error: String(e) });
  }
});


// HTML
app.use(express.static("frontend"));


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});