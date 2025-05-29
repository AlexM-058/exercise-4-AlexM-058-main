const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const movieModel = require("./movie-model.js");
const axios = require("axios");

const app = express();

// Parse urlencoded bodies
app.use(bodyParser.json());

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "files")));

app.get("/movies", function (req, res) {
  let movies = Object.values(movieModel);
  const queriedGenre = req.query.genre;
  if (queriedGenre) {
    movies = movies.filter((movie) => movie.Genres.indexOf(queriedGenre) >= 0);
  }
  res.send(movies);
});

// Configure a 'get' endpoint for a specific movie
app.get("/movies/:imdbID", function (req, res) {
  const id = req.params.imdbID;
  const exists = id in movieModel;

  if (exists) {
    res.send(movieModel[id]);
  } else {
    res.sendStatus(404);
  }
});

app.put("/movies/:imdbID", function (req, res) {
  const id = req.params.imdbID;
  const exists = id in movieModel;

  movieModel[req.params.imdbID] = req.body;

  if (!exists) {
    res.status(201);
    res.send(req.body);
  } else {
    res.sendStatus(200);
  }
});

app.get("/genres", function (req, res) {
  const genres = [
    ...new Set(Object.values(movieModel).flatMap((movie) => movie.Genres)),
  ];
  genres.sort();
  res.send(genres);
});

/* Task 1.1. Add the GET /search endpoint: Query omdbapi.com and return
   a list of the results you obtain. Only include the properties 
   mentioned in the README when sending back the results to the client */
app.get("/search", async function (req, res) {
  const searchTerm = req.query.q || req.query.query;
  if (!searchTerm) {
    res.status(400).send({ error: "Missing search query parameter" });
    return;
  }
  try {
    const apiKey = "7939c55f"; // Use your OMDB API key
    const omdbUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(searchTerm)}`;
    const response = await axios.get(omdbUrl);
    if (
      response.data &&
      response.data.Response === "True" &&
      response.data.Search
    ) {
      const arr = response.data.Search;
      const results = [];
      for (let i = 0; i < arr.length; i++) {
        const movie = arr[i];
        let yearNum = null;
        if (/^\d{4}$/.test(movie.Year)) {
          yearNum = Number(movie.Year);
        }
        results.push({
          imdbID: movie.imdbID,
          Title: movie.Title,
          Year: yearNum,
        });
      }
      res.send(results);
    } else {
      res.send([]);
    }
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch from OMDB API" });
  }
});
/* Task 2.2 Add a POST /movies endpoint that receives an array of imdbIDs that the
   user selected to be added to the movie collection. Search them on omdbapi.com,
   convert the data to the format we use since exercise 1 and add the data to the
   movie collection. */
app.post("/addMovies", async function (req, res) {
  const imdbIDs = req.body;
  if (!Array.isArray(imdbIDs) || imdbIDs.length === 0) {
    res.status(400).send({ error: "Request body must be a non-empty array of imdbIDs" });
    return;
  }
  const apiKey = "7939c55f"; // Use your actual OMDB API key
  const addedMovies = [];
  for (const imdbID of imdbIDs) {
    try {
      const omdbUrl = `http://www.omdbapi.com/?apikey=${apiKey}&i=${encodeURIComponent(imdbID)}`;
      const response = await axios.get(omdbUrl);
      const data = response.data;
      if (data && data.Response === "True") {
        // Convert OMDB data to our format
        const movie = {
          imdbID: data.imdbID,
          Title: data.Title,
          Year: data.Year,
          Poster: data.Poster,
          Genres: data.Genre ? data.Genre.split(",").map(g => g.trim()) : [],
        };
        movieModel[movie.imdbID] = movie;
        addedMovies.push(movie);
      }
    } catch (err) {
      // Ignore errors for individual movies
    }
  }
  res.status(201).send(addedMovies);
});

/* Task 3.2. Add the DELETE /movies/:imdbID endpoint which removes the movie
   with the given imdbID from the collection. */
app.delete("/movies/:imdbID", function (req, res) {
  const id = req.params.imdbID;
  if (id in movieModel) {
    delete movieModel[id];
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(3000);

console.log("Server now listening on http://localhost:3000/");