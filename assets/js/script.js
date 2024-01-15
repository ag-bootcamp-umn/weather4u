// Important DOM elements
const searchForm = $('.search-form');
const searchInput = $('.search-input');
const searchHistory = $('.search-history');
const cityCard = $('.city');
const cityHeader = $('.city__header');
const cityTitle = $('.city__title');
const cityText = $('.city__text');
const forecastCard = $('.forecast');

// Data for functionality
const key = 'efd21b7255a6d48a2dbeae2fad22deb3';


// Start by pulling in any stored data (if applicable) and setting up an object to keep track of data in the app
const weather4UData = JSON.parse(localStorage.getItem('weather4UData')) || {};
const weather4U = {
    searchHistory: weather4UData.favorites || [],
}

// Setting an event listener on the search form
$(document).ready( function() {
    $('.search-form').on('submit', getCityOptions);
    $('.city-options').on('click', '.option-btn', getCity);
});

function getCityOptions(e) {
    e.preventDefault();

    const searchName = $('.search-input').val();

    $.ajax({
        url:`https://api.openweathermap.org/geo/1.0/direct?q=${searchName}&limit=5&appid=${key}`,
        type: 'GET',
        dataType: 'json',
        success: function(res) {
            weather4U.searchResults = res;
            $.each(weather4U.searchResults, function(i, option) {
                $('.city-options').append(`
                <button type="button" data-index="${i}" class="option-btn btn link-opacity-50-hover mb-2">${option.name}, ${option.state}</button>
                `);
            });
        },
        error: function() {
            console.log("Can't get nuthin!")
        }
    });
}

function getCity(e) {
    let optionIndex = $(this).attr('data-index');
    let city = weather4U.searchResults[optionIndex];
    console.log(`api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${key}`);

    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${key}`,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            $('.city-options').html('');
            saveSearch(city);
            showWeather(city)
            console.log(data);
        },
        error: function() {
            console.log("Couldn't locate it, Jack!");
            console.log(url);
        }
    })
}

function saveSearch(save) {
    weather4U.searchHistory.push(save);
    // append button to search history

}

function showWeather(city) {
    // Get the data about the city
    // Extract relevant data, etc.
    // Whack it up there!
}

function showForecast(city) {
    // Get the data from the city variable
    // look at the data for list[0]
    // today = new Date(most recent date).getDay();
    // Look at future dates -> filter them out to be different days, and at the same hour
}