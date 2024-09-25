

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
      return processShowtimeData(data, city.cityName);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  }
  
  // City configurations
  const cities = {
    hyderabad: {
      regionCode: "HYD",
      subRegionCode: "HYD",
      regionSlug: "hyderabad",
      latitude: "17.385044",
      longitude: "78.486671",
      cityName: "Hyderabad"
    },
    bengaluru: {
      regionCode: "BANG",
      subRegionCode: "BANG",
      regionSlug: "bengaluru",
      latitude: "12.971599",
      longitude: "77.594563",
      cityName: "Bengaluru"
    },
    chennai: {
      regionCode: "CHEN",
      subRegionCode: "CHEN",
      regionSlug: "chennai",
      latitude: "13.056",
      longitude: "80.206",
      cityName: "Chennai"
    }
  };
  
  // Function to process and aggregate showtime data
  function processShowtimeData(data, cityName) {
    const results = {};
  
    // Metrics for total shows, fast-filling, and sold-out shows
    let totalShows = 0;
    let fastFillingShows = 0;
    let soldOutShows = 0;
  
    const fastFillingThreshold = 0.5; // 50% threshold for fast-filling shows
  
    data.ShowDetails.forEach(showDetail => {
      showDetail.Venues.forEach(venue => {
        venue.ShowTimes.forEach(showTime => {
          totalShows++;  // Count total shows
  
          // Initialize aggregation variables for each venue and showtime
          let totalMaxSeats = 0;
          let totalSeatsAvailable = 0;
          let totalBookedTickets = 0;
          let totalGross = 0;
          let bookedGross = 0;
  
          // Extract cinema chain from venue name (assumption: chain is part of venue name)
          const cinemaChain = extractCinemaChain(venue.VenueName);
          if (!results[cinemaChain]) {
            results[cinemaChain] = {
              totalBookedGross: 0,
              totalGross: 0,
              totalShows: 0,
              grandMaxSeats: 0,
              grandSeatsAvailable: 0,
              grandBookedTickets: 0,
              occupancy: 0,
              showDetails: []
            }; // Initialize object for new cinema chain
          }
  
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
  
          // Check if the show is sold out or fast-filling
          if (totalSeatsAvailable === 0) {
            soldOutShows++;  // Increment sold-out shows
          } else if ((totalMaxSeats - totalSeatsAvailable) / totalMaxSeats >= fastFillingThreshold) {
            fastFillingShows++;  // Increment fast-filling shows
          }
  
          // Update chain totals
          results[cinemaChain].totalBookedGross += bookedGross;
          results[cinemaChain].totalGross += totalGross;
          results[cinemaChain].totalShows++;
          results[cinemaChain].grandMaxSeats += totalMaxSeats;
          results[cinemaChain].grandSeatsAvailable += totalSeatsAvailable;
          results[cinemaChain].grandBookedTickets += totalBookedTickets;
  
          // Calculate occupancy for the current show
          const occupancy = ((totalBookedTickets / totalMaxSeats) * 100).toFixed(2);
          
          results[cinemaChain].showDetails.push({
            VenueName: venue.VenueName,
            ShowTime: showTime.ShowTime,
            MaxSeats: totalMaxSeats,
            SeatsAvailable: totalSeatsAvailable,
            BookedTickets: totalBookedTickets,
            Occupancy: `${occupancy}%`,
            TotalGross: totalGross.toFixed(2),
            BookedGross: bookedGross.toFixed(2)
          });
        });
      });
    });
  
    // Display results by city and chain
    console.log(`\nShowtimes for ${cityName}:`);
    Object.keys(results).forEach(chain => {
      const chainData = results[chain];
      const occupancy = ((chainData.grandBookedTickets / chainData.grandMaxSeats) * 100).toFixed(2);
      
      console.log(`\n${chain} Chain:`);
      console.log(`Total Shows: ${chainData.totalShows}`);
      console.log(`Total Booked Gross: ₹${chainData.totalBookedGross.toFixed(2)}`);
      console.log(`Total Gross (All Seats): ₹${chainData.totalGross.toFixed(2)}`);
      console.log(`Occupancy: ${occupancy}%`);
      console.table(chainData.showDetails);
    });
  
    // Display additional metrics for the city
    console.log(`\nTotal Shows: ${totalShows}`);
    console.log(`Fast Filling Shows: ${fastFillingShows}`);
    console.log(`Sold Out Shows: ${soldOutShows}`);
  }
  
  // Function to extract cinema chain from venue name
  function extractCinemaChain(venueName) {
    if (venueName.includes("PVR")) return "PVR";
    if (venueName.includes("Cinepolis")) return "Cinepolis";
    if (venueName.includes("Asian")) return "Asian";
    return "Independent"; // Default for any other venues
  }
  
  // Fetch showtimes for each city
  fetchShowtimes(cities.hyderabad);
  fetchShowtimes(cities.bengaluru);
  fetchShowtimes(cities.chennai);
  