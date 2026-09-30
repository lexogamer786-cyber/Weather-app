
/* =====================================================
   CONFIG
===================================================== */

const API =
    "https://api.open-meteo.com/v1/forecast";

const GEO_API =
    "https://geocoding-api.open-meteo.com/v1/search";


/* =====================================================
   STATE
===================================================== */

let unit = "celsius";

let currentLocation = null;

let userLocation = null;

let searchTimer = null;

let searchController = null;

let suggestionPlaces = [];


  /* =====================================================
   PRIORITY TELANGANA LOCATIONS
===================================================== */

const priorityLocations = [

    {
        name: "Armoor",
        admin1: "Telangana",
        admin2: "Nizamabad",
        country: "India",
        country_code: "IN",
        latitude: 18.7895,
        longitude: 78.2890,
        timezone: "Asia/Kolkata"
    },

    {
        name: "Nizamabad",
        admin1: "Telangana",
        admin2: "Nizamabad",
        country: "India",
        country_code: "IN",
        latitude: 18.6725,
        longitude: 78.0941,
        timezone: "Asia/Kolkata"
    },

    {
        name: "Hyderabad",
        admin1: "Telangana",
        admin2: "Hyderabad",
        country: "India",
        country_code: "IN",
        latitude: 17.3850,
        longitude: 78.4867,
        timezone: "Asia/Kolkata"
    }

];


/* =====================================================
   ELEMENTS
===================================================== */

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const locationBtn =
    document.getElementById("locationBtn");

const unitBtn =
    document.getElementById("unitBtn");

const suggestionsBox =
    document.getElementById("suggestions");

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("error");

const weatherApp =
    document.getElementById("weatherApp");


/* =====================================================
   WEATHER INFO
===================================================== */

function weatherInfo(code, isDay = true){

    const map = {

        0:["Clear Sky","☀️","clear"],

        1:["Mainly Clear","🌤️","clear"],

        2:["Partly Cloudy","⛅","cloudy"],

        3:["Overcast","☁️","cloudy"],

        45:["Fog","🌫️","cloudy"],
        48:["Fog","🌫️","cloudy"],

        51:["Light Drizzle","🌦️","rain"],
        53:["Drizzle","🌦️","rain"],
        55:["Heavy Drizzle","🌧️","rain"],

        56:["Freezing Drizzle","🌧️","rain"],
        57:["Freezing Drizzle","🌧️","rain"],

        61:["Light Rain","🌦️","rain"],
        63:["Moderate Rain","🌧️","rain"],
        65:["Heavy Rain","🌧️","rain"],

        66:["Freezing Rain","🌧️","rain"],
        67:["Heavy Freezing Rain","🌧️","rain"],

        71:["Light Snow","🌨️","cloudy"],
        73:["Snow","❄️","cloudy"],
        75:["Heavy Snow","❄️","cloudy"],

        77:["Snow Grains","🌨️","cloudy"],

        80:["Light Showers","🌦️","rain"],
        81:["Showers","🌧️","rain"],
        82:["Heavy Showers","⛈️","storm"],

        85:["Snow Showers","🌨️","cloudy"],
        86:["Heavy Snow Showers","❄️","cloudy"],

        95:["Thunderstorm","⛈️","storm"],
        96:["Thunderstorm","⛈️","storm"],
        99:["Heavy Thunderstorm","⛈️","storm"]

    };

    const result =
        map[code] ||
        ["Unknown","🌡️","cloudy"];


    if(!isDay){

        if(code === 0)
            return [
                "Clear Night",
                "🌙",
                "night"
            ];

        if(code === 1)
            return [
                "Mostly Clear Night",
                "🌙",
                "night"
            ];

        if(code === 2)
            return [
                "Partly Cloudy Night",
                "☁️",
                "night"
            ];
    }

    return result;
}


/* =====================================================
   UI HELPERS
===================================================== */

function showLoading(){

    loading.classList.add("show");

    weatherApp.style.display =
        "none";

    errorBox.classList.remove(
        "show"
    );
}

function hideLoading(){

    loading.classList.remove(
        "show"
    );
}

function showError(message){

    hideLoading();

    errorBox.textContent =
        message;

    errorBox.classList.add(
        "show"
    );
}

function formatTime(value){

    return new Date(value)
        .toLocaleTimeString(
            [],
            {
                hour:"numeric",
                minute:"2-digit"
            }
        );
}

function formatDay(value){

    return new Date(value)
        .toLocaleDateString(
            [],
            {
                weekday:"short"
            }
        );
}

function kmToMiles(km){

    return km * 0.621371;
}

function cToF(c){

    return (c * 9/5) + 32;
}

function temperature(value){

    return unit === "celsius"
        ? Math.round(value)
        : Math.round(cToF(value));
}

function windSpeed(value){

    return unit === "celsius"
        ? Math.round(value) + " km/h"
        : Math.round(
            kmToMiles(value)
          ) + " mph";
}

function direction(deg){

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    return directions[
        Math.round(deg / 45) % 8
    ];
}


/* =====================================================
   SEARCH HELPERS
===================================================== */

function normalizeText(text){

    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]/g,
            ""
        );
}


function levenshtein(a,b){

    const matrix = [];

    for(
        let i = 0;
        i <= b.length;
        i++
    ){

        matrix[i] = [i];
    }

    for(
        let j = 0;
        j <= a.length;
        j++
    ){

        matrix[0][j] = j;
    }

    for(
        let i = 1;
        i <= b.length;
        i++
    ){

        for(
            let j = 1;
            j <= a.length;
            j++
        ){

            if(
                b.charAt(i - 1) ===
                a.charAt(j - 1)
            ){

                matrix[i][j] =
                    matrix[i - 1][j - 1];

            }else{

                matrix[i][j] =
                    Math.min(

                        matrix[i - 1][j - 1] + 1,

                        matrix[i][j - 1] + 1,

                        matrix[i - 1][j] + 1
                    );
            }
        }
    }

    return matrix[b.length][a.length];
}


function distanceKm(
    lat1,
    lon1,
    lat2,
    lon2
){

    const R = 6371;

    const dLat =
        (lat2 - lat1)
        * Math.PI / 180;

    const dLon =
        (lon2 - lon1)
        * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

        Math.sin(dLon / 2) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


/* =====================================================
   SMART LOCATION SCORE
===================================================== */

function scorePlace(place,query){

    const q =
        normalizeText(query);

    const name =
        normalizeText(
            place.name
        );

    const admin1 =
        normalizeText(
            place.admin1
        );

    const admin2 =
        normalizeText(
            place.admin2
        );

    let score = 0;


    /* Exact match */

    if(name === q){
        score += 3000;
    }


    /* Prefix */

    if(name.startsWith(q)){
        score += 1800;
    }


    /* Contains */

    if(name.includes(q)){
        score += 700;
    }


    /* Fuzzy spelling */

    const distance =
        levenshtein(
            q,
            name
        );

    if(distance === 1){
        score += 1000;
    }
    else if(distance === 2){
        score += 650;
    }
    else if(distance === 3){
        score += 300;
    }


    /* India */

    if(
        String(place.country_code)
            .toUpperCase() === "IN"
    ){

        score += 500;
    }


    /* If user typed state/admin area */

    const queryParts =
        query
            .toLowerCase()
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);

    for(
        const part of queryParts
    ){

        const p =
            normalizeText(part);

        if(
            admin1.includes(p)
        ){

            score += 600;
        }

        if(
            admin2.includes(p)
        ){

            score += 500;
        }
    }


    /* Population = small relevance boost */

    if(place.population){

        score += Math.min(
            150,
            Math.log10(
                Number(
                    place.population
                ) + 1
            ) * 12
        );
    }


    /* Current GPS proximity */

    if(userLocation){

        const km =
            distanceKm(

                userLocation.latitude,

                userLocation.longitude,

                Number(place.latitude),

                Number(place.longitude)
            );


        /*
          Proximity is deliberately weaker
          than exact name matching.
        */

        score += Math.max(
            0,
            250 - km * 2
        );
    }


    return score;
}


/* =====================================================
   FETCH LOCATIONS
===================================================== */

async function fetchLocations(query){

    if(searchController){

        searchController.abort();
    }


      /* PRIORITY LOCAL LOCATIONS */

    const q = normalizeText(query);

    const localMatches = priorityLocations.filter(place => {

        const name = normalizeText(place.name);
        const district = normalizeText(place.admin2);
        const state = normalizeText(place.admin1);

        return (
            name.includes(q) ||
            district.includes(q) ||
            state.includes(q) ||
            q.includes(name)
        );
    });

      
    searchController =
        new AbortController();


    /*
      First search:
      Full user query
    */

    let url =
        GEO_API +
        "?name=" +
        encodeURIComponent(
            query
        ) +
        "&count=100" +
        "&language=en" +
        "&countryCode=IN" +
        "&format=json";


    let response =
        await fetch(
            url,
            {
                signal:
                    searchController.signal
            }
        );


    if(!response.ok){

        throw new Error(
            "Location search failed."
        );
    }


    let data =
        await response.json();

    let results =
        data.results || [];


    /*
      TYPO FALLBACK

      Example:

      armoor
        ↓
      arm

      delhii
        ↓
      del
    */

    if(
        results.length === 0 &&
        normalizeText(query).length >= 3
    ){

        const normalized =
            normalizeText(query);

        const prefix =
            normalized.slice(0,3);


        const fallbackUrl =
            GEO_API +
            "?name=" +
            encodeURIComponent(
                prefix
            ) +
            "&count=100" +
            "&language=en" +
            "&countryCode=IN" +
            "&format=json";


        const fallbackResponse =
            await fetch(
                fallbackUrl
            );


        if(fallbackResponse.ok){

            const fallbackData =
                await fallbackResponse.json();

            results =
                fallbackData.results || [];
        }
    }


    /*
      Remove duplicate coordinates
    */

    const unique = [];

    const seen =
        new Set();


    for(
        const place of results
    ){

        const key =
            `${place.latitude},${place.longitude}`;

        if(!seen.has(key)){

            seen.add(key);

            unique.push(place);
        }
    }


    /*
      Score and sort
    */

    /* =====================================================
   COMBINE PRIORITY + API RESULTS
===================================================== */

const combined = [
    ...localMatches,
    ...unique
];


/* Remove duplicate locations */

const finalPlaces = [];

const seenLocations = new Set();

for(const place of combined){

    const key =
        `${Number(place.latitude).toFixed(4)},${Number(place.longitude).toFixed(4)}`;

    if(!seenLocations.has(key)){

        seenLocations.add(key);

        finalPlaces.push(place);
    }
}


/* Sort API locations normally */

const scored =
    finalPlaces
        .map(place => ({

            place,

            score:
                localMatches.includes(place)
                    ? 10000
                    : scorePlace(
                        place,
                        query
                    )

        }))
        .sort(
            (a,b) =>
                b.score - a.score
        )
        .map(
            item =>
                item.place
        );


return scored.slice(0,12);
}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHTML(value){

    return String(value || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =====================================================
   SHOW SUGGESTIONS
===================================================== */

function showSuggestions(results){

    suggestionPlaces =
        results;


    if(
        !results.length
    ){

        suggestionsBox.innerHTML = `
            <div class="search-loading">
                ❌ No matching Indian location found
            </div>
        `;

        suggestionsBox.classList.add(
            "show"
        );

        return;
    }


    suggestionsBox.innerHTML =
        results.map(
            (place,index) => {

                const parts = [
                    place.admin4,
                    place.admin3,
                    place.admin2,
                    place.admin1,
                    place.country
                ].filter(Boolean);


                let distanceHTML = "";


                if(userLocation){

                    const km =
                        distanceKm(

                            userLocation.latitude,

                            userLocation.longitude,

                            Number(
                                place.latitude
                            ),

                            Number(
                                place.longitude
                            )
                        );


                    if(km < 500){

                        distanceHTML = `
                            <div class="suggestion-distance">
                                📍 ${Math.round(km)} km away
                            </div>
                        `;
                    }
                }


                return `
                    <div
                        class="suggestion"
                        data-index="${index}"
                    >

                        <div class="suggestion-icon">
                            📍
                        </div>

                        <div>

                            <div class="suggestion-title">
                                ${escapeHTML(
                                    place.name
                                )}
                            </div>

                            <div class="suggestion-meta">
                                ${escapeHTML(
                                    parts.join(", ")
                                )}
                            </div>

                            ${distanceHTML}

                        </div>

                    </div>
                `;
            }
        ).join("");


    suggestionsBox.classList.add(
        "show"
    );


    document
        .querySelectorAll(
            ".suggestion"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            item.dataset.index
                        );

                    selectLocation(
                        suggestionPlaces[
                            index
                        ]
                    );
                }
            );
        });
}


/* =====================================================
   SELECT LOCATION
===================================================== */

function selectLocation(place){

    currentLocation = {

        latitude:
            Number(place.latitude),

        longitude:
            Number(place.longitude),

        name:
            place.name,

        country:
            place.country || "India",

        timezone:
            place.timezone || "auto",

        admin1:
            place.admin1 || "",

        admin2:
            place.admin2 || ""

    };


    cityInput.value =
        place.name;


    suggestionsBox.classList.remove(
        "show"
    );


    getWeather();
}


/* =====================================================
   LIVE SEARCH
===================================================== */

cityInput.addEventListener(
    "input",
    () => {

        clearTimeout(
            searchTimer
        );


        const query =
            cityInput.value.trim();


        if(query.length < 2){

            suggestionsBox.classList.remove(
                "show"
            );

            return;
        }


        suggestionsBox.innerHTML = `
            <div class="search-loading">
                🔎 Finding locations...
            </div>
        `;

        suggestionsBox.classList.add(
            "show"
        );


        searchTimer =
            setTimeout(
                async () => {

                    try{

                        const results =
                            await fetchLocations(
                                query
                            );

                        showSuggestions(
                            results
                        );

                    }catch(error){

                        if(
                            error.name ===
                            "AbortError"
                        ){

                            return;
                        }


                        suggestionsBox.innerHTML = `
                            <div class="search-loading">
                                Unable to search locations
                            </div>
                        `;

                    }

                },
                300
            );
    }
);


/* =====================================================
   SEARCH BUTTON
===================================================== */

searchBtn.addEventListener(
    "click",
    async () => {

        const query =
            cityInput.value.trim();


        if(!query){

            showError(
                "Please enter a city, town or village."
            );

            return;
        }


        try{

            const results =
                await fetchLocations(
                    query
                );


            if(results.length){

                selectLocation(
                    results[0]
                );

            }else{

                showError(
                    "Location not found in India."
                );
            }

        }catch(error){

            if(
                error.name !==
                "AbortError"
            ){

                showError(
                    "Unable to search location."
                );
            }
        }
    }
);


/* =====================================================
   ENTER KEY
===================================================== */

cityInput.addEventListener(
    "keydown",
    event => {

        if(
            event.key ===
            "Enter"
        ){

            event.preventDefault();

            searchBtn.click();
        }
    }
);


/* =====================================================
   CLOSE SUGGESTIONS
===================================================== */

document.addEventListener(
    "click",
    event => {

        if(
            !event.target.closest(
                ".search-box"
            )
        ){

            suggestionsBox.classList.remove(
                "show"
            );
        }
    }
);


/* =====================================================
   MY LOCATION
===================================================== */

locationBtn.addEventListener(
    "click",
    () => {

        if(
            !navigator.geolocation
        ){

            showError(
                "Your browser does not support location."
            );

            return;
        }


        showLoading();


        navigator.geolocation.getCurrentPosition(

            position => {

                userLocation = {

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude

                };


                currentLocation = {

                    latitude:
                        position.coords.latitude,

                    longitude:
                        position.coords.longitude,

                    name:
                        "My Location",

                    country:
                        "India",

                    timezone:
                        "auto"

                };


                getWeather();

            },

            error => {

                showError(
                    "Location permission was not available. Search your city manually."
                );

            },

            {
                enableHighAccuracy:true,

                timeout:10000,

                maximumAge:300000
            }
        );
    }
);


/* =====================================================
   GET WEATHER
===================================================== */

async function getWeather(){

    if(!currentLocation){

        return;
    }


    showLoading();


    try{

        const {
            latitude,
            longitude
        } = currentLocation;


        const params =
            new URLSearchParams({

                latitude,
                longitude,

                current:
                    "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility,pressure_msl,is_day",

                hourly:
                    "temperature_2m,weather_code,relative_humidity_2m,precipitation_probability,wind_speed_10m",

                daily:
                    "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",

                timezone:
                    "auto",

                forecast_days:
                    "7"
            });


        const response =
            await fetch(
                API +
                "?" +
                params.toString()
            );


        if(!response.ok){

            throw new Error(
                "Weather service unavailable."
            );
        }


        const data =
            await response.json();


        renderWeather(
            data
        );


    }catch(error){

        showError(
            error.message ||
            "Unable to load weather."
        );
    }
}


/* =====================================================
   RENDER WEATHER
===================================================== */

function renderWeather(data){

    hideLoading();


    weatherApp.style.display =
        "block";


    const current =
        data.current;


    const isDay =
        Boolean(
            current.is_day
        );


    const info =
        weatherInfo(
            current.weather_code,
            isDay
        );


    /* Background */

    document.body.className =
        info[2];


/* =========================================
   DYNAMIC WEATHER CARD IMAGE
========================================= */

const weatherBackground =
    document.getElementById(
        "weatherBackground"
    );

if(weatherBackground){

    let backgroundImage =
        "weather-bg.png";


    /* NIGHT HAS HIGHEST PRIORITY */

    if(!isDay){

        backgroundImage =
            "night-bg.png";

    }

    /* SNOW */

    else if(
        [71,73,75,77,85,86]
            .includes(
                current.weather_code
            )
    ){

        backgroundImage =
            "snow-bg.png";

    }

    /* RAIN + SHOWERS + STORM */

    else if(
        [
            51,53,55,
            56,57,
            61,63,65,
            66,67,
            80,81,82,
            95,96,97,99
        ].includes(
            current.weather_code
        )
    ){

        backgroundImage =
            "rain-bg.png";

    }

    /* CLOUDY / FOG */

    else if(
        [
            2,3,45,48
        ].includes(
            current.weather_code
        )
    ){

        backgroundImage =
            "cloudy-bg.png";

    }

    /* CLEAR */

    else{

        backgroundImage =
            "weather-bg.png";

    }


    /* Smooth image change */

    weatherBackground.style.opacity = "0";


    setTimeout(() => {

        weatherBackground.src =
            backgroundImage;

        weatherBackground.onload = () => {

            weatherBackground.style.opacity =
                "1";
        };

    }, 250);

}
  

    /* Location */

    let locationText =
        currentLocation.name;


    if(
        currentLocation.admin1
    ){

        locationText +=
            ", " +
            currentLocation.admin1;
    }


    document.getElementById(
        "locationName"
    ).textContent =
        locationText;


    /* Date */

    document.getElementById(
        "currentDate"
    ).textContent =
        new Date().toLocaleString(
            [],
            {
                weekday:"long",
                month:"long",
                day:"numeric",
                hour:"numeric",
                minute:"2-digit"
            }
        );


    /* Main weather */

    document.getElementById(
        "mainIcon"
    ).textContent =
        info[1];


    document.getElementById(
        "temperature"
    ).textContent =
        temperature(
            current.temperature_2m
        );


    document.querySelector(
        ".unit"
    ).textContent =
        unit === "celsius"
            ? "°C"
            : "°F";


    document.getElementById(
        "condition"
    ).textContent =
        info[0];


    document.getElementById(
        "feels"
    ).textContent =
        "Feels like " +
        temperature(
            current.apparent_temperature
        ) +
        (
            unit === "celsius"
                ? "°C"
                : "°F"
        );


    /* Details */

    document.getElementById(
        "humidity"
    ).textContent =
        current.relative_humidity_2m +
        "%";


    document.getElementById(
        "wind"
    ).textContent =
        windSpeed(
            current.wind_speed_10m
        );


    document.getElementById(
        "precip"
    ).textContent =
        current.precipitation +
        " mm";


    document.getElementById(
        "visibility"
    ).textContent =
        current.visibility != null
            ? (
                current.visibility / 1000
              ).toFixed(1) +
              " km"
            : "--";


    document.getElementById(
        "windDirection"
    ).textContent =
        direction(
            current.wind_direction_10m
        );


    document.getElementById(
        "pressure"
    ).textContent =
        Math.round(
            current.pressure_msl
        ) +
        " hPa";


    renderHourly(
        data
    );


    renderDaily(
        data
    );


    renderSun(
        data
    );
}


/* =====================================================
   HOURLY
===================================================== */

function renderHourly(data){

    const container =
        document.getElementById(
            "hourly"
        );


    container.innerHTML = "";


    const times =
        data.hourly.time;

    const temps =
        data.hourly.temperature_2m;

    const codes =
        data.hourly.weather_code;


    const currentTime =
        Date.now();


    let shown = 0;


    for(
        let i = 0;
        i < times.length &&
        shown < 24;
        i++
    ){

        const timestamp =
            new Date(
                times[i]
            ).getTime();


        if(
            timestamp <
            currentTime
        ){

            continue;
        }


        const info =
            weatherInfo(
                codes[i],
                true
            );


        const hour =
            document.createElement(
                "div"
            );


        hour.className =
            "hour";


        if(shown === 0){

            hour.classList.add(
                "active"
            );
        }


        hour.innerHTML = `

            <div class="hour-time">
                ${shown === 0
                    ? "Now"
                    : formatTime(
                        times[i]
                    )
                }
            </div>

            <div class="hour-icon">
                ${info[1]}
            </div>

            <div class="hour-temp">
                ${temperature(
                    temps[i]
                )}°
            </div>

        `;


        container.appendChild(
            hour
        );


        shown++;
    }
}


/* =====================================================
   DAILY
===================================================== */

function renderDaily(data){

    const container =
        document.getElementById(
            "daily"
        );


    container.innerHTML = "";


    for(
        let i = 0;
        i < data.daily.time.length;
        i++
    ){

        const info =
            weatherInfo(
                data.daily.weather_code[i],
                true
            );


        const day =
            document.createElement(
                "div"
            );


        day.className =
            "day";


        day.innerHTML = `

            <div>

                <div class="day-name">
                    ${i === 0
                        ? "Today"
                        : formatDay(
                            data.daily.time[i]
                        )
                    }
                </div>

                <div class="day-condition">
                    ${info[0]}
                </div>

            </div>


            <div class="day-icon">
                ${info[1]}
            </div>


            <div class="day-temp">
                ${temperature(
                    data.daily.temperature_2m_min[i]
                )}° /
                ${temperature(
                    data.daily.temperature_2m_max[i]
                )}°
            </div>

        `;


        container.appendChild(
            day
        );
    }
}


/* =====================================================
   SUN
===================================================== */

function renderSun(data){

    document.getElementById(
        "sunrise"
    ).textContent =
        formatTime(
            data.daily.sunrise[0]
        );


    document.getElementById(
        "sunset"
    ).textContent =
        formatTime(
            data.daily.sunset[0]
        );
}


/* =====================================================
   UNIT TOGGLE
===================================================== */

unitBtn.addEventListener(
    "click",
    () => {

        unit =
            unit === "celsius"
                ? "fahrenheit"
                : "celsius";


        unitBtn.textContent =
            unit === "celsius"
                ? "°F"
                : "°C";


        if(currentLocation){

            getWeather();
        }
    }
);


/* =====================================================
   INITIAL LOCATION
===================================================== */

/*
  We DON'T automatically request GPS permission.

  User can press My Location,
  or search manually.
*/

cityInput.focus();
