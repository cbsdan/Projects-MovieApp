const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";

const main = document.querySelector('main');
const movieApp = document.getElementById('movies'); //div - the container for movies
const movies = document.querySelectorAll('.movie'); //div - the container for each movie
const searchBar = document.getElementById('search-bar'); //input type text for search
const titleLabel = document.querySelector('.content-label'); // h2 - label for app content

let page = 1; //intiialize page to 1 to be use in changing to later
loadMovies(); //load some random movies at first load

titleLabel.addEventListener('click', ()=>{
  location.reload();
  reloadWeb();
});

const debounceSearch = debounce(searchMovies, 1200);

searchBar.addEventListener('input', async ()=> {
  searchResults = await debounceSearch(searchBar.value);
  scrollToTop();
  if (searchResults !== undefined) {
    displaySearchMovies(await searchResults);
    searchPage++;
  } else {
    console.log(`undefine: ${searchResults}`);
  }
})

//Request random movie from API and return object.
async function randomMovies(page) {
  const resp = await fetch(APIURL + page);
  const respData = await resp.json();
  return respData;
}

//Return an object
async function searchMovies(title) {
  const resp = await fetch(SEARCHAPI + title);
  const respData = await resp.json();
  return respData; 
}

async function displaySearchMovies(results) {
  if (results === undefined) {
    console.log("undefined");
    return;
  }
 
  const totalPage = await results.total_pages;
  const totalResults = await results.total_results;
  let moviesFound = await results.results; //Array

  //if the search do not found a movie
  if (totalResults === 0) {
    movieApp.innerHTML = ''; //remove previous content
    movieApp.innerHTML = `
      <div class="found-label">Movie Found: ${totalResults}</div>
    `;
    loadMovies(); // since there is no found movie, it will just display random
    return;
  }

  //if the search found movie/s
  if (moviesFound !== undefined) {
    movieApp.innerHTML = `
      <div class="found-label">Movie Found: ${totalResults}</div>
    `;
    moviesFound.forEach((movie)=> {
      addMovieHTML(movie);
    })

    if (totalPage === results.page) {
      return;
    }

    moviesFound = results.results; 
  }
}

function debounce(func, delay) {
  let timerId;

  return function(...args) {
    clearTimeout(timerId);

    return new Promise((resolve) => {
      timerId = setTimeout(() => {
        const result = func.apply(this, args);
        resolve(result);
      }, delay);
    });
  };
}
function addMovieHTML(movie) {
  const movieEl = document.createElement('div');
  movieEl.classList.add('movie');

  movieEl.innerHTML = `
    <img class="movie-img" src="${IMGPATH + movie.poster_path}">
    <div class="movie-info">
      <p class="movie-title">
        <span>${movie.title}</span> <span class="movie-year"> (${movie.release_date!== undefined ? (movie.release_date).substring(0, 4) : "Unkown"})</span>
      </p>
      <p class="movie-rating">${movie.vote_average.toFixed(1)}</p>
    </div>
    <div class="movie-overview">
      <h3 class="label title">Title:</h3>
      ${movie.title} (${movie.release_date!== undefined ? (movie.release_date).substring(0, 4) : "Unkown"})

      <h3 class="label overv">Overview:</h3>
      ${movie.overview}
    </div>
  `;
  const movieRating = movieEl.querySelector('.movie-rating');
  if (!(movieRating.classList.contains("green" || "orange" || "red"))) {
    if (movie.vote_average > 7){
      movieRating.classList.add("green");
    } else if (movie.vote_average > 4) {
      movieRating.classList.add("orange");
    } else {
      movieRating.classList.add("red");
    }
    movieApp.appendChild(movieEl);
    startAnimation(movieEl);
    };
  }

// Request random movies from API
async function loadMovies() {
  const requestData = await randomMovies(page);
  const results = await requestData.results; //get the movie results. return array(20) size
  
  if (requestData !== undefined && results !== undefined) {
    results.forEach((result)=>{
     addMovieHTML(result);
    });
    page++;
    const totalPage = requestData.total_pages;
  } else {
    console.log("Fetching Data from API")
  }

}


// Detect if user has reached the bottom of the page
function checkIfReachedBottom(func) {
  // Get the height of the document
  const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight);

  // Get the current scroll position of the window
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Get the height of the window
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  // Check if user has reached the bottom of the page
  if (scrollTop + windowHeight >= docHeight) {
    func();
    // Your code here for when the user reaches the bottom of the page
  }
}

document.addEventListener("scroll", ()=>{
  if (!(searchBar.value)) {
    checkIfReachedBottom(loadMovies);
  }
});


function reloadWeb() {
  page = 1;
  movieApp.innerHTML = '';
  loadMovies();
}

function startAnimation(movies) {
  // Set the opacity of the animation container to 1 to make it visible
  movieApp.style.opacity = 1;
    setTimeout(() => {
      movies.style.opacity = 1; /* Set opacity to 1 for fade-in effect */
      movies.style.transform = 'translateY(0)'; /* Set transform to 0 for upward movement effect */
    }, 200); /* 0.2 seconds delay for each item */;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Optional: Use 'smooth' for smooth scrolling, 'auto' for instant scrolling
  });
}