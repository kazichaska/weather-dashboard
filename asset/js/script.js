// var citySearch = document.querySelector("h3");
// var searchButton = $("#search")
// document.querySelector("#btn");
// var cardEl = $("card");
// var cardContainer = $("#boxes");
// var todaysWeather = $("#todays-weather");
var weatherDetail = $("#weather-detail");
var forecastEl = $("#forecast");
var cityList = $(".city-list");
var defaultCity = "Minneapolis";
var cities = JSON.parse(localStorage.getItem("city")) ? JSON.parse(localStorage.getItem("city")): [];

var cityInput = document.querySelector("#city-input");

function searchCity(city) {
    console.log(city);
    if (cityInput.value.length > 0) {
        city = cityInput.value;
    } else if (cityInput.value == ""){
        city = city;
    }
    console.log(cityInput.value);
    var lowerCasedCity = city.toLowerCase();
    const foundCity = JSON.parse(localStorage.getItem("city"))?.find(savedCity => {
        return savedCity === city
    }) 
    console.log(foundCity);
    if(foundCity){
        getApi(lowerCasedCity);
        showCity(cities);
        displayStoredCities(lowerCasedCity);
        return
    } else {
        cities.push(lowerCasedCity);
        savedSearchCity(lowerCasedCity);
        getApi(lowerCasedCity);
        showCity(cities);
        displayStoredCities(lowerCasedCity);
    }
}

$("#searchbtn").click(function() {
    searchCity(cityInput.value);
    cityInput.value = '';
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
        // uviColor(tempArray, data);
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
    uviLi.textContent =  " UV Index : ";
    var uvIndex = document.createElement('p');
    console.log(uvIndex);
    uvIndex.innerHTML = uvi;
    $("#city-box").append(uviLi.textContent + uvIndex.innerHTML);
    console.log(weatherData.current.uvi);
    uviColor(weatherData, data, uvIndex);
    // if(weatherData.current.uvi >= 0 && weatherData.current.uvi <= 3){
    //     // uvIndex.css("color", "green");
    //     uvIndex.setAttribute("class", "uviGreen");
    //     uvIndex.style.color = "green";
    // } else if (weatherData.current.uvi >= 4 && weatherData.current.uvi <= 6){
    //     // uvIndex.css("color", "yellow");
    //     uvIndex.setAttribute("class", "uviYellow"); 
    //     uvIndex.style.color = "yellow";
    // } else
    //     // uvIndex.css("color", "red");
    //     uvIndex.setAttribute("class", "uviRed"); 
    //     uvIndex.style.color = "red";
}

var uviColor = function(weatherData, data, uviLi) {

    if(weatherData.current.uvi >= 0 && weatherData.current.uvi <= 3){
        uviLi.setAttribute("class", "uviGreen");
    } else if (weatherData.current.uvi >= 4 && weatherData.current.uvi <= 6){
        uviLi.setAttribute("class", "uviYellow"); 
    } else
        uviLi.setAttribute("class", "uviRed"); 
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

var savedSearchCity = function(city) {
        localStorage.setItem("city", JSON.stringify(cities));
        JSON.parse(localStorage.getItem('city', (city)));
        console.log(cities.length);
}

savedSearchCity();


var showCity = function(cities) {
    JSON.parse(localStorage.getItem("city"));
    $(".list-group").empty();
    for (let i = 0; i < cities?.length; i++) {
        let liCity = document.createElement('p');
        $(".list-group").append(liCity);
        liCity.textContent = cities[i];
        console.log(liCity);
        liCity.addEventListener('click', (e) => {
            searchCity(liCity.textContent);
            console.log(liCity.textContent);
        })
    // $("#city-input").empty();
    }
}