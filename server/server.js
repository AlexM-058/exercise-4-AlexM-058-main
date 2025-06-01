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
app.post("/movies", async function (req, res) {
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
        // Convert OMDB data to the required format with 12 keys
        // Convert Released to ISO 8601 format (yyyy-mm-dd) if possible
        let releasedIso = null;
        if (data.Released && /^\d{2} \w{3} \d{4}$/.test(data.Released)) {
          // Example: "25 Jan 2008"
          const [day, mon, year] = data.Released.split(" ");
          const months = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
          };
          releasedIso = `${year}-${months[mon]}-${day.padStart(2, "0")}`;
        } else {
          releasedIso = null;
        }
        // Convert Runtime to a number (minutes)
        let runtimeNum = null;
        if (data.Runtime && /^\d+ min$/.test(data.Runtime)) {
          runtimeNum = Number(data.Runtime.split(" ")[0]);
        } else {
          runtimeNum = null;
        }
        // Convert Metascore to a number if possible and clamp between 0 and 100
        let metascoreNum = null;
        if (data.Metascore && /^\d+$/.test(data.Metascore)) {
          metascoreNum = Number(data.Metascore);
          if (metascoreNum < 0) metascoreNum = 0;
          if (metascoreNum > 100) metascoreNum = 100;
        } else {
          metascoreNum = null;
        }
        // Convert imdbRating to a number if possible and clamp between 0 and 10
        let imdbRatingNum = null;
        if (data.imdbRating && !isNaN(data.imdbRating)) {
          imdbRatingNum = Number(data.imdbRating);
          if (imdbRatingNum < 0) imdbRatingNum = 0;
          if (imdbRatingNum > 10) imdbRatingNum = 10;
        } else {
          imdbRatingNum = null;
        }
        const movie = {
          imdbID: data.imdbID,
          Title: data.Title,
          Released: releasedIso,
          Runtime: runtimeNum,
          Genres: data.Genre ? data.Genre.split(",").map(g => g.trim()) : [],
          Directors: data.Director ? data.Director.split(",").map(d => d.trim()) : [],
          Writers: data.Writer ? data.Writer.split(",").map(w => w.trim()) : [],
          Actors: data.Actors ? data.Actors.split(",").map(a => a.trim()) : [],
          Plot: data.Plot,
          Poster: data.Poster,
          Metascore: metascoreNum,
          imdbRating: imdbRatingNum
        };
        movieModel[movie.imdbID] = movie;
        addedMovies.push(movie);
      }
    } catch (err) {
      // Ignore errors for individual movies
    }
  }
  res.status(200).send(addedMovies);
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

// Nu, nu trebuie importată funcția search din search.js în server.js.
// search.js rulează în browser (client-side), iar server.js rulează pe server (server-side).
// Ele comunică prin HTTP requests (ex: GET /search), nu prin import direct de funcții.