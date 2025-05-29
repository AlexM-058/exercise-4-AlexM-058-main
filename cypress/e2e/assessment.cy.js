import { checkMovie, } from "./movieChecks.mjs";

const QUERY = "Lord of the Rings: The Battle for Middle-Earth";

const LORD_OF_THE_RINGS = [
  {
    Title: "The Lord of the Rings: The Battle for Middle-Earth",
    imdbID: "tt0412935",
    Year: 2004,
  },
  {
    Title: "The Lord of the Rings: The Battle for Middle-Earth II",
    imdbID: "tt0760172",
    Year: 2006,
  },
  {
    Title:
      "The Lord of the Rings: The Battle for Middle-earth II - The Rise of the Witch-king",
    imdbID: "tt1058040",
    Year: 2006,
  },
];

describe("Testing Exercise 4", () => {
  it("1.1. GET /search returns the correct data from omdbapi.com", () => {
    cy.request({ method: "GET", url: "/search", failOnStatusCode: false }).as(
      "searchResult"
    );

    cy.get("@searchResult").then((response) => {
      expect(
        response.status,
        `Expected GET /search to return status code 400 when the query is missing`
      ).to.be.eq(400);
    });

    cy.request(
      "/search?query=" + QUERY
    ).as("searchResult");
    cy.get("@searchResult").then((response) => {
      expect(
        response.status,
        `Expected GET /search to return status code 200 when given a query`
      ).to.be.eq(200);
      expect(
        response.body,
        `Expected body to contain 3 search results when queries with '${QUERY}'`
      ).to.deep.eq(LORD_OF_THE_RINGS);

      cy.request("/search?query=my little pony friendship magic").as(
        "searchResult"
      );
      cy.get("@searchResult").then((response) => {
        expect(
          response.status,
          `Expected GET /search to return status code 200 when given a query`
        ).to.be.eq(200);
        expect(
          response.body,
          `Expected body to contain 2 search results when queries with 'my little pony friendship magic'`
        ).to.deep.eq([
          {
            Title: "My Little Pony: Friendship Is Magic",
            imdbID: "tt1751105",
            Year: null,
          },
          {
            Title: "My Little Pony: Friendship Is Magic - A Decade of Pony",
            imdbID: "tt13408956",
            Year: 2019,
          },
        ]);
      });
    });
  });

  it("1.2. User query is sent to GET /search endpoint", () => {
    cy.visit("/search.html").then(() => {
      cy.intercept("GET", "/search?query=*", []).as("search-endpoint");

      cy.get("#search input").type(QUERY);
      cy.get("#search button").click();

      cy.wait("@search-endpoint").then(({ request, response }) => {
        expect(
          request.query,
          `Expected request to include the search query entered by the user as a query parameter named 'query'`
        ).to.deep.eq({ query: QUERY });
      });
    });
  });

  function toChildTagNames(element) {
    return Array.from(element.children).map(e => e.tagName)
  }

  it("1.3. Search results are rendered correctly", () => {
    cy.visit("/search.html").then(() => {
      cy.intercept("GET", "/search?query=*", LORD_OF_THE_RINGS).as("search-endpoint");

      cy.get("#search input").type(QUERY);
      cy.get("#search button").click();

      cy.wait("@search-endpoint").then(() => {

        cy.get("#results article").then(resultElements => {
          expect(resultElements.length, `Expected ${LORD_OF_THE_RINGS.length} articles in the results section, one for each movie`)
            .to.be.eq(LORD_OF_THE_RINGS.length)

          for (let i = 0; i < resultElements.length; i++) {
            const movie = LORD_OF_THE_RINGS[i]
            const resultElement = resultElements[i]

            expect(resultElement.children.length, "Result article must have exacly 2 child elements").to.eq(2)
            expect(toChildTagNames(resultElement), "Result article child elements must be correct").to.deep.eq(['INPUT', 'LABEL'])

            const inputElement = resultElement.children[0]
            expect(inputElement.type, `Expected the input element to be a 'checkbox'`).to.be.eq("checkbox")
            expect(inputElement.value, `Expected the input elements value to equal the movie's id '${movie.imdbID}'`)
              .to.be.eq(movie.imdbID)
            expect(inputElement.id, `Expected the input elements id to equal the movie's id '${movie.imdbID}'`)
              .to.be.eq(movie.imdbID)
              
            const labelElement = resultElement.children[1]
            expect(labelElement.getAttribute('for'), `Expected the label element to be associated with the input element`).to.be.eq(movie.imdbID)
            expect(labelElement, `Expected the label element to contain the movie title '${movie.Title}'`)
              .to.contain(movie.Title)
          }
        })

        cy.get("#results button").then(elements => {
          const buttonElement = elements[0]

          expect(buttonElement.tagName, "Expected results form to contain a button element").to.be.eq("BUTTON")
          expect(buttonElement.textContent, "Expected button to have text 'Add selected to collection'").to.be.eq("Add selected to collection")
        })
      });

      cy.intercept("GET", "/search?query=*", []).as("search-endpoint");

      cy.get("#search button").click();

      cy.wait("@search-endpoint").then(() => {

        cy.get("#results").then(elements => {
          const sectionElement = elements[0]

          expect(sectionElement.children.length, "Result section must have exacly 1 child elements").to.eq(1)
          expect(toChildTagNames(sectionElement), "Result article child elements must be correct").to.deep.eq(['P'])
          expect(sectionElement.children[0], `Expected no results found message in the paragraph`).to.contain(`No results for your query '${QUERY}' found.`)
        })

      });
  })
})

it("2.1. Send ids of the selected movies to endpoint POST /movies", () => {
  cy.visit("/search.html").then(() => {
    cy.intercept("GET", "/search?query=*", LORD_OF_THE_RINGS).as("search-endpoint");

    cy.get("#search input").type(QUERY);
    cy.get("#search button").click();

    cy.wait("@search-endpoint").then(() => {

      cy.get("#results article input").then(inputElements => {

        inputElements[0].click()
        inputElements[2].click();

        cy.intercept("POST", "/movies", {}).as("post-movies");

        cy.get("#results button").click()

        cy.wait("@post-movies").then(({request}) => {

          expect(request.body, `Expected body of POST request to contain an array with the imdbIDs of the selected movies`)
            .to.deep.eq([LORD_OF_THE_RINGS[0].imdbID, LORD_OF_THE_RINGS[2].imdbID])
        })
      });
    })
  })
})

const movieIds = [
  "tt0469494", "tt0304415", "tt0057012", "tt0145487", "tt0427229", "tt0108052", "tt0089881", "tt0088727", 
  "tt0133093", "tt0012349", "tt0113986", "tt0290002", "tt0084814", "tt0318462", "tt2042568", "tt0407362", 
  "tt0059578", "tt0055205", "tt0364569", "tt0382330", "tt0049314", "tt0433383", "tt0120685", "tt0339291", 
  "tt1853728", "tt1320082", "tt0025316", "tt0094889", "tt0449088", "tt0120735", "tt0079470", "tt0083987", 
  "tt0089457", "tt0367882", "tt0119217", "tt0369436", "tt0087182", "tt0436889", "tt0091605", "tt0120601"];

  it("2.2. Added movies are available in the GET /movies endpoint", () => {
    cy.request("/movies").then((response) => {
      expect(response.body, "Response expected to be an array").to.be.a(
        "array"
      );

      const collectionIds = response.body.map((movie) => movie.imdbID);

      let idsToPost = movieIds
        .filter((imdbId) => !collectionIds.includes(imdbId))
        .slice(0, 3);

      expect(idsToPost.length, `No imdbIds left in test. All movie ids known to the test have been added to the movie collection. Restart the server to start anew`).to.be.at.least(1);

      cy.request("POST", "/movies", idsToPost).as("postMovieResponse");
      cy.get("@postMovieResponse").then((response) => {
        expect(
          response.status,
          `Expected response to have status code 200`
        ).to.be.eq(200);

        cy.request("/movies").then((response) => {
          const collectionIdsAfterPost = response.body.map(movie => movie.imdbID);
          const expectedMovieCount = collectionIds.length + idsToPost.length;
          expect(
            collectionIdsAfterPost.length,
            `Expected movie collection to have grown from ${collectionIds.length} to ${expectedMovieCount} movies`
          ).to.be.eq(expectedMovieCount);

          const newMovies = response.body.filter(movie => idsToPost.includes(movie.imdbID))

          for (const movie of newMovies) {
            checkMovie(movie);
          }
        });
      });
    });
  });

  it("3.1. A click on the 'Delete' button calls the DELETE /movies/:imdbID endpoint", () => {
    cy.visit("/").then(() => {
      cy.get("main article").then(movieElements => {
        expect(movieElements.length, `Expected at least one movie before testing the deletion`).to.be.at.least(1)

        const imdbId = movieElements[0].id;
        
        cy.intercept("DELETE", "/movies/*", {}).as("delete-movies");
        
        cy.get(`article#${imdbId} button:nth-of-type(2)`).click()

        cy.wait("@delete-movies").then(({request}) => {
          const {pathname} = new URL(request.url)
          expect(pathname, `Expected DELETE request to target endpoint '/movies/${imdbId}'`).to.be.eq(`/movies/${imdbId}`)
        })
      })
    });
  })

  it("3.2. Removal of a movie using DELETE /movies/:imdbID successfully deletes the movie from the server-side movie collection", () => {
    cy.request("/movies").then(response => {
      const currentMoviesIds = response.body.map(movie => movie.imdbID);

      expect(currentMoviesIds.length, `Expected at least one movie to be present in the movie collection`).to.be.at.least(1)

      const deletedID = currentMoviesIds[0];
      
      cy.request("DELETE", "/movies/" + deletedID).then(response => {
        expect(response.status, `Expected status of DELETE response to be 200`).to.be.eq(200)

        cy.request("/movies").then(response => {
          const moviesIdsAfterDeletion = response.body.map(movie => movie.imdbID);

          expect(moviesIdsAfterDeletion.length, `Expected movie count to be ${currentMoviesIds.length - 1} after deletion`).to.be.eq(currentMoviesIds.length - 1)
          expect(moviesIdsAfterDeletion.includes(deletedID), `Expected movie id of deleted movie ${deletedID} to no longer be present in movies returned from GET /movies endpoint`).to.be.eq(false)
        })
      })
    })
  })

  it("3.3. After successfully deleting a movie on the server-side, the movie is removed from the DOM", () => {
    cy.visit("/").then(() => {
      cy.get("main article").then(movieElements => {
        expect(movieElements.length, `Expected at least one movie before testing the deletion`).to.be.at.least(1)

        const imdbId = movieElements[0].id;
        
        cy.get(`article#${imdbId} button:nth-of-type(2)`).click()

        cy.get("main article").then(movieElementsAfterDeletion => {
          expect(movieElementsAfterDeletion.length, `Expected article movie element count to be ${movieElements.length - 1} after deletion`).to.be.eq(movieElements.length - 1)

          const movieIdsAfterDeletion = Array.from(movieElementsAfterDeletion).map(e => e.id)
          expect(movieIdsAfterDeletion.includes(imdbId), `Expect article movie element for deleted imdbID ${imdbId} to be no longer present in DOM`).to.be.eq(false)
        })
      })
    });
  })
});
