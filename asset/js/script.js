var citySearch = document.querySelector("h3");
var cityInput = document.querySelector("#city-input");
var searchButton = $("#search")
// document.querySelector("#btn");
var cardEl = $("card");
var cardContainer = $("#boxes");
// var todaysWeather = $("#todays-weather");
var weatherDetail = $("#weather-detail");
var forecastEl = $("#forecast");
var cityList = $(".city-list");
var defaultCity = "Minneapolis";
var cities = JSON.parse(localStorage.getItem("city")) || [];

$("#searchbtn").click(function() {
    console.log(cityInput.value);
    var city = cityInput.value;
    var cityNameList = $("li").text(city);
    cityNameList.addClass("list-group-item");
    $("#list-group").prepend(cityNameList);
    getApi(city);
    //   localStorage.setItem(city, city);
    // localStrData(city);
    displayStoredCities(city);
});

// console.log($("#search"));
// console.log(document.querySelector("#city-input").value);

function getApi(city) {
    var requestUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city ? city: defaultCity}&limit=5&appid=f34dabc58db5ff52b58f3ded309b23a6`
    
    fetch(requestUrl)
    .then(async function(response) {
        // console.log(response);
        var data = await response.json();
        // console.log(data);
        const lat = data[0].lat;
        const lot = data[0].lon;
        console.log(data[0].name);
        await getWeatherDetail(lat, lot, data)
    })
    console.log(requestUrl);
}

// getApi();

var weatherArray = [];
async function getWeatherDetail(lat, lon, data) {
    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&temperature=unit&appid=f34dabc58db5ff52b58f3ded309b23a6`;
    // const response = await fetch(url);
    fetch(requestUrl)
    .then(async function(response) {
        var tempArray = await response.json();
        console.log(response);
        // weatherArray = [];
        // weatherArray.push(await response.json())
        // console.log(weatherArray);
        // console.log(data[0].name);
        displayTodaysWeather(tempArray, data);
        displayForcast(tempArray);
    });    
}

// console.log(weatherArray.length);
// console.log((weatherArray[0].current.temp));
// console.log((weatherArray[0].current.wind_speed));
// console.log((weatherArray[0].current.humidity));
// console.log((weatherArray[0].current.uvi));

var displayTodaysWeather = function(weatherData, data) {
    // get todays data from weatherarray and display 
    // var cityLi = city;
    // console.log(city);
    var icon = weatherData.current.weather[0].icon;
    // console.log(icon);
    var imageEl = document.createElement('img');
    imageEl.src =  `http://openweathermap.org/img/wn/${icon}@2x.png`
    cityList.append(imageEl);
    var createDiv = document.createElement('div');
    // for (var i = 0; i < weatherArray.length; i++) {
    //     var tempLi = document.createElement('p');
    //     tempLi.textContent = "Temparature: " + (weatherArray[0].current.temp);
    //     var windLi = document.createElement('p')
    //     windLi.textContent = "Wind: " + (weatherArray[0].current.wind_speed);
    //     var humidityLi = document.createElement('p');
    //     humidityLi.textContent = "Humidity: " + (weatherArray[0].current.humidity);
    //     var uviLi = document.createElement('p');
    //     uviLi.textContent =  "UV Index: " + (weatherArray[0].current.uvi);
    // }
    var city = data[0].name;
    var temp = weatherData.current.temp;
    var humidity = weatherData.current.humidity;
    var wind = weatherData.current.wind_speed;
    var uvi = weatherData.current.uvi;
    console.log(city, temp, humidity, wind, uvi);
    
    var cityLi = document.createElement('h2');
    cityLi.textContent = "City: " + city;
    var tempLi = document.createElement('p');
    tempLi.textContent = "Temparature: " + temp;
    var windLi = document.createElement('p')
    windLi.textContent = "Wind: " + wind;
    var humidityLi = document.createElement('p');
    humidityLi.textContent = "Humidity: " + humidity;
    var uviLi = document.createElement('p');
    uviLi.textContent =  "UV Index: " + uvi;

    // createDiv.append(city, tempLi, windLi, humidityLi, uviLi);
    createDiv.append(cityLi.textContent = "City: " + city);
    // $("#todays-weather").html(createLi);
    // $(".city-list").replaceWith(createDiv);
    // $("#city-list").html(createLi);
    // $("#city-list").html(createLi);

}

// var localStrData = function(city) {
//     localStorage.setItem("city", JSON.stringify(city));
// }

var displayStoredCities = function(city) {
    // for everything city in localsotrage append to DOM
    var title = document.createElement('h1');
    title.setAttribute("class", "title");
    weatherDetail.append(title);
    title.textContent = (city);
    console.log(title);
}

// displayStoredCities();

var displayForcast = function(forecastData) {
    // get data from weatherarray and display weather for each forcast date
    // var fivecard = $(".fivecard");
    var fivecard = $("#forecast");
    var fiveCityName = document.createElement("h4");
    var fiveIcon = document.createElement("img");
    var fiveTemp = document.createElement('p');
    icon = forecastData.daily[0].weather[0].icon;
    console.log(icon);
    var fiveIcon = document.createElement('img');
    fiveIcon.src =  `http://openweathermap.org/img/wn/${icon}@2x.png`
    // $('.fivecard').append(fiveIcon);
    // // check the path of name
    // fiveCityName.textContent = weatherArray[0].current.name;
    // fivecard.append(fiveCityName);
    console.log(forecastData);
    for ( i = 0; i <= 5; i++ ) {
        var foreCastCard = document.createElement("div");
        foreCastCard.setAttribute("class", "days");
        var foreCastTitle = document.createElement("h3");
        foreCastCard.append(foreCastTitle);
        foreCastTitle.textContent = forecastData.city;
        $("#day-"+i).append(foreCastCard);
        // var todaysDate = moment.unix(forecastData.daily[i].dt);
        // console.log(todaysDate.format('MMMM Do YYYY'));
        // var fiveDayTemp = forecastData.daily[i].temp.day;
        // var fiveDayHumidity = forecastData.daily[i].humidity;
        // var fiveDayWind = forecastData.daily[i].wind_speed;
        // var fiveDayUvi = forecastData.daily[i].uvi;
        // console.log(fiveDayTemp, fiveDayHumidity, fiveDayWind, fiveDayUvi);
        // $("#day-"+i).append(fiveDayTemp, fiveDayHumidity, fiveDayWind, fiveDayUvi, fiveIcon);
        // $("#day-"+i).append(fiveDayHumidity);
        // $("#day-"+i).append(fiveDayWind);
        // $("#day-"+i).append(fiveDayUvi);
    }
}

var saveSearchCity = function() {
    localStorage.setItem("city", JSON.stringify(city));
}

var showCity = function() {
    // JSON.parse(localStorage.getItem("city"));
    // for (i = 0; i < 5; i++) {
    //     createElement.
    // }
}