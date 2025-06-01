function search() {
  /* Task 1.2: Initialize the searchForm correctly */
  const searchForm = document.getElementById("search");

  if (!searchForm) {
    // Prevent error if form is not found in the DOM
    console.error("Search form not found in the document.");
    return;
  }

  if (searchForm.reportValidity()) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const sectionElement = document.querySelector("section:nth-of-type(2)");

      // Golește secțiunea de rezultate existente
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
          // Modificat: Mesajul include acum interogarea de căutare
          p.textContent = `No results for your query '${queryValue}' found.`;
          sectionElement.appendChild(p);
        } else {
          const resultsSection =
            document.getElementById("results") || sectionElement;
          results.forEach((movie) => {
            const article = document.createElement("article");
            article.id = movie.imdbID;
            article.innerHTML = `
                          <input type="checkbox" id="${movie.imdbID}" value="${movie.imdbID}">
                          <label for="${movie.imdbID}">${movie.Title}</label>
                      `;
            resultsSection.appendChild(article);
          });

          // Adăugăm butonul "Add selected to collection" după afișarea rezultatelor
          const addSelectedButton = document.createElement("button");
          addSelectedButton.textContent = "Add selected to collection";
          addSelectedButton.id = "addSelectedMoviesButton";
          resultsSection.appendChild(addSelectedButton);

          // Adăugăm un event listener pentru noul buton
          addSelectedButton.addEventListener("click", function () {
            const selectedImdbIDs = [];
            // Selectăm toate checkbox-urile din secțiunea de rezultate care sunt bifate
            const checkboxes = resultsSection.querySelectorAll(
              'input[type="checkbox"]:checked'
            );
            checkboxes.forEach((checkbox) => {
              selectedImdbIDs.push(checkbox.value);
            });

            if (selectedImdbIDs.length > 0) {
              addMovies(selectedImdbIDs);
            } else {
              alert("Please select at least one movie to add.");
            }
          });
        }
      }
    };

    /* Task 1.2: Finish the xhr configuration and send the request */
    const queryInput = document.getElementById("query");
    const queryValue = queryInput ? queryInput.value : "";
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
  xhr.open("POST", "/movies");
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
  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("button pressed");
      search();
    });
  }
  const queryInput = document.getElementById("query");
  if (queryInput && queryInput.value) {
    search();
  }
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = "data:;base64,=";
  document.head.appendChild(link);
};
