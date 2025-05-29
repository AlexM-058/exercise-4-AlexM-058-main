[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/F9ZR1pjN)
# Web Technologies - Exercise 4

The fourth and last assignment is about movie management. We are going to include functionality to search for movies using the `https://www.omdbapi.com/`, select some of the movies found, and add them to our personal movie collection. We  will also be add a new button to each movie `article` element to allow us to remove it from our collection. 

As usual, you can find detailed information about each part in the **Tasks** section below.

To set up your working environment for the project, you will need to perform the same steps you have used since exercise 1. First, you **clone** the project and configure it in an IDE, then you **install** the project's dependencies. To do so, run 

    npm install

in the project's root directory, where this `README.md` file is located. 

Then use

    npm start

or, using `nodemon` (the **recommended** option), run

    npm run start-nodemon

to start the server. In any case, the server will run on port 3000. You should see the message

    Server now listening on http://localhost:3000/

in your terminal. Navigate to [http://localhost:3000/](http://localhost:3000/) to test the application manually.

## Project structure

Our starting point for exercise 4 is a solution of exercise 3. 

On the server-side, we still have our `movie-model.js`, this time it does not contain any movies. In `server.js` you will find the server startup code defining the endpoints we have so far:
* `GET /movies` to get either all or genre-specific movies using the query parameter `genre`,
* `GET /movies/:imdbID` to get a specific movie to be edited in our form,
* `PUT /movies/:imdbID` to update a movie and, finally,
* `GET /genres` to get all genres of the movies in the collection sorted alphabetically.

On the client-side, we now have **three** HTML documents, each of which comes with its own `.css` and `.js` file:
* `index.html`. The overview page with genre filter and a new navigation area that leads us to `search.html`
* `edit.html`. Containing the edit functionality; nothing new there.
* `search.html`. This is where we will include the search for movies which we want to add to our personal collection.

Two of the CSS files, `index.css` and `search.css` are based on `grid-base.css`, because both of them use the same layout, a CSS grid. The third one, `edit.css` is based on `base.css`, which contains basic styles that are also used in `grid-base.css`.

All element builders reside in `builders.js`, which are used in `index.js` and `search.js`. You can use the builders to build the elements of this exercise, if you wish to do so. If you want to read more about the builder pattern itself, you can start with its [Wikipedia page](https://en.wikipedia.org/wiki/Builder_pattern). 

## Tasks

Here's a first overview of the three tasks, details follow below:

1. **Add the search capability**. In a first step, we will add a new server-side endpoint, `GET /search`, which in turn will use the `omdbapi.com` to search movies and return it to our client. We will send the movies found on `omdbapi.com` back to the client (including only a limited set of properties) and add the search results to the DOM dynamically. Then, we provide the user with the possibility to select those movies.

2. **Include movies selected by the user in the server-side collection**. In this task, we add functionality to send the movies selected by the user to another new endpoint, namely `POST /movies`, which will query `omdbapi.com` again to get the movie data for the selected movies. Then, we permanently add the chosen movies to our model.

3. **Remove individual movies from the collection**. We add functionality for the deletion of individual movies on the server-side and also remove the corresponding article element from the DOM once the deletion was successful. 

### Checking your implementation
As usual, to check whether your implementation is working as expected you should **run** Cypress end-to-end tests. These tests are the exact same tests used to assess your implementation once you commit it to the GitHub repository, this time there are 8 of them.

To start the tests, run

    npm run cypress

Again, there are subtasks within the three main tasks. Here is the scheme we will use to award the points:

+ 1.1. `GET /search` returns the correct data from `omdbapi.com`: **0.4 points**
+ 1.2. User query is sent to the `GET /search` endpoint: **0.2 points**
+ 1.3. Search results are rendered correctly: **0.4 points**

+ 2.1. Send ids of the selected movies to endpoint `POST /movies` : **0.25 points**
+ 2.2. Added movies are available in the `GET /movies` endpoint: **0.75 points**

+ 3.1. A click on the 'Delete' button calls the `DELETE /movies/:imdbID` endpoint: **0.33 points**
+ 3.2. Removal of a movie using `DELETE /movies/:imdbID` successfully deletes the movie from the server-side movie collection: **0.33 points**
+ 3.3. After successfully deleting a movie on the server-side, the movie is removed from the DOM: **0.34 points**

As always, use the configured test specification file `cypress/e2e/assessment.cy.js` to run the tests.

### Task 1: Query `omdbapi.com` and display the movies found to the user

**1.1 In `server.js`.** Add and implement the `GET /search` endpoint.

Add the new endpoint and include a sanity-check of the incoming request. If the request does not include a `query` parameter, reply with a status code **400 (Bad request)**.

If the request passes the sanity-check, continue with the endpoint logic.

The endpoint internally queries `omdbapi.com`. You will have to register on `omdbapi.com`and obtain an API key. Using that key, you can then query the API as described on their [main page](https://www.omdbapi.com/). Use either the [`http` module](https://nodejs.org/api/http.html) available in Node.js or another HTTP client to your liking.

**Use the `s` parameter of the OMDb API to search for movie titles.**

The `GET /search` endpoint finally returns an **array** with the results obtained from `omdbapi.com`, but the results sent back to the client only include the properties `Title`, `imdbID`, and `Year`. Ensure the Year property is converted to a number before passing it on. If the `Year` property is not numerical, e.g. when converting a series that spans multiple years (`2010-2016`), then this property will be `null`.

**1.2. In `search.js`.** In this subtask, you make sure that endpoint you added in 1.1. is used by the search form. Almost all the functionality is already there. But you need to correctly initialize the `searchForm` variable with the `form` HTML element that contains the search input element. Then, complete the configuration of the XMLHttpRequest `xhr` to target the `GET /search` endpoint passing the **query** entered by the user to the endpoint using a *query parameter* named *query* (that's a lot of queries 😄).

**1.3. In `search.js`.** Again, in `search.js`, once the results are returned from the server (see 1.1), we add them to the DOM.

You will find a `sectionElement` already initialized in `search.js`. Your task is to dynamically add content to this element.

Two cases need to be considered:

1. No movies for the user query are found. In this case add a `p` paragraph element with a corresponding message. E.g. for the query **'asdf'**:
    ```html
    <p>No results for your query 'asdf' found.</p>
    ```
2. Results were returned. In this case, build and add a `form` element that includes the following structure for every movie found (using *The Lord of the Rings: The Two Towers* as example movie):

    ```html
    <article>
        <input type="checkbox" value="tt0167261" id="tt0167261">
        <label for="tt0167261">The Lord of the Rings: The Two Towers (2002)</label>
    </article>
    ```

    In addition to these result `article`s, add a button with the text `Add selected to collection` to the bottom of the form. We are going to configure its click event listener in 2.1.

### Task 2: Send the selected movies to the server and add them to the movie collection permanently.

**2.1. In `search.js`**. To finish our search feature, add a click event handler to our `Add selected to collection` button. On button click, collect all selected checkboxes of the form and add their `imdbID`s in an array. Then POST this array to the `POST /movies` endpoint.

**2.2. In `server.js`.** On the server-side, add the `POST /movies` endpoint and query `omdbapi.com` again to obtain the data for the selected movies. 

In a next step, convert the data that the API returns to the format that we use in our movie collection. This automates what you did manually in the first task of exercise 1. You will have to throw away some of the properties and also convert some of them, namely:
* the `Released` to an ISO date string,
* the `Runtime` to either `null` if not available or to a number representing the runtime of the movie in minutes,
* the `Genre`, `Director`, and `Writer` properties to arrays of strings. In addition to that, their names change to the pluralized form, e.g., `Genre` becomes `Genres`,
* the `Actors` property to an array of strings,
* the `MetaScore` to either `null` if not available or to a number representing the Metascore, and finally,
* the `imdbRating` to a number.

As a bare minimum, send back a status code of 200 to inform the client that the operation was successful. You can also include the movies added as payload to inform the client.

### Task 3: Add a DELETE endpoint on the server-side and send the corresponding request from the client when the *Delete*-button of a movie is clicked

**3.1. In index.js.** When the user clicks the *Delete*-button, the `deleteMovie(imdbID)` function in `index.js` is called. Add an `XMLHttpRequest` to it, configure it to target the `DELETE /movies/:imdbID` endpoint and send it.

**3.2. In server.js.** On the server-side, add the `DELETE /movies/:imdbID` endpoint and remove the movie with the `imdbID` given as a path parameter from the movie collection. Confirm the successful deletion by sending back a status code of **200**.

**3.3. In index.js.** When the server response arrives and carries a **200** status code, remove the `article` element corresponding to the deleted movie (you can find it easily, it has an `id` that is equal to the `imdbID`) from the DOM.

**Well done, good job!** Don't forget to push and check on GitHub!
