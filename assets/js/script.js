const apiKey = "82523b6c0329ebe3b1def605beb7c5a3";
//const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

//do some maths to convert metric units to celsius to avoid recalling api
//math.round to give whole numbers

const placeNameEl = document.getElementById("place-name");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");

const descriptionEl = document.getElementById("description");
const heroIconEl = document.getElementById("hero-weather-icon");

const tempEl = document.getElementById("temp");
const tempMaxEl = document.getElementById("temp-max");
const tempMinEl = document.getElementById("temp-min");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");
const windDirectionEl = document.getElementById("wind-direction");
const uvIndexEl = document.getElementById("uv-index");

const abbreviatedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const abbreviatedDays = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

let waitingForReply = false;

function renderData(d) {
    let timeUTC = Date.now(); //milliseconds
    let timeZone = d.timezone_offset * 1000; //converted to milliseconds
    let newTime = (timeZone + timeUTC);
    let date_ = new Date(newTime);
    let timestr = date_.toLocaleTimeString();
    //dateEl.textContent = date_;
    //timeEl.textContent = timestr;

    console.log(d);
    console.log(date_, timestr);


    let weatherDay = days[date_.getDay()];
    let weatherDate = date_.getDate();
    let weatherMonth = months[date_.getMonth()];

    let weatherHour = date_.getHours().toString().padStart(2, "0"); //getHours returns single digit, padStart will add a leading zero if needed
    let weatherMinutes = date_.getMinutes().toString().padStart(2, "0");

    dateEl.textContent = `${weatherDay} ${weatherDate} ${weatherMonth}, ${weatherHour}:${weatherMinutes}`;


    descriptionEl.textContent = d.current.weather[0].description;
    let uvIndex = d.current.uvi.toFixed(1);
    uvIndexEl.innerHTML = "<b>" + uvIndex + "</b>";
    if (uvIndex >= 0 && uvIndex <= 3) uvIndexEl.style.backgroundColor = "green";
    else if (uvIndex > 3 && uvIndex <= 5) uvIndexEl.style.backgroundColor = "#E2D240";
    else if (uvIndex > 5 && uvIndex <= 7) uvIndexEl.style.backgroundColor = "orange";
    else if (uvIndex > 7 && uvIndex <= 10) uvIndexEl.style.backgroundColor = "red";
    else (uvIndexEl.style.backgroundColor = "violet");



    applyStyles(d, weatherHour);

}

function getLonLat(location) {

    waitingForReply = true;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`)
        .then(function (resp) {
            waitingForReply = false;
            return resp.json()
        })
        .then(function (data) {
            let lonLat = {
                longitude: data.coord.lon,
                latitude: data.coord.lat
            }

            if (data.sys.country === undefined) {
                placeNameEl.textContent = `${data.name}`;
            }
            else {
                placeNameEl.textContent = `${data.name}, ${data.sys.country}`;
            }
            tempEl.textContent = `${Math.round(data.main.temp)}°C`;
            tempMaxEl.textContent = `${Math.round(data.main.temp_max)}°`;
            tempMinEl.textContent = `${Math.round(data.main.temp_min)}°`;
            feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°`;
            humidityEl.textContent = `${data.main.humidity}%`;
            windSpeedEl.textContent = `${data.wind.speed.toFixed(1)} m/s`;
            let windDirection = data.wind.deg;
            windDirectionEl.style.transform = `rotate(${windDirection}deg)`;

            console.log(data);
            getWeather(lonLat)
        })
        .catch(function (error) {
            //console.log("Oh dear... something went catastrophically wrong. Or maybe you just can't spell. Please try again.");
            console.log(error);
        });




}


function getWeather(lonLat) {

    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lonLat.latitude}&lon=${lonLat.longitude}&exclude=minutely,hourly,alerts&appid=${apiKey}&units=metric`)
        .then(function (resp) { return resp.json() })
        .then(function (data) {

            if (data.message === "not found") {
                //display message that location was not found, offer tip
                console.log("not found");
            }
            else {

                renderData(data);

            }
        })
        .catch(function (error) {

            console.log(error);
        });

}

document.querySelector("#submit-button").addEventListener("click", function (event) {
    event.preventDefault();
    let location = document.getElementById("search-bar").value;
    if (location === "") {
        console.log("enter a location");
    }
    else if (waitingForReply) {
        console.log("please wait");
    }
    else {
        document.getElementById("search-bar").value = "";
        getLonLat(location);
    }
}, false);



function applyStyles(data, hour) {

    //console.log("hour of day is: " + parseInt(hour));
    if (parseInt(hour) > 21 || parseInt(hour) < 6) {
        document.body.className = "background-night";
        //night time

    }

    else { //not night time
        let weatherId = data.current.weather[0].id;
        console.log("weather ID = " + weatherId);
        console.log(parseInt(weatherId / 100));

        switch (parseInt(weatherId / 100)) {

            //cloud coverage
            case 8: {
                switch (weatherId % 8) {
                    case 0: {
                        document.body.className = "background-clear";
                        console.log("ID is 800; clear sky");
                        break;
                    }
                    case 1: {
                        document.body.className = "background-clear";
                        console.log("1-25% clouds");
                        break;
                    }
                    case 2:
                    case 3:
                        {
                            document.body.className = "background-cloudy";
                            //some clouds
                            break;
                        }
                    case 4: {
                        document.body.className = "background-heavy-clouds";
                        break;
                    }
                }
                break;
            }
            //rain
            case 5: {
                document.body.className = "background-rain";
                console.log("rain");
                break;

            }
            //snow
            case 6: {
                document.body.className = "background-snow";
                console.log("snow");
                break;

            }

        }
    }
    console.log("reached end of applyStyles")

}

// function drawWeather(weatherData) {

//     console.log(weatherData);

// }


//NB OneCall and Weather do not always return the same description for the current weather.
//In order to get the UV index I have to call OneCall, but you can only use lat and long for the location.
//So in order to get lat and long I have to call Weather first!! 


//wait for reply before allowed to search again
//remove & and = from search 


//use innerHTMl to generate dynamic SVGs