// Important DOM elements
const searchForm = $(".search-form");
const searchInput = $(".search-input");
const searchHistoryCard = $(".search-history");
const cityOptions = $(".city-options");
const cityDisplay = $(".city__display");
const forecast = $(".forecast");

// Data for functionality
const key = "efd21b7255a6d48a2dbeae2fad22deb3";

// Start by pulling in any stored data (if applicable) and setting up an object to keep track of data in the app
const weather4UData = JSON.parse(localStorage.getItem("weather4UData")) || {};

const weather4U = {
  searchHistory: weather4UData.favorites || [],
  searchResults: [],
  selection: {}
};

// Setting an event listener on the search form
$(document).ready(function () {
  $(searchForm).on("submit", getCityOptions);
  $(cityOptions).on("click", ".option-btn", function() {
    let optionIndex = $(this).attr("data-index");
    let city = weather4U.searchResults[optionIndex];
    weather4U.searchResults = [];
    getCity(city, true);
  });
  $(searchHistoryCard).on("click", ".saved-search", function() {
    let optionIndex = $(this).attr("data-index");
    let city = weather4U.searchHistory[optionIndex];
    weather4U.searchResults = [];
    getCity(city, false);
  });
  $(cityDisplay).on('click', '.forecast-btn', showForecast);
});


// GET BASIC DATA FOR CITIES MATCHING THE INPUT; THROW THEM UP AS BUTTONS
function getCityOptions(e) {
  $(cityDisplay).html('');   
  $(forecast).html('');         // This line and above: clear out results sections
  e.preventDefault();
  $(cityOptions).html(""); // clears out the area where the search results will be displayed
  const searchName = $(searchInput).val(); // grabs the user input

  // API call to search for city/cities with this name
  // The first 5 results are displayed as clickable buttons
  $.ajax({
    url: `https://api.openweathermap.org/geo/1.0/direct?q=${searchName}&limit=5&appid=${key}`,
    type: "GET",
    dataType: "json",
    success: function (res) {
      weather4U.searchResults = res;
      console.log(res);
      if (res.length === 0) $(cityOptions).html('<h5>No Matches</h5>')
      $.each(weather4U.searchResults, function (i, option) {
        showButton(i, option, '.city-options', 'option-btn');
      });
      $(searchInput).val(""); // Clears the search form input
    },
    error: function () {
      console.log("Can't get nuthin!");
    },
  });
}

// MAKE API CALL FOR A FORECAST BASED ON THE CITY THE USER SELECTED
function getCity(city, save = false) {
  
  weather4U.selection.city = {};
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${key}&units=imperial`,
    method: "GET",
    dataType: "json",
    success: function (data) {
      $(cityOptions).html("");  // clears out the search result options
      weather4U.selection.city = city;
      const {list} = data;

      // add 5-day 4cast to the weather4U obj (our SSOT)
      weather4U.selection.cityWeather = list;

      // save the data to our search history
      if (save === true) {saveSearch(city);}

      // let's have a look at what's going on in the city we selected...
      showWeather(city, weather4U.selection.cityWeather);
    },
    error: function () {
      console.log("Couldn't locate it, Jack!");
      console.log(url);
    },
  });
}


// SAVING THE CURRENT CITY TO THE SEARCH HISTORY
function saveSearch(search) {
  $(searchHistoryCard).html('');
  weather4U.searchHistory.push(search);
  if (weather4U.searchHistory.length > 0) {
    $.each(weather4U.searchHistory, function(i, option) {
      showButton(i, option, '.search-history', 'saved-search')
    });
  }
}


// DISPLAYS TODAY'S WEATHER 
function showWeather() {
    // Get all the data we need:
    const citySrc = weather4U.selection.cityWeather[0];
    let {name} = weather4U.selection.city;
    let {dt_txt: date} = citySrc;
    let {temp, humidity} = citySrc.main;
    let {icon} = citySrc.weather[0];
    let {speed: windSpeed} = citySrc.wind;

    // Manipulate some of this data for public consumption
    date = new Date(date).toLocaleDateString('en-US');
    // Display it all in the UI
    $(cityDisplay).html(`
        <div class="city__top"><div class="city__title"><h2>${name}</h2> <h3>${date}</h3></div> <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png"></div>
        <p>Temp: ${Math.round(temp)} &deg;F</p>
        <p>Humidity: ${humidity} %</p>
        <p>Wind Speed: ${windSpeed} mph</p>
        <button type="button" class="forecast-btn btn btn-outline-light link-opacity-50-hover mb-2">5-Day Forecast</button>
    `);

    // showForecast();
}

//  GET THE FORECAST AND DISPLAY IT
function showForecast() {
  // CLear out the html, justi n case...
  $(forecast).html('');
  // Filter forecast so it's only data for midday. This ensures it's from 5 separate days, and from the same time each day. 
  let weatherList = weather4U.selection.cityWeather;
  weatherList = weatherList.filter( function(fc) {
    return new Date(fc.dt_txt).getHours() === 12;
  }) ;

  $.each(weatherList, function() {
    $(forecast).append(`
    <div class="col-12 col-md-auto">
      <h5>${new Date($(this)[0].dt_txt).toLocaleDateString('en-US')}</h5>
      <img class="weather-icon" src="https://openweathermap.org/img/wn/${$(this)[0].weather[0].icon}@2x.png">
      <p>Temp: ${Math.round($(this)[0].main.temp)} &deg;F</p>
      <p>Wind: ${$(this)[0].wind.speed} mph</p>
      <p>Humidity: ${$(this)[0].main.humidity} %</p>
    </div>
    `);
  });
}


// HELPER FUNCTIONS

// Displays buttons
function showButton(i, option, location, className) {
  console.log(i, option, location, className)
  console.log('showing')
  const state = option.state? option.state : option.country;
  const light = className === 'saved-search' ? ' btn-light' : '';
  $(location).append(`
  <button type="button" data-index="${i}" class="${className} btn${light} link-opacity-50-hover mb-2">${option.name}, ${state}</button>
  `);
}