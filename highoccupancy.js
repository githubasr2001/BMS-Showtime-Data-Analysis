

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
      return processShowtimeData(data, city.regionSlug);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  }
  
  // Function to process and aggregate showtime data for high occupancy theaters
  function processShowtimeData(data, cityName) {
    const highOccupancyTheaters = []; // Array to hold high occupancy theaters
  
    // Initialize total aggregation variables
    let grandTotalMaxSeats = 0;
    let grandTotalSeatsAvailable = 0;
    let grandTotalBookedTickets = 0;
    let grandTotalGross = 0;
  
    const highOccupancyThreshold = 60; // 60% threshold for high occupancy
  
    data.ShowDetails.forEach(showDetail => {
      showDetail.Venues.forEach(venue => {
        venue.ShowTimes.forEach(showTime => {
          // Initialize aggregation variables for each venue and showtime
          let totalMaxSeats = 0;
          let totalSeatsAvailable = 0;
          let totalBookedTickets = 0;
          let totalGross = 0;
  
          showTime.Categories.forEach(category => {
            const maxSeats = parseInt(category.MaxSeats, 10) || 0;
            const seatsAvail = parseInt(category.SeatsAvail, 10) || 0;
            const bookedTickets = maxSeats - seatsAvail;
            const currentPrice = parseFloat(category.CurPrice) || 0;
  
            totalMaxSeats += maxSeats;
            totalSeatsAvailable += seatsAvail;
            totalBookedTickets += bookedTickets;
  
            // Calculate gross based only on booked tickets
            totalGross += bookedTickets * currentPrice;
          });
  
          // Calculate occupancy for each show
          const occupancy = ((totalBookedTickets / totalMaxSeats) * 100).toFixed(2);
  
          // Check for high occupancy and store the theater info
          if (occupancy >= highOccupancyThreshold) {
            highOccupancyTheaters.push({
              City: cityName.charAt(0).toUpperCase() + cityName.slice(1), // Capitalize city name
              VenueName: venue.VenueName,
              Occupancy: `${occupancy}%`,
              TotalGross: totalGross.toFixed(2),
            });
          }
  
          // Update grand totals
          grandTotalMaxSeats += totalMaxSeats;
          grandTotalSeatsAvailable += totalSeatsAvailable;
          grandTotalBookedTickets += totalBookedTickets;
        });
      });
    });
  
    // Display high occupancy theaters with headings
    if (highOccupancyTheaters.length > 0) {
      console.log(`\nHigh Occupancy Theaters in ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}:`);
      console.table(highOccupancyTheaters);
    } else {
      console.log(`No theaters with high occupancy found in ${cityName.charAt(0).toUpperCase() + cityName.slice(1)}.`);
    }
  
    // Calculate total gross from high occupancy theaters
    const totalHighOccupancyGross = highOccupancyTheaters.reduce((sum, theater) => sum + parseFloat(theater.TotalGross), 0).toFixed(2);
  
    return {
      highOccupancyTheaters,
      totalShows: highOccupancyTheaters.length, // Return the number of high occupancy shows found
      totalGross: totalHighOccupancyGross, // Total gross from high occupancy theaters
      averageOccupancy: highOccupancyTheaters.length ? highOccupancyTheaters.map(t => parseFloat(t.Occupancy)).reduce((sum, occupancy) => sum + occupancy, 0) / highOccupancyTheaters.length : 0 // Average occupancy from high occupancy theaters
    };
  }
  
  // Call the function for each city
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
    }
  };
  
  // Fetch showtimes for each city
  Promise.all([
    fetchShowtimes(cities.hyderabad),
    fetchShowtimes(cities.bengaluru),
    fetchShowtimes(cities.chennai)
  ]).then(results => {
    results.forEach(result => {
      if (result.highOccupancyTheaters.length) {
        console.log(`\nTotal Gross from High Occupancy Theaters in ${result.highOccupancyTheaters[0].City}: ₹${result.totalGross}`);
        console.log(`Average Occupancy in High Occupancy Theaters in ${result.highOccupancyTheaters[0].City}: ${result.averageOccupancy.toFixed(2)}%`);
      }
    });
  });
  
  