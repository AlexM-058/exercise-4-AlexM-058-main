function search() {
  /* Task 1.2: Initialize the searchForm correctly */
  const searchForm = document.getElementById("searchForm"); 

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
          const ul = document.createElement("ul");
          results.forEach((movie) => {
            const li = document.createElement("li");
            li.innerHTML = `
              <strong>${movie.Title}</strong> (${movie.Year})<br>
              <img src="${movie.Poster}" alt="Poster" style="height:100px"><br>
              imdbID: ${movie.imdbID}
            `;
            ul.appendChild(li);
          });
          sectionElement.appendChild(ul);
        }
      }
    };

    /* Task 1.2: Finish the xhr configuration and send the request */
    xhr.open("GET", "/search?q=" + encodeURIComponent(document.getElementById("query").value));
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

window.onload = function () {
  document.getElementById("search").addEventListener("click", () => search());
};