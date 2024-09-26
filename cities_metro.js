// Store the results in an array for DataFrame conversion later
const aggregatedResults = [];

// Function to fetch showtimes for a given city
async function fetchShowtimes(city) {
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
    return processShowtimeData(data, city);
  } catch (error) {
    console.error('Error fetching showtimes:', error);
  }
}

// City configurations (Telangana regions, including Hyderabad, Bengaluru, Chennai)
const cities = {
  hyderabad: {
    regionCode: "HYD",
    subRegionCode: "HYD",
    regionSlug: "hyderabad",
    latitude: "17.385044",
    longitude: "78.486671"
  },
  bengaluru: {
    regionCode: "BANG",
    subRegionCode: "BANG",
    regionSlug: "bengaluru",
    latitude: "12.971599",
    longitude: "77.594563"
  },
  chennai: {
    regionCode: "CHEN",
    subRegionCode: "CHEN",
    regionSlug: "chennai",
    latitude: "13.056",
    longitude: "80.206"
  },
  // Add other Telangana regions like Adilabad, Warangal, etc.
};

// Function to process and aggregate showtime data
function processShowtimeData(data, city) {
  let grandTotalMaxSeats = 0;
  let grandTotalSeatsAvailable = 0;
  let grandTotalBookedTickets = 0;
  let grandTotalGross = 0;
  let grandBookedGross = 0;
  let totalShows = 0;

  data.ShowDetails.forEach(showDetail => {
    showDetail.Venues.forEach(venue => {
      venue.ShowTimes.forEach(showTime => {
        totalShows++;  // Count total shows

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

  const grandOccupancy = ((grandTotalBookedTickets / grandTotalMaxSeats) * 100).toFixed(2);

  // Add data for this city to the aggregatedResults array
  aggregatedResults.push({
    areaName: city.regionSlug,
    totalGross: grandTotalGross.toFixed(2),
    bookedGross: grandBookedGross.toFixed(2),
    occupancy: `${grandOccupancy}%`,
    totalShows: totalShows
  });

  console.log(`Data for ${city.regionSlug}:`, {
    totalGross: grandTotalGross.toFixed(2),
    bookedGross: grandBookedGross.toFixed(2),
    occupancy: `${grandOccupancy}%`,
    totalShows: totalShows
  });
}

// Fetch showtimes for all cities and regions
(async () => {
  for (const cityKey in cities) {
    if (cities.hasOwnProperty(cityKey)) {
      await fetchShowtimes(cities[cityKey]);
    }
  }

  // Log or export the aggregated results for DataFrame conversion
  console.table(aggregatedResults);

  // If you're using Node.js and a package like 'pandas-js' or 'danfojs', convert aggregatedResults to a DataFrame
  // In a Python environment, you can use `pandas.DataFrame(aggregatedResults)` after exporting this data
})();
