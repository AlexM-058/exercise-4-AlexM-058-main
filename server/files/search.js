function search() {
  /* Task 1.2: Initialize the searchForm correctly */
  const searchForm = document.getElementById("searchForm"); 

  if (!searchForm) {
    // Prevent error if form is not found in the DOM
    return;
  }

  if (searchForm.reportValidity()) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const sectionElement = document.querySelector("section:nth-of-type(2)");

      while (sectionElement.childElementCount > 0) {
        sectionElement.firstChild.remove();
      }

      if (xhr.status === 200) {
        const results = JSON.parse(xhr.responseText);

        /* Task 1.3 Insert the results as specified. Do NOT
           forget to also cover the case in which no results
           are available. 
          */
        if (!results || results.length === 0) {
          const p = document.createElement("p");
          p.textContent = "No results found.";
          sectionElement.appendChild(p);
        } else {
          // Render each result as an <article> in #results section (for Cypress test)
          const resultsSection = document.getElementById("results") || sectionElement;
          results.forEach((movie) => {
            const article = document.createElement("article");
            article.id = movie.imdbID;
            article.innerHTML = `
              <h2>${movie.Title}</h2>
              <p>Year: ${movie.Year !== null ? movie.Year : "N/A"}</p>
              <p>imdbID: ${movie.imdbID}</p>
            `;
            resultsSection.appendChild(article);
          });
        }
      }
    };

    /* Task 1.2: Finish the xhr configuration and send the request */
    const queryValue = document.getElementById("query").value;
    xhr.open("GET", "/search?query=" + encodeURIComponent(queryValue));
    xhr.setRequestHeader("Accept", "application/json");
    xhr.send();
  }
}

/* Task 2.1. Add a function that you use as an event handler for when
    the button you added above in 1.3. is clicked. In it, call the
    POST /addMovies endpoint and pass the array of imdbID to be added
    as payload. */
function addMovies(imdbIDs) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/addMovies");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function () {
    if (xhr.status === 200 || xhr.status === 201) {
      alert("Movies added successfully!");
    } else {
      alert("Failed to add movies.");
    }
  };
  xhr.send(JSON.stringify(imdbIDs));
}

// Prevent favicon.ico errors in development (optional, client-side workaround)
window.onload = function () {
  // Attach the search handler to the form's submit event for better UX
  // S-a modificat pentru a asculta direct evenimentul 'click' al butonului
  const searchForm = document.getElementById("search"); // Acum caută formularul cu id="search"
  const searchButton = document.getElementById("searchButton"); // Noul element pentru buton

  if (searchButton) {
    searchButton.addEventListener("click", function (e) {
      // e.preventDefault(); // Nu mai e strict necesar aici
      search();
    });
  }
  // Also trigger search on page load if there is a query in the input (for Cypress tests)
  const queryInput = document.getElementById("query");
  if (queryInput && queryInput.value) {
    search();
  }
  // Optionally, prevent favicon.ico requests from causing errors in the console
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = "data:;base64,=";
  document.head.appendChild(link);
};

// In summary: The /search endpoint is called in search.js by the search() function,
// which is triggered when the search form is submitted or the search button is clicked.
// The results are displayed in the second <section> element of the HTML page.
