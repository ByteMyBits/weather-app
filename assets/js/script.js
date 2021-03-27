const apiKey = "82523b6c0329ebe3b1def605beb7c5a3";
//const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

//do some maths to convert metric units to imperial to avoid recalling api
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

//////////////////////////////////////////////////////////

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

    let firstDay = date_.getDay();
    let weatherDay = days[firstDay];
    let weatherDate = date_.getDate();
    let weatherMonth = months[date_.getMonth()];

    let weatherHour = date_.getHours().toString().padStart(2, "0"); //getHours returns single digit, padStart will add a leading zero if needed
    let weatherMinutes = date_.getMinutes().toString().padStart(2, "0");

    dateEl.textContent = `${weatherDay} ${weatherDate} ${weatherMonth}, ${weatherHour}:${weatherMinutes}`;


    descriptionEl.textContent = d.current.weather[0].description;
    let uvIndex = d.current.uvi.toFixed(1);
    uvIndexEl.innerHTML = "<b>" + uvIndex + "</b>";
    //uvIndexEl.style.transition = "all 2s";
    if (uvIndex >= 0 && uvIndex <= 3) uvIndexEl.style.backgroundColor = "green";
    else if (uvIndex > 3 && uvIndex <= 5) uvIndexEl.style.backgroundColor = "#E2D240";
    else if (uvIndex > 5 && uvIndex <= 7) uvIndexEl.style.backgroundColor = "orange";
    else if (uvIndex > 7 && uvIndex <= 10) uvIndexEl.style.backgroundColor = "red";
    else (uvIndexEl.style.backgroundColor = "violet");


    //set 5 day forecast:



    // let cards = document.querySelectorAll(".card");
    let currentCard = 0; //first child
    let cardArray = [];
    console.log("weather/first day is: " + weatherDay);

    for (let i = 0; i <= 7; i++) {
        let sunrise = d.daily[i].sunrise * 1000; //milliseconds
        let adjustedTime = (timeZone + sunrise);
        date_ = new Date(adjustedTime);
        console.log(date_.getDay(), firstDay);

        if (date_.getDay() > firstDay) {

            let cardContent = {
                newWeatherDay: abbreviatedDays[date_.getDay()],
                newWeatherDate: date_.getDate(),
                weatherID: d.daily[i].weather[0].id,
                temp: d.daily[i].temp.day
            }
            cardArray.push(cardContent);
            currentCard++;
        }
        if (currentCard >= 5) {
            i = 7;
        }

    }
    console.log(cardArray);

    applyStyles(d, weatherHour);

}

////////////////////////////////////////////////////////////////

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
            //console.log("Oh dear... something went catastrophically wrong
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

    let iconFill = document.querySelectorAll(".icon-colour");
    iconFill.forEach(icon => {
        icon.style.fill = "white";
    });
    //console.log("hour of day is: " + parseInt(hour));
    //use the sunrise and sunset times instead
    if (parseInt(hour) >= 22 || parseInt(hour) <= 5) {
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
                        heroIconEl.innerHTML = `<svg height="8rem" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 135.98 135.98"><defs><linearGradient id="a" x1="75.89" y1="39.83" x2="60.45" y2="94.86" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f5e683"/><stop offset="1" stop-color="#ffc054"/></linearGradient><linearGradient id="b" x1="68.75" y1="115.86" x2="64.36" y2="131.5" xlink:href="#a"/><linearGradient id="c" x1="68.75" y1="215.78" x2="64.36" y2="231.41" gradientTransform="matrix(1 0 0 -1 0 235.89)" xlink:href="#a"/><linearGradient id="d" x1="-47.79" y1="624.24" x2="-52.17" y2="639.88" gradientTransform="rotate(90 263.91 380.45)" xlink:href="#a"/><linearGradient id="e" x1="-47.79" y1="-292.6" x2="-52.17" y2="-276.97" gradientTransform="matrix(0 1 1 0 408.46 116.54)" xlink:href="#a"/><linearGradient id="f" x1="-37.91" y1="135.89" x2="-40.95" y2="146.74" gradientTransform="matrix(.71 .71 .71 -.71 31.58 158.75)" xlink:href="#a"/><linearGradient id="g" x1="1.53" y1="-102.86" x2="-1.52" y2="-92" gradientTransform="matrix(.71 -.71 -.71 -.71 -37.95 -36.54)" xlink:href="#a"/><linearGradient id="h" x1="-314.5" y1="-269.2" x2="-317.55" y2="-258.35" gradientTransform="matrix(-.71 -.71 -.71 .71 -377.63 68.09)" xlink:href="#a"/><linearGradient id="i" x1="-403.57" y1="173.74" x2="-406.61" y2="184.59" gradientTransform="matrix(-.71 .71 .71 .71 -308.09 263.38)" xlink:href="#a"/></defs><g data-name="Layer 2"><g data-name="Layer 1"><circle cx="67.99" cy="67.99" r="40.12" fill="url(#a)"/><path d="M68 114.8h7.88a3.76 3.76 0 013.26 5.64l-3.94 6.83-3.94 6.83a3.76 3.76 0 01-6.52 0l-3.94-6.83-3.94-6.83a3.76 3.76 0 013.26-5.64z" fill="url(#b)"/><path d="M68 21.18h7.88a3.77 3.77 0 003.26-5.65l-3.95-6.82-3.94-6.83a3.76 3.76 0 00-6.52 0l-3.94 6.83-3.94 6.82a3.77 3.77 0 003.26 5.65z" fill="url(#c)"/><path d="M21.18 68v7.88a3.77 3.77 0 01-5.65 3.26l-6.82-3.95-6.83-3.94a3.76 3.76 0 010-6.52l6.83-3.94 6.82-3.94a3.77 3.77 0 015.65 3.26z" fill="url(#d)"/><path d="M114.8 68v7.88a3.76 3.76 0 005.64 3.26l6.83-3.94 6.83-3.94a3.76 3.76 0 000-6.52l-6.83-3.94-6.83-3.94a3.76 3.76 0 00-5.64 3.26z" fill="url(#e)"/><path d="M100 36l3.87 3.87a2.61 2.61 0 004.37-1.17l1.42-5.29 1.34-5.28a2.61 2.61 0 00-3.2-3.2l-5.28 1.42-5.29 1.42a2.61 2.61 0 00-1.17 4.37z" fill="url(#f)"/><path d="M36 36l3.87-3.87a2.61 2.61 0 00-1.17-4.37l-5.29-1.42-5.29-1.42a2.61 2.61 0 00-3.2 3.2l1.42 5.29 1.42 5.29a2.61 2.61 0 004.37 1.17z" fill="url(#g)"/><path d="M36 100l-3.86-3.9a2.61 2.61 0 00-4.37 1.17l-1.42 5.29-1.42 5.28a2.61 2.61 0 003.2 3.2l5.29-1.41 5.29-1.42a2.61 2.61 0 001.17-4.37z" fill="url(#h)"/><path d="M100 100l-3.87 3.87a2.61 2.61 0 001.17 4.37l5.29 1.42 5.28 1.41a2.61 2.61 0 003.2-3.2l-1.41-5.28-1.42-5.29a2.61 2.61 0 00-4.37-1.17z" fill="url(#i)"/></g></g></svg>`
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
                            let iconFill = document.querySelectorAll(".icon-colour");
                            iconFill.forEach(icon => {
                                icon.style.fill = "rgb(39, 39, 39)";
                            });
                            // test.style.fill = "rgb(39, 39, 39)"
                            // test2.style.fill = "red";    
                            //some clouds
                            heroIconEl.innerHTML = `<svg height="8rem" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 141.31 100.67"><defs><linearGradient id="b" x1="76.09" y1="11.45" x2="61.32" y2="64.09" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f5e683"/><stop offset="1" stop-color="#ffc054"/></linearGradient><linearGradient id="a" x1="1012.36" y1="49.91" x2="1042.66" y2="90.15" gradientTransform="matrix(-1 0 0 1 1124.21 0)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dcdcdc"/></linearGradient><linearGradient id="c" x1="1067.88" y1="31.13" x2="1093.65" y2="65.34" xlink:href="#a"/></defs><g data-name="Layer 2"><g data-name="Layer 1"><circle cx="68.53" cy="38.38" r="38.38" fill="url(#b)"/><path d="M73.57 44.73a27.87 27.87 0 0120.71 9.18A14.6 14.6 0 01122 59.59a19.31 19.31 0 11-11.06 35.13 17.05 17.05 0 01-21.13.74 28 28 0 11-16.24-50.73z" fill="url(#a)" opacity=".9"/><path d="M23.78 26.72a23.72 23.72 0 0117.61 7.8 12.41 12.41 0 0123.55 4.83 16.42 16.42 0 11-9.41 29.87 14.53 14.53 0 01-18 .64 23.78 23.78 0 11-13.75-43.14z" fill="url(#c)" opacity=".9"/></g></g></svg>`
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
                heroIconEl.innerHTML = `<svg height="10rem" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 149.24 158.03"><defs><linearGradient id="linear-gradient" x1="123.98" y1="80.98" x2="126.32" y2="89.04" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#664c3e"/><stop offset=".99" stop-color="#442b1b"/></linearGradient><linearGradient id="linear-gradient-2" x1="77.25" y1="104.41" x2="93.7" y2="125.67" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".29" stop-color="#f5f9fa"/><stop offset=".77" stop-color="#dce9f0"/><stop offset=".99" stop-color="#cee0ea"/></linearGradient><linearGradient id="linear-gradient-3" x1="56.62" y1="107.15" x2="63.73" y2="110.84" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8c5aed"/><stop offset=".4" stop-color="#8252e5"/><stop offset="1" stop-color="#6c42d3"/></linearGradient><linearGradient id="linear-gradient-4" x1="-573.9" y1="627.32" x2="-573.54" y2="627.28" gradientTransform="matrix(55.93 0 0 -21.23 32167.63 13396.56)" xlink:href="#linear-gradient-3"/><linearGradient id="linear-gradient-5" x1="71.12" y1="52.04" x2="82.6" y2="67.3" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-6" x1="63.43" y1="70.77" x2="67.88" y2="73.17" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffbf61"/><stop offset=".21" stop-color="#f8b55a"/><stop offset=".56" stop-color="#e89c49"/><stop offset=".99" stop-color="#ce732e"/></linearGradient><linearGradient id="linear-gradient-7" x1="27.58" y1="147.19" x2="29.29" y2="151.53" xlink:href="#linear-gradient"/><linearGradient id="linear-gradient-8" x1="11.34" y1="45.3" x2="16.11" y2="45.3" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-9" x1="138.34" y1="113" x2="142.78" y2="113" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-10" x1="58.81" y1="15.31" x2="65.38" y2="15.31" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-11" x1="134.22" y1="54.31" x2="138.82" y2="54.31" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-12" x1="98.88" y1="2.87" x2="104.63" y2="2.87" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-13" x1="30.21" y1="119.51" x2="35.96" y2="119.51" xlink:href="#linear-gradient-2"/><linearGradient id="linear-gradient-14" x1="1.25" y1="106.83" x2="5.32" y2="106.83" xlink:href="#linear-gradient-2"/><style>.cls-1{fill:#1c1c1c;opacity:.3;isolation:isolate}.cls-6{fill:#6c42d3}.cls-9{fill:#666564}.cls-10{fill:#4c4b49}.cls-21{fill:#fff}</style></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M2.09 149.88l7 4.68a4.38 4.38 0 003.7.38L36 146.73a.17.17 0 01.1 0l21.39 4.94.15.51c-.36 1.35-1.15 1.56-2.54 1.37l-4.67-.83c-1.25-.23-5.92-1.38-7.18-1.52-6.17-.71-8-.44-11.23.46a47.87 47.87 0 00-5.33 1.83l-9.43 3.87a9.15 9.15 0 01-7.26-.16c-1.47-.67-1.27-2-2.35-3.21h-.06l-5.68-2.78c-.59-.63-.89-.58-.55-1.54z"/><ellipse id="Ellipse_69" data-name="Ellipse 69" class="cls-1" cx="82.11" cy="141" rx="27.92" ry="5.03"/><path id="Path_54" data-name="Path 54" d="M139.59 78.7l2.27-4.1a1.52 1.52 0 00-.59-2l-.86-.48a1.52 1.52 0 00-2.05.59l-3.21 5.83a1.5 1.5 0 01-1.66.74l-8.44-2a1.47 1.47 0 00-1.17.2l-20.37 13.21a1.51 1.51 0 00-.44 2.09l.53.82a1.52 1.52 0 002.09.45l18.93-12.32a1.55 1.55 0 011.17-.2l21.37 5a1.5 1.5 0 001.84-1.09l.23-1a1.5 1.5 0 00-1.12-1.81l-7.51-1.76a1.51 1.51 0 01-1.13-1.81 2.26 2.26 0 01.12-.36z" fill="url(#linear-gradient)"/><path id="Path_55" data-name="Path 55" d="M115.61 109.79a36 36 0 11-69.08-16.05 34.19 34.19 0 012.4-4.74c.3-.5.6-1 .92-1.44l.57-.82c.27-.36.54-.73.81-1.07l.05-.07c.18-.24.36-.47.55-.69.42-.51.84-1 1.28-1.48a10 10 0 01.7-.75l.17-.18c.25-.26.51-.52.79-.77a.69.69 0 01.11-.13l.7-.64.2-.19.1-.09.82-.68c.38-.33.79-.64 1.19-1a3 3 0 01.4-.31.39.39 0 01.1-.08c.33-.25.69-.5 1-.75a35.65 35.65 0 0117.78-6.19c.76 0 1.54-.08 2.32-.08s1.55 0 2.34.07 1.5.11 2.23.2H84.67a6.73 6.73 0 01.67.1h.29c.45.07.89.15 1.35.25s.95.2 1.41.32 1 .24 1.41.38.7.2 1.06.33l.59.19.17.06c.35.12.7.26 1.06.4l.57.23a13.52 13.52 0 011.4.62c.39.16.77.34 1.15.54l.28.13c.29.15.58.3.86.46a3.12 3.12 0 01.35.2 6.44 6.44 0 01.63.36l.94.57c.4.25.79.51 1.18.78a.2.2 0 00.07.06c.36.23.72.5 1.07.76s.72.54 1.06.83c.74.61 1.44 1.22 2.13 1.88.67.64 1.32 1.3 2 2a35.59 35.59 0 019.2 26.25z" fill="url(#linear-gradient-2)"/><path id="Path_56" data-name="Path 56" d="M62.84 93v-.33C74 95 98.77 92 106.41 83.55c-.63-.71-1.28-1.37-2-2 .5-1.08.24-2.19-1-3.3-.31-.26-.64-.51-1-.76l-2.29.59c-10.83 2.74-37.35 9-48.9 7.58a17.12 17.12 0 01-2-.38l-.33.46c-.46.61-.1 1.25.92 1.87-.32.48-1.15 1.86-1.45 2.35 4.17 1.64 9.08 1.78 13.55 2.21-.05.22-.09.44-.13.67-.11.68-.19 1.39-.26 2.15a73.23 73.23 0 00-.06 9.6c.42 8.11 1.7 17.36 2.72 23.83a4.81 4.81 0 01-3.67 5.46l-.32.07a1.54 1.54 0 00.8.46c.81.14 3.37.1 4-.35 2.13-1 2.44-3.18 2-5.22-3-14.32-4.43-29.69-4.23-36.2z" fill="#c9c9c9"/><path id="Path_57" data-name="Path 57" d="M60.61 133.9a4.52 4.52 0 01-4-1 15.7 15.7 0 01-3.63-4.2c-6.13-10.21-.86-30.37 1.49-38 .58-1.89 1-3 1-3l1-.6c2.78-1.56 10-5.2 7 1-.1.21-.22.43-.35.68a10.47 10.47 0 00-1 3c-1.76 8.43.55 26.11 2.22 36.55a4.81 4.81 0 01-3.73 5.57z" fill="url(#linear-gradient-3)"/><path id="Path_58" data-name="Path 58" class="cls-6" d="M60.61 133.9c-5.92-18.16-.73-46.38-.73-46.38l3.57.66c-.11.23-.24.47-.38.74-3.43 6.24-.68 27.61 1.22 39.52a4.82 4.82 0 01-3.68 5.46z"/><path id="Path_59" data-name="Path 59" d="M63.1 88.86v.06a10.41 10.41 0 00-1 3 23.35 23.35 0 01-7.84-.5c.58-1.89 1.17-3.63 1.17-3.63l1-.6z" fill="#5736bf"/><path id="Path_60" data-name="Path 60" d="M104.44 81.53c-2.18 4.8-19.19 8.86-30.7 9.43-10.3.52-20.56-1.31-23.88-3.37-1-.62-1.38-1.27-.92-1.88l.32-.45c.18-.23.35-.46.53-.68s.41-.54.63-.79c.43-.54.87-1.06 1.34-1.57.24-.26.48-.53.73-.78.06-.06.12-.13.18-.18.27-.28.54-.55.82-.82l.13-.13.73-.68a2.09 2.09 0 00.22-.2.94.94 0 00.1-.1c.28-.24.55-.48.84-.71s.82-.67 1.24-1c.14-.11.27-.22.42-.32l.11-.09c.36-.27.73-.53 1.1-.78a37.41 37.41 0 0118.68-6.5c.8 0 1.62-.08 2.44-.08s1.63 0 2.46.06 1.57.12 2.34.22H84.95l.7.1h.3l1.42.27c.49.1 1 .21 1.49.34s1 .25 1.48.4.73.21 1.11.35c.2.06.41.12.62.2a.49.49 0 01.17.06c.38.13.75.27 1.12.42l.61.24c.5.19 1 .41 1.46.64s.81.37 1.21.58L97 74c.3.15.6.31.89.48a2.82 2.82 0 01.38.21l.66.38c.33.19.65.39 1 .6s.83.53 1.24.82l1.2.86.13.11c.33.25.66.5 1 .76 1.18 1.12 1.43 2.23.94 3.31z" fill="url(#linear-gradient-4)"/><path id="Path_61" data-name="Path 61" class="cls-6" d="M96.68 73.84c-3.18 4.53-12.9 10.74-19.51 11.79-7 1.12-17.51-4-22.6-6.21a.48.48 0 00.11-.09l.83-.71c.4-.35.83-.67 1.25-1a4.71 4.71 0 01.42-.33c-.2-.14-.42-.28-.62-.43l1.83-.44 26.22-6.26 9.81-2.33-2.25 2.7c-.77 1.27 1.67.55.7 1.68.5.19 2.1.84 2.58 1.07s.84.36 1.23.56z"/><g id="Group_59" data-name="Group 59"><path id="Path_62" data-name="Path 62" class="cls-9" d="M83.41 98.81a2.9 2.9 0 01-.2.87 3.63 3.63 0 01-1.8 2 3.58 3.58 0 01-3.13 0 3.54 3.54 0 01-1.69-1.68 3.6 3.6 0 016.47-3.18c0 .09.09.18.12.27a3.56 3.56 0 01.23 1.72z"/><path id="Path_63" data-name="Path 63" class="cls-10" d="M83.42 98.81a3.24 3.24 0 01-.2.87 3.63 3.63 0 01-1.8 2 3.55 3.55 0 01-3.13 0 3.4 3.4 0 01-1.41-1.19 3.62 3.62 0 00.43.24 3.57 3.57 0 003.14 0 3.63 3.63 0 001.8-2 2.88 2.88 0 00.19-.87 3.45 3.45 0 00-.22-1.68c0-.09-.08-.18-.12-.27a3.24 3.24 0 00-.28-.47 3.6 3.6 0 011.26 1.42c0 .09.09.18.11.27a3.58 3.58 0 01.23 1.68z"/></g><g id="Group_60" data-name="Group 60"><path id="Path_64" data-name="Path 64" class="cls-9" d="M83.45 110a3.77 3.77 0 01-.21.94 3.92 3.92 0 01-1.93 2.15 3.8 3.8 0 01-3.37 0 3.73 3.73 0 01-1.81-1.78 3.87 3.87 0 017-3.41l.12.29a3.82 3.82 0 01.2 1.81z"/><path id="Path_65" data-name="Path 65" class="cls-10" d="M83.45 110a3.39 3.39 0 01-.22.94 3.85 3.85 0 01-1.93 2.15 3.78 3.78 0 01-3.36 0 3.6 3.6 0 01-1.52-1.27 3 3 0 00.47.25 3.78 3.78 0 003.36 0 3.85 3.85 0 001.93-2.07 3.05 3.05 0 00.21-.94 3.69 3.69 0 00-.24-1.8c0-.1-.09-.19-.12-.29a4.14 4.14 0 00-.3-.5 3.79 3.79 0 011.34 1.52c0 .1.1.19.13.29a4 4 0 01.25 1.72z"/></g><g id="Group_61" data-name="Group 61"><path id="Path_66" data-name="Path 66" class="cls-9" d="M83.12 122.67a2.87 2.87 0 01-.18.82 3.43 3.43 0 01-1.69 1.88 3.35 3.35 0 01-2.93 0 3.28 3.28 0 01-1.58-1.56 3.38 3.38 0 016.06-3 2.77 2.77 0 01.1.26 3.25 3.25 0 01.22 1.6z"/><path id="Path_67" data-name="Path 67" class="cls-10" d="M83.12 122.67a2.58 2.58 0 01-.19.82 3.41 3.41 0 01-1.68 1.88 3.35 3.35 0 01-2.93 0 3.27 3.27 0 01-1.32-1.1c.13.08.27.15.41.22a3.37 3.37 0 002.94 0A3.41 3.41 0 0082 122.6a2.87 2.87 0 00.18-.82 3.25 3.25 0 00-.21-1.57c0-.09-.08-.17-.11-.26a2.82 2.82 0 00-.26-.44 3.34 3.34 0 011.17 1.33 1.45 1.45 0 01.11.26 3.38 3.38 0 01.24 1.57z"/></g><path id="Path_68" data-name="Path 68" d="M99.46 62.9A28.12 28.12 0 0194 72.67a27.73 27.73 0 01-36.8 4.66l-.61-.44-.22-.16c-.32-.23-.61-.46-.9-.7a27.72 27.72 0 1144-13.13z" fill="url(#linear-gradient-5)"/><circle id="Ellipse_70" data-name="Ellipse 70" class="cls-10" cx="60.56" cy="61.91" r="3.27"/><circle id="Ellipse_71" data-name="Ellipse 71" class="cls-10" cx="75.02" cy="64.12" r="3.27"/><path id="Path_69" data-name="Path 69" d="M65.4 77.91a1.51 1.51 0 01-2 .49 1.42 1.42 0 01-.89-1.4l.2-3.12.44-7a2 2 0 012.23-1.7 2.85 2.85 0 01.48.13l1.78.57 1.78.57a2.11 2.11 0 01.74.39 1.86 1.86 0 01.57 2.45l-3.69 6z" fill="url(#linear-gradient-6)"/><path id="Path_70" data-name="Path 70" d="M57.73 151.36v.17a1.92 1.92 0 01-2.3 1.47l-19.25-4.09a1.93 1.93 0 00-1 .07l-23.52 8.39a1.9 1.9 0 01-1.66-.17l-9.08-5.51a1.91 1.91 0 01-.64-2.63l.09-.14a1.92 1.92 0 012.63-.65l7.43 4.53a1.93 1.93 0 001.64.17l9.21-3.29a1.93 1.93 0 00.5-3.35l-7.5-5.51a1.75 1.75 0 01-.56-.65l-3.22-6a1.91 1.91 0 01.8-2.58l.15-.09a1.92 1.92 0 012.59.8l2.78 5.24a2 2 0 00.56.65l11 8.1a1.93 1.93 0 001.78.27l4.68-1.67a1.85 1.85 0 011-.07l20.36 4.32a1.92 1.92 0 011.53 2.22z" fill="url(#linear-gradient-7)"/><circle cx="13.73" cy="45.3" r="2.38" fill="url(#linear-gradient-8)"/><circle cx="140.56" cy="113" r="2.22" fill="url(#linear-gradient-9)"/><circle cx="62.09" cy="15.31" r="3.28" fill="url(#linear-gradient-10)"/><circle cx="136.52" cy="54.31" r="2.3" fill="url(#linear-gradient-11)"/><circle cx="101.76" cy="2.87" r="2.87" fill="url(#linear-gradient-12)"/><circle cx="33.09" cy="119.51" r="2.87" fill="url(#linear-gradient-13)"/><circle cx="3.28" cy="106.83" r="2.04" fill="url(#linear-gradient-14)"/><path id="Path_72" data-name="Path 72" class="cls-21" d="M120.92 38.27l-3.28 1.38a.33.33 0 01-.29 0l-1.84-1.21a.32.32 0 01-.14-.27v-2a.33.33 0 01.16-.26l2.3-1.24a.32.32 0 01.3 0l3 1.69.23-.4-2.36-1.34a.3.3 0 01-.11-.41.28.28 0 01.12-.12l2.17-1.17-.22-.4-2.21 1.19a.31.31 0 01-.42-.12.32.32 0 010-.19l.34-2.58-.45-.06-.45 3.35a.32.32 0 01-.16.23l-2.27 1.22a.32.32 0 01-.3 0l-1.49-.9a.31.31 0 01-.15-.28l.06-2.4a.27.27 0 01.14-.24l2.71-1.85-.26-.38-2.07 1.41a.31.31 0 01-.43-.08.23.23 0 01-.05-.18l.07-2.66h-.46l-.07 2.7a.32.32 0 01-.32.3.3.3 0 01-.16 0l-2.2-1.49-.26.38 2.77 1.87a.31.31 0 01.13.24l-.07 2.42a.3.3 0 01-.15.26l-1.51.86a.32.32 0 01-.3 0l-2.28-1.24a.33.33 0 01-.16-.26l-.13-3.87h-.46l.11 3.24a.3.3 0 01-.29.32.29.29 0 01-.16 0l-2.6-1.44-.22.4 2.22 1.17a.31.31 0 01.12.42.25.25 0 01-.14.13l-2.47 1.13.19.42 3.19-1.45a.31.31 0 01.28 0l2.45 1.33a.3.3 0 01.16.27l-.07 1.89a.31.31 0 01-.17.27l-2.45 1.26a.34.34 0 01-.28 0l-3.18-1.58-.2.41 2.47 1.23a.31.31 0 01.1.41.32.32 0 01-.14.14l-2.19 1.12.21.41 2.4-1.23a.3.3 0 01.41.13.28.28 0 010 .15l-.08 3h.46l.09-3.61a.3.3 0 01.17-.26l2.36-1.22a.32.32 0 01.3 0l1.53.93a.3.3 0 01.14.27l-.08 2a.3.3 0 01-.11.23l-2.76 2.31.3.35 2-1.69a.33.33 0 01.44 0 .4.4 0 01.07.21l-.12 2.94h.46l.12-3a.3.3 0 01.32-.29.27.27 0 01.19.08l2.17 2 .31-.34-2.84-2.67a.31.31 0 01-.1-.24l.08-2a.34.34 0 01.16-.27l1.6-.83a.31.31 0 01.31 0l1.94 1.38a.31.31 0 01.14.23l.3 3.29h.45l-.22-2.44a.3.3 0 01.28-.33.29.29 0 01.2.05l2.12 1.4.26-.39-2.22-1.45a.32.32 0 01-.09-.43.26.26 0 01.14-.11l2.61-1.11zm-6.17.12l-1.6.83a.29.29 0 01-.3 0l-1.53-.93a.33.33 0 01-.15-.27v-1.8a.29.29 0 01.16-.26l1.58-.9a.29.29 0 01.31 0l1.55.93a.33.33 0 01.15.27v1.87a.31.31 0 01-.17.26z"/><path id="Path_72-2" data-name="Path 72" class="cls-21" d="M126.37 132.1l-2.62 1.11a.24.24 0 01-.23 0l-1.48-1a.24.24 0 01-.11-.21v-1.57a.28.28 0 01.13-.21l1.84-1a.25.25 0 01.24 0l2.38 1.36.18-.32-1.91-1.09a.24.24 0 01-.09-.33.17.17 0 01.1-.1l1.73-.94-.18-.32-1.76 1a.26.26 0 01-.34-.1.4.4 0 010-.15l.28-2.06-.36-.05-.36 2.68a.23.23 0 01-.13.18l-1.81 1a.25.25 0 01-.24 0l-1.2-.72a.27.27 0 01-.12-.22l.05-1.92a.31.31 0 01.11-.2l2.17-1.48-.21-.3-1.66 1.13a.24.24 0 01-.34-.06.28.28 0 010-.15l.06-2.13h-.37L120 126a.23.23 0 01-.25.24.2.2 0 01-.13 0l-1.76-1.19-.21.31 2.22 1.49a.26.26 0 01.11.21L120 129a.24.24 0 01-.12.2l-1.21.69a.25.25 0 01-.24 0l-1.82-1a.23.23 0 01-.13-.21l-.11-3.1H116l.09 2.59a.24.24 0 01-.23.25.28.28 0 01-.13 0l-2-1.1-.17.32 1.73.94a.25.25 0 01.1.33.25.25 0 01-.12.11l-2 .9.15.34 2.55-1.17a.28.28 0 01.22 0l2 1.07a.22.22 0 01.13.22v1.49a.23.23 0 01-.13.21l-2 1a.24.24 0 01-.23 0l-2.54-1.26-.16.33 2 1a.25.25 0 01.11.33.29.29 0 01-.11.11l-1.76.9.17.33 1.92-1a.25.25 0 01.33.11.27.27 0 010 .12l-.06 2.42h.36l.08-2.88a.26.26 0 01.13-.22l1.89-1a.25.25 0 01.24 0l1.22.75a.24.24 0 01.12.22l-.06 1.61a.28.28 0 01-.09.17l-2.28 1.88.24.28 1.61-1.35a.23.23 0 01.34 0 .25.25 0 01.06.17l-.09 2.35h.37l.1-2.37a.24.24 0 01.25-.23.23.23 0 01.16.06l1.74 1.63.25-.26-2.28-2.14a.27.27 0 01-.08-.19l.06-1.62a.26.26 0 01.14-.21l1.27-.67a.27.27 0 01.25 0l1.48 1a.21.21 0 01.11.18l.24 2.63h.37l-.18-1.95a.24.24 0 01.22-.27.29.29 0 01.16 0l1.7 1.12.2-.31-1.77-1.16a.24.24 0 01-.07-.34.2.2 0 01.11-.09l2.09-.89zm-4.94.1l-1.28.67a.23.23 0 01-.24 0l-1.22-.75a.24.24 0 01-.12-.21v-1.44a.23.23 0 01.13-.21l1.26-.72a.28.28 0 01.25 0l1.24.74a.25.25 0 01.12.22v1.49a.23.23 0 01-.14.21z"/><path id="Path_72-3" data-name="Path 72" class="cls-21" d="M32.55 15.56l-3.74 1.58a.38.38 0 01-.33 0l-2.1-1.38a.37.37 0 01-.16-.31l.06-2.23a.34.34 0 01.18-.3l2.63-1.41a.34.34 0 01.34 0l3.4 1.93.26-.46-2.74-1.58a.37.37 0 01-.13-.48.38.38 0 01.14-.14l2.47-1.33-.25-.45-2.52 1.37a.35.35 0 01-.51-.36l.39-2.94-.52-.07-.51 3.82a.39.39 0 01-.18.27l-2.59 1.39a.34.34 0 01-.34 0l-1.71-1a.34.34 0 01-.17-.31L24 8.38a.37.37 0 01.16-.28L27.24 6 27 5.56l-2.42 1.61a.35.35 0 01-.49-.09.36.36 0 01-.06-.2l.08-3h-.52l-.08 3.08a.35.35 0 01-.36.34.33.33 0 01-.15-.11l-2.51-1.7-.29.44 3.16 2.13a.33.33 0 01.15.3l-.07 2.76a.35.35 0 01-.17.3l-1.72 1a.3.3 0 01-.34 0L18.56 11a.34.34 0 01-.18-.3l-.15-4.41h-.53l.13 3.7a.35.35 0 01-.34.37.41.41 0 01-.18 0l-2.89-1.63-.25.46 2.47 1.34a.36.36 0 01.14.48.33.33 0 01-.16.15l-2.82 1.29.22.47 3.64-1.66a.37.37 0 01.31 0l2.8 1.52a.33.33 0 01.18.32l-.05 2.13a.35.35 0 01-.19.3L17.9 17a.29.29 0 01-.31 0L14 15.18l-.23.47 2.82 1.4a.36.36 0 01.16.47.41.41 0 01-.16.16L14.05 19l.24.47L17 18a.34.34 0 01.47.16.32.32 0 010 .16l-.09 3.45h.52l.11-4.12a.36.36 0 01.19-.31L21 16a.34.34 0 01.34 0l1.74 1.06a.37.37 0 01.17.32l-.09 2.29a.38.38 0 01-.13.26l-3.15 2.64.34.4 2.3-1.92a.34.34 0 01.49 0 .31.31 0 01.08.24l-.13 3.35h.52l.14-3.37A.35.35 0 0124 21a.33.33 0 01.23.1l2.47 2.32.3-.42-3.24-3a.35.35 0 01-.11-.27l.09-2.32a.33.33 0 01.19-.29l1.82-.95a.34.34 0 01.35 0l2.12 1.39a.35.35 0 01.15.26l.35 3.76h.52L29 18.75a.35.35 0 01.32-.39.4.4 0 01.22.06L32 20l.29-.44-2.53-1.66a.35.35 0 01-.1-.49.37.37 0 01.15-.13l3-1.26zm-7 .13l-1.83 1a.37.37 0 01-.34 0l-1.75-1.07a.34.34 0 01-.16-.31l.05-2a.35.35 0 01.18-.3l1.8-1a.38.38 0 01.36 0l1.73.99a.37.37 0 01.17.31l-.06 2.13a.34.34 0 01-.19.25z"/><path id="Path_72-4" data-name="Path 72" class="cls-21" d="M29.36 78.59L26.08 80a.3.3 0 01-.29 0L24 78.74a.31.31 0 01-.14-.26l.05-2a.33.33 0 01.16-.26L26.32 75a.32.32 0 01.3 0l3 1.69.23-.4L27.43 75a.32.32 0 01-.11-.42.34.34 0 01.12-.12l2.17-1.17-.22-.4L27.18 74a.31.31 0 01-.42-.13.31.31 0 010-.19l.34-2.57-.45-.06-.45 3.35a.34.34 0 01-.16.23l-2.27 1.22a.29.29 0 01-.3 0L22 75a.31.31 0 01-.15-.27l.06-2.4a.32.32 0 01.14-.25l2.71-1.84-.26-.38-2.07 1.41a.32.32 0 01-.43-.08.29.29 0 01-.1-.19l.1-2.67h-.46l-.1 2.67a.3.3 0 01-.32.29.24.24 0 01-.16 0l-2.2-1.48-.26.38L21.27 72a.32.32 0 01.14.27l-.07 2.42a.31.31 0 01-.15.26l-1.51.85a.27.27 0 01-.3 0l-2.28-1.22a.33.33 0 01-.16-.26l-.13-3.87h-.46l.11 3.24a.3.3 0 01-.29.32A.29.29 0 0116 74l-2.54-1.38-.22.4 2.17 1.18a.3.3 0 01.12.41.32.32 0 01-.14.14l-2.47 1.13.19.42 3.19-1.46a.31.31 0 01.28 0L19 76.17a.32.32 0 01.16.28l-.05 1.87a.3.3 0 01-.17.26l-2.45 1.26a.28.28 0 01-.28 0l-3.18-1.57-.2.41 2.47 1.22a.31.31 0 010 .55l-2.19 1.13.21.41 2.4-1.24a.29.29 0 01.41.14.23.23 0 010 .14l-.08 3h.46l.09-3.61a.31.31 0 01.17-.27L19.21 79a.32.32 0 01.3 0l1.53.93a.3.3 0 01.14.28l-.08 2a.29.29 0 01-.11.22l-2.75 2.32.29.35 2-1.69a.32.32 0 01.44 0 .38.38 0 01.07.21l-.12 2.94h.46l.12-3a.31.31 0 01.32-.3.27.27 0 01.19.08l2.17 2 .32-.33-2.85-2.68a.29.29 0 01-.1-.23l.08-2a.31.31 0 01.17-.1l1.6-.83a.29.29 0 01.31 0l1.85 1.22a.3.3 0 01.14.23l.3 3.29h.46l-.23-2.44a.32.32 0 01.28-.34.35.35 0 01.2 0l2.13 1.4.25-.38-2.22-1.46a.32.32 0 01-.09-.43.26.26 0 01.14-.11L29.54 79zm-6.17.12l-1.6.84a.32.32 0 01-.3 0l-1.53-.93a.33.33 0 01-.15-.27l.05-1.8a.29.29 0 01.16-.26l1.58-.9a.29.29 0 01.31 0l1.55.93a.32.32 0 01.15.27l-.05 1.86a.3.3 0 01-.17.26z"/></g></g></svg>`;
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

//put focus back onto search after search
//use innerHTMl to generate dynamic SVGs, add them as symbols?


//give the forecast cards a max and min width similar to the container
//don't let them become too thin/tall