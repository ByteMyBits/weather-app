
const url = `api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

fetch("https://api.github.com/emojis")
    .then(function () {
        console.log("did that work?");
    })
    .catch(function () {
        console.log("Oh dear, looks like you fucked up. Please try again.");
    });

console.log("does the app carry on though?")

//make sure to catch errors with API "hmm something went wrong, please try again "

document.querySelector("#submit-button").addEventListener("click", function (event) {
    console.log("clicked");
    event.preventDefault();
}, false);