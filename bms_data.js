
async function fetchShowtimes(city) {
    // API endpoint URL
    const url = `https://in.bookmyshow.com/api/movies-data/showtimes-by-event?appCode=MOBAND2&appVersion=14304&language=en&eventCode=ET00310216&regionCode=${city.regionCode}&subRegion=${city.subRegionCode}&bmsId=1.21345445.1703250084656&token=67x1xa33b4x422b361ba&lat=${city.latitude}&lon=${city.longitude}&query=`;
  
    // Headers specific to the city
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
      return processShowtimeData(data);
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
  
  // Function to process and aggregate showtime data
  function processShowtimeData(data) {
    const results = [];
  
    // Initialize total aggregation variables
    let grandTotalMaxSeats = 0;
    let grandTotalSeatsAvailable = 0;
    let grandTotalBookedTickets = 0;
    let grandTotalGross = 0;
    let grandBookedGross = 0;
  
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
  
          // Update grand totals
          grandTotalMaxSeats += totalMaxSeats;
          grandTotalSeatsAvailable += totalSeatsAvailable;
          grandTotalBookedTickets += totalBookedTickets;
          grandTotalGross += totalGross;
          grandBookedGross += bookedGross;
  
          // Calculate occupancy for each show
          const occupancy = ((totalBookedTickets / totalMaxSeats) * 100).toFixed(2);
  
          results.push({
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
  
    // Add the total row
    const grandOccupancy = ((grandTotalBookedTickets / grandTotalMaxSeats) * 100).toFixed(2);
    results.push({
      VenueName: "TOTAL",
      ShowTime: "",
      MaxSeats: grandTotalMaxSeats,
      SeatsAvailable: grandTotalSeatsAvailable,
      BookedTickets: grandTotalBookedTickets,
      Occupancy: `${grandOccupancy}%`,
      TotalGross: grandTotalGross.toFixed(2),
      BookedGross: grandBookedGross.toFixed(2)
    });
  
    console.table(results);
  
    // Display additional metrics
    console.log(`Total Shows: ${totalShows}`);
    console.log(`Fast Filling Shows: ${fastFillingShows}`);
    console.log(`Sold Out Shows: ${soldOutShows}`);
    console.log(`Total Booked Gross: ₹${grandBookedGross.toFixed(2)}`);
    console.log(`Total Gross (All Seats): ₹${grandTotalGross.toFixed(2)}`);
    console.log(`Total Occupancy: ${grandOccupancy}%`);
  
    return {
      results,
      totalShows,
      fastFillingShows,
      soldOutShows,
      totalBookedGross: grandBookedGross.toFixed(2),
      totalGross: grandTotalGross.toFixed(2),
      totalOccupancy: `${grandOccupancy}%`
    };
  }
  
  // Fetch showtimes for Hyderabad
  fetchShowtimes(cities.hyderabad);
  
  // Fetch showtimes for Bengaluru
  fetchShowtimes(cities.bengaluru);
  
  // Fetch showtimes for Chennai
  fetchShowtimes(cities.chennai);
  