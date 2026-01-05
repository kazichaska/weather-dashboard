var weatherDetail = $("#weather-detail");
var forecastEl = $("#forecast");
var cityList = $(".recent-list");
var defaultCity = "Minneapolis";
var cities = JSON.parse(localStorage.getItem("city")) ? JSON.parse(localStorage.getItem("city")): [];

var cityInput = document.querySelector("#city-input");

// ==================== CONTACT FORM FUNCTIONALITY ====================
const contactToggle = document.getElementById('contact-toggle');
const contactModal = document.getElementById('contact-modal');
const contactClose = document.querySelector('.contact-close');
const contactForm = document.getElementById('contact-form');

contactToggle.addEventListener('click', () => {
    contactModal.classList.add('active');
});

contactClose.addEventListener('click', () => {
    contactModal.classList.remove('active');
});

contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
        contactModal.classList.remove('active');
    }
});

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    try {
        const response = await fetch("https://formspree.io/f/mjgkjddn", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            contactForm.style.display = 'none';
            document.getElementById('contact-success').style.display = 'block';
            setTimeout(() => {
                contactModal.classList.remove('active');
                contactForm.style.display = 'flex';
                document.getElementById('contact-success').style.display = 'none';
                contactForm.reset();
            }, 3000);
        } else {
            alert("There was an error sending your message. Please try again later.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("There was an error sending your message. Please try again later.");
    }
});

// ==================== AI INSIGHTS FUNCTION ====================
function generateAIInsights(weatherData, cityName) {
    if (!weatherData?.list?.[0]) return;
    
    const current = weatherData.list[0];
    const temp = Math.round(current.main.temp);
    const humidity = current.main.humidity;
    const wind = Math.round(current.wind.speed);
    const feelsLike = Math.round(current.main.feels_like);
    const description = current.weather[0].main;
    
    let insight = ``;
    
    // Temperature-based insights
    if (temp < 32) {
        insight += `🥶 It's freezing in ${cityName}! Bundle up and stay warm. `;
    } else if (temp < 50) {
        insight += `🧥 Chilly weather ahead! A jacket would be a good idea. `;
    } else if (temp < 70) {
        insight += `😊 Nice mild weather! Perfect for outdoor activities. `;
    } else if (temp < 85) {
        insight += `☀️ Warm and pleasant weather. Don't forget sunscreen! `;
    } else {
        insight += `🔥 It's quite hot! Stay hydrated and seek shade when needed. `;
    }
    
    // Humidity-based insights
    if (humidity > 80) {
        insight += `💧 High humidity detected - you might feel the heat more intensely. `;
    } else if (humidity < 30) {
        insight += `🏜️ Low humidity - moisturize your skin and drink plenty of water. `;
    }
    
    // Wind-based insights
    if (wind > 20) {
        insight += `💨 Strong winds are expected. Secure loose items outside. `;
    } else if (wind < 5) {
        insight += `🌬️ Very light winds - perfect for outdoor plans! `;
    }
    
    // General weather insights
    if (description.includes('Rain')) {
        insight += `☔ Rainy conditions ahead. Don't forget an umbrella!`;
    } else if (description.includes('Cloud')) {
        insight += `☁️ Cloudy skies expected. Great for avoiding direct sun exposure.`;
    } else if (description.includes('Clear') || description.includes('Sunny')) {
        insight += `✨ Clear skies! Excellent visibility and great for photography.`;
    } else if (description.includes('Snow')) {
        insight += `❄️ Snow on the way! Check road conditions before traveling.`;
    } else if (description.includes('Storm') || description.includes('Thunderstorm')) {
        insight += `⚡ Severe weather warning! Stay indoors and avoid outdoor activities.`;
    }
    
    document.getElementById('ai-insights-content').textContent = insight;
}

// Load default city when page loads
window.addEventListener('load', function() {
    showCity(cities);
    getApi(defaultCity);
});

function searchCity(city) {
    // console.log(city);
    if (cityInput.value.length > 0) {
        city = cityInput.value;
    } else if (cityInput.value == ""){
        city = city;
    }
    // console.log(cityInput.value);
    var lowerCasedCity = city.toLowerCase();
    const foundCity = JSON.parse(localStorage.getItem("city"))?.find(savedCity => {
        return savedCity === lowerCasedCity
    }) 
    // console.log(foundCity);
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
    if (!city) return;
    
    // Using the Current Weather endpoint
    var requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=1b18ce13c84e21faafb19c931bb29331`
    
    console.log('Fetching weather for:', city);
    fetch(requestUrl)
    .then(async function(response) {
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('City not found. Please check the city name.');
            } else if (response.status === 401) {
                throw new Error('API key not active yet. Please wait a few minutes and try again.');
            } else {
                throw new Error(data.message || 'Error fetching city data');
            }
        }
        
        if (!data || !data.coord) {
            throw new Error('Invalid location data received');
        }
        
        console.log('Weather data received:', data);
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        const cityData = [{
            name: data.name,
            lat: lat,
            lon: lon
        }];
        
        await getWeatherDetail(lat, lon, cityData);
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message || 'Could not find weather data for this city. Please try another city.');
    })
    // console.log(requestUrl);
}

// getApi();

var weatherArray = [];
async function getWeatherDetail(lat, lon, data) {
    var requestUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=1b18ce13c84e21faafb19c931bb29331`;
    
    try {
        const response = await fetch(requestUrl);
        const responseData = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your API key.');
            } else if (response.status === 429) {
                throw new Error('Too many requests. Please try again later.');
            } else {
                throw new Error(responseData.message || 'Weather data not available');
            }
        }

        if (!responseData || !responseData.list || responseData.list.length === 0) {
            throw new Error('Invalid weather data received');
        }

        displayTodaysWeather(responseData, data);
        displayForcast(responseData, data);
        // Generate AI insights for the current city
        generateAIInsights(responseData, data[0].name);
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('API key')) {
            alert('API key error. Please check your API configuration.');
        } else {
            alert(error.message || 'Could not fetch weather data. Please try again later.');
        }
    }
}

var displayTodaysWeather = function(weatherData, data) {
    if (!weatherData?.list?.[0] || !data?.[0]?.name) {
        console.error('Invalid weather data');
        return;
    }
    
    $("#city-box").empty(); // Clear previous content
    
    var currentWeather = weatherData.list[0];
    var icon = currentWeather.weather[0].icon;
    var city = data[0].name;
    var temp = currentWeather.main.temp;
    var humidity = currentWeather.main.humidity;
    var wind = currentWeather.wind.speed;
    var feelsLike = currentWeather.main.feels_like;
    var pressure = currentWeather.main.pressure;
    var cloudiness = currentWeather.clouds.all;

    // Create and append city name
    var cityTitle = document.createElement('h2');
    cityTitle.setAttribute("class", "title");
    cityTitle.textContent = city;
    $("#city-box").append(cityTitle);

    // Create and append weather icon
    var weatherIcon = document.createElement('img');
    weatherIcon.setAttribute("class", "icon");
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
    
    // Get the date
    var todaysDate = moment(currentWeather.dt_txt);
    var dates = todaysDate.format('MMM DD, YYYY');
    
    // Create date element
    var dateEl = document.createElement('p');
    dateEl.textContent = `${dates}`;
    dateEl.style.gridColumn = '1 / -1';
    dateEl.style.fontSize = '14px';
    dateEl.style.color = '#718096';
    
    // Create weather info container
    var weatherInfoLeft = document.createElement('div');
    weatherInfoLeft.className = 'weather-info';
    
    var tempEl = document.createElement('p');
    tempEl.innerHTML = `<i class="fas fa-thermometer-half"></i><strong>Temperature:</strong> ${Math.round(temp)}°F`;
    
    var feelsLikeEl = document.createElement('p');
    feelsLikeEl.innerHTML = `<i class="fas fa-wind"></i><strong>Feels Like:</strong> ${Math.round(feelsLike)}°F`;
    
    var pressureEl = document.createElement('p');
    pressureEl.innerHTML = `<i class="fas fa-gauge-high"></i><strong>Pressure:</strong> ${pressure} mb`;
    
    // Create weather info container right
    var weatherInfoRight = document.createElement('div');
    weatherInfoRight.className = 'weather-info';
    
    var windEl = document.createElement('p');
    windEl.innerHTML = `<i class="fas fa-fan"></i><strong>Wind Speed:</strong> ${Math.round(wind)} MPH`;
    
    var humidityEl = document.createElement('p');
    humidityEl.innerHTML = `<i class="fas fa-droplet"></i><strong>Humidity:</strong> ${humidity}%`;
    
    var cloudsEl = document.createElement('p');
    cloudsEl.innerHTML = `<i class="fas fa-cloud"></i><strong>Cloudiness:</strong> ${cloudiness}%`;
    
    // Append left info
    weatherInfoLeft.append(tempEl, feelsLikeEl, pressureEl);
    
    // Append right info
    weatherInfoRight.append(windEl, humidityEl, cloudsEl);
    
    // Append all elements in the correct structure
    $("#city-box").append(dateEl, weatherIcon);
    $("#city-box").append(weatherInfoLeft);
    $("#city-box").append(weatherInfoRight);
}

// Remove the UV index color function since it's not needed
// var uviColor = function(weatherData) {
//     var uvInfo = document.createElement('p');
//     uvInfo.textContent = "UV Index:" + weatherData.current.uvi;
//     $("#city-box").append(uvInfo);
//     if(weatherData.current.uvi >= 0 && weatherData.current.uvi <= 3){
//         uvInfo.setAttribute("class", "uviGreen");
//     } else if (weatherData.current.uvi >= 4 && weatherData.current.uvi <= 6){
//         uvInfo.setAttribute("class", "uviYellow"); 
//     } else
//         uvInfo.setAttribute("class", "uviRed"); 
// }

var uviColor = function(weatherData) {
    var uvInfo = document.createElement('p');
    uvInfo.textContent = "UV Index:" + weatherData.current.uvi;
    $("#city-box").append(uvInfo);
    if(weatherData.current.uvi >= 0 && weatherData.current.uvi <= 3){
        uvInfo.setAttribute("class", "uviGreen");
    } else if (weatherData.current.uvi >= 4 && weatherData.current.uvi <= 6){
        uvInfo.setAttribute("class", "uviYellow"); 
    } else
        uvInfo.setAttribute("class", "uviRed"); 
}


var displayStoredCities = function(city) {
    // for everything city in localsotrage append to DOM
    $("#city-box").empty();
    var title = document.createElement('h2');
    title.setAttribute("class", "title");
    $("#city-box").append(title);
    title.textContent = (city);
    // console.log(title);
}

// displayStoredCities();

var displayForcast = function(forecastData, data) {
    if (!forecastData?.list) {
        console.error('No forecast data available');
        return;
    }

    $(".fivecard").empty();
    // Get one forecast per day (every 8th item as the API returns 3-hour forecasts)
    for (let i = 7; i < forecastData.list.length; i += 8) {
        const forecast = forecastData.list[i];

        var fivecard = document.createElement("div");
        fivecard.setAttribute("class", "cardweather");
        
        var fiveDaysDate = document.createElement('p');
        fiveDaysDate.setAttribute("class", "datePlace");
        
        // Create and setup weather icon
        var fiveIcon = document.createElement('img');
        fiveIcon.src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        fiveIcon.setAttribute("class", "cardimage");
        
        // Create info elements
        var fiveDayTemp = document.createElement('p');
        fiveDayTemp.setAttribute("class", "cardinfo");
        fiveDayTemp.innerHTML = `<strong>Temp: ${Math.round(forecast.main.temp)}°F</strong>`;
        
        var fiveDayWind = document.createElement('p');
        fiveDayWind.setAttribute("class", "cardinfo");
        fiveDayWind.innerHTML = `<strong>Wind: ${Math.round(forecast.wind.speed)} MPH</strong>`;
        
        var fiveDayHumidity = document.createElement('p');
        fiveDayHumidity.setAttribute("class", "cardinfo");
        fiveDayHumidity.innerHTML = `<strong>Humidity: ${forecast.main.humidity}%</strong>`;
        
        // Append elements to card
        fivecard.append(fiveDaysDate, fiveIcon, fiveDayTemp, fiveDayWind, fiveDayHumidity);
        
        // Add card to container
        $(".fivecard").append(fivecard);
        
        // Format and set date
        var todaysDate = moment(forecast.dt_txt);
        var dates = todaysDate.format('MMM DD');
        fiveDaysDate.textContent = dates;
    }
}

// displayForcast();

var savedSearchCity = function(city) {
        localStorage.setItem("city", JSON.stringify(cities));
        JSON.parse(localStorage.getItem('city', (city)));
        // console.log(cities.length);
}

savedSearchCity();


var showCity = function(cities) {
    cities = JSON.parse(localStorage.getItem("city")) || [];
    $(".recent-list").empty();
    for (let i = 0; i < cities?.length; i++) {
        let liCity = document.createElement('li');
        liCity.className = 'city-item';
        $(".recent-list").append(liCity);
        liCity.textContent = cities[i];
        // console.log(liCity);
        liCity.addEventListener('click', (e) => {
            searchCity(cities[i]);
            console.log(cities[i]);
        });
    // $("#city-input").empty();
    }
}