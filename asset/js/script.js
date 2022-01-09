var citySearch = document.querySelector("h3");
var cityInput = document.querySelector("#city-input");
var submitButton = $("#search")
// document.querySelector("#btn");


$("#search").click(function() {
    alert("Search button was clicked!");
});

console.log(submitButton);

function getApi() {
    var requestUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=dhaka&limit=5&appid=f34dabc58db5ff52b58f3ded309b23a6'
    
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

async function getWeatherDetail(lat, lon) {
    var requestUrl = "https://api.openweathermap.org/data/2.5/onecall?" + "lat=" +lat + "&" + "lon=" +lon + "&" + "appid=f34dabc58db5ff52b58f3ded309b23a6";
    // const response = await fetch(url);
    fetch(requestUrl)
    .then(async function(response) {
        console.log(response);
        var weatherArray = await response.json();
        console.log(weatherArray);
    });    
}




// after putting the city name and click on search
// submitButton.addEventListener("click", function(event) {
//     // event.preventDefault();
//     console.log(event.target);
// })


// function to get city lon and lad 
// var getCityLonLad = function() {
//     // first api to get city detail for laditude and longitude
//     console.log("this is where we will get api detail woth log and lad");
// };

// // function to get the weather details
// getCityLonLad();

// var getWeatherDetail = function() {
//     // second api to get all other detail weather using first api call's 
//     console.log("this would be detatil view of 5-day weather");
// }

// getWeatherDetail();