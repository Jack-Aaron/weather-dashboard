const searchedCities = [];

$(document).ready(function () {
    const button = document.getElementById("search");
    const calls = ["weather", "forecast"];
    const apiKey = "appid=18ac44d36d8e6681e3fb54132749a6ea";

    const search = {
        click: button.addEventListener("click", function () {
            var city = document.querySelector("input").value;
            search.query(search.builder(city, calls));
        }),

        builder: function (city, calls) {
            var URLs = [];
            var nCalls = calls.length;
            var parameter = "?q=" + city + "&" + apiKey;
            for (let n = 0; n < nCalls; n++) {
                var queryURL = "https://api.openweathermap.org/data/2.5/"
                    + calls[n]
                    + parameter;
                URLs.push(queryURL);
            }
            return URLs;
        },

        query: function (URLs) {
            var responses = [];
            var nURLs = URLs.length;
            for (let n = 0; n < nURLs; n++) {
                var queryURL = URLs[n];
                fetch(queryURL)
                    .then(req => req.json())
                    .then(function (response) {
                        responses.push(response);
                        var nResponses = responses.length
                        if (nResponses === nURLs) { process.send(responses) }
                    });
            }
        }
    }

    var process = {

        send: function (data) {
            var weatherData = data[0];
            var forecastData = data[1];
            process.uv.query(process.uv.builder(weatherData.coord));
            var weather = process.render.weather(weatherData);
            var forecast = process.render.forecast(forecastData);
            var history = process.history(weatherData.name);
        },

        uv: functions = {

            builder: function (latLon) {
                var p1 = "https://api.openweathermap.org/data/2.5/uvi";
                var p2 = "?" + apiKey;
                var p3 = "&lat=" + latLon.lat + "&lon=" + latLon.lon;
                var weather = p1 + p2 + p3
                var forecast = p1 + "/forecast" + p2 + p3 + "&cnt=" + 4;
                var uvURLs = [weather, forecast];
                return uvURLs;
            },

            query: function (uvURLs) {
                var responses = [];
                var nUvURLS = uvURLs.length;
                for (let n = 0; n < nUvURLS; n++) {
                    var queryURL = uvURLs[n];
                    fetch(queryURL)
                        .then(req => req.json())
                        .then(function (response) {
                            responses.push(response);
                            var nResponses = responses.length
                            if (nResponses === nUvURLS) { process.uv.send(responses) }
                        });
                }
            },

            send: function (data) {
                var weatherUV = data[0];
                var forecastUV = data[1];
                process.render.weatherUV(weatherUV);
            }
        },


        render: functions = {

            weather: function (data) {
                document.getElementById("current").innerHTML = "";
                var cityName = document.createElement("h3");
                cityName.textContent = data.name;
                document.body.children[1].children[0].children[1].children[0].children[1].appendChild(cityName);
                var currentDate = document.createElement("h3");
                currentDate.textContent = moment().format('MMMM Do, YYYY');
                document.body.children[1].children[0].children[1].children[0].children[1].appendChild(currentDate);
                var cityTemp = document.createElement("h3");
                cityTemp.textContent = data.main.temp + " K";
                document.body.children[1].children[0].children[1].children[0].children[1].appendChild(cityTemp);
                var cityHumidity = document.createElement("h3");
                cityHumidity.textContent = data.main.humidity + "%";
                document.body.children[1].children[0].children[1].children[0].children[1].appendChild(cityHumidity);
                var cityWindSpeed = document.createElement("h3");
                cityWindSpeed.textContent = data.wind.speed + "m/s";
                document.body.children[1].children[0].children[1].children[0].children[1].appendChild(cityWindSpeed);
            },

            weatherUV: function (data) {
                var cityUV = document.createElement("h3");
                cityUV.setAttribute("class", "UV");
                var currentUV = data.value;
                cityUV.textContent = currentUV;

                if (currentUV <= 3) { cityUV.setAttribute("style", "background-color:#299501"); }
                if (3 <= currentUV < 6) { cityUV.setAttribute("style", "background-color:#F7E401"); }
                if (6 <= currentUV < 8) { cityUV.setAttribute("style", "background-color:#F95901"); }
                if (8 <= currentUV < 11) { cityUV.setAttribute("style", "background-color:#D90011"); }
                if (currentUV >= 11) { cityUV.setAttribute("style", "background-color:#6C49CB"); }

                document.body.children[1].children[0].children[1].children[0].children[1].appendChild(cityUV);
            },

            forecast: function (data) {
                for (let i = 0; i < 5; i++) {
                    document.getElementById(`day${i + 1}`).innerHTML = "";
                    const currentDate = document.createElement("h6");
                    currentDate.textContent = moment(data.list[3 + (i * 8)].dt_txt).format('MMMM Do, YYYY');
                    document.body.children[1].children[1].children[1].children[0].children[1].children[0].children[i].appendChild(currentDate);
                    const weatherIcon = document.createElement("img");
                    weatherIcon.src = `https://openweathermap.org/img/wn/${data.list[3 + (i * 8)].weather[0].icon}.png`;
                    // weatherIcon.style = 'position:absolute;margin:0.5em 0 0 2em;';
                    // weatherIcon.class = 'clearfix';
                    document.body.children[1].children[1].children[1].children[0].children[1].children[0].children[i].appendChild(weatherIcon);
                    const forecastTemp = document.createElement("h6");
                    forecastTemp.textContent = data.list[3 + (i * 8)].main.temp;
                    document.body.children[1].children[1].children[1].children[0].children[1].children[0].children[i].appendChild(forecastTemp);
                    const forecastHumidity = document.createElement("h6");
                    forecastHumidity.textContent = data.list[3 + (i * 8)].main.humidity;
                    document.body.children[1].children[1].children[1].children[0].children[1].children[0].children[i].appendChild(forecastHumidity);
                }
            }
        },

        history: function (name) {


            for (let i = 0; i <= searchedCities.length; i++) {
                if (searchedCities.includes(name) === false) {
                    searchedCities.push(name);
                    let historyButton = document.createElement("button");
                    historyButton.textContent = name;
                    historyButton.id = (`historyButton${name}`);
                    document.body.children[1].children[1].children[0].children[0].children[1].children[1].appendChild(historyButton);
                    historyButton.addEventListener("click", function () {
                        var historyButton = document.getElementById('historyButton');
                        search.query(search.builder(name, calls));
                    })
                }
            }
        }
    }
}) 