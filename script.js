console.warn("Script loaded.");

/* --------------------------- Constants --------------------------- */
// PREFIXES
const PREFIX = `PREFIX msmt: <http://msmt.cz/>\n`;

// Limits
const SEARCH_RESULTS_LIMIT = 250;
const AGGREGATED_RESULTS_LIMIT = 50;


/* --------------------------- SPARQL query ------------------------------- */

/**
 * Main function.
 * 
 * Runs a SPARQL query against the server API and
 * renders the result to a table.
 * @fires runQuery
 * @fires renderTable
 * 
 * @param {string} query 
 */
function runAndRenderQuery(query) {
    runQuery(query).then(data => {
        renderTable(data);
    });
    //TODO pagination?
}

/**
 * Sends a POST request with a SPARQL query to the server.
 * 
 * @param {string} query - The SPARQL query to run
 * @returns {Promise<*>} data - The data fetched from the sparql query
 */
async function runQuery(query) {
    if (!query) return;
    console.log("Running query:", query);

  const queryResult = await fetch("/api/query", {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify({ query })
  });

  const data = await queryResult.json();
  return data;
}


/* --------------------------- Detail by ICO ------------------------------- */

/**
 * Shows detailed info about a school/entity in a modal dialog.
 * @param {string} icoIRI - The ICO IRI of the school/entity to get details for. 
 */
window.showDetailByIco = async function(icoIRI) {
    console.log("DETAIL clicked:", icoIRI);
    const query = queryDetailByIco(icoIRI);
    console.log("DETAIL query:", query);
    await runQuery(query).then(data => {
        renderTableInModal(data);
    });
};

/**
 * Creates a SPARQL query to get detailed info about a school by its ICO.
 * @param {string} icoIRI 
 * @returns {string} queryText - The SPARQL query as a string.
 */
function queryDetailByIco(icoIRI) {
    const queryText = PREFIX + `
        SELECT ?ico ?nazevSkoly ?kraj ?obec ?psc ?ulice ?cislo
        WHERE {
            ?sub msmt:ico "${icoIRI}" ;
                msmt:uplnyNazev ?nazevSkoly ;
                msmt:adresa ?a.

            OPTIONAL { ?sub msmt:kraj ?kraj . }
            OPTIONAL { ?a msmt:obec ?obec . }
            OPTIONAL { ?a msmt:psc ?psc . }
            OPTIONAL { ?a msmt:ulice ?ulice . }
            OPTIONAL { ?a msmt:cisloDomovni ?cislo . }
        }
        GROUP BY ?ico ?nazevSkoly ?kraj ?obec ?psc ?ulice ?cislo`;
    return queryText;
}


/* --------------------------- Query by name ------------------------------- */

/**
 * Creates a SPARQL query to search for schools by name.
 * @returns {string} queryText - The SPARQL query as a string.
 */
function queryByName() {
    const nameToSearch = (document.getElementById("inputSearchByName").value).trim().toLowerCase();
    console.warn("Running search by school name:", nameToSearch);

    if (nameToSearch === "") {
        console.error("Empty name to search.");
        document.getElementById("inputSearchByName").classList.add("is-invalid");
        document.getElementById("validationSchoolName").classList.remove("invisible");
        return;
    }

    document.getElementById("inputSearchByName").classList.remove("is-invalid");
    document.getElementById("validationSchoolName").classList.add("invisible");

    const queryText = PREFIX + `
        SELECT ?ico ?nazevSkoly ?obec
        WHERE {
            ?sub msmt:ico ?ico ;
                msmt:uplnyNazev ?nazevSkoly ;
                msmt:adresa ?a .
            ?a msmt:obec ?obec .

            FILTER(CONTAINS(LCASE(STR(?nazevSkoly)), "${nameToSearch}"))
        }
        ORDER BY ?nazevSkoly
        LIMIT ${SEARCH_RESULTS_LIMIT}`;
    return queryText;
}

/* --------------------------- Query by field of study ------------------------------- */

/**
 * Creates a SPARQL query to search for schools by field of study.
 * @returns {string} queryText - The SPARQL query as a string.
 */
function queryByFieldOfStudy() {
    const fieldOfStudyToSearch = (document.getElementById("inputSearchByFieldOfStudy").value).trim().toLowerCase();
    console.warn("Running search by field of study:", fieldOfStudyToSearch);

    if (fieldOfStudyToSearch === "") {
        console.error("Empty field of study to search.");
        document.getElementById("inputSearchByFieldOfStudy").classList.add("is-invalid");
        document.getElementById("validationFieldOfStudy").classList.remove("invisible");
        return;
    }

    document.getElementById("inputSearchByFieldOfStudy").classList.remove("is-invalid");
    document.getElementById("validationFieldOfStudy").classList.add("invisible");

    const queryText = PREFIX + `
        SELECT DISTINCT
            ?ico ?nazevSkoly ?obec ?typSkoly ?oborKod ?oborNazev
            WHERE {
                ?sub msmt:ico ?ico ;
                    msmt:uplnyNazev ?nazevSkoly ;
                    msmt:adresa ?a ;
                    msmt:skolyAZarizeni ?skola .
                ?a msmt:obec ?obec .

                OPTIONAL { ?skola msmt:uplnyNazev ?typSkoly . }

                ?skola msmt:obory ?obor .
                ?obor msmt:kod ?oborKod ;
                        msmt:nazev ?oborNazev .

                FILTER(CONTAINS(LCASE(STR(?oborNazev)), LCASE("${fieldOfStudyToSearch}")))
            }
            ORDER BY ?nazevSkoly ?typSkoly ?oborNazev
            LIMIT ${SEARCH_RESULTS_LIMIT}`;
    return queryText;
}


/* --------------------------- Query by municipality ------------------------------- */

/**
 * Creates a SPARQL query to search for schools by municipality.
 * @returns {string} queryText - The SPARQL query as a string.
 */
function queryByMunicipality() {
    const municipalityToSearch = (document.getElementById("inputSearchByMunicipality").value).trim().toLowerCase();
    console.warn("Running search by municipality:", municipalityToSearch);

    if (municipalityToSearch === "") {
        console.error("Empty municipality to search.");
        document.getElementById("inputSearchByMunicipality").classList.add("is-invalid");
        document.getElementById("validationMunicipality").classList.remove("invisible");
        return;
    }

    document.getElementById("inputSearchByMunicipality").classList.remove("is-invalid");
    document.getElementById("validationMunicipality").classList.add("invisible");

    const queryText = PREFIX + `
        SELECT DISTINCT ?ico ?nazevSkoly ?obec ?typSkoly
        WHERE {
            ?sub msmt:ico ?ico ;
                msmt:uplnyNazev ?nazevSkoly ;
                msmt:adresa ?a ;
                msmt:skolyAZarizeni ?skola .
            ?a msmt:obec ?obec .

            OPTIONAL { ?skola msmt:izo ?izo . }
            OPTIONAL { ?skola msmt:uplnyNazev ?typSkoly . }

            FILTER(CONTAINS(LCASE(STR(?obec)), LCASE("${municipalityToSearch}")))
        }
        ORDER BY ?nazevSkoly ?typSkoly
        LIMIT ${SEARCH_RESULTS_LIMIT}`;
    return queryText;
}


/* --------------------------- Aggregated queries ------------------------------- */

/**
 * Queries top 50 municipalities by number of associated schools/entities.
 * @returns {string} queryText - The SPARQL query as a string.
 */
function queryMunicipalitiesBySchools() {
    const queryText = PREFIX + `
        SELECT ?obec (COUNT(DISTINCT ?sub) AS ?pocetSubjektu)
        WHERE {
            ?sub msmt:ico ?ico ;
                msmt:adresa ?a .
            ?a msmt:obec ?obec .
        }
        GROUP BY ?obec
        ORDER BY DESC(?pocetSubjektu)
        LIMIT ${AGGREGATED_RESULTS_LIMIT}`;
    return queryText;
}

/**
 * Queries top 50 fields of study by number of associated schools/entities.
 * @returns {string} queryText - The SPARQL query as a string.
 */
function queryFieldsOfStudyBySchools() {
   const queryText = PREFIX + `
        SELECT ?nazev (COUNT(*) AS ?pocet)
        WHERE {
        ?sub msmt:skolyAZarizeni ?skola .
        ?skola msmt:obory ?obor .
        ?obor msmt:nazev ?nazev .
        }
        GROUP BY ?nazev
        ORDER BY DESC(?pocet)
        LIMIT ${AGGREGATED_RESULTS_LIMIT}`;
return queryText;
}

/* ----------------------------- Rendering ----------------------------------- */

/**
 * Renders the SPARQL query result data into an HTML table.
 * Used for displaying the main results on the page.
 * 
 * @param {} data - The data fetched from the sparql query
 */
function renderTable(data) {
    const oldTable = document.getElementById("resultsTable");
    if (oldTable) {
        oldTable.remove();
    }

    const tableToRender = getQueryResultTable(data, true, true);
    if (!tableToRender) {
        document.getElementById("resultText").innerHTML = `<i class="bi bi-exclamation-circle"></i> Nenalezeny žádné výsledky.`;
        return;
    }

    tableToRender.id = "resultsTable";
    document.getElementById("queryResult").appendChild(tableToRender);
    document.getElementById("resultText").innerHTML = `<i class="bi bi-hash"></i> Nalezeno ${data?.results?.bindings.length} záznamů.`;
}

/**
 * Renders the SPARQL query result data into an HTML table inside a modal.
 * Used for displaying detailed results in a modal dialog.
 * 
 * @param {} data - The data fetched from the sparql query
 */
function renderTableInModal(data) {
    const oldTable = document.getElementById("resultsTableModal");
    if (oldTable) {
        oldTable.remove();
    }

    const tableToRender = getQueryResultTable(data, true, false);
    if (!tableToRender) {
        alert("Nenalezeny žádné výsledky.");
        return;
    }

    tableToRender.id = "resultsTableModal";
    const modalBody = document.getElementById("queryResultModal");
    modalBody.appendChild(tableToRender);
    const queryResultModal = new bootstrap.Modal(document.getElementById("queryResultModalContainer"));
    queryResultModal.show();
}    

/**
 * Assembles an HTML table from SPARQL query result data and returns it.
 * @param {*} data 
 * @param {boolean} numberRows - Whether to include a row number column
 * @returns {HTMLElement} table - The HTML table element with the query results
 */
function getQueryResultTable(data, numberRows, renderDetailButtons) {
    console.log("Getting table from data:", data);
    const bindings = data?.results?.bindings || [];
    const columnNames = data?.head?.vars || [];

    if (!bindings.length) {
        console.warn("No results to render.");
        return;
    }

    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-bordered", "mt-4");
    
    // ---------------- Render table head ----------------
    const tableHead = document.createElement("thead");
    if (numberRows) {
        const headerNumberCell = document.createElement("th");
        headerNumberCell.textContent = "#";
        tableHead.appendChild(headerNumberCell);
    }

    for (const column of columnNames) {
        if (renderDetailButtons && column === "ico") {
            const th = document.createElement("th");
            th.textContent = "Detail";
            tableHead.appendChild(th);
            continue;
        }
        const th = document.createElement("th");
        th.textContent = String(column).charAt(0).toUpperCase() + String(column).slice(1);
        tableHead.appendChild(th);
    }


    // ---------------- Render table body ----------------
    const tableBody = document.createElement("tbody");
    bindings.forEach((row, rowIdx) => {
        const tr = document.createElement("tr");
        if (numberRows) {
            const rowNumberCell = document.createElement("td");
            rowNumberCell.textContent = rowIdx + 1;
            tr.appendChild(rowNumberCell);
        }

        for (const column of columnNames) {
            const cell = row[column]?.value ?? "";
            const td = document.createElement("td");
            if (renderDetailButtons && column === "ico" && cell) {
                const button = document.createElement("button");
                button.textContent = "Detail";
                button.onclick = () => showDetailByIco(cell);
                td.appendChild(button);
            } else {
                td.textContent = escapeHtml(cell.charAt(0).toUpperCase() + String(cell).slice(1));
            }
            tr.appendChild(td);
        }
        tableBody.appendChild(tr);
    });

    table.appendChild(tableHead);
    table.appendChild(tableBody);

    return table;
}


/* --------------------------- Utility functions ------------------------------- */

/**
 * Escapes HTML special characters in a string.
 * @param {string} htmlString - The input HTML string
 * @returns {string} escapedHtmlString - The escaped HTML string
 */
function escapeHtml(htmlString) {
  const escapedHtmlString = String(htmlString)
                              .replaceAll("&", "&amp;")
                              .replaceAll("<", "&lt;")
                              .replaceAll(">", "&gt;")
                              .replaceAll('"', "&quot;")
                              .replaceAll("'", "&#039;");
  return escapedHtmlString;
}