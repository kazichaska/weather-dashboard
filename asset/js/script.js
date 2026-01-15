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
}

// ==================== GET WEATHER DETAIL (5-DAY FORECAST) ====================
async function getWeatherDetail(lat, lon, cityData) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=1b18ce13c84e21faafb19c931bb29331`;
    
    try {
        const response = await fetch(forecastUrl);
        const forecastData = await response.json();
        
        if (!response.ok) {
            throw new Error(forecastData.message || 'Could not fetch forecast data');
        }
        
        if (!forecastData || !forecastData.list) {
            throw new Error('Invalid forecast data received');
        }
        
        // Display current weather and forecast
        displayTodaysWeather(forecastData, cityData);
        displayForcast(forecastData, cityData);
        generateAIInsights(forecastData, cityData[0].name);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        alert('Could not fetch forecast data. Please try again.');
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
    cityTitle.setAttribute("class", "title hero-title");
    cityTitle.textContent = city;
    $("#city-box").append(cityTitle);

    // Create and append weather icon
    var weatherIcon = document.createElement('img');
    weatherIcon.setAttribute("class", "icon hero-icon");
    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
    
    // Get the date
    var todaysDate = moment(currentWeather.dt_txt);
    var dates = todaysDate.format('MMM DD, YYYY');
    
    // Description
    var description = currentWeather.weather?.[0]?.description || '';

    // Create date element
    var dateEl = document.createElement('p');
    dateEl.textContent = `${dates}`;
    dateEl.className = 'date-chip';
    dateEl.style.gridColumn = '1 / -1';
    
    // Create description chip
    var descEl = document.createElement('p');
    descEl.textContent = description;
    descEl.className = 'desc-chip';
    descEl.style.gridColumn = '1 / -1';
    descEl.style.textTransform = 'capitalize';
    
    // Create weather info container
    var weatherInfoLeft = document.createElement('div');
    weatherInfoLeft.className = 'weather-info info-left';
    
    var tempEl = document.createElement('p');
    tempEl.className = 'metric';
    tempEl.innerHTML = `<span class="metric-label">Temperature</span><span class="metric-value">${Math.round(temp)}°F</span>`;
    
    var feelsLikeEl = document.createElement('p');
    feelsLikeEl.className = 'metric';
    feelsLikeEl.innerHTML = `<span class="metric-label">Feels Like</span><span class="metric-value">${Math.round(feelsLike)}°F</span>`;
    
    var pressureEl = document.createElement('p');
    pressureEl.className = 'metric';
    pressureEl.innerHTML = `<span class="metric-label">Pressure</span><span class="metric-value">${pressure} mb</span>`;
    
    // Create weather info container right
    var weatherInfoRight = document.createElement('div');
    weatherInfoRight.className = 'weather-info info-right';
    
    var windEl = document.createElement('p');
    windEl.className = 'metric';
    windEl.innerHTML = `<span class="metric-label">Wind</span><span class="metric-value">${Math.round(wind)} MPH</span>`;
    
    var humidityEl = document.createElement('p');
    humidityEl.className = 'metric';
    humidityEl.innerHTML = `<span class="metric-label">Humidity</span><span class="metric-value">${humidity}%</span>`;
    
    var cloudsEl = document.createElement('p');
    cloudsEl.className = 'metric';
    cloudsEl.innerHTML = `<span class="metric-label">Cloudiness</span><span class="metric-value">${cloudiness}%</span>`;
    
    // Append left info
    weatherInfoLeft.append(tempEl, feelsLikeEl, pressureEl);
    
    // Append right info
    weatherInfoRight.append(windEl, humidityEl, cloudsEl);
    
    // Append all elements in the correct structure
    $("#city-box").append(dateEl, descEl, weatherIcon);
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
        fivecard.style.cursor = "pointer";
        fivecard.setAttribute("data-index", i); // Store the index for later use
        
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
        
        // Add click event to show details
        fivecard.addEventListener('click', () => {
            showWeatherDetails(forecast, data[0].name);
        });
        
        // Add card to container
        $(".fivecard").append(fivecard);
        
        // Format and set date
        var todaysDate = moment(forecast.dt_txt);
        var dates = todaysDate.format('MMM DD');
        fiveDaysDate.textContent = dates;
    }
}

// ==================== WEATHER DETAILS MODAL ====================
function showWeatherDetails(forecast, cityName) {
    const modal = document.getElementById('weather-details-modal');
    const detailsBody = document.getElementById('weather-details-body');
    
    const temp = Math.round(forecast.main.temp);
    const feelsLike = Math.round(forecast.main.feels_like);
    const tempMin = Math.round(forecast.main.temp_min);
    const tempMax = Math.round(forecast.main.temp_max);
    const humidity = forecast.main.humidity;
    const pressure = forecast.main.pressure;
    const wind = Math.round(forecast.wind.speed);
    const clouds = forecast.clouds.all;
    const description = forecast.weather[0].description;
    const icon = forecast.weather[0].icon;
    const date = moment(forecast.dt_txt).format('dddd, MMMM DD, YYYY');
    const time = moment(forecast.dt_txt).format('h:mm A');
    
    // Generate detailed insight
    let insight = '';
    if (temp < 32) {
        insight = `❄️ Freezing conditions expected! Stay indoors and keep warm. If you must go out, dress in layers.`;
    } else if (temp < 50) {
        insight = `🧥 Cold weather ahead. A warm jacket is recommended. Good weather for indoor activities.`;
    } else if (temp < 70) {
        insight = `😊 Pleasant weather conditions. Perfect for outdoor activities like walking or jogging.`;
    } else if (temp < 85) {
        insight = `☀️ Warm and comfortable. Great for outdoor plans, but don't forget sunscreen!`;
    } else {
        insight = `🔥 Very hot conditions! Stay hydrated, wear light clothing, and limit outdoor exposure during peak hours.`;
    }
    
    if (humidity > 80) {
        insight += ` High humidity may make it feel warmer than it actually is.`;
    }
    
    if (wind > 15) {
        insight += ` Strong winds expected - secure outdoor items.`;
    }
    
    detailsBody.innerHTML = `
        <div class="weather-details-header">
            <img src="https://openweathermap.org/img/wn/${icon}@4x.png" class="weather-details-icon" alt="${description}">
            <div class="weather-details-title-section">
                <h2 class="weather-details-date">${date}</h2>
                <p class="weather-details-description">${description} • ${time}</p>
            </div>
        </div>
        
        <div class="weather-details-grid">
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-thermometer-half"></i>
                    Temperature
                </div>
                <p class="weather-detail-value">${temp}°F</p>
            </div>
            
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-temperature-arrow-down"></i>
                    Feels Like
                </div>
                <p class="weather-detail-value">${feelsLike}°F</p>
            </div>
            
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-arrow-up"></i>
                    High / Low
                </div>
                <p class="weather-detail-value">${tempMax}° / ${tempMin}°</p>
            </div>
            
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-droplet"></i>
                    Humidity
                </div>
                <p class="weather-detail-value">${humidity}%</p>
            </div>
            
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-wind"></i>
                    Wind Speed
                </div>
                <p class="weather-detail-value">${wind} MPH</p>
            </div>
            
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-gauge-high"></i>
                    Pressure
                </div>
                <p class="weather-detail-value">${pressure} mb</p>
            </div>
            
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-cloud"></i>
                    Cloudiness
                </div>
                <p class="weather-detail-value">${clouds}%</p>
            </div>
            
            <div class="weather-detail-item">
                <div class="weather-detail-label">
                    <i class="fas fa-location-dot"></i>
                    Location
                </div>
                <p class="weather-detail-value" style="font-size: 18px;">${cityName}</p>
            </div>
        </div>
        
        <div class="weather-detail-insight">
            <h4 class="weather-detail-insight-title">
                <i class="fas fa-lightbulb"></i>
                Weather Insight
            </h4>
            <p class="weather-detail-insight-text">${insight}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

// Close weather details modal
document.addEventListener('DOMContentLoaded', () => {
    const weatherModal = document.getElementById('weather-details-modal');
    const weatherModalClose = document.querySelector('.weather-modal-close');
    
    if (weatherModalClose) {
        weatherModalClose.addEventListener('click', () => {
            weatherModal.classList.remove('active');
        });
    }
    
    if (weatherModal) {
        weatherModal.addEventListener('click', (e) => {
            if (e.target === weatherModal) {
                weatherModal.classList.remove('active');
            }
        });
    }
});

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