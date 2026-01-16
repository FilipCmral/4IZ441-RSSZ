# 4IZ441-RSSZ

# Introduction
The goal of this project is to make a user-friendly tool, which could be used to aid in the search for educational institutions in the Czech Republic. It is not always easy to navigate through the options for education as information on the web is not always presented in a structured manner. The project addresses this problem by offering an interactive web interface connected to an RDF store via SPARQL. The aim is for the tool to be used to be used both by the parents and the children themselves.
# 1)	Dataset
The application works with the Rejstřík škol a školských zařízení - celá ČR dataset  published via NKOD . The dataset is represented in RDF and uses a domain-specific vocabulary (prefix msmt: in the queries). The core entities relevant to the application are schools described by the IČO number and textual attributes like the full name of the school. Address information is modelled as a related node that carries properties such as municipality, postal code, street, and house number. 
The dataset was downloaded as JSON-LD and pushed into Apache Jena Fuseki to create a SPARQL endpoint which the application could send requests to.
# 2)	Stack and architecture
The application uses a standard client-server design.
The backend utilities Apache Jena Fuseki to store the dataset and create a SPARQL endpoint.
The frontend uses a single HTML page with a combination of custom CSS and Bootstrap v5.3  for styling. The frontend sends SPARQL queries to the endpoint, parses the JSON results, and renders them into the HTML as a table.
In order to run the application locally a miniserver using Node.js and the express library was made.
# 3)	Functionality
I)	Searching
The application provides three ways to search for a school. There is currently no option combine the three ways of searching, it is clear that such an upgrade would greatly improve the viability of the project.
  a)	Search by school name
  The user can enter either the full name or a part of the name of the school. The results are ordered alphabetically.
  b)	Search by field of study
  The user can enter either the full name or a part of the name of the field of study. The results are ordered alphabetically. 
  c)	Search by municipality
  The user can enter either the full name or a part of the name of the municipality/city/town. The results are ordered alphabetically.
  d)	Details
  For any listed school, the user can open a detail view, which queries additional attributes, concretely IČO, name, region and address components.
 
II)	Aggregated searches
There is a bonus feature which provides the user the ability to list the top municipalities and top fields of study ordered by the number of schools under that category.
  a)	Show municipalities by the number of schools
This search shows the 50 largest municipalities by the number of schools in them. The function could potentially be improved by adding a button for each municipality to show the list of the schools located there.
  b)	Show fields of study by the number of schools
This search shows the 50 largest fields of study by the number of schools that teach them. The function could potentially be improved by adding a button for each field of study to show the list of the schools which teach it.
 
# 4)	Limitations and possible extensions
The current prototype focuses on single attribute search. The main limitation is the fact, that the three attributes cannot be combined to create a more complex search. Another limitation lies in the searching itself, the substring search is simple but not linguistically robust (e.g., no stemming or typo tolerance).
Possible future work includes adding pagination, extending filters, such as filtering by region or school type (elementary school, high school etc.).
Conclusion
This project delivers a functional RDF/SPARQL based web application which connects open RDF data to a user interface. The result is a small but complete example of how graph data can be published and consumed in a realistic scenario, while remaining easy to deploy and understand. The source code is available in the authors GitHub repo (https://github.com/FilipCmral/4IZ441-RSSZ).
