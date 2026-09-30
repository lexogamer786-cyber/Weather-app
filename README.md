# 🌦️ LEXO SkyCast --- India Weather

A modern, responsive weather web application built with **HTML, CSS and
JavaScript**.

LEXO SkyCast lets users search Indian cities, towns and villages and
view current weather, hourly forecasts, a 7-day forecast, sunrise/sunset
information, and weather-specific visuals.

## ✨ Features

-   🔎 **Indian Location Search**
    -   Search cities, towns and villages across India.
    -   Live suggestions while typing.
    -   Fuzzy matching for small spelling mistakes.
    -   Relevant results are ranked automatically.
    -   Priority support for Armoor, Nizamabad and Hyderabad.
-   📍 **My Location**
    -   Uses browser Geolocation when the user presses the My Location
        button.
    -   Loads weather for the detected coordinates after permission is
        granted.
-   🌡️ **Current Weather**
    -   Temperature
    -   Feels-like temperature
    -   Weather condition
    -   Humidity
    -   Wind speed
    -   Precipitation
    -   Visibility
    -   Wind direction
    -   Atmospheric pressure
-   🕐 **Hourly Forecast**
    -   Upcoming 24 hours with time, weather icon and temperature.
-   📅 **7-Day Forecast**
    -   Daily weather condition.
    -   Minimum and maximum temperature.
-   🌅 **Sun & Daylight**
    -   Sunrise
    -   Sunset
-   🌡️ **Temperature Unit Toggle**
    -   Celsius (°C)
    -   Fahrenheit (°F)
-   🖼️ **Dynamic Weather Card Backgrounds**
    -   Clear → `weather-bg.png`
    -   Rain / Storm → `rain-bg.png`
    -   Snow → `snow-bg.png`
    -   Cloudy / Fog → `cloudy-bg.png`
    -   Night → `night-bg.png`
-   🌄 **Weather-Based Page Background**
    -   Uses `overall-bg.png` as the base background.
    -   Weather states can apply different visual overlays.
-   📱 **Responsive Design**
    -   Desktop, tablet and mobile layouts.
-   ✨ **Modern UI**
    -   Glassmorphism cards
    -   Smooth transitions
    -   Animated weather icon
    -   Loading state
    -   Error messages
    -   Weather-specific styling

## 🛠️ Technologies

-   HTML5
-   CSS3
-   Vanilla JavaScript
-   Open-Meteo Weather API
-   Open-Meteo Geocoding API
-   Browser Geolocation API
-   Google Fonts --- Inter & Space Grotesk

## 🌐 APIs

### Open-Meteo Weather API

``` text
https://api.open-meteo.com/v1/forecast
```

Used for current, hourly and daily weather data.

### Open-Meteo Geocoding API

``` text
https://geocoding-api.open-meteo.com/v1/search
```

Used for Indian location search.

## 📂 Project Structure

``` text
LEXO-SkyCast/
│
├── index.html
├── style.css
├── script.js
│
├── overall-bg.png
├── weather-bg.png
├── rain-bg.png
├── snow-bg.png
├── cloudy-bg.png
└── night-bg.png
```

## 📄 Files

### `index.html`

Contains the application structure, including the search interface,
current weather card, weather details, hourly forecast, 7-day forecast,
and sunrise/sunset section.

### `style.css`

Controls the complete visual design, glassmorphism cards, backgrounds,
responsive layouts, buttons, forecast cards, animations and transitions.

### `script.js`

Handles location search, API requests, weather rendering, browser
geolocation, temperature conversion, forecasts, sunrise/sunset and
dynamic weather backgrounds.

## 🚀 How to Run

1.  Download or clone the repository.
2.  Keep the HTML, CSS, JavaScript and image files in the same project
    folder.
3.  Make sure the image filenames remain exactly the same.
4.  Open `index.html` in a modern browser.

### GitHub Pages

1.  Upload the project to a GitHub repository.
2.  Keep all referenced image files in the repository.
3.  Enable GitHub Pages in the repository settings.
4.  Open the generated Pages URL.

## 🎨 Dynamic Weather Images

The main weather card uses one image element and JavaScript changes its
source according to the current weather.

  Weather State            Image
  ------------------------ ------------------
  Clear                    `weather-bg.png`
  Rain / Showers / Storm   `rain-bg.png`
  Snow                     `snow-bg.png`
  Cloudy / Fog             `cloudy-bg.png`
  Night                    `night-bg.png`

## 🔍 Smart Search

The search system uses:

-   Text normalization
-   Exact matching
-   Prefix matching
-   Partial matching
-   Levenshtein fuzzy matching
-   India-specific filtering
-   State and district matching
-   Location proximity scoring when browser location is available
-   Duplicate removal
-   Typo fallback search

## 📊 Weather Data

### Current Weather

-   Temperature
-   Relative humidity
-   Apparent temperature
-   Precipitation
-   Weather code
-   Wind speed
-   Wind direction
-   Visibility
-   Pressure
-   Day/night state

### Hourly Forecast

-   Temperature
-   Weather code
-   Relative humidity
-   Precipitation probability
-   Wind speed

### Daily Forecast

-   Weather code
-   Maximum temperature
-   Minimum temperature
-   Sunrise
-   Sunset

## 📱 Responsive Design

On smaller screens:

-   Weather cards stack vertically.
-   Search controls wrap.
-   Daily forecast layout becomes simpler.
-   Typography and spacing adapt to smaller displays.

## 🔐 Location Permission

LEXO SkyCast does not automatically request GPS permission when the page
opens. The user can press **📍 My Location** to request browser location
access.

If permission is unavailable, the app shows an error and the user can
search manually.

## ⚠️ Notes

-   Live weather and search require an internet connection.
-   Weather availability depends on the Open-Meteo service.
-   Browser geolocation requires user permission.
-   Keep image filenames exactly as referenced by the project.
-   The project currently focuses on Indian locations.

## 👨‍💻 Author

**Sofiyan**

**Online identity:** LEXO GAMER

**Project:** LEXO SkyCast

## 📄 License

This is a personal learning/development project by Sofiyan.

Weather data is provided through **Open-Meteo**.

------------------------------------------------------------------------

⭐ If you find this project useful, consider giving the repository a
star.
