let map, markerCapitalGroup, markerNeighbourGroup, markerEarthquakeGroup, position, marker, geojsonFeature, border = null, covidCountry, activeCases, confirmCases, deaths;
let geonameid, currentTemp, currentWeather, weatherIcon, humidity, windspeed, tempMin, tempMax;
let population, areainsqkm, countryCodeISO2, countryCodeISO3, countryDomain, capital, countryName, countryCode, countryFlag, northPoint, southPoint, eastPoint, westPoint, continentName, currencyName, currencySymbol, currencyCode, currencyConversion, wikipediaInfo, allLanguages = [], allHolidays = [], allHolidaysDate = [];
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

let iconAirportsOptions = {
	iconUrl: 'images/airport.png',
	iconSize: [40, 40]
}
let customAirportsIcon = L.icon(iconAirportsOptions);
let markerAirportsOptions = {
	title: "AirportLocation",
	clickable: true,
	icon: customAirportsIcon
}

let iconNeighboursOptions = {
	iconUrl: 'images/neighbours.png',
	iconSize: [40, 40]
}
let customNeighboursIcon = L.icon(iconNeighboursOptions);
let markerNeighboursOptions = {
	title: "NeighbourLocation",
	clickable: true,
	icon: customNeighboursIcon
}

let iconEarthquakeOptions = {
	iconUrl: 'images/earthquake.png',
	iconSize: [40, 40]
}
let customEarthquakeIcon = L.icon(iconEarthquakeOptions);
let markerEarthquakeOptions = {
	title: "EarthquakeLocation",
	clickable: true,
	icon: customEarthquakeIcon
}
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
	markerCapitalGroup = L.layerGroup().addTo(map);
	L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	marker = L.marker([lat, lng], markerCapitalOptions).addTo(markerCapitalGroup);
	map.addLayer(marker);
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
				alert(result['status']['description']);
				return;
			}
			countryCode = result["data"]["sys"]["country"];
			$.ajax({
				url: "php/getAirports.php",
				type: 'GET',
				dataType: 'json',
				data: {
					countryCode: countryCode
				},
				success: function (result) {
					if (result['status']['name'] == 'error') {
						alert(result['status']['description']);
						return;
					}
					markerAirportGroup = L.layerGroup().addTo(map);
					for (let i = 0; i < 10; i++) {
						marker = L.marker([result['data']['response'][i]['lat'], result['data']['response'][i]['lng']], markerAirportsOptions).addTo(markerAirportGroup);
						map.addLayer(marker);
						marker.bindPopup(result['data']['response'][i]['name'] + " - " + result['data']['response'][i]['iata_code']);
					}
					for (let i = 0; i < result['data']['response'].length; i++) {
						document.getElementById("airportsList").innerHTML += "<div class='airports'>" + result['data']['response'][i]['name'] + " - " + result['data']['response'][i]['iata_code'] + "</div>";
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
						alert(result['status']['description']);
						return;
					}
					newsTitle = result['data']['results'][0]['title'];
					newsLink = result['data']['results'][0]['link'];
					newsDescription = result['data']['results'][0]['description'];
					newsCategory = result['data']['results'][0]['category'][0];
					newsPublishDate = result['data']['results'][0]['pubDate'];
					$('#txtTitle1').html("<a style='text-decoration: none;' target='_blank' href='" + newsLink + "'>" + newsTitle + "</a>");
					$('#txtDescription1').html(newsDescription);
					$('#txtCategory1').html(newsCategory);
					$('#txtPublishDate1').html(newsPublishDate);
					newsTitle = result['data']['results'][1]['title'];
					newsLink = result['data']['results'][1]['link'];
					newsDescription = result['data']['results'][1]['description'];
					newsCategory = result['data']['results'][1]['category'][0];
					newsPublishDate = result['data']['results'][1]['pubDate'];
					$('#txtTitle2').html("<a style='text-decoration: none;' target='_blank' href='" + newsLink + "'>" + newsTitle + "</a>");
					$('#txtDescription2').html(newsDescription);
					$('#txtCategory2').html(newsCategory);
					$('#txtPublishDate2').html(newsPublishDate);
					newsTitle = result['data']['results'][2]['title'];
					newsLink = result['data']['results'][2]['link'];
					newsDescription = result['data']['results'][2]['description'];
					newsCategory = result['data']['results'][2]['category'][0];
					newsPublishDate = result['data']['results'][2]['pubDate'];
					$('#txtTitle3').html("<a style='text-decoration: none;' target='_blank' href='" + newsLink + "'>" + newsTitle + "</a>");
					$('#txtDescription3').html(newsDescription);
					$('#txtCategory3').html(newsCategory);
					$('#txtPublishDate3').html(newsPublishDate);
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
								alert(result['status']['description']);
								return;
							}
							geonameid = result['data'][0]['geonameId'];
							capital = result['data'][0]['capital'];
							population = result['data'][0]['population'];
							areainsqkm = result['data'][0]['areaInSqKm'];
							countryName = result['data'][0]['countryName'];
							continentName = result['data'][0]['continentName'];
							currencyCode = result['data'][0]['currencyCode'];
							northPoint = result['data'][0]['north'];
							southPoint = result['data'][0]['south'];
							eastPoint = result['data'][0]['east'];
							westPoint = result['data'][0]['west'];
							$('#infoModalLabel').html(countryName);
							$('.txtCapitalName').html(capital);
							$('#txtAreaInSqKm').html(areainsqkm);
							$('#txtCapital').html(capital);
							$('#txtPopulation').html(population);
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
										alert(result['status']['description']);
										return;
									}
									markerNeighbourGroup = L.layerGroup().addTo(map);
									for (let m = 0; m < result['data']['geonames'].length; m++) {
										marker = L.marker([result['data']['geonames'][m]['lat'], result['data']['geonames'][m]['lng']], markerNeighboursOptions).addTo(markerNeighbourGroup);
										map.addLayer(marker);
										marker.bindPopup("Name : " + result['data']['geonames'][m]['name'] + "<br>Country Name : " + result['data']['geonames'][m]['countryName'] + "<br>Latitude : " + result['data']['geonames'][m]['lat'] + "<br>Longitude : " + result['data']['geonames'][m]['lng']);
									}
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
										alert(result['status']['description']);
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
										alert(result['status']['description']);
										return;
									}
									markerEarthquakeGroup = L.layerGroup().addTo(map);
									for (let m = 0; m < result['data']['earthquakes'].length; m++) {
										marker = L.marker([result['data']['earthquakes'][m]['lat'], result['data']['earthquakes'][m]['lng']], markerEarthquakeOptions).addTo(markerEarthquakeGroup);
										map.addLayer(marker);
										marker.bindPopup("Earthquake Depth : " + result['data']['earthquakes'][m]['depth'] + "<br>Latitude : " + result['data']['earthquakes'][m]['lat'] + "<br>Longitude : " + result['data']['earthquakes'][m]['lng']);
									}
								},
								error: function (jqXHR, textStatus, errorThrown) {
									console.log(textStatus, errorThrown);
								}
							});
							$.ajax({
								url: "php/getCapitalWeather.php",
								type: 'GET',
								dataType: 'json',
								data: {
									capital: capital
								},
								success: function (result) {
									if (result['status']['name'] == 'error') {
										alert(result['status']['description']);
										return;
									}
									weatherIcon = result['data']['weather'][0]['icon'];
									currentTemp = result['data']['main']['temp'];
									currentWeather = result['data']['weather'][0]['main'];
									windspeed = result['data']['wind']['speed'];
									humidity = result['data']['main']['humidity'];
									tempMin = result['data']['main']['temp_min'];
									tempMax = result['data']['main']['temp_max'];
									$('#CapitalWeatherIcon').html('<img src="https://openweathermap.org/img/wn/' + weatherIcon + '@2x.png" width="24px">');
									$('#txtCapitalWeatherTemp').html(currentTemp + "&deg;");
									$('#txtCapitalWeatherCurrent').html(currentWeather);
									$('#txtCapitalWeatherWindspeed').html(windspeed + " km/h");
									$('#txtCapitalWeatherHumidity').html(humidity + "%");
									$('#txtCapitalWeatherMax').html(tempMax + "&deg;");
									$('#txtCapitalWeatherMin').html(tempMin + "&deg;");
									$('#CapitalHumidityIcon').html('<img src="images/humidity.svg" width="24px">');
									$('#CapitalWindIcon').html('<img src="images/007-windy.svg" width="24px">');
									$('.CapitalHiTempIcon').html('<img src="images/temperatureHi.svg" width="24px">');
									$('.CapitalLoTempIcon').html('<img src="images/temperatureLo.svg" width="24px">');
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
										alert(result['status']['description']);
										return;
									}
									wikipediaInfo = result['data']['extract_html'];
									wikipediaLink = result['data']['content_urls']['desktop']['page'];
									$('#txtWiki').html('<b>Wikipedia: <a target="_blank" href="' + wikipediaLink + '">' + countryName + '</a></b>' + wikipediaInfo);
								},
								error: function (jqXHR, textStatus, errorThrown) {
									console.log(textStatus, errorThrown);
								}
							});
							$.ajax({
								url: "php/getCovidCountryList.php",
								type: 'GET',
								dataType: 'json',
								data: {},
								success: function (result) {
									if (result['status']['name'] == 'error') {
										// alert(result['status']['description']);
										return;
									}
									for (let c = 0; c < result['data'].length; c++) {
										if (result['data'][c]['Country'] == countryName) {
											covidCountry = result['data'][c]['Country'];
											$.ajax({
												url: "php/getCovidData.php",
												type: 'GET',
												dataType: 'json',
												data: {
													country: covidCountry
												},
												success: function (result) {
													if (result['status']['name'] == 'error') {
														alert(result['status']['description']);
														return;
													}
													activeCases = result['data'][result['data'].length - 1]['Active'];
													confirmCases = result['data'][result['data'].length - 1]['Confirmed'];
													deaths = result['data'][result['data'].length - 1]['Deaths'];
													$('#txtConfirmedCases').html(confirmCases);
													$('#txtActiveCases').html(activeCases);
													$('#txtDeaths').html(deaths);
												},
												error: function (jqXHR, textStatus, errorThrown) {
													console.log(textStatus, errorThrown);
												}
											});
											break;
										}
									}
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
										alert(result['error-message']);
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
										alert(result['status']['description']);
										return;
									}
									currencyName = result['data'][0]['currencies'][currencyCode]["name"];
									currencySymbol = result['data'][0]['currencies'][currencyCode]["symbol"];
									countryDomain = result['data'][0]['tld'];
									countryCodeISO2 = result['data'][0]['cca2'];
									countryCodeISO3 = result['data'][0]['cca3'];
									languages = result['data'][0]['languages'];
									allLanguages = [];
									for (let l in languages)
										allLanguages.push(languages[l]);
									countryFlag = result['data'][0]['flags']['png'];
									$('#txtWikiImg').html("<img id='flag' src='" + countryFlag + "'><br>");
									$('#txtCurrency').html(currencyName);
									$('#txtLanguages').html(allLanguages.toString());
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
		map.removeLayer(markerCapitalGroup);
		map.removeLayer(markerAirportGroup);
		map.removeLayer(markerNeighbourGroup);
		map.removeLayer(markerEarthquakeGroup);
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
				if (result['status']['name'] == 'error') {
					alert(result['status']['description']);
					return;
				}
				document.getElementById("airportsList").innerHTML = "";
				markerAirportGroup = L.layerGroup().addTo(map);
				for (let i = 0; i < 10; i++) {
					marker = L.marker([result['data']['response'][i]['lat'], result['data']['response'][i]['lng']], markerAirportsOptions).addTo(markerAirportGroup);
					map.addLayer(marker);
					marker.bindPopup(result['data']['response'][i]['name'] + " - " + result['data']['response'][i]['iata_code']);
				}
				for (let i = 0; i < result['data']['response'].length; i++) {
					document.getElementById("airportsList").innerHTML += "<div class='airports'>" + result['data']['response'][i]['name'] + " - " + result['data']['response'][i]['iata_code'] + "</div>";
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
							alert(result['status']['description']);
							return;
						}
						geonameid = result['data'][0]['geonameId'];
						capital = result['data'][0]['capital'];
						population = result['data'][0]['population'];
						areainsqkm = result['data'][0]['areaInSqKm'];
						countryName = result['data'][0]['countryName'];
						continentName = result['data'][0]['continentName'];
						currencyCode = result['data'][0]['currencyCode'];
						northPoint = result['data'][0]['north'];
						southPoint = result['data'][0]['south'];
						eastPoint = result['data'][0]['east'];
						westPoint = result['data'][0]['west'];
						$('#infoModalLabel').html(countryName);
						$('.txtCapitalName').html(capital);
						$('#txtAreaInSqKm').html(areainsqkm);
						$('#txtCapital').html(capital);
						$('#txtPopulation').html(population);
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
									alert(result['status']['description']);
									return;
								}
								markerNeighbourGroup = L.layerGroup().addTo(map);
								for (let m = 0; m < result['data']['geonames'].length; m++) {
									marker = L.marker([result['data']['geonames'][m]['lat'], result['data']['geonames'][m]['lng']], markerNeighboursOptions).addTo(markerNeighbourGroup);
									map.addLayer(marker);
									marker.bindPopup("Name : " + result['data']['geonames'][m]['name'] + "<br>Country Name : " + result['data']['geonames'][m]['countryName'] + "<br>Latitude : " + result['data']['geonames'][m]['lat'] + "<br>Longitude : " + result['data']['geonames'][m]['lng']);
								}
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
									alert(result['status']['description']);
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
									alert(result['status']['description']);
									return;
								}
								markerEarthquakeGroup = L.layerGroup().addTo(map);
								for (let m = 0; m < result['data']['earthquakes'].length; m++) {
									marker = L.marker([result['data']['earthquakes'][m]['lat'], result['data']['earthquakes'][m]['lng']], markerEarthquakeOptions).addTo(markerEarthquakeGroup);
									map.addLayer(marker);
									marker.bindPopup("Earthquake Depth : " + result['data']['earthquakes'][m]['depth'] + "<br>Latitude : " + result['data']['earthquakes'][m]['lat'] + "<br>Longitude : " + result['data']['earthquakes'][m]['lng']);
								}
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(textStatus, errorThrown);
							}
						});
						$.ajax({
							url: "php/getCapitalWeather.php",
							type: 'GET',
							dataType: 'json',
							data: {
								capital: capital
							},
							success: function (result1) {
								if (result['status']['name'] == 'error') {
									alert(result['status']['description']);
									return;
								}
								weatherIcon = result1['data']['weather'][0]['icon'];
								currentTemp = result1['data']['main']['temp'];
								currentWeather = result1['data']['weather'][0]['main'];
								windspeed = result1['data']['wind']['speed'];
								humidity = result1['data']['main']['humidity'];
								tempMin = result1['data']['main']['temp_min'];
								tempMax = result1['data']['main']['temp_max'];
								$('#CapitalWeatherIcon').html('<img src="https://openweathermap.org/img/wn/' + weatherIcon + '@2x.png" width="24px">');
								$('#txtCapitalWeatherTemp').html(currentTemp + "&deg;");
								$('#txtCapitalWeatherCurrent').html(currentWeather);
								$('#txtCapitalWeatherWindspeed').html(windspeed + " km/h");
								$('#txtCapitalWeatherHumidity').html(humidity + "%");
								$('#txtCapitalWeatherMax').html(tempMax + "&deg;");
								$('#txtCapitalWeatherMin').html(tempMin + "&deg;");
								$('#CapitalHumidityIcon').html('<img src="images/humidity.svg" width="24px">');
								$('#CapitalWindIcon').html('<img src="images/007-windy.svg" width="24px">');
								$('.CapitalHiTempIcon').html('<img src="images/temperatureHi.svg" width="24px">');
								$('.CapitalLoTempIcon').html('<img src="images/temperatureLo.svg" width="24px">');
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
									alert(result['status']['description']);
									return;
								}
								wikipediaInfo = result['data']['extract_html'];
								wikipediaLink = result['data']['content_urls']['desktop']['page'];
								$('#txtWiki').html('<b>Wikipedia: <a target="_blank" href="' + wikipediaLink + '">' + countryName + '</a></b>' + wikipediaInfo);
							},
							error: function (jqXHR, textStatus, errorThrown) {
								console.log(textStatus, errorThrown);
							}
						});
						$.ajax({
							url: "php/getCovidCountryList.php",
							type: 'GET',
							dataType: 'json',
							data: {},
							success: function (result) {
								if (result['status']['name'] == 'error') {
									alert(result['status']['description']);
									return;
								}
								for (let c = 0; c < result['data'].length; c++) {
									if (result['data'][c]['Country'] == countryName) {
										covidCountry = result['data'][c]['Country'];
										$.ajax({
											url: "php/getCovidData.php",
											type: 'GET',
											dataType: 'json',
											data: {
												country: covidCountry
											},
											success: function (result) {
												if (result['status']['name'] == 'error') {
													alert(result['status']['description']);
													return;
												}
												activeCases = result['data'][result['data'].length - 1]['Active'];
												confirmCases = result['data'][result['data'].length - 1]['Confirmed'];
												deaths = result['data'][result['data'].length - 1]['Deaths'];
												$('#txtConfirmedCases').html(confirmCases);
												$('#txtActiveCases').html(activeCases);
												$('#txtDeaths').html(deaths);
											},
											error: function (jqXHR, textStatus, errorThrown) {
												console.log(textStatus, errorThrown);
											}
										});
										break;
									}
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
									alert(result['status']['description']);
									return;
								}
								newsTitle = result['data']['results'][0]['title'];
								newsLink = result['data']['results'][0]['link'];
								newsDescription = result['data']['results'][0]['description'];
								newsCategory = result['data']['results'][0]['category'][0];
								newsPublishDate = result['data']['results'][0]['pubDate'];
								$('#txtTitle1').html("<a style='text-decoration: none;' target='_blank' href='" + newsLink + "'>" + newsTitle + "</a>");
								$('#txtDescription1').html(newsDescription);
								$('#txtCategory1').html(newsCategory);
								$('#txtPublishDate1').html(newsPublishDate);
								newsTitle = result['data']['results'][1]['title'];
								newsLink = result['data']['results'][1]['link'];
								newsDescription = result['data']['results'][1]['description'];
								newsCategory = result['data']['results'][1]['category'][0];
								newsPublishDate = result['data']['results'][1]['pubDate'];
								$('#txtTitle2').html("<a style='text-decoration: none;' target='_blank' href='" + newsLink + "'>" + newsTitle + "</a>");
								$('#txtDescription2').html(newsDescription);
								$('#txtCategory2').html(newsCategory);
								$('#txtPublishDate2').html(newsPublishDate);
								newsTitle = result['data']['results'][2]['title'];
								newsLink = result['data']['results'][2]['link'];
								newsDescription = result['data']['results'][2]['description'];
								newsCategory = result['data']['results'][2]['category'][0];
								newsPublishDate = result['data']['results'][2]['pubDate'];
								$('#txtTitle3').html("<a style='text-decoration: none;' target='_blank' href='" + newsLink + "'>" + newsTitle + "</a>");
								$('#txtDescription3').html(newsDescription);
								$('#txtCategory3').html(newsCategory);
								$('#txtPublishDate3').html(newsPublishDate);
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
									alert(result['error-message']);
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
									alert(result['status']['description']);
									return;
								}
								currencyName = result['data'][0]['currencies'][currencyCode]["name"];
								currencySymbol = result['data'][0]['currencies'][currencyCode]["symbol"];
								countryDomain = result['data'][0]['tld'];
								countryCodeISO2 = result['data'][0]['cca2'];
								countryCodeISO3 = result['data'][0]['cca3'];
								languages = result['data'][0]['languages'];
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
								markerCapitalGroup = L.layerGroup().addTo(map);
								marker = L.marker([result['data'][0]['latlng'][0], result['data'][0]['latlng'][1]], markerCapitalOptions).addTo(markerCapitalGroup);
								map.addLayer(marker);
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
}
$('#infoBtn').on('click', function () {
	$('#infoModal').show();
});
$('#wikiBtn').on('click', function () {
	$('#wikiModal').show();
});
$('#weatherBtn').on('click', function () {
	$('#weatherModal').show();
});
$('#currencyBtn').on('click', function () {
	$('#currencyModal').show();
});
$('#newsBtn').on('click', function () {
	$('#newsModal').show();
});
$('#covidBtn').on('click', function () {
	$('#covidModal').show();
});