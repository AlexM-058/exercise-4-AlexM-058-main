const DATE_REGEX = new RegExp("^\\d{4}-\\d{2}-\\d{2}$");
const ID_REGEX = new RegExp("^tt\\d{7}$")

function checkArray(array, name, type) {
  expect(array, `Movie property "${name}" expected to be an Array`).to.be.an(
    "array"
  );
  array.forEach((item) =>
    expect(
      item,
      `Each item contained in Movie property "${name}" is expected to be of type "${type}"`
    ).to.be.a(type)
  );
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

export function toChildTagNames(element, sort=true) {
  let tagNames = Array.from(element.children).map(e => e.tagName)
  if (sort === true) {
    tagNames.sort()
  }
  return tagNames
}

export function checkMovie(movie) {
  expect(movie, "Movie expected to have 12 pre-defined keys").to.have.keys(
    "imdbID",
    "Title",
    "Released",
    "Runtime",
    "Genres",
    "Directors",
    "Writers",
    "Actors",
    "Plot",
    "Poster",
    "Metascore",
    "imdbRating"
  );
  expect(movie.imdbID).to.be.a("string");
  expect(movie.imdbID, 'Movie property "imdbID" is expected to match the IMDB id format').to.match(ID_REGEX)

  expect(movie.Title).to.be.a("string");
  expect(movie.Released, 'Movie property "Released" is expected to be a ISO 8601 formatted date string').to.match(DATE_REGEX);

  if (movie.Runtime) {
    expect(movie.Runtime, 'Movie property "Runtime" is expected to be a number greater or equal to 0')
    .to.be.a("number")
    .and.to.be.at.least(0);
  }

  const stringArrayNames = ["Genres", "Directors", "Writers", "Actors"];
  stringArrayNames.forEach((name) => checkArray(movie[name], name, "string"));

  expect(movie.Plot).to.be.a("string");
  expect(movie.Poster).to.be.a("string");
  expect(
    isValidURL(movie.Poster),
    'Movie property "Poster" is expected to be a URL'
  ).to.be.eq(true);

  expect(
    movie.Metascore,
    'Movie property "Metascore" is expected to be a number greater than 0 and less or equal to 100'
  )
    .to.be.a("number")
    .and.to.be.at.least(0)
    .and.to.be.at.most(100);
  expect(
    movie.imdbRating,
    'Movie property "imdbRating" is expected to be a number greater than 0 and less or equal to 10'
  )
    .to.be.a("number")
    .and.to.be.greaterThan(0)
    .and.to.be.at.most(10);
}

function checkList(element, index, elements, parentTag = "P", childTag = "SPAN") {
  const child = element.children[index];
  expect(child.tagName).to.be.eq(parentTag);
  elements.forEach((e) => expect(child.textContent).to.contain(e));
  expect(toChildTagNames(child)).to.deep.eq(Array(elements.length).fill(childTag));
}

function checkLabeledList(label, element, index, elements) {
  expect(element.children[index - 1]).to.contain(label);
  checkList(element, index, elements, "UL", "LI");
}

const EXPECTED_MOVIE_TAG_NAMES = ["IMG", "H1", "P", "P", "P", "P", "H2", "UL", "H2", "UL", "H2", "UL",]

export function checkMovieArticle(movieElement, movie) {
  expect(
    movieElement.children.length,
    `Movie article must have exacly 12 child elements, but has ${movieElement.children.length}`
  ).to.eq(12);
  expect(
    movieElement.id,
    `Movie id '${movieElement.id}' must match the IMDb id'${movie.imdbID}'`
  ).to.eq(movie.imdbID);
  expect(
    toChildTagNames(movieElement, false),
    `Expected article childs to be ${EXPECTED_MOVIE_TAG_NAMES}, but they were ${toChildTagNames(movieElement)}`
  ).to.deep.eq(EXPECTED_MOVIE_TAG_NAMES);

  expect(movieElement.children[0].src).contains(movie.Poster, {matchCase: false,});
  expect(movieElement.children[1]).to.contain(movie.Title);

  const buttonElement = movieElement.children[2].children;
  expect(
    buttonElement.length,
    "Edit button paragraph must have one children, but has " +
      buttonElement.length
  ).to.eq(1);
  expect(buttonElement[0].tagName).to.be.eq("BUTTON");

  const infoElements = movieElement.children[3].children;

  expect(
    infoElements.length,
    "Movie information paragraph must have three children, but has " +
      infoElements.length
  ).to.eq(3);
  expect(infoElements[0]).to.contain("Runtime");
  const r = infoElements[0].innerText.match(/(\d+)h (\d+)m/);
  expect(parseInt(r[1]) * 60 + parseInt(r[2])).to.be.eq(
    parseInt(movie.Runtime)
  );
  expect(infoElements[1]).to.contain("\u2022");
  expect(infoElements[2])
    .to.contain("Released on")
    .and.to.contain(new Date(movie.Released).toLocaleDateString());

  checkList(movieElement, 4, movie.Genres);
  const genreElements = movieElement.children[4].children;
  for (let j = 0; j < genreElements.length; j++) {
    expect(genreElements[j]).to.have.class("genre");
  }

  expect(movieElement.children[5]).to.contain(movie.Plot);
  checkLabeledList("Director", movieElement, 7, movie.Directors);
  checkLabeledList("Writer", movieElement, 9, movie.Writers);
  checkLabeledList("Actor", movieElement, 11, movie.Actors);
}

