var citySearch = document.querySelector("h3");
var cityInput = document.querySelector("#city-input");
var searchButton = $("#search")
// document.querySelector("#btn");

var defaultCity = "Minneapolis";

$("#search").click(function() {
    console.log(cityInput.value);
    var city = cityInput.value;
    getApi(city);
    //   localStorage.setItem(city, city);
    // localStrData(city);
});

console.log(document.querySelector("#city-input").value);

function getApi(city) {
    var requestUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city ? city: defaultCity}&limit=5&appid=f34dabc58db5ff52b58f3ded309b23a6`
    
    fetch(requestUrl)
    .then(async function(response) {
        console.log(response);
        var data = await response.json();
        console.log(data);
        const lat = data[0].lat;
        const lot = data[0].lon;
        await getWeatherDetail(lat, lot)
    })
    console.log(requestUrl);
}

getApi();

var weatherArray = [];
async function getWeatherDetail(lat, lon) {
    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&temperature=unit&appid=f34dabc58db5ff52b58f3ded309b23a6`;
    // const response = await fetch(url);
    fetch(requestUrl)
    .then(async function(response) {
        console.log(response);
        weatherArray.push(await response.json())
        console.log(weatherArray);
    });    
}

console.log(weatherArray.length);
console.log((weatherArray[0].current.temp));
console.log((weatherArray[0].current.wind_speed));
console.log((weatherArray[0].current.humidity));
console.log((weatherArray[0].current.uvi));

var displayTodaysWeather = function() {
    // get todays data from weatherarray and display 
    var createLi = document.createElement('li');
    for (var i = 0; i < weatherArray.length; i++) {
        createLi.append((weatherArray[0].current.temp));
    }
}


var localStrData = function(city) {
    // localStorage.setItem(JSON.stringify(city, weatherArray[0]));
}

var displayStoredCities = function() {
    // for everything city in localsotrage append to DOM
}

displayStoredCities();

var displayForcast = function() {
    // get data from weatherarray and display weather for each forcast date
}

