// var citySearch = document.querySelector("h3");
// var searchButton = $("#search")
// document.querySelector("#btn");
var cardEl = $("card");
var cardContainer = $("#boxes");
// var todaysWeather = $("#todays-weather");
var weatherDetail = $("#weather-detail");
var forecastEl = $("#forecast");
var cityList = $(".city-list");
var defaultCity = "Minneapolis";
var cities = JSON.parse(localStorage.getItem("city")) ? JSON.parse(localStorage.getItem("city")): [];

var cityInput = document.querySelector("#city-input");

var searchCity = function() {
    console.log(cityInput.value);
    var city = cityInput.value;
    cities.push(cityInput.value);
    event.preventDefault();
    getApi(city);
    displayStoredCities(city);
    saveSearchCity(city);
    showCity(cities);
}

$("#searchbtn").click(function() {
    searchCity();
});


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
    var requestUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&temperature=unit&appid=f34dabc58db5ff52b58f3ded309b23a6`;
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
        displayForcast(tempArray, data);
    });    
}

var displayTodaysWeather = function(weatherData, data) {
    
    var icon = weatherData.current.weather[0].icon;
    // console.log(icon);
    // var imageEl = document.createElement('img');
    // imageEl.src =  `http://openweathermap.org/img/wn/${icon}@2x.png`
    // cityList.append(imageEl);
    // var createDiv = document.createElement('div');
    var city = data[0].name;
    var temp = weatherData.current.temp;
    var humidity = weatherData.current.humidity;
    var wind = weatherData.current.wind_speed;
    var uvi = weatherData.current.uvi;
    console.log(city, temp, humidity, wind, uvi);
    var fiveIcon = document.createElement('img');
    fiveIcon.src =  `http://openweathermap.org/img/wn/${icon}@2x.png`
    
    // var cityLi = document.createElement('h2');
    // var tempLi = document.createElement('p');
    var windLi = document.createElement('p').style.fontWeight = "500";
    var humidityLi = document.createElement('p');
    var uviLi = document.createElement('p');
    var todaysDate = moment.unix(weatherData.daily[0].dt);
    var dates = (todaysDate.format('MM/DD/YYYY'));
    
    console.log(weatherData.daily[0].dt);
    // createDiv.append(city, tempLi, windLi, humidityLi, uviLi);
    $("#city-box").append(todaysDate.textContent = "(" +dates+ ")");
    $("#city-box").append(fiveIcon);
    $("#city-box").append(windLi.textContent = " Wind : " + wind);
    $("#city-box").append(humidityLi.textContent = " Humidity : " + humidity);
    $("#city-box").append(uviLi.textContent =  " UV Index : " + uvi);
    console.log(weatherData.current.uvi);
    if(weatherData.current.uvi === 0 || weatherData.current.uvi <= 3){
        console.log("Green");
    } else if (weatherData.current.uvi === 4 || weatherData.current.uvi <= 6){
        console.log("Yello"); 
    } else
        console.log("Red");
}

var displayStoredCities = function(city) {
    // for everything city in localsotrage append to DOM
    $("#city-box").empty();
    var title = document.createElement('h2');
    title.setAttribute("class", "title");
    $("#city-box").append(title);
    title.textContent = (city);
    console.log(title);
}

// displayStoredCities();

var displayForcast = function(forecastData, data) {

    $(".fivecard").empty();
    for ( i = 1; i <= 5; i++ ) {
        var fivecard = document.createElement("div");
        var fiveCityName = document.createElement("h4");
        var fiveIcon = document.createElement("img");
        // var fiveTemp = document.createElement('p');
        var fiveDayTemp = document.createElement('p');
        var fiveDayWind = document.createElement('p');
        var fiveDayHumidity = document.createElement('p');
        var fiveDayUvi = document.createElement('p');
        var fiveDaysDate = document.createElement('p');
        icon = forecastData.daily[i].weather[0].icon;
        console.log(icon);
        var fiveIcon = document.createElement('img');
        fiveIcon.src =  `http://openweathermap.org/img/wn/${icon}@2x.png`
        fivecard.append(fiveDaysDate,fiveIcon, fiveDayTemp, fiveDayWind, fiveDayHumidity, fiveDayUvi);
        // fiveCityName.textContent = data[0].name;
        $(".fivecard").append(fivecard);
        fivecard.setAttribute("class", "cardweather");
        fiveDayTemp.setAttribute("class", "cardinfo");
        fiveDayWind.setAttribute("class", "cardinfo");
        fiveDayHumidity.setAttribute("class", "cardinfo");
        fiveDayUvi.setAttribute("class", "cardinfo");
        fiveIcon.setAttribute("class", "cardimage");
        fiveDaysDate.setAttribute("class", "datePlace");
        var todaysDate = moment.unix(forecastData.daily[i].dt);
        var dates = (todaysDate.format('MM/DD/YYYY'));
        fiveDaysDate.textContent = dates;
        fiveDayTemp.textContent = "Temp: " + forecastData.daily[i].temp.day;
        fiveDayWind.textContent = "Wind: " + forecastData.daily[i].wind_speed;
        fiveDayHumidity.textContent = "Humidity: " + forecastData.daily[i].humidity;
        fiveDayUvi.textContent = "UVi: " + forecastData.daily[i].uvi;
        
        console.log(forecastData);
    }
}

// displayForcast();

var saveSearchCity = function(city) {
    localStorage.setItem("city", JSON.stringify(cities));
    JSON.parse(localStorage.getItem('city', (city)));
    console.log(cities.length)
}

saveSearchCity();

// function timedRefresh(timeoutPeriod) {
// 	setTimeout("location.reload(true);",timeoutPeriod);
// }
// window.onload = timedRefresh(20000);

var showCity = function(cities) {
    JSON.parse(localStorage.getItem("city"));
    $(".list-group").empty();
    for (i = 0; i < cities?.length; i++) {
        var liCity = document.createElement('p');
        $(".list-group").append(liCity);
        liCity.textContent = cities[i];
        console.log(liCity);
        liCity.addEventListener('click', searchCity);
    }
}