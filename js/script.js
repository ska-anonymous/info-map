let map, markerCapitalGroup, markerNeighbourGroup = L.markerClusterGroup(), markerEarthquakeGroup = L.markerClusterGroup(), position, marker, geojsonFeature, border = null, covidCountry, activeCases, confirmCases, deaths, errorsButton;
let geonameid, currentTemp, currentWeather, weatherIcon, humidity, windspeed, tempMin, tempMax;
let population, areainsqkm, countryCodeISO2, countryCodeISO3, countryDomain, capital, countryName, countryCode, countryFlag, northPoint, southPoint, eastPoint, westPoint, continentName, currencyName, currencySymbol, currencyCode, currencyConversion, wikipediaInfo, allLanguages = [], allHolidays = [], allHolidaysDate = [];
let airportMarkers = L.markerClusterGroup();
let newsTitle, newsDescription, newsLink, newsKeyword, newsCategory, newsPublishDate;
let iconCapitalOptions = {
    iconUrl: 'images/capital.png',
    iconSize: [40, 40]
}
let customCapitalIcon = L.icon(iconCapitalOptions);
let markerCapitalOptions = {
    title: "CapitalLocation",
    clickable: true,
    icon: customCapitalIcon
}

// let iconAirportsOptions = {
//     iconUrl: 'images/airport.png',
//     iconSize: [40, 40]
// }
let iconAirportsOptions = {
    icon: 'fa-plane',
    markerColor: 'blue',
    shape: 'square',
    prefix: 'fa'
};

// let customAirportsIcon = L.icon(iconAirportsOptions);
// let markerAirportsOptions = {
//     title: "AirportLocation",
//     clickable: true,
//     icon: customAirportsIcon
// }

// let iconNeighboursOptions = {
//     iconUrl: 'images/neighbours.png',
//     iconSize: [40, 40]
// }
let iconNeighboursOptions = {
    icon: 'fa-building',
    markerColor: 'orange',
    shape: 'square',
    prefix: 'fa'
}
// let customNeighboursIcon = L.icon(iconNeighboursOptions);
// let markerNeighboursOptions = {
//     title: "NeighbourLocation",
//     clickable: true,
//     icon: customNeighboursIcon
// }

// let iconEarthquakeOptions = {
//     iconUrl: 'images/earthquake.png',
//     iconSize: [40, 40]
// }
let iconEarthquakeOptions = {
    icon: 'fa-exclamation-triangle',
    markerColor: 'red',
    shape: 'square',
    prefix: 'fa'
}
// let customEarthquakeIcon = L.icon(iconEarthquakeOptions);
// let markerEarthquakeOptions = {
//     title: "EarthquakeLocation",
//     clickable: true,
//     icon: customEarthquakeIcon
// }
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position) {
    displayMap(position.coords.latitude, position.coords.longitude);
}
getLocation();
function polystyle(feature) {
    return {
        fillColor: 'purple',
        weight: 2,
        opacity: 1,
        color: 'black',
        fillOpacity: 0.2
    };
}
function displayMap(lat, lng) {
    map = L.map('map').setView([lat, lng], 5);
    // markerCapitalGroup = L.layerGroup().addTo(map);
    let osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    // Add the satellite tile layer
    let satLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        // maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    // Create an object to hold the different base layers
    let baseLayers = {
        "OpenStreetMap": osmLayer,
        "Satellite": satLayer
    };
    let overlayLayers = {
        "Airports": airportMarkers,
        "Earthquake Locations": markerEarthquakeGroup,
        "Neighbour Countries": markerNeighbourGroup
    };

    // Add the layer control to the map
    L.control.layers(baseLayers, overlayLayers).addTo(map);

    // marker = L.marker([lat, lng], markerCapitalOptions).addTo(markerCapitalGroup);
    // map.addLayer(marker);
    $.ajax({
        url: "php/getCurrentCapital.php",
        type: 'GET',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng
        },
        success: function (result) {
            if (result['status']['name'] == 'error') {
                addErrorsToModal(result['status']['description']);
                return;
            }
            countryCode = result["data"]["sys"]["country"];
            // change the country dropdown selected option to the currentCountry
            changeCountrySelect(countryCode);
            $.ajax({
                url: "php/getAirports.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    countryCode: countryCode
                },
                success: function (result) {
                    if (result['status']['name'] == 'error') {
                        addErrorsToModal(result['status']['description']);
                        return;
                    }

                    let airports = {
                        "type": "FeatureCollection",
                        "features": []
                    };

                    // Check if response data exists and has a length greater than 0
                    if (result['data'] && result['data']['response'] && result['data']['response'].length > 0) {
                        for (let i = 0; i < 10; i++) {
                            if (result['data']['response'][i] && result['data']['response'][i]['lng'] && result['data']['response'][i]['lat'] && result['data']['response'][i]['name'] && result['data']['response'][i]['iata_code']) {
                                let airport = {
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [result['data']['response'][i]['lng'], result['data']['response'][i]['lat']]
                                    },
                                    "properties": {
                                        "name": result['data']['response'][i]['name'],
                                        "iata_code": result['data']['response'][i]['iata_code']
                                    }
                                };
                                airports.features.push(airport);
                            }
                        }

                        for (let i = 0; i < result['data']['response'].length; i++) {
                            if (result['data']['response'][i] && result['data']['response'][i]['name'] && result['data']['response'][i]['iata_code']) {
                                document.getElementById("airportsList").innerHTML += "<div class='airports'>" + result['data']['response'][i]['name'] + " - " + result['data']['response'][i]['iata_code'] + "</div>";
                            }
                        }

                        let marker = L.geoJSON(airports, {
                            pointToLayer: function (feature, latlng) {
                                return L.marker(latlng, {
                                    icon: L.ExtraMarkers.icon(iconAirportsOptions),
                                    title: "AirportLocation",
                                    clickable: true
                                });
                            },
                            onEachFeature: function (feature, layer) {
                                layer.bindPopup(feature.properties.name + " - " + feature.properties.iata_code);
                            }
                        });

                        airportMarkers.clearLayers();
                        airportMarkers.addLayer(marker);
                        map.addLayer(airportMarkers);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });

            $.ajax({
                url: "php/getNews.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    countryCode: countryCode
                },
                success: function (result) {
                    if (result['status']['name'] == 'error') {
                        // addErrorsToModal(result['status']['description']);

                        let error = result['status']['description'];
                        $('#news-modal-body').append(error);

                        return;
                    }

                    let newsModalBody = $('#news-modal-body');
                    let newsHtml = '';

                    for (let i = 0; i < 5; i++) {
                        let newsData = result['data']['results'][i];
                        let newsTitle = newsData['title'];
                        let newsLink = newsData['link'];
                        let newsImageUrl = newsData['image_url'] ? newsData['image_url'] : 'images/image-not-available.jpg';
                        // let newsDescription = newsData['description'];
                        // let newsCategory = newsData['category'][0];
                        let newsPublishDate = newsData['pubDate'];

                        newsHtml += `
                        <div class="row">
                        <div class="col-5">
                          <img src="${newsImageUrl}" alt="" class="img-fluid">
                        </div>
                        <div class="col-7">
                          <a href="${newsLink}" target="_blank">
                            <p>
                                <b>${newsTitle}</b>
                            </p>
                          </a>
                          <p><b>${newsPublishDate}</b></p>
                        </div>
                      </div>
                      <hr>
                        `;
                    }
                    $(newsModalBody).html(newsHtml);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
            $.ajax({
                url: "php/getCountryBorder.php",
                type: 'GET',
                dataType: 'json',
                data: {
                    iso: countryCode
                },
                success: function (result) {
                    if (border)
                        border.clearLayers();
                    geojsonFeature = result['data'];
                    border = L.geoJSON(geojsonFeature, { style: polystyle }).addTo(map);
                    $.ajax({
                        url: "php/getCountryInfo.php",
                        type: 'GET',
                        dataType: 'json',
                        data: {
                            country: countryCode
                        },
                        success: function (result) {
                            if (result['status']['name'] == 'error') {
                                // addErrorsToModal(result['status']['description']);

                                let error = result['status']['description'];
                                $('#infoModalLabel').html(error);
                                $('.txtCapitalName').html(error);
                                $('#txtAreaInSqKm').html(error);
                                $('#txtCapital').html(error);
                                $('#txtPopulation').html(error);
                                $('#txtCurrencyCode').html(error);

                                return;
                            }
                            if (result['data'] && result['data'].length > 0) {
                                let countryData = result['data'][0];

                                geonameid = countryData['geonameId'] !== undefined ? countryData['geonameId'] : '';
                                capital = countryData['capital'] !== undefined ? countryData['capital'] : '';
                                population = countryData['population'] !== undefined ? countryData['population'] : '';
                                areainsqkm = countryData['areaInSqKm'] !== undefined ? countryData['areaInSqKm'] : '';
                                countryName = countryData['countryName'] !== undefined ? countryData['countryName'] : '';
                                getTopSites(countryName);
                                getHotels(countryName);
                                continentName = countryData['continentName'] !== undefined ? countryData['continentName'] : '';
                                currencyCode = countryData['currencyCode'] !== undefined ? countryData['currencyCode'] : '';
                                northPoint = countryData['north'] !== undefined ? countryData['north'] : '';
                                southPoint = countryData['south'] !== undefined ? countryData['south'] : '';
                                eastPoint = countryData['east'] !== undefined ? countryData['east'] : '';
                                westPoint = countryData['west'] !== undefined ? countryData['west'] : '';
                                $('#infoModalLabel').html(countryName);
                                $('.txtCapitalName').html(capital);
                                $('#txtAreaInSqKm').html(numeral(areainsqkm).format('0,0'));
                                $('#txtCapital').html(capital);
                                $('#txtPopulation').html(numeral(population).format('0,0'));
                                $('#txtCurrencyCode').html(currencyCode);
                            }


                            // continentName = result['data'][0]['continentName'];
                            // currencyCode = result['data'][0]['currencyCode'];
                            // northPoint = result['data'][0]['north'];
                            // southPoint = result['data'][0]['south'];
                            // eastPoint = result['data'][0]['east'];
                            // westPoint = result['data'][0]['west'];
                            // $('#infoModalLabel').html(countryName);
                            // $('.txtCapitalName').html(capital);
                            // $('#txtAreaInSqKm').html(areainsqkm);
                            // $('#txtCapital').html(capital);
                            // $('#txtPopulation').html(population);
                            // $('#txtCurrencyCode').html(currencyCode);
                            $.ajax({
                                url: "php/getNeighbours.php",
                                type: 'GET',
                                dataType: "json",
                                data: {
                                    geonameId: geonameid
                                },
                                success: function (result) {
                                    if (result['status']['name'] == 'error') {
                                        addErrorsToModal(result['status']['description']);
                                        return;
                                    }

                                    let neighboursData = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    }

                                    for (let m = 0; m < result['data']['geonames'].length; m++) {
                                        let neighbour = {
                                            "type": "Feature",
                                            "geometry": {
                                                "type": "Point",
                                                "coordinates": [result['data']['geonames'][m]['lng'], result['data']['geonames'][m]['lat']]
                                            },
                                            "properties": {
                                                "name": result['data']['geonames'][m]['name'],
                                                "countryName": result['data']['geonames'][m]['countryName'],
                                                "lat": result['data']['geonames'][m]['lat'],
                                                "lon": result['data']['geonames'][m]['lng'],
                                            }
                                        }
                                        neighboursData.features.push(neighbour);
                                    }

                                    let marker = L.geoJSON(neighboursData, {
                                        pointToLayer: function (feature, latlng) {
                                            return L.marker(latlng, {
                                                icon: L.ExtraMarkers.icon(iconNeighboursOptions),
                                                title: "NeighbourLocation",
                                                clickable: true
                                            });
                                        },
                                        onEachFeature: function (feature, layer) {
                                            layer.bindPopup("Name : " + feature.properties.name + "<br>Country Name : " + feature.properties.countryName + "<br>Latitude : " + feature.properties.lat + "<br>Longitude : " + feature.properties.lon);
                                        }
                                    });

                                    markerNeighbourGroup.clearLayers();
                                    markerNeighbourGroup.addLayer(marker);
                                    map.addLayer(markerNeighbourGroup);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('Unesco Data Error', textStatus, errorThrown);
                                }
                            });
                            $.ajax({
                                url: "php/getUnesco.php",
                                type: 'GET',
                                dataType: "json",
                                data: {
                                    countryName: countryName
                                },
                                success: function (result) {
                                    if (result['status']['name'] == 'error') {
                                        addErrorsToModal(result['status']['description']);
                                        return;
                                    }
                                    unescoNumber = result.data.unescoSites.nhits;
                                    if (unescoNumber < 1) {
                                        $('#unescoModal').modal('show');
                                        map.addLayer(largeCityCluster);
                                        map.addLayer(cityMarkersCluster);
                                    }
                                    else if (unescoNumber > 0) {
                                        for (let i = 0; i < result.data.unescoSites.records.length; i++) {
                                            unescoIcon = L.icon({
                                                iconUrl: 'images/unesco.svg',
                                                iconSize: [50, 50],
                                                popupAnchor: [0, -15]
                                            });
                                            unescoSite = result.data.unescoSites.records[i].fields.site;
                                            unescoLat = result.data.unescoSites.records[i].fields.coordinates[0];
                                            unescoLng = result.data.unescoSites.records[i].fields.coordinates[1];
                                            unescoThumbnail = result.data.unescoSites.records[i].fields.image_url.filename;
                                            unsescoDescription = result.data.unescoSites.records[i].fields.short_description;
                                            unescoUrl = `https://whc.unesco.org/en/list/${result.data.unescoSites.records[i].fields.id_number}`;
                                            unescoMarker = L.marker(new L.LatLng(unescoLat, unescoLng), ({ icon: unescoIcon })).bindPopup(`<div class="markerContainer"><h3>${unescoSite}</h3><img class="markerThumbnail" src='https://whc.unesco.org/uploads/sites/${unescoThumbnail}'><p class="markerTxtDescription">${unsescoDescription}</p></div><div id="city-link"><a href="${unescoUrl}" target="_blank">Learn more</a></div>`, {
                                                maxWidth: 300
                                            });
                                        }
                                    };
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log('Unesco Data Error', textStatus, errorThrown);
                                }
                            });
                            $.ajax({
                                url: "php/getEarthquakes.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                    north: northPoint,
                                    south: southPoint,
                                    east: eastPoint,
                                    west: westPoint
                                },
                                success: function (result) {
                                    if (result['status']['name'] == 'error') {
                                        addErrorsToModal(result['status']['description']);
                                        return;
                                    }

                                    let earthquakePlaces = {
                                        "type": "FeatureCollection",
                                        "features": []
                                    }

                                    for (let m = 0; m < result['data']['earthquakes'].length; m++) {
                                        let earthquakePlace = {
                                            "type": "Feature",
                                            "geometry": {
                                                "type": "Point",
                                                "coordinates": [result['data']['earthquakes'][m]['lng'], result['data']['earthquakes'][m]['lat']] // San Francisco International Airport
                                            },
                                            "properties": {
                                                "depth": result['data']['earthquakes'][m]['depth'],
                                                "lat": result['data']['earthquakes'][m]['lat'],
                                                "lon": result['data']['earthquakes'][m]['lng'],
                                                "datetime": result['data']['earthquakes'][m]['datetime'],
                                            }
                                        }
                                        earthquakePlaces.features.push(earthquakePlace);
                                    }


                                    let marker = L.geoJSON(earthquakePlaces, {
                                        pointToLayer: function (feature, latlng) {
                                            return L.marker(latlng, {
                                                icon: L.ExtraMarkers.icon(iconEarthquakeOptions),
                                                title: "EarthquakeLocation",
                                                clickable: true
                                            });
                                        },
                                        onEachFeature: function (feature, layer) {
                                            layer.bindPopup(
                                                "Earthquake Depth : " + feature.properties.depth +
                                                "<br>Latitude : " + feature.properties.lat +
                                                "<br>Longitude : " + feature.properties.lon +
                                                "<br>Date-Time : " + new Date(feature.properties.datetime).toLocaleString('en-GB', { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" })
                                            );
                                        }
                                    });

                                    markerEarthquakeGroup.clearLayers();
                                    markerEarthquakeGroup.addLayer(marker);
                                    map.addLayer(markerEarthquakeGroup);


                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log(textStatus, errorThrown);
                                }
                            });
                            $.ajax({
                                url: "php/getCurrentWeatherCopy.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                    capital: capital
                                },
                                success: function (result) {
                                    if (result['status']['name'] == 'error') {
                                        let error = result['status']['description'];
                                        $('#weather-modal-body').html(error);
                                        return;
                                    }
                                    weatherIcon = result['data']['current']['condition']['icon'];
                                    currentTemp = result['data']['current']['temp_c'];
                                    currentWeather = result['data']['current']['condition']['text'];
                                    // weatherDescription = result['data']['weather'][0]['description'];
                                    windspeed = result['data']['current']['wind_mph'];
                                    humidity = result['data']['current']['humidity'];
                                    tempMin = result['data']['forecast']['forecastday'][0]['day']['maxtemp_c'];
                                    tempMax = result['data']['forecast']['forecastday'][0]['day']['mintemp_c'];

                                    tomorrowDate = result['data']['forecast']['forecastday'][1]['date'];
                                    tomorrowWeather = result['data']['forecast']['forecastday'][1]['day']['condition']['text'];
                                    tomorrowTemp = result['data']['forecast']['forecastday'][1]['day']['avgtemp_c'];
                                    tomorrowWeatherIcon = result['data']['forecast']['forecastday'][1]['day']['condition']['icon'];

                                    nextDayDate = result['data']['forecast']['forecastday'][2]['date'];
                                    nextDayWeather = result['data']['forecast']['forecastday'][2]['day']['condition']['text'];
                                    nextDayTemp = result['data']['forecast']['forecastday'][2]['day']['avgtemp_c'];
                                    nextDayWeatherIcon = result['data']['forecast']['forecastday'][2]['day']['condition']['icon'];

                                    let forecastHtml = `
                                    <table class="table text-light">
                                      <thead>
                                      <th></th>
                                      <th></th>
                                      </thead>
                                      <tbody>
                                      <td>
                                      <div class="forecast-item">
                                      <h6>${tomorrowDate}</h6>                                      
                                      <div class="d-flex">
                                        <img src="${tomorrowWeatherIcon}" alt="" class="img-fluid">
                                        <span>${Math.round(tomorrowTemp)}&deg;</span>
                                      </div>
                                      <h6>${tomorrowWeather}</h6>
                                        </div>
                                      </td>
                                      <td>
                                      <div class="forecast-item">
                                        <h6>${nextDayDate}</h6>
                                        <div class="d-flex">
                                            <img src="${nextDayWeatherIcon}" alt="" class="img-fluid">
                                            <span>${Math.round(nextDayTemp)}&deg;</span>
                                        </div>
                                        <h6>${nextDayWeather}</h6>
                                        </div>
                                      </td>                               
                                        
                                        </tbody>
                                    </table>
                                    
                                    
                                  `;

                                    let weatherHtml = `
                                    <div class="row">
                                      <div class="col-3 border-right text-center">
                                        <div class="text-center">
                                          <img src="${weatherIcon}" alt="" class="img-fluid">
                                          <span>${Math.round(currentTemp)}&deg;</span>
                                        </div>
                                        <h5>${currentWeather}</h5>
                                      </div>
                                      <div class="col-9">
                                      <h4 class="text-center">Today</h4>
                                        <table class="table text-light">
                                          <thead>
                                            <tr>
                                              <th><img src="images/humidity.svg" width="50"></th>
                                              <th><img src="images/007-windy.svg" width="50"></th>
                                              <th><img src="images/temperatureHi.svg" width="50"></th>
                                              <th><img src="images/temperatureLo.svg" width="50"></th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td>${Math.round(humidity)}%</td>
                                              <td>${Math.round(windspeed)} km/h</td>
                                              <td>${Math.round(tempMax)}&deg;</td>
                                              <td>${Math.round(tempMin)}&deg;</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <div class="forecast-container">
                                        <h4 class="text-center">Two-day Forecast</h4>
                                        <div class="d-flex">
                                          ${forecastHtml}
                                        </div>
                                      </div>
                                      </div>
                                    </div>
                                   
                                  `;
                                    $('#weather-modal-body').html(weatherHtml);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log(textStatus, errorThrown);
                                }
                            });

                            // $.ajax({
                            //     url: "php/getCapitalWeather.php",
                            //     type: 'GET',
                            //     dataType: 'json',
                            //     data: {
                            //         capital: capital
                            //     },
                            //     success: function (result) {
                            //         if (result['status']['name'] == 'error') {
                            //             // addErrorsToModal(result['status']['description']);

                            //             let error = result['status']['description'];
                            //             $('#weather-modal-body').html(error);

                            //             return;
                            //         }
                            //         weatherIcon = result['data']['weather'][0]['icon'];
                            //         currentTemp = result['data']['main']['temp'];
                            //         currentWeather = result['data']['weather'][0]['main'];
                            //         weatherDescription = result['data']['weather'][0]['description'];
                            //         windspeed = result['data']['wind']['speed'];
                            //         humidity = result['data']['main']['humidity'];
                            //         tempMin = result['data']['main']['temp_min'];
                            //         tempMax = result['data']['main']['temp_max'];

                            //         let weatherHtml = `
                            //         <div class="row">
                            //         <div class="col-3 border-right">
                            //           <div class="d-flex">
                            //             <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="" class="img-fluid">
                            //             <span>${currentTemp}&deg;</span>
                            //           </div>
                            //           <h5>${currentWeather}</h5>
                            //           <h5>${weatherDescription}</h5>
                            //         </div>
                            //         <div class="col-9">
                            //           <table class="table text-light">
                            //             <thead>
                            //               <tr>
                            //                 <th><img src="images/humidity.svg" width="50"></th>
                            //                 <th><img src="images/007-windy.svg" width="50"></th>
                            //                 <th><img src="images/temperatureHi.svg" width="50"></th>
                            //                 <th><img src="images/temperatureLo.svg" width="50"></th>
                            //               </tr>
                            //             </thead>
                            //             <tbody>
                            //               <tr>
                            //                 <td>${humidity}%</td>
                            //                 <td>${windspeed} km/h</td>
                            //                 <td>${tempMax}&deg;</td>
                            //                 <td>${tempMin}&deg;</td>
                            //               </tr>
                            //             </tbody>
                            //           </table>
                            //         </div>
                            //       </div>
                            //         `;
                            //         $('#weather-modal-body').html(weatherHtml);
                            //     },
                            //     error: function (jqXHR, textStatus, errorThrown) {
                            //         console.log(textStatus, errorThrown);
                            //     }
                            // });
                            $.ajax({
                                url: "php/getWikipediaInfo.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                    countryName: countryName
                                },
                                success: function (result) {
                                    if (result['status']['name'] == 'error') {
                                        // addErrorsToModal(result['status']['description']);

                                        let error = result['status']['description'];
                                        $('#txtWiki').html(error);

                                        return;
                                    }
                                    wikipediaInfo = result['data']['extract_html'];
                                    wikipediaLink = result['data']['content_urls']['desktop']['page'];
                                    $('#wikiModalLabel').html(`<b>Wikipedia: </b> ${countryName}`);
                                    $('#txtWiki').html(wikipediaInfo + `<a href="${wikipediaLink}" target="_blank">Read more...</a>`);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log(textStatus, errorThrown);
                                }
                            });

                            $.ajax({
                                url: "php/getCurrencyConvert.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                    currencyCode: currencyCode
                                },
                                success: function (result) {
                                    if (result['error']) {
                                        // addErrorsToModal(result['error-message']);

                                        $("#txtExchangeRate").html(result['error-message']);

                                        return;
                                    }
                                    currencyConversion = result['data'];
                                    $("#txtExchangeRate").html("1 USD = " + currencyConversion + " " + currencyCode);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log(textStatus, errorThrown);
                                }
                            });
                            $.ajax({
                                url: "php/getCurrencyData.php",
                                type: 'GET',
                                dataType: 'json',
                                data: {
                                    countryCode: countryCode
                                },
                                success: function (result) {
                                    if (result['status']['name'] == 'error') {
                                        // addErrorsToModal(result['status']['description']);

                                        // print error in the modal elements
                                        let error = result['status']['description'];
                                        $('#txtCurrency').html(error);
                                        $('#txtLanguages').html(error);
                                        $('#txtDomain').html(error);
                                        $('#txtIso2').html(error);
                                        $('#txtIso3').html(error);
                                        $('#txtCurrencySymbol').html(error);

                                        return;
                                    }

                                    // Check if the properties exist and assign them to variables
                                    if (result['data'][0]['currencies'] && result['data'][0]['currencies'][currencyCode]) {
                                        currencyName = result['data'][0]['currencies'][currencyCode]["name"];
                                        currencySymbol = result['data'][0]['currencies'][currencyCode]["symbol"];
                                    }
                                    if (result['data'][0]['tld']) {
                                        countryDomain = result['data'][0]['tld'];
                                    }
                                    if (result['data'][0]['cca2']) {
                                        countryCodeISO2 = result['data'][0]['cca2'];
                                    }
                                    if (result['data'][0]['cca3']) {
                                        countryCodeISO3 = result['data'][0]['cca3'];
                                    }
                                    if (result['data'][0]['languages']) {
                                        languages = result['data'][0]['languages'];
                                        allLanguages = Object.values(languages);
                                    }
                                    if (result['data'][0]['flags']['png']) {
                                        countryFlag = result['data'][0]['flags']['png'];
                                        $('#txtWikiImg').html("<img id='flag' src='" + countryFlag + "'><br>");
                                    }

                                    // Assign values to HTML elements
                                    $('#txtCurrency').html(currencyName);
                                    $('#txtLanguages').html(allLanguages ? allLanguages.toString() : "");
                                    $('#txtDomain').html(countryDomain);
                                    $('#txtIso2').html(countryCodeISO2);
                                    $('#txtIso3').html(countryCodeISO3);
                                    $('#txtCurrencySymbol').html(currencySymbol);
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.log(textStatus, errorThrown);
                                }
                            });

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log(textStatus, errorThrown);
                        }
                    });
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });

    $("#countries").change(function () {
        countryCode = this.value;
        if (markerCapitalGroup) {
            map.removeLayer(markerCapitalGroup);
        }
        if (airportMarkers) {
            map.removeLayer(airportMarkers);
        }
        if (markerNeighbourGroup) {
            map.removeLayer(markerNeighbourGroup);
        }
        if (markerEarthquakeGroup) {
            map.removeLayer(markerEarthquakeGroup);
        }
        $('#newsTBody').empty();
        $('#txtWiki').empty();
        allHolidays = [];
        allHolidaysDate = [];
        $.ajax({
            url: "php/getAirports.php",
            type: 'GET',
            dataType: 'json',
            data: {
                countryCode: countryCode
            },
            success: function (result) {
                console.log(countryCode)
                if (result['status'] && result['status']['name'] == 'error') {
                    addErrorsToModal(result['status']['description']);
                    return;
                }
                document.getElementById("airportsList").innerHTML = "";
                let airports = {
                    "type": "FeatureCollection",
                    "features": []
                }

                if (result['data'] && result['data']['response']) {
                    for (let i = 0; i < Math.min(result['data']['response'].length, 10); i++) {
                        let airport = {
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [result['data']['response'][i]['lng'], result['data']['response'][i]['lat']] // San Francisco International Airport
                            },
                            "properties": {
                                "name": result['data']['response'][i]['name'],
                                "iata_code": result['data']['response'][i]['iata_code']
                            }
                        }
                        airports.features.push(airport);
                    }

                    for (let i = 0; i < result['data']['response'].length; i++) {
                        document.getElementById("airportsList").innerHTML += "<div class='airports'>" + result['data']['response'][i]['name'] + " - " + result['data']['response'][i]['iata_code'] + "</div>";
                    }

                    let marker = L.geoJSON(airports, {
                        pointToLayer: function (feature, latlng) {
                            return L.marker(latlng, {
                                icon: L.ExtraMarkers.icon(iconAirportsOptions),
                                title: "AirportLocation",
                                clickable: true
                            });
                        },
                        onEachFeature: function (feature, layer) {
                            layer.bindPopup(feature.properties.name + " - " + feature.properties.iata_code);
                        }
                    });
                    airportMarkers.clearLayers();
                    airportMarkers.addLayer(marker);
                    map.addLayer(airportMarkers);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });

        $.ajax({
            url: "php/getCountryBorder.php",
            type: 'GET',
            dataType: 'json',
            data: {
                iso: countryCode
            },
            success: function (result) {
                if (border)
                    border.clearLayers();
                geojsonFeature = result['data'];
                border = L.geoJSON(geojsonFeature, { style: polystyle }).addTo(map);
                $.ajax({
                    url: "php/getCountryInfo.php",
                    type: 'GET',
                    dataType: 'json',
                    data: {
                        country: countryCode
                    },
                    success: function (result) {
                        if (result['status']['name'] == 'error') {
                            // addErrorsToModal(result['status']['description']);

                            let error = result['status']['description'];
                            $('#infoModalLabel').html(error);
                            $('.txtCapitalName').html(error);
                            $('#txtAreaInSqKm').html(error);
                            $('#txtCapital').html(error);
                            $('#txtPopulation').html(error);
                            $('#txtCurrencyCode').html(error);

                            return;
                        }
                        geonameid = result['data'][0]['geonameId'];
                        capital = result['data'][0]['capital'];
                        population = result['data'][0]['population'];
                        areainsqkm = result['data'][0]['areaInSqKm'];
                        countryName = result['data'][0]['countryName'];
                        getTopSites(countryName);
                        getHotels(countryName);
                        continentName = result['data'][0]['continentName'];
                        currencyCode = result['data'][0]['currencyCode'];
                        northPoint = result['data'][0]['north'];
                        southPoint = result['data'][0]['south'];
                        eastPoint = result['data'][0]['east'];
                        westPoint = result['data'][0]['west'];
                        $('#infoModalLabel').html(countryName);
                        $('.txtCapitalName').html(capital);
                        $('#txtAreaInSqKm').html(numeral(areainsqkm).format('0,0'));
                        $('#txtCapital').html(capital);
                        $('#txtPopulation').html(numeral(population).format('0,0'));
                        $('#txtCurrencyCode').html(currencyCode);
                        $.ajax({
                            url: "php/getNeighbours.php",
                            type: 'GET',
                            dataType: "json",
                            data: {
                                geonameId: geonameid
                            },
                            success: function (result) {
                                if (result['status']['name'] == 'error') {
                                    addErrorsToModal(result['status']['description']);
                                    return;
                                }
                                let neighboursData = {
                                    "type": "FeatureCollection",
                                    "features": []
                                }

                                for (let m = 0; m < result['data']['geonames'].length; m++) {
                                    let neighbour = {
                                        "type": "Feature",
                                        "geometry": {
                                            "type": "Point",
                                            "coordinates": [result['data']['geonames'][m]['lng'], result['data']['geonames'][m]['lat']]
                                        },
                                        "properties": {
                                            "name": result['data']['geonames'][m]['name'],
                                            "countryName": result['data']['geonames'][m]['countryName'],
                                            "lat": result['data']['geonames'][m]['lat'],
                                            "lon": result['data']['geonames'][m]['lng'],
                                        }
                                    }
                                    neighboursData.features.push(neighbour);
                                }

                                let marker = L.geoJSON(neighboursData, {
                                    pointToLayer: function (feature, latlng) {
                                        return L.marker(latlng, {
                                            icon: L.ExtraMarkers.icon(iconNeighboursOptions),
                                            title: "NeighbourLocation",
                                            clickable: true
                                        });
                                    },
                                    onEachFeature: function (feature, layer) {
                                        layer.bindPopup("Name : " + feature.properties.name + "<br>Country Name : " + feature.properties.countryName + "<br>Latitude : " + feature.properties.lat + "<br>Longitude : " + feature.properties.lon);
                                    }
                                });

                                markerNeighbourGroup.clearLayers();
                                markerNeighbourGroup.addLayer(marker);
                                map.addLayer(markerNeighbourGroup);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('Unesco Data Error', textStatus, errorThrown);
                            }
                        });
                        $.ajax({
                            url: "php/getUnesco.php",
                            type: 'GET',
                            dataType: "json",
                            data: {
                                countryName: countryName
                            },
                            success: function (result) {
                                if (result['status']['name'] == 'error') {
                                    addErrorsToModal(result['status']['description']);
                                    return;
                                }
                                unescoNumber = result.data.unescoSites.nhits;
                                if (unescoNumber < 1) {
                                    $('#unescoModal').modal('show');
                                    map.addLayer(largeCityCluster);
                                    map.addLayer(cityMarkersCluster);
                                }
                                else if (unescoNumber > 0) {
                                    for (let i = 0; i < result.data.unescoSites.records.length; i++) {
                                        unescoIcon = L.icon({
                                            iconUrl: 'images/unesco.svg',
                                            iconSize: [50, 50],
                                            popupAnchor: [0, -15]
                                        });
                                        unescoSite = result.data.unescoSites.records[i].fields.site;
                                        unescoLat = result.data.unescoSites.records[i].fields.coordinates[0];
                                        unescoLng = result.data.unescoSites.records[i].fields.coordinates[1];
                                        unescoThumbnail = result.data.unescoSites.records[i].fields.image_url.filename;
                                        unsescoDescription = result.data.unescoSites.records[i].fields.short_description;
                                        unescoUrl = `https://whc.unesco.org/en/list/${result.data.unescoSites.records[i].fields.id_number}`;
                                        unescoMarker = L.marker(new L.LatLng(unescoLat, unescoLng), ({ icon: unescoIcon })).bindPopup(`<div class="markerContainer"><h3>${unescoSite}</h3><img class="markerThumbnail" src='https://whc.unesco.org/uploads/sites/${unescoThumbnail}'><p class="markerTxtDescription">${unsescoDescription}</p></div><div id="city-link"><a href="${unescoUrl}" target="_blank">Learn more</a></div>`, {
                                            maxWidth: 300
                                        });
                                    }
                                };
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log('Unesco Data Error', textStatus, errorThrown);
                            }
                        });
                        $.ajax({
                            url: "php/getEarthquakes.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                north: northPoint,
                                south: southPoint,
                                east: eastPoint,
                                west: westPoint
                            },
                            success: function (result) {
                                if (result['status']['name'] == 'error') {
                                    addErrorsToModal(result['status']['description']);
                                    return;
                                }
                                let earthquakePlaces = {
                                    "type": "FeatureCollection",
                                    "features": []
                                }

                                for (let m = 0; m < result['data']['earthquakes'].length; m++) {
                                    let earthquakePlace = {
                                        "type": "Feature",
                                        "geometry": {
                                            "type": "Point",
                                            "coordinates": [result['data']['earthquakes'][m]['lng'], result['data']['earthquakes'][m]['lat']] // San Francisco International Airport
                                        },
                                        "properties": {
                                            "depth": result['data']['earthquakes'][m]['depth'],
                                            "lat": result['data']['earthquakes'][m]['lat'],
                                            "lon": result['data']['earthquakes'][m]['lng'],
                                            "datetime": result['data']['earthquakes'][m]['datetime'],
                                        }
                                    }
                                    earthquakePlaces.features.push(earthquakePlace);
                                }

                                let marker = L.geoJSON(earthquakePlaces, {
                                    pointToLayer: function (feature, latlng) {
                                        return L.marker(latlng, {
                                            icon: L.ExtraMarkers.icon(iconEarthquakeOptions),
                                            title: "EarthquakeLocation",
                                            clickable: true
                                        });
                                    },
                                    onEachFeature: function (feature, layer) {
                                        layer.bindPopup(
                                            "Earthquake Depth : " + feature.properties.depth +
                                            "<br>Latitude : " + feature.properties.lat +
                                            "<br>Longitude : " + feature.properties.lon +
                                            "<br>Date-Time : " + new Date(feature.properties.datetime).toLocaleString('en-GB', { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" })
                                        );
                                    }
                                });

                                markerEarthquakeGroup.clearLayers();
                                markerEarthquakeGroup.addLayer(marker);
                                map.addLayer(markerEarthquakeGroup);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });
                        $.ajax({
                            url: "php/getCurrentWeatherCopy.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                capital: capital
                            },
                            success: function (result) {
                                if (result['status']['name'] == 'error') {
                                    let error = result['status']['description'];
                                    $('#weather-modal-body').html(error);
                                    return;
                                }
                                weatherIcon = result['data']['current']['condition']['icon'];
                                currentTemp = result['data']['current']['temp_c'];
                                currentWeather = result['data']['current']['condition']['text'];
                                // weatherDescription = result['data']['weather'][0]['description'];
                                windspeed = result['data']['current']['wind_mph'];
                                humidity = result['data']['current']['humidity'];
                                tempMin = result['data']['forecast']['forecastday'][0]['day']['maxtemp_c'];
                                tempMax = result['data']['forecast']['forecastday'][0]['day']['mintemp_c'];

                                tomorrowDate = result['data']['forecast']['forecastday'][1]['date'];
                                tomorrowWeather = result['data']['forecast']['forecastday'][1]['day']['condition']['text'];
                                tomorrowTemp = result['data']['forecast']['forecastday'][1]['day']['avgtemp_c'];
                                tomorrowWeatherIcon = result['data']['forecast']['forecastday'][1]['day']['condition']['icon'];

                                nextDayDate = result['data']['forecast']['forecastday'][2]['date'];
                                nextDayWeather = result['data']['forecast']['forecastday'][2]['day']['condition']['text'];
                                nextDayTemp = result['data']['forecast']['forecastday'][2]['day']['avgtemp_c'];
                                nextDayWeatherIcon = result['data']['forecast']['forecastday'][2]['day']['condition']['icon'];

                                let forecastHtml = `
                                    <table class="table text-light">
                                      <thead>
                                      <th></th>
                                      <th></th>
                                      </thead>
                                      <tbody>
                                      <td>
                                      <div class="forecast-item">
                                      <h6>${tomorrowDate}</h6>                                      
                                      <div class="d-flex">
                                        <img src="${tomorrowWeatherIcon}" alt="" class="img-fluid">
                                        <span>${Math.round(tomorrowTemp)}&deg;</span>
                                      </div>
                                      <h6>${tomorrowWeather}</h6>
                                        </div>
                                      </td>
                                      <td>
                                      <div class="forecast-item">
                                        <h6>${nextDayDate}</h6>
                                        <div class="d-flex">
                                            <img src="${nextDayWeatherIcon}" alt="" class="img-fluid">
                                            <span>${Math.round(nextDayTemp)}&deg;</span>
                                        </div>
                                        <h6>${nextDayWeather}</h6>
                                        </div>
                                      </td>                               
                                        
                                        </tbody>
                                    </table>
                                    
                                    
                                  `;

                                let weatherHtml = `
                                    <div class="row">
                                      <div class="col-3 border-right text-center">
                                        <div class="text-center">
                                          <img src="${weatherIcon}" alt="" class="img-fluid">
                                          <span>${Math.round(currentTemp)}&deg;</span>
                                        </div>
                                        <h5>${currentWeather}</h5>
                                      </div>
                                      <div class="col-9">
                                      <h4 class="text-center">Today</h4>
                                        <table class="table text-light">
                                          <thead>
                                            <tr>
                                              <th><img src="images/humidity.svg" width="50"></th>
                                              <th><img src="images/007-windy.svg" width="50"></th>
                                              <th><img src="images/temperatureHi.svg" width="50"></th>
                                              <th><img src="images/temperatureLo.svg" width="50"></th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr>
                                              <td>${Math.round(humidity)}%</td>
                                              <td>${Math.round(windspeed)} km/h</td>
                                              <td>${Math.round(tempMax)}&deg;</td>
                                              <td>${Math.round(tempMin)}&deg;</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                        <div class="forecast-container">
                                        <h4 class="text-center">Two-day Forecast</h4>
                                        <div class="d-flex">
                                          ${forecastHtml}
                                        </div>
                                      </div>
                                      </div>
                                    </div>
                                   
                                  `;
                                $('#weather-modal-body').html(weatherHtml);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });

                        $.ajax({
                            url: "php/getWikipediaInfo.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                countryName: countryName
                            },
                            success: function (result) {
                                if (result['status']['name'] == 'error') {
                                    // addErrorsToModal(result['status']['description']);

                                    $('#txtWiki').html(result['status']['description']);

                                    return;
                                }

                                wikipediaInfo = result['data']['extract_html'];
                                wikipediaLink = result['data']['content_urls']['desktop']['page'];
                                $('#wikiModalLabel').html(`<b>Wikipedia: </b> ${countryName}`);
                                $('#txtWiki').html(wikipediaInfo + `<a href="${wikipediaLink}" target="_blank">Read more...</a>`);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });
                        $.ajax({
                            url: "php/getNews.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                countryCode: countryCode,
                                countryName: countryName
                            },
                            success: function (result) {
                                if (result['status']['name'] == 'error') {
                                    // addErrorsToModal(result['status']['description']);

                                    let error = result['status']['description'];
                                    $('#news-modal-body').append(error);

                                    return;
                                }

                                let newsModalBody = $('#news-modal-body');
                                let newsHtml = '';

                                for (let i = 0; i < 5; i++) {
                                    let newsData = result['data']['results'][i];
                                    let newsTitle = newsData['title'];
                                    let newsLink = newsData['link'];
                                    let newsImageUrl = newsData['image_url'] ? newsData['image_url'] : 'images/image-not-available.jpg';
                                    // let newsDescription = newsData['description'];
                                    // let newsCategory = newsData['category'][0];
                                    let newsPublishDate = newsData['pubDate'];

                                    newsHtml += `
                                    <div class="row">
                                    <div class="col-5">
                                      <img src="${newsImageUrl}" alt="" class="img-fluid">
                                    </div>
                                    <div class="col-7">
                                      <a href="${newsLink}" target="_blank">
                                        <p>
                                            <b>${newsTitle}</b>
                                        </p>
                                      </a>
                                      <p><b>${newsPublishDate}</b></p>
                                    </div>
                                  </div>
                                  <hr>
                                    `;
                                }
                                $(newsModalBody).html(newsHtml);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });
                        $.ajax({
                            url: "php/getCurrencyConvert.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                currencyCode: currencyCode
                            },
                            success: function (result) {
                                if (result['error']) {
                                    // addErrorsToModal(result['error-message']);

                                    $("#txtExchangeRate").html(result['error-message']);
                                    return;
                                }
                                currencyConversion = result['data'];
                                $("#txtExchangeRate").html("1 USD = " + currencyConversion + " " + currencyCode);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });
                        $.ajax({
                            url: "php/getCurrencyData.php",
                            type: 'GET',
                            dataType: 'json',
                            data: {
                                countryCode: countryCode
                            },
                            success: function (result) {
                                if (result['status']['name'] == 'error') {
                                    // addErrorsToModal(result['status']['description']);

                                    let error = result['status']['description'];
                                    $('#txtWikiImg').html(error);
                                    $('#txtCurrency').html(error);
                                    $('#txtLanguages').html(error);
                                    $('#txtDomain').html(error);
                                    $('#txtIso2').html(error);
                                    $('#txtIso3').html(error);
                                    $('#txtCurrencySymbol').html(error);

                                    return;
                                }
                                if (result['data'][0]['currencies'] && result['data'][0]['currencies'][currencyCode]) {
                                    currencyName = result['data'][0]['currencies'][currencyCode]["name"];
                                    currencySymbol = result['data'][0]['currencies'][currencyCode]["symbol"];
                                }

                                if (result['data'][0]['tld']) {
                                    countryDomain = result['data'][0]['tld'];
                                }

                                if (result['data'][0]['cca2']) {
                                    countryCodeISO2 = result['data'][0]['cca2'];
                                }

                                if (result['data'][0]['cca3']) {
                                    countryCodeISO3 = result['data'][0]['cca3'];
                                }

                                if (result['data'][0]['languages']) {
                                    languages = result['data'][0]['languages'];
                                }

                                allLanguages = [];
                                for (let l in languages)
                                    allLanguages.push(languages[l]);
                                countryFlag = result['data'][0]['flags']['png'];
                                $('#txtWikiImg').html("<img src='" + countryFlag + "'>");
                                $('#txtCurrency').html(currencyName);
                                $('#txtLanguages').html(allLanguages.toString());
                                $('#txtDomain').html(countryDomain);
                                $('#txtIso2').html(countryCodeISO2);
                                $('#txtIso3').html(countryCodeISO3);
                                $('#txtCurrencySymbol').html(currencySymbol);
                                map.setView([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]], 5);
                                // markerCapitalGroup = L.layerGroup().addTo(map);
                                // marker = L.marker([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]], markerCapitalOptions).addTo(markerCapitalGroup);
                                // map.addLayer(marker);
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.log(textStatus, errorThrown);
                            }
                        });
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus, errorThrown);
                    }
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    });


    // function for changing the country dropdown to the current country
    function changeCountrySelect(countryCode) {
        let countriesDropdown = document.querySelector('#countries');
        countriesDropdown.value = countryCode;
    }


    // function for getting top sites of a country
    function getTopSites(countryName) {
        $.ajax({
            url: "php/getTop5.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: countryName
            },
            success: function (result) {
                if (result['status']['name'] == 'error') {
                    // addErrorsToModal(result['status']['description']);

                    let error = result['status']['description'];
                    document.getElementById('top5sites').innerHTML = `<tr>
                        <td>${error}</td>
                    </tr>`;
                    return;
                }

                let tBody = document.getElementById('top5sites');
                let html = "";

                let data = result['data']['results'];
                for (let i = 0; i < 5; i++) {
                    let place = data[i];
                    html += `
                    <tr class="success currencyRow">
                    <td>
                    <a target="_blank" href="https://www.google.com/maps?q=${place['geometry']['location']['lat']},${place['geometry']['location']['lng']}">${place['name']}</a>
                    </td>
                  </tr>
                    `;
                }
                tBody.innerHTML = html;
            }
        })
    }

    // function for getting Hotels Data
    function getHotels(countryName) {
        $.ajax({
            url: "php/getHotels.php",
            type: 'GET',
            dataType: 'json',
            data: {
                country: countryName
            },
            success: function (result) {
                if (result['status']['name'] == 'error') {
                    // addErrorsToModal(result['status']['description']);

                    let error = result['status']['description'];
                    document.getElementById('hotels').innerHTML = `
                        <tr>
                            <td>${error}</td>
                        </tr>
                    `;
                    return;
                }

                let tBody = document.getElementById('hotels');
                let html = "";

                let data = result['data']['results'];
                for (let i = 0; i < 15; i++) {
                    let place = data[i];
                    html += `
                        <tr class="success currencyRow">
                        <td>
                        <a target="_blank" href="https://www.google.com/maps?q=${place['geometry']['location']['lat']},${place['geometry']['location']['lng']}">${place['name']}</a>
                        </td>
                      </tr>
                        `;
                }
                tBody.innerHTML = html;
            }
        })
    }

    // easy buttons
    var infoButton = L.easyButton('fa fa-info', function () {
        $('#infoModal').modal('show');
    }, 'Info');

    var wikiButton = L.easyButton('fab fa-wikipedia-w', function () {
        $('#wikiModal').modal('show');
    }, 'Wiki');

    var weatherButton = L.easyButton('fas fa-cloud-sun', function () {
        $('#weatherModal').modal('show');
    }, 'Weather');

    var currencyButton = L.easyButton('fas fa-money-bill-wave', function () {
        $('#currencyModal').modal('show');
    }, 'Currency');

    var newsButton = L.easyButton('far fa-newspaper', function () {
        $('#newsModal').modal('show');
    }, 'News');

    // var covidButton = L.easyButton('fas fa-virus', function () {
    //     $('#covidModal').modal('show');
    // }, 'Covid Report');

    var top5Button = L.easyButton('fa fa-suitcase-rolling', function () {
        $('#top5Modal').modal('show');
    }, 'Top 5 Places to Visit');

    var hotelsButton = L.easyButton('fas fa-bed', function () {
        $('#hotelsModal').modal('show');
    }, 'Hotels');

    errorsButton = L.easyButton('fa fa-exclamation-circle', function () {
        $('#errors-modal').modal('show');
    }, 'Errors');

    infoButton.addTo(map);
    wikiButton.addTo(map);
    weatherButton.addTo(map);
    currencyButton.addTo(map);
    newsButton.addTo(map);
    // covidButton.addTo(map);
    top5Button.addTo(map);
    hotelsButton.addTo(map);
    errorsButton.addTo(map);
    errorsButton._container.classList.add('d-none');


    function addErrorsToModal(error) {
        // show error easybutton first
        if(error.trim().length > 0){
            errorsButton._container.classList.remove('d-none');
        }else{
            return;
        }
        
        let errorsModalBody = document.querySelector('#errors-modal-body');
        let errorDiv = document.createElement('div');
        errorDiv.innerHTML = `
            <p>${error}</p>
            <hr>
        `;
        errorsModalBody.appendChild(errorDiv);
    }

    // // Position the buttons at the bottom right corner
    // var buttonContainer = document.getElementById('modal-buttons');

    // // Add the buttons to the separate div container
    // buttonContainer.appendChild(infoButton.getContainer());
    // buttonContainer.appendChild(wikiButton.getContainer());
    // buttonContainer.appendChild(weatherButton.getContainer());
    // buttonContainer.appendChild(currencyButton.getContainer());
    // buttonContainer.appendChild(newsButton.getContainer());
    // // buttonContainer.appendChild(covidButton.getContainer());
    // buttonContainer.appendChild(top5Button.getContainer());
    // buttonContainer.appendChild(hotelsButton.getContainer());

}
