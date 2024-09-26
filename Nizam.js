// Function to fetch showtimes for a given city and store results in an array
async function fetchShowtimes(city, resultsArray) {
    const url = `https://in.bookmyshow.com/api/movies-data/showtimes-by-event?appCode=MOBAND2&appVersion=14304&language=en&eventCode=ET00310216&regionCode=${city.regionCode}&subRegion=${city.subRegionCode}&bmsId=1.21345445.1703250084656&token=67x1xa33b4x422b361ba&lat=${city.latitude}&lon=${city.longitude}&query=`;
  
    const headers = {
      "Host": "in.bookmyshow.com",
      "x-bms-id": "1.21345445.1703250084656",
      "x-region-code": city.regionCode,
      "x-subregion-code": city.subRegionCode,
      "x-region-slug": city.regionSlug,
      "x-platform": "AND",
      "x-platform-code": "ANDROID",
      "x-app-code": "MOBAND2",
      "x-device-make": "Google-Pixel XL",
      "x-screen-height": "2392",
      "x-screen-width": "1440",
      "x-screen-density": "3.5",
      "x-app-version": "14.3.4",
      "x-app-version-code": "14304",
      "x-network": "Android | WIFI",
      "x-latitude": city.latitude,
      "x-longitude": city.longitude,
      "x-ab-testing": "adtechHPSlug=default",
      "x-location-selection": "manual",
      "x-location-shared": "false",
      "lang": "en",
      "user-agent": "Dalvik/2.1.0 (Linux; U; Android 12; Pixel XL Build/SP2A.220505.008)"
    };
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
        compress: true
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      processShowtimeData(city.regionSlug, data, resultsArray);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  }
  
  // Function to process showtime data and store in results array
  function processShowtimeData(areaName, data, resultsArray) {
    // Initialize total aggregation variables
    let grandTotalMaxSeats = 0;
    let grandTotalSeatsAvailable = 0;
    let grandTotalBookedTickets = 0;
    let grandTotalGross = 0;
    let grandBookedGross = 0;
  
    data.ShowDetails.forEach(showDetail => {
      showDetail.Venues.forEach(venue => {
        venue.ShowTimes.forEach(showTime => {
          let totalMaxSeats = 0;
          let totalSeatsAvailable = 0;
          let totalBookedTickets = 0;
          let totalGross = 0;
          let bookedGross = 0;
  
          showTime.Categories.forEach(category => {
            const maxSeats = parseInt(category.MaxSeats, 10) || 0;
            const seatsAvail = parseInt(category.SeatsAvail, 10) || 0;
            const bookedTickets = maxSeats - seatsAvail;
            const currentPrice = parseFloat(category.CurPrice) || 0;
  
            totalMaxSeats += maxSeats;
            totalSeatsAvailable += seatsAvail;
            totalBookedTickets += bookedTickets;
            totalGross += maxSeats * currentPrice;
            bookedGross += bookedTickets * currentPrice;
          });
  
          grandTotalMaxSeats += totalMaxSeats;
          grandTotalSeatsAvailable += totalSeatsAvailable;
          grandTotalBookedTickets += totalBookedTickets;
          grandTotalGross += totalGross;
          grandBookedGross += bookedGross;
        });
      });
    });
  
    // Calculate occupancy
    const grandOccupancy = ((grandTotalBookedTickets / grandTotalMaxSeats) * 100).toFixed(2);
  
    // Store the result for this area
    resultsArray.push({
      AreaName: areaName,
      TotalGross: grandTotalGross.toFixed(2),
      BookedGross: grandBookedGross.toFixed(2),
      Occupancy: `${grandOccupancy}%`
    });
  }
  
  // City configurations (Telangana and metro cities)
const cities = {
  hyderabad: {
    regionCode: "HYD",
    subRegionCode: "HYD",
    regionSlug: "hyderabad",
    latitude: "17.385044",
    longitude: "78.486671"
  },
  warangal: {
    regionCode: "WAR",
    subRegionCode: "WAR",
    regionSlug: "warangal",
    latitude: "18.000055",
    longitude: "79.588167"
  },
  nizamabad: {
    regionCode: "NIZA",
    subRegionCode: "NIZA",
    regionSlug: "nizamabad",
    latitude: "18.6833",
    longitude: "78.1"
  },
  khammam: {
    regionCode: "KHAM",
    subRegionCode: "KHAM",
    regionSlug: "khammam",
    latitude: "17.25",
    longitude: "80.15"
  },
  karimnagar: {
    regionCode: "KARIM",
    subRegionCode: "KARIM",
    regionSlug: "karimnagar",
    latitude: "18.5962",
    longitude: "79.2902"
  },
  ramagundam: {
    regionCode: "RAMA",
    subRegionCode: "RAMA",
    regionSlug: "ramagundam",
    latitude: "17.3000",
    longitude: "79.4500"
  },
  mahabubnagar: {
    regionCode: "MAHA",
    subRegionCode: "MAHA",
    regionSlug: "mahabubnagar",
    latitude: "16.6000",
    longitude: "77.9833"
  },
  nalgonda: {
    regionCode: "NALK",
    subRegionCode: "NALK",
    regionSlug: "nalgonda",
    latitude: "17.1883",
    longitude: "79.2"
  },
  adilabad: {
    regionCode: "ADIL",
    subRegionCode: "ADIL",
    regionSlug: "adilabad",
    latitude: "19.6667",
    longitude: "78.5333"
  },
  suryapet: {
    regionCode: "SURY",
    subRegionCode: "SURY",
    regionSlug: "suryapet",
    latitude: "17.1353",
    longitude: "79.6334"
  },
  miryalaguda: {
    regionCode: "MRGD",
    subRegionCode: "MRGD",
    regionSlug: "miryalaguda",
    latitude: "16.8753",
    longitude: "79.566"
  },
  siddipet: {
    regionCode: "SDDP",
    subRegionCode: "SDDP",
    regionSlug: "siddipet",
    latitude: "18.1019",
    longitude: "78.8521"
  },
  jagtial: {
    regionCode: "JGTL",
    subRegionCode: "JGTL",
    regionSlug: "jagtial",
    latitude: "18.7909",
    longitude: "78.9119"
  },
  mancherial: {
    regionCode: "MANC",
    subRegionCode: "MANC",
    regionSlug: "mancherial",
    latitude: "18.8756",
    longitude: "79.4591"
  },
  armoor: {
    regionCode: "ARMO",
    subRegionCode: "ARMO",
    regionSlug: "armoor",
    latitude: "18.7895",
    longitude: "78.2893"
  },
  nirmal: {
    regionCode: "NIRM",
    subRegionCode: "NIRM",
    regionSlug: "nirmal",
    latitude: "19.0667",
    longitude: "78.5833"
  },
  sircilla: {
    regionCode: "SIRC",
    subRegionCode: "SIRC",
    regionSlug: "sircilla",
    latitude: "18.4042",
    longitude: "78.8305"
  },
  kamareddy: {
    regionCode: "KMRD",
    subRegionCode: "KMRD",
    regionSlug: "kamareddy",
    latitude: "18.324",
    longitude: "78.3343"
  },
  palwancha: {
    regionCode: "PLWA",
    subRegionCode: "PLWA",
    regionSlug: "palwancha",
    latitude: "18.3198",
    longitude: "78.4359"
  },
  kothagudem: {
    regionCode: "KTGM",
    subRegionCode: "KTGM",
    regionSlug: "kothagudem",
    latitude: "17.556",
    longitude: "80.6144"
  },
  bodhan: {
    regionCode: "BODH",
    subRegionCode: "BODH",
    regionSlug: "bodhan",
    latitude: "18.6794",
    longitude: "77.8767"
  },
  sangareddy: {
    regionCode: "SARE",
    subRegionCode: "SARE",
    regionSlug: "sangareddy",
    latitude: "17.6194",
    longitude: "78.0823"
  },
  metpally: {
    regionCode: "METT",
    subRegionCode: "METT",
    regionSlug: "metpally",
    latitude: "18.279756",
    longitude: "79.579837"
  },
  zaheerabad: {
    regionCode: "ZAGE",
    subRegionCode: "ZAGE",
    regionSlug: "zaheerabad",
    latitude: "17.6748",
    longitude: "77.6164"
  },
  kodad: {
    regionCode: "KODA",
    subRegionCode: "KODA",
    regionSlug: "kodad",
    latitude: "16.9951",
    longitude: "79.972"
  },
  gadwal: {
    regionCode: "GADW",
    subRegionCode: "GADW",
    regionSlug: "gadwal",
    latitude: "16.2337",
    longitude: "77.8081"
  },
  wanaparthy: {
    regionCode: "WANA",
    subRegionCode: "WANA",
    regionSlug: "wanaparthy",
    latitude: "16.362514",
    longitude: "78.063183"
  },
  vikarabad: {
    regionCode: "VKBD",
    subRegionCode: "VKBD",
    regionSlug: "vikarabad",
    latitude: "17.3364",
    longitude: "77.9048"
  },
  jangaon: {
    regionCode: "JNGN",
    subRegionCode: "JNGN",
    regionSlug: "jangaon",
    latitude: "17.7288",
    longitude: "79.1605"
  },
  bhadrachalam: {
    regionCode: "BHDR",
    subRegionCode: "BHDR",
    regionSlug: "bhadrachalam",
    latitude: "17.6688",
    longitude: "80.8936"
  },
  medak: {
    regionCode: "MDAK",
    subRegionCode: "MDAK",
    regionSlug: "medak",
    latitude: "17.8716",
    longitude: "78.1108"
  },
  huzurnagar: {
    regionCode: "HUZU",
    subRegionCode: "HUZU",
    regionSlug: "huzurnagar",
    latitude: "16.8983",
    longitude: "79.0917"
  },
  bhuvanagiri: {
    regionCode: "BHUV",
    subRegionCode: "BHUV",
    regionSlug: "bhuvanagiri",
    latitude: "11.4459",
    longitude: "79.653"
  },
  bhainsa: {
    regionCode: "BHAN",
    subRegionCode: "BHAN",
    regionSlug: "bhainsa",
    latitude: "19.1031",
    longitude: "77.9653"
  },
  narsampet: {
    regionCode: "NASP",
    subRegionCode: "NASP",
    regionSlug: "narsampet",
    latitude: "17.9281",
    longitude: "79.8945"
  }
};

// Results array to store all regions' data
const resultsArray = [];

// Fetch showtimes for all cities and store the results
async function fetchAllShowtimes() {
  const cityKeys = Object.keys(cities);
  for (let i = 0; i < cityKeys.length; i++) {
    const city = cities[cityKeys[i]];
    await fetchShowtimes(city, resultsArray);
  }

  // Log the final results (convert this to CSV or DataFrame if needed)
  console.table(resultsArray);

  // To convert resultsArray to CSV or use it in Python as a DataFrame,
  // save it to a CSV file or send it to a backend for further processing
}

// Fetch showtimes for all regions
fetchAllShowtimes();

  