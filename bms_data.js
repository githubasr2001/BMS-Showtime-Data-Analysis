// Function to fetch showtimes for a given city
async function fetchShowtimes(city) {
  const url = `https://in.bookmyshow.com/api/movies-data/showtimes-by-event?appCode=MOBAND2&appVersion=14304&language=en&eventCode=ET00310216&regionCode=${city.region_code}&subRegion=${city.sub_region_code}&bmsId=1.21345445.1703250084656&token=67x1xa33b4x422b361ba&lat=${city.latitude}&lon=${city.longitude}&query=`;

  const headers = {
    "Host": "in.bookmyshow.com",
    "x-bms-id": "1.21345445.1703250084656",
    "x-region-code": city.region_code,
    "x-subregion-code": city.sub_region_code,
    "x-region-slug": city.region_slug,
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

// Function to process and aggregate showtime data
function processShowtimeData(data) {
  const results = [];
  
  let grandTotalMaxSeats = 0;
  let grandTotalSeatsAvailable = 0;
  let grandTotalBookedTickets = 0;
  let grandTotalGross = 0;
  let grandBookedGross = 0;

  let totalShows = 0;
  let fastFillingShows = 0;
  let soldOutShows = 0;

  const fastFillingThreshold = 0.5; // 50% threshold for fast-filling shows

  data.ShowDetails.forEach(showDetail => {
    showDetail.Venues.forEach(venue => {
      venue.ShowTimes.forEach(showTime => {
        totalShows++;
        
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

        if (totalSeatsAvailable === 0) {
          soldOutShows++;
        } else if ((totalMaxSeats - totalSeatsAvailable) / totalMaxSeats >= fastFillingThreshold) {
          fastFillingShows++;
        }

        grandTotalMaxSeats += totalMaxSeats;
        grandTotalSeatsAvailable += totalSeatsAvailable;
        grandTotalBookedTickets += totalBookedTickets;
        grandTotalGross += totalGross;
        grandBookedGross += bookedGross;

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

// Array of cities from the provided JSON data
const cities = 
[
    {
        "city_code": "MUMBAI",
        "region_code": "MUMBAI",
        "sub_region_code": "MUMBAI",
        "region_slug": "mumbai",
        "latitude": "19.076",
        "longitude": "72.8777"
    },
    {
        "city_code": "MUMBAI",
        "region_code": "MUMBAI",
        "sub_region_code": "MWEST",
        "region_slug": "mumbai-western",
        "latitude": "19.12175",
        "longitude": "72.8504"
    },
    {
        "city_code": "MUMBAI",
        "region_code": "MUMBAI",
        "sub_region_code": "MCENT",
        "region_slug": "mumbai-south-central",
        "latitude": "19.0653",
        "longitude": "72.87942"
    },
    {
        "city_code": "MUMBAI",
        "region_code": "MUMBAI",
        "sub_region_code": "THAN",
        "region_slug": "navi-mumbai",
        "latitude": "19.1101",
        "longitude": "73.0625"
    },
    {
        "city_code": "MUMBAI",
        "region_code": "MUMBAI",
        "sub_region_code": "THNE",
        "region_slug": "thane",
        "latitude": "19.2183",
        "longitude": "72.9781"
    },
    {
        "city_code": "MUMBAI",
        "region_code": "MUMBAI",
        "sub_region_code": "KALYAN",
        "region_slug": "kalyan",
        "latitude": "19.241201",
        "longitude": "73.12906"
    },
    {
        "city_code": "MUMBAI",
        "region_code": "MUMBAI",
        "sub_region_code": "ULHA",
        "region_slug": "ulhasnagar",
        "latitude": "19.218",
        "longitude": "73.1631"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "NCR",
        "region_slug": "national-capital-region-ncr",
        "latitude": "28.6139",
        "longitude": "77.209"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "DELHI",
        "region_slug": "delhi",
        "latitude": "28.635308",
        "longitude": "77.22496"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "GURG",
        "region_slug": "gurugram-gurgaon",
        "latitude": "28.4595",
        "longitude": "77.0266"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "NOIDA",
        "region_slug": "noida",
        "latitude": "28.539",
        "longitude": "77.389"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "GHAZ",
        "region_slug": "ghaziabad",
        "latitude": "28.682",
        "longitude": "77.427"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "KUND",
        "region_slug": "kundli",
        "latitude": "28.86886",
        "longitude": "77.116706"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "GRET",
        "region_slug": "greater-noida",
        "latitude": "28.4744",
        "longitude": "77.504"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "FARI",
        "region_slug": "faridabad",
        "latitude": "28.4089",
        "longitude": "77.3178"
    },
    {
        "city_code": "NCR",
        "region_code": "NCR",
        "sub_region_code": "PKWA",
        "region_slug": "pilkhuwa",
        "latitude": "28.7076",
        "longitude": "77.6565"
    },
    {
        "city_code": "BANG",
        "region_code": "BANG",
        "sub_region_code": "BANG",
        "region_slug": "bengaluru",
        "latitude": "12.971599",
        "longitude": "77.594563"
    },
    {
        "city_code": "HYD",
        "region_code": "HYD",
        "sub_region_code": "HYD",
        "region_slug": "hyderabad",
        "latitude": "17.385044",
        "longitude": "78.486671"
    },
    {
        "city_code": "AHD",
        "region_code": "AHD",
        "sub_region_code": "AHD",
        "region_slug": "ahmedabad",
        "latitude": "23.039568",
        "longitude": "72.566005"
    },
    {
        "city_code": "CHD",
        "region_code": "CHD",
        "sub_region_code": "CHD",
        "region_slug": "chandigarh",
        "latitude": "30.733315",
        "longitude": "76.779418"
    },
    {
        "city_code": "CHD",
        "region_code": "CHD",
        "sub_region_code": "MOLI",
        "region_slug": "mohali",
        "latitude": "30.705704",
        "longitude": "76.721413"
    },
    {
        "city_code": "CHD",
        "region_code": "CHD",
        "sub_region_code": "ZRIK",
        "region_slug": "zirakpur",
        "latitude": "30.6425",
        "longitude": "76.8173"
    },
    {
        "city_code": "CHEN",
        "region_code": "CHEN",
        "sub_region_code": "CHEN",
        "region_slug": "chennai",
        "latitude": "13.056",
        "longitude": "80.206"
    },
    {
        "city_code": "PUNE",
        "region_code": "PUNE",
        "sub_region_code": "PUNE",
        "region_slug": "pune",
        "latitude": "18.52043",
        "longitude": "73.856744"
    },
    {
        "city_code": "KOLK",
        "region_code": "KOLK",
        "sub_region_code": "KOLK",
        "region_slug": "kolkata",
        "latitude": "22.641",
        "longitude": "88.411"
    },
    {
        "city_code": "KOCH",
        "region_code": "KOCH",
        "sub_region_code": "KOCH",
        "region_slug": "kochi",
        "latitude": "9.931233",
        "longitude": "76.267304"
    },
    {
        "city_code": "AALU",
        "region_code": "AALU",
        "sub_region_code": "AALU",
        "region_slug": "aalo",
        "latitude": "28.163707",
        "longitude": "94.787013"
    },
    {
        "city_code": "ABOR",
        "region_code": "ABOR",
        "sub_region_code": "ABOR",
        "region_slug": "abohar",
        "latitude": "30.1453",
        "longitude": "74.1993"
    },
    {
        "city_code": "ABRD",
        "region_code": "ABRD",
        "sub_region_code": "ABRD",
        "region_slug": "abu-road",
        "latitude": "24.531445",
        "longitude": "72.73336"
    },
    {
        "city_code": "ACHM",
        "region_code": "ACHM",
        "sub_region_code": "ACHM",
        "region_slug": "achampet",
        "latitude": "16.399035",
        "longitude": "78.636713"
    },
    {
        "city_code": "ACHA",
        "region_code": "ACHA",
        "sub_region_code": "ACHA",
        "region_slug": "acharapakkam",
        "latitude": "12.4035",
        "longitude": "79.8157"
    },
    {
        "city_code": "ADKI",
        "region_code": "ADKI",
        "sub_region_code": "ADKI",
        "region_slug": "addanki",
        "latitude": "15.8107",
        "longitude": "79.9724"
    },
    {
        "city_code": "ADIL",
        "region_code": "ADIL",
        "sub_region_code": "ADIL",
        "region_slug": "adilabad",
        "latitude": "19.6667",
        "longitude": "78.5333"
    },
    {
        "city_code": "ADIM",
        "region_code": "ADIM",
        "sub_region_code": "ADIM",
        "region_slug": "adimali",
        "latitude": "10.0115",
        "longitude": "76.9528"
    },
    {
        "city_code": "ADPR",
        "region_code": "ADPR",
        "sub_region_code": "ADPR",
        "region_slug": "adipur",
        "latitude": "23.073639",
        "longitude": "70.090562"
    },
    {
        "city_code": "ADNI",
        "region_code": "ADNI",
        "sub_region_code": "ADNI",
        "region_slug": "adoni",
        "latitude": "15.6322",
        "longitude": "77.2728"
    },
    {
        "city_code": "AGOR",
        "region_code": "AGOR",
        "sub_region_code": "AGOR",
        "region_slug": "agar-malwa",
        "latitude": "23.711416",
        "longitude": "76.00976"
    },
    {
        "city_code": "AGAR",
        "region_code": "AGAR",
        "sub_region_code": "AGAR",
        "region_slug": "agartala",
        "latitude": "23.8333",
        "longitude": "91.2667"
    },
    {
        "city_code": "AGIR",
        "region_code": "AGIR",
        "sub_region_code": "AGIR",
        "region_slug": "agiripalli",
        "latitude": "16.68",
        "longitude": "80.7852"
    },
    {
        "city_code": "AGRA",
        "region_code": "AGRA",
        "sub_region_code": "AGRA",
        "region_slug": "agra",
        "latitude": "27.17667",
        "longitude": "78.008075"
    },
    {
        "city_code": "AHMG",
        "region_code": "AHMG",
        "sub_region_code": "AHMG",
        "region_slug": "ahmedgarh",
        "latitude": "30.678192",
        "longitude": "75.827631"
    },
    {
        "city_code": "AHMED",
        "region_code": "AHMED",
        "sub_region_code": "AHMED",
        "region_slug": "ahmednagar",
        "latitude": "19.11033",
        "longitude": "74.672868"
    },
    {
        "city_code": "AHOR",
        "region_code": "AHOR",
        "sub_region_code": "AHOR",
        "region_slug": "ahore",
        "latitude": "25.3723",
        "longitude": "72.7777"
    },
    {
        "city_code": "AIZW",
        "region_code": "AIZW",
        "sub_region_code": "AIZW",
        "region_slug": "aizawl",
        "latitude": "23.7307",
        "longitude": "92.7173"
    },
    {
        "city_code": "AJMER",
        "region_code": "AJMER",
        "sub_region_code": "AJMER",
        "region_slug": "ajmer",
        "latitude": "26.45",
        "longitude": "74.64"
    },
    {
        "city_code": "AKAL",
        "region_code": "AKAL",
        "sub_region_code": "AKAL",
        "region_slug": "akaltara",
        "latitude": "22.024497",
        "longitude": "82.423551"
    },
    {
        "city_code": "AKBR",
        "region_code": "AKBR",
        "sub_region_code": "AKBR",
        "region_slug": "akbarpur",
        "latitude": "26.433258",
        "longitude": "82.518696"
    },
    {
        "city_code": "AKVD",
        "region_code": "AKVD",
        "sub_region_code": "AKVD",
        "region_slug": "akividu",
        "latitude": "16.5823",
        "longitude": "81.3784"
    },
    {
        "city_code": "AKLJ",
        "region_code": "AKLJ",
        "sub_region_code": "AKLJ",
        "region_slug": "akluj",
        "latitude": "17.8824",
        "longitude": "75.0205"
    },
    {
        "city_code": "AKOL",
        "region_code": "AKOL",
        "sub_region_code": "AKOL",
        "region_slug": "akola",
        "latitude": "20.70388",
        "longitude": "76.997093"
    },
    {
        "city_code": "TKOT",
        "region_code": "TKOT",
        "sub_region_code": "TKOT",
        "region_slug": "akot",
        "latitude": "21.0973",
        "longitude": "77.0536"
    },
    {
        "city_code": "ALAK",
        "region_code": "ALAK",
        "sub_region_code": "ALAK",
        "region_slug": "alakode",
        "latitude": "12.191",
        "longitude": "75.4673"
    },
    {
        "city_code": "ALNI",
        "region_code": "ALNI",
        "sub_region_code": "ALNI",
        "region_slug": "alangudi",
        "latitude": "10.3589",
        "longitude": "78.9769"
    },
    {
        "city_code": "ALKM",
        "region_code": "ALKM",
        "sub_region_code": "ALKM",
        "region_slug": "alangulam",
        "latitude": "8.8646",
        "longitude": "77.496"
    },
    {
        "city_code": "ALPZ",
        "region_code": "ALPZ",
        "sub_region_code": "ALPZ",
        "region_slug": "alappuzha",
        "latitude": "9.4981",
        "longitude": "76.3388"
    },
    {
        "city_code": "ALAR",
        "region_code": "ALAR",
        "sub_region_code": "ALAR",
        "region_slug": "alathur",
        "latitude": "10.6454",
        "longitude": "76.5458"
    },
    {
        "city_code": "ALBG",
        "region_code": "ALBG",
        "sub_region_code": "ALBG",
        "region_slug": "alibaug",
        "latitude": "18.6554",
        "longitude": "72.8671"
    },
    {
        "city_code": "ALI",
        "region_code": "ALI",
        "sub_region_code": "ALI",
        "region_slug": "aligarh",
        "latitude": "27.89381",
        "longitude": "78.068138"
    },
    {
        "city_code": "ALIP",
        "region_code": "ALIP",
        "sub_region_code": "ALIP",
        "region_slug": "alipurduar",
        "latitude": "26.4922",
        "longitude": "89.532"
    },
    {
        "city_code": "ALMO",
        "region_code": "ALMO",
        "sub_region_code": "ALMO",
        "region_slug": "almora",
        "latitude": "29.815",
        "longitude": "79.2902"
    },
    {
        "city_code": "ALSR",
        "region_code": "ALSR",
        "sub_region_code": "ALSR",
        "region_slug": "alsisar-rajasthan",
        "latitude": "28.3067",
        "longitude": "75.2873"
    },
    {
        "city_code": "ALUR",
        "region_code": "ALUR",
        "sub_region_code": "ALUR",
        "region_slug": "alur",
        "latitude": "12.9793",
        "longitude": "75.9913"
    },
    {
        "city_code": "ALWR",
        "region_code": "ALWR",
        "sub_region_code": "ALWR",
        "region_slug": "alwar",
        "latitude": "27.554637",
        "longitude": "76.611356"
    },
    {
        "city_code": "ADAM",
        "region_code": "ADAM",
        "sub_region_code": "ADAM",
        "region_slug": "amadalavalasa",
        "latitude": "18.4101",
        "longitude": "83.903"
    },
    {
        "city_code": "AMAP",
        "region_code": "AMAP",
        "sub_region_code": "AMAP",
        "region_slug": "amalapuram",
        "latitude": "16.5721",
        "longitude": "82.0009"
    },
    {
        "city_code": "AMLN",
        "region_code": "AMLN",
        "sub_region_code": "AMLN",
        "region_slug": "amalner",
        "latitude": "21.0419",
        "longitude": "75.0582"
    },
    {
        "city_code": "AMAN",
        "region_code": "AMAN",
        "sub_region_code": "AMAN",
        "region_slug": "amangal",
        "latitude": "16.8494",
        "longitude": "78.5303"
    },
    {
        "city_code": "ZAMA",
        "region_code": "ZAMA",
        "sub_region_code": "ZAMA",
        "region_slug": "amanpur",
        "latitude": "27.7126",
        "longitude": "78.7391"
    },
    {
        "city_code": "AVTI",
        "region_code": "AVTI",
        "sub_region_code": "AVTI",
        "region_slug": "amaravathi",
        "latitude": "16.573",
        "longitude": "80.3575"
    },
    {
        "city_code": "AMBG",
        "region_code": "AMBG",
        "sub_region_code": "AMBG",
        "region_slug": "ambajogai",
        "latitude": "18.7271",
        "longitude": "76.3811"
    },
    {
        "city_code": "AMB",
        "region_code": "AMB",
        "sub_region_code": "AMB",
        "region_slug": "ambala",
        "latitude": "30.378179",
        "longitude": "76.776697"
    },
    {
        "city_code": "AMBI",
        "region_code": "AMBI",
        "sub_region_code": "AMBI",
        "region_slug": "ambikapur",
        "latitude": "23.1355",
        "longitude": "83.1818"
    },
    {
        "city_code": "AMBR",
        "region_code": "AMBR",
        "sub_region_code": "AMBR",
        "region_slug": "ambur",
        "latitude": "12.7904",
        "longitude": "78.7166"
    },
    {
        "city_code": "AMGN",
        "region_code": "AMGN",
        "sub_region_code": "AMGN",
        "region_slug": "amgaon",
        "latitude": "21.367209",
        "longitude": "80.381205"
    },
    {
        "city_code": "AMRA",
        "region_code": "AMRA",
        "sub_region_code": "AMRA",
        "region_slug": "amravati",
        "latitude": "20.938882",
        "longitude": "77.780457"
    },
    {
        "city_code": "AMRE",
        "region_code": "AMRE",
        "sub_region_code": "AMRE",
        "region_slug": "amreli",
        "latitude": "21.60451",
        "longitude": "71.221475"
    },
    {
        "city_code": "AMRI",
        "region_code": "AMRI",
        "sub_region_code": "AMRI",
        "region_slug": "amritsar",
        "latitude": "31.633979",
        "longitude": "74.872264"
    },
    {
        "city_code": "AMRO",
        "region_code": "AMRO",
        "sub_region_code": "AMRO",
        "region_slug": "amroha",
        "latitude": "28.9044",
        "longitude": "78.4673"
    },
    {
        "city_code": "ANAI",
        "region_code": "ANAI",
        "sub_region_code": "ANAI",
        "region_slug": "anaikatti",
        "latitude": "11.1048",
        "longitude": "76.7683"
    },
    {
        "city_code": "ANKP",
        "region_code": "ANKP",
        "sub_region_code": "ANKP",
        "region_slug": "anakapalle",
        "latitude": "17.6896",
        "longitude": "82.9977"
    },
    {
        "city_code": "AND",
        "region_code": "AND",
        "sub_region_code": "AND",
        "region_slug": "anand",
        "latitude": "22.560869",
        "longitude": "72.954773"
    },
    {
        "city_code": "ANPR",
        "region_code": "ANPR",
        "sub_region_code": "ANPR",
        "region_slug": "anandapur",
        "latitude": "21.2148",
        "longitude": "86.1249"
    },
    {
        "city_code": "ANTT",
        "region_code": "ANTT",
        "sub_region_code": "ANTT",
        "region_slug": "anantapalli",
        "latitude": "16.975553",
        "longitude": "81.439344"
    },
    {
        "city_code": "ANAN",
        "region_code": "ANAN",
        "sub_region_code": "ANAN",
        "region_slug": "anantapur",
        "latitude": "14.5216",
        "longitude": "77.7452"
    },
    {
        "city_code": "ANPT",
        "region_code": "ANPT",
        "sub_region_code": "ANPT",
        "region_slug": "anaparthi",
        "latitude": "16.9341",
        "longitude": "81.9555"
    },
    {
        "city_code": "ANHL",
        "region_code": "ANHL",
        "sub_region_code": "ANHL",
        "region_slug": "anchal",
        "latitude": "8.93",
        "longitude": "76.9065"
    },
    {
        "city_code": "AANI",
        "region_code": "AANI",
        "sub_region_code": "AANI",
        "region_slug": "andaman-and-nicobar",
        "latitude": "11.7401",
        "longitude": "92.6586"
    },
    {
        "city_code": "ANEK",
        "region_code": "ANEK",
        "sub_region_code": "ANEK",
        "region_slug": "anekal",
        "latitude": "12.7105",
        "longitude": "77.6911"
    },
    {
        "city_code": "ANDM",
        "region_code": "ANDM",
        "sub_region_code": "ANDM",
        "region_slug": "angadipuram",
        "latitude": "10.9718",
        "longitude": "76.2103"
    },
    {
        "city_code": "ANGA",
        "region_code": "ANGA",
        "sub_region_code": "ANGA",
        "region_slug": "angamaly",
        "latitude": "10.1849",
        "longitude": "76.3753"
    },
    {
        "city_code": "ANGR",
        "region_code": "ANGR",
        "sub_region_code": "ANGR",
        "region_slug": "angara",
        "latitude": "16.77274",
        "longitude": "81.924555"
    },
    {
        "city_code": "ANGL",
        "region_code": "ANGL",
        "sub_region_code": "ANGL",
        "region_slug": "angul",
        "latitude": "20.9211",
        "longitude": "84.8568"
    },
    {
        "city_code": "ANJA",
        "region_code": "ANJA",
        "sub_region_code": "ANJA",
        "region_slug": "anjad",
        "latitude": "22.0431",
        "longitude": "75.0538"
    },
    {
        "city_code": "ANJR",
        "region_code": "ANJR",
        "sub_region_code": "ANJR",
        "region_slug": "anjar",
        "latitude": "23.1135",
        "longitude": "70.026"
    },
    {
        "city_code": "ANKV",
        "region_code": "ANKV",
        "sub_region_code": "ANKV",
        "region_slug": "anklav",
        "latitude": "22.3775",
        "longitude": "72.9992"
    },
    {
        "city_code": "ANKL",
        "region_code": "ANKL",
        "sub_region_code": "ANKL",
        "region_slug": "ankleshwar",
        "latitude": "21.6264",
        "longitude": "73.0152"
    },
    {
        "city_code": "ANKO",
        "region_code": "ANKO",
        "sub_region_code": "ANKO",
        "region_slug": "ankola",
        "latitude": "14.6653",
        "longitude": "74.3001"
    },
    {
        "city_code": "ANVR",
        "region_code": "ANVR",
        "sub_region_code": "ANVR",
        "region_slug": "annavaram",
        "latitude": "17.2789",
        "longitude": "82.4013"
    },
    {
        "city_code": "ANGI",
        "region_code": "ANGI",
        "sub_region_code": "ANGI",
        "region_slug": "annigeri",
        "latitude": "15.4273",
        "longitude": "75.4316"
    },
    {
        "city_code": "ATYR",
        "region_code": "ATYR",
        "sub_region_code": "ATYR",
        "region_slug": "anthiyur",
        "latitude": "11.5771",
        "longitude": "77.5877"
    },
    {
        "city_code": "APRA",
        "region_code": "APRA",
        "sub_region_code": "APRA",
        "region_slug": "apra",
        "latitude": "31.0861",
        "longitude": "75.8781"
    },
    {
        "city_code": "ARAK",
        "region_code": "ARAK",
        "sub_region_code": "ARAK",
        "region_slug": "arakkonam",
        "latitude": "13.0752",
        "longitude": "79.6558"
    },
    {
        "city_code": "AMBH",
        "region_code": "AMBH",
        "sub_region_code": "AMBH",
        "region_slug": "arambagh",
        "latitude": "22.88615",
        "longitude": "87.78427"
    },
    {
        "city_code": "ARMB",
        "region_code": "ARMB",
        "sub_region_code": "ARMB",
        "region_slug": "arambol",
        "latitude": "15.684689",
        "longitude": "73.703284"
    },
    {
        "city_code": "ARNT",
        "region_code": "ARNT",
        "sub_region_code": "ARNT",
        "region_slug": "aranthangi",
        "latitude": "10.1692",
        "longitude": "79.0023"
    },
    {
        "city_code": "ARAV",
        "region_code": "ARAV",
        "sub_region_code": "ARAV",
        "region_slug": "aravakurichi",
        "latitude": "10.7747",
        "longitude": "77.909"
    },
    {
        "city_code": "ARIY",
        "region_code": "ARIY",
        "sub_region_code": "ARIY",
        "region_slug": "ariyalur",
        "latitude": "11.2399",
        "longitude": "79.2902"
    },
    {
        "city_code": "ARGU",
        "region_code": "ARGU",
        "sub_region_code": "ARGU",
        "region_slug": "arkalgud",
        "latitude": "12.764",
        "longitude": "76.0609"
    },
    {
        "city_code": "ARMO",
        "region_code": "ARMO",
        "sub_region_code": "ARMO",
        "region_slug": "armoor",
        "latitude": "18.7895",
        "longitude": "78.2893"
    },
    {
        "city_code": "ARNI",
        "region_code": "ARNI",
        "sub_region_code": "ARNI",
        "region_slug": "arni",
        "latitude": "12.67",
        "longitude": "79.28"
    },
    {
        "city_code": "ARSI",
        "region_code": "ARSI",
        "sub_region_code": "ARSI",
        "region_slug": "arsikere",
        "latitude": "13.3105",
        "longitude": "76.2537"
    },
    {
        "city_code": "ARUP",
        "region_code": "ARUP",
        "sub_region_code": "ARUP",
        "region_slug": "aruppukottai",
        "latitude": "9.521597",
        "longitude": "78.088196"
    },
    {
        "city_code": "ASANSOL",
        "region_code": "ASANSOL",
        "sub_region_code": "ASANSOL",
        "region_slug": "asansol",
        "latitude": "23.6739",
        "longitude": "86.9524"
    },
    {
        "city_code": "AKMP",
        "region_code": "AKMP",
        "sub_region_code": "AKMP",
        "region_slug": "ashoknagar",
        "latitude": "24.577162",
        "longitude": "77.731527"
    },
    {
        "city_code": "ASNA",
        "region_code": "ASNA",
        "sub_region_code": "ASNA",
        "region_slug": "ashoknagar-west-bengal",
        "latitude": "22.8252",
        "longitude": "88.6287"
    },
    {
        "city_code": "ASTA",
        "region_code": "ASTA",
        "sub_region_code": "ASTA",
        "region_slug": "ashta",
        "latitude": "23.018",
        "longitude": "76.716"
    },
    {
        "city_code": "ASMA",
        "region_code": "ASMA",
        "sub_region_code": "ASMA",
        "region_slug": "ashta-maharashtra",
        "latitude": "16.9483",
        "longitude": "74.4115"
    },
    {
        "city_code": "ASIK",
        "region_code": "ASIK",
        "sub_region_code": "ASIK",
        "region_slug": "asika",
        "latitude": "19.6159",
        "longitude": "84.6649"
    },
    {
        "city_code": "ASWA",
        "region_code": "ASWA",
        "sub_region_code": "ASWA",
        "region_slug": "aswaraopeta",
        "latitude": "17.2445",
        "longitude": "81.1313"
    },
    {
        "city_code": "ATHG",
        "region_code": "ATHG",
        "sub_region_code": "ATHG",
        "region_slug": "athagarh",
        "latitude": "20.5174",
        "longitude": "85.6306"
    },
    {
        "city_code": "ATHN",
        "region_code": "ATHN",
        "sub_region_code": "ATHN",
        "region_slug": "athani",
        "latitude": "16.7269",
        "longitude": "75.0641"
    },
    {
        "city_code": "ATMK",
        "region_code": "ATMK",
        "sub_region_code": "ATMK",
        "region_slug": "atmakur-nellore",
        "latitude": "14.6167",
        "longitude": "79.6245"
    },
    {
        "city_code": "ATPA",
        "region_code": "ATPA",
        "sub_region_code": "ATPA",
        "region_slug": "atpadi",
        "latitude": "17.4287",
        "longitude": "74.9383"
    },
    {
        "city_code": "ATRA",
        "region_code": "ATRA",
        "sub_region_code": "ATRA",
        "region_slug": "atraulia",
        "latitude": "26.3337",
        "longitude": "82.9468"
    },
    {
        "city_code": "ATTO",
        "region_code": "ATTO",
        "sub_region_code": "ATTO",
        "region_slug": "attibele",
        "latitude": "12.779",
        "longitude": "77.7702"
    },
    {
        "city_code": "ATLI",
        "region_code": "ATLI",
        "sub_region_code": "ATLI",
        "region_slug": "attili",
        "latitude": "16.6885",
        "longitude": "81.6037"
    },
    {
        "city_code": "ATTI",
        "region_code": "ATTI",
        "sub_region_code": "ATTI",
        "region_slug": "attingal",
        "latitude": "8.6982",
        "longitude": "76.8137"
    },
    {
        "city_code": "ATTR",
        "region_code": "ATTR",
        "sub_region_code": "ATTR",
        "region_slug": "attur",
        "latitude": "11.5963",
        "longitude": "78.5989"
    },
    {
        "city_code": "AURA",
        "region_code": "AURA",
        "sub_region_code": "AURA",
        "region_slug": "aurangabad",
        "latitude": "19.876",
        "longitude": "75.349"
    },
    {
        "city_code": "AUBI",
        "region_code": "AUBI",
        "sub_region_code": "AUBI",
        "region_slug": "aurangabad-bihar",
        "latitude": "24.7033",
        "longitude": "84.3542"
    },
    {
        "city_code": "AURW",
        "region_code": "AURW",
        "sub_region_code": "AURW",
        "region_slug": "aurangabad-west-bengal",
        "latitude": "24.5976",
        "longitude": "88.0339"
    },
    {
        "city_code": "AURV",
        "region_code": "AURV",
        "sub_region_code": "AURV",
        "region_slug": "auroville",
        "latitude": "12.003136",
        "longitude": "79.801769"
    },
    {
        "city_code": "AUSH",
        "region_code": "AUSH",
        "sub_region_code": "AUSH",
        "region_slug": "aushapur",
        "latitude": "17.462",
        "longitude": "78.7356"
    },
    {
        "city_code": "AVII",
        "region_code": "AVII",
        "sub_region_code": "AVII",
        "region_slug": "avinashi",
        "latitude": "11.1914",
        "longitude": "77.2689"
    },
    {
        "city_code": "AYOD",
        "region_code": "AYOD",
        "sub_region_code": "AYOD",
        "region_slug": "ayodhya",
        "latitude": "26.7922",
        "longitude": "82.1998"
    },
    {
        "city_code": "AZMG",
        "region_code": "AZMG",
        "sub_region_code": "AZMG",
        "region_slug": "azamgarh",
        "latitude": "26.0737",
        "longitude": "83.1859"
    },
    {
        "city_code": "BKOT",
        "region_code": "BKOT",
        "sub_region_code": "BKOT",
        "region_slug": "b-kothakota",
        "latitude": "13.65674",
        "longitude": "78.265857"
    },
    {
        "city_code": "BAMA",
        "region_code": "BAMA",
        "sub_region_code": "BAMA",
        "region_slug": "badami",
        "latitude": "15.9186",
        "longitude": "75.6761"
    },
    {
        "city_code": "BADN",
        "region_code": "BADN",
        "sub_region_code": "BADN",
        "region_slug": "badaun",
        "latitude": "28.0337",
        "longitude": "79.1205"
    },
    {
        "city_code": "BADD",
        "region_code": "BADD",
        "sub_region_code": "BADD",
        "region_slug": "baddi",
        "latitude": "30.9578",
        "longitude": "76.7914"
    },
    {
        "city_code": "BAHR",
        "region_code": "BAHR",
        "sub_region_code": "BAHR",
        "region_slug": "badhra",
        "latitude": "29.1043",
        "longitude": "75.1655"
    },
    {
        "city_code": "BADA",
        "region_code": "BADA",
        "sub_region_code": "BADA",
        "region_slug": "badnagar",
        "latitude": "23.0504",
        "longitude": "75.3774"
    },
    {
        "city_code": "BADR",
        "region_code": "BADR",
        "sub_region_code": "BADR",
        "region_slug": "badnawar",
        "latitude": "23.0208",
        "longitude": "75.2336"
    },
    {
        "city_code": "BADV",
        "region_code": "BADV",
        "sub_region_code": "BADV",
        "region_slug": "badvel",
        "latitude": "14.7309",
        "longitude": "79.0589"
    },
    {
        "city_code": "BAAG",
        "region_code": "BAAG",
        "sub_region_code": "BAAG",
        "region_slug": "bagaha",
        "latitude": "27.1222",
        "longitude": "84.0722"
    },
    {
        "city_code": "BAGA",
        "region_code": "BAGA",
        "sub_region_code": "BAGA",
        "region_slug": "bagalkot",
        "latitude": "16.1725",
        "longitude": "75.6557"
    },
    {
        "city_code": "BBHA",
        "region_code": "BBHA",
        "sub_region_code": "BBHA",
        "region_slug": "bagbahara",
        "latitude": "21.0595",
        "longitude": "82.3723"
    },
    {
        "city_code": "BGPI",
        "region_code": "BGPI",
        "sub_region_code": "BGPI",
        "region_slug": "bagepalli",
        "latitude": "13.783573",
        "longitude": "77.792202"
    },
    {
        "city_code": "BAPU",
        "region_code": "BAPU",
        "sub_region_code": "BAPU",
        "region_slug": "bagha-purana",
        "latitude": "30.685679",
        "longitude": "75.094003"
    },
    {
        "city_code": "BGAM",
        "region_code": "BGAM",
        "sub_region_code": "BGAM",
        "region_slug": "baghmari",
        "latitude": "22.587",
        "longitude": "88.3876"
    },
    {
        "city_code": "BAGN",
        "region_code": "BAGN",
        "sub_region_code": "BAGN",
        "region_slug": "bagnan",
        "latitude": "22.4671",
        "longitude": "87.9702"
    },
    {
        "city_code": "BAGU",
        "region_code": "BAGU",
        "sub_region_code": "BAGU",
        "region_slug": "bagru",
        "latitude": "26.8093",
        "longitude": "75.5417"
    },
    {
        "city_code": "BAHD",
        "region_code": "BAHD",
        "sub_region_code": "BAHD",
        "region_slug": "bahadurgarh",
        "latitude": "28.6924",
        "longitude": "76.924"
    },
    {
        "city_code": "BHRH",
        "region_code": "BHRH",
        "sub_region_code": "BHRH",
        "region_slug": "bahraich",
        "latitude": "27.570867",
        "longitude": "81.598175"
    },
    {
        "city_code": "BAID",
        "region_code": "BAID",
        "sub_region_code": "BAID",
        "region_slug": "baidyabati",
        "latitude": "22.7958",
        "longitude": "88.3191"
    },
    {
        "city_code": "BIAH",
        "region_code": "BIAH",
        "sub_region_code": "BIAH",
        "region_slug": "baihar",
        "latitude": "22.1012",
        "longitude": "80.5494"
    },
    {
        "city_code": "BAIJ",
        "region_code": "BAIJ",
        "sub_region_code": "BAIJ",
        "region_slug": "baijnath",
        "latitude": "32.0521",
        "longitude": "76.6493"
    },
    {
        "city_code": "BKTH",
        "region_code": "BKTH",
        "sub_region_code": "BKTH",
        "region_slug": "baikunthpur",
        "latitude": "23.27915",
        "longitude": "82.563616"
    },
    {
        "city_code": "BAND",
        "region_code": "BAND",
        "sub_region_code": "BAND",
        "region_slug": "baindur",
        "latitude": "13.866593",
        "longitude": "74.627623"
    },
    {
        "city_code": "BART",
        "region_code": "BART",
        "sub_region_code": "BART",
        "region_slug": "bakhrahat",
        "latitude": "22.3879",
        "longitude": "88.20593"
    },
    {
        "city_code": "BLGT",
        "region_code": "BLGT",
        "sub_region_code": "BLGT",
        "region_slug": "balaghat",
        "latitude": "21.9667",
        "longitude": "80.3333"
    },
    {
        "city_code": "BALG",
        "region_code": "BALG",
        "sub_region_code": "BALG",
        "region_slug": "balangir",
        "latitude": "20.6723",
        "longitude": "83.1649"
    },
    {
        "city_code": "BLSR",
        "region_code": "BLSR",
        "sub_region_code": "BLSR",
        "region_slug": "balasore",
        "latitude": "21.3469",
        "longitude": "86.6611"
    },
    {
        "city_code": "BLIJ",
        "region_code": "BLIJ",
        "sub_region_code": "BLIJ",
        "region_slug": "balijipeta",
        "latitude": "18.6149",
        "longitude": "83.5297"
    },
    {
        "city_code": "BALD",
        "region_code": "BALD",
        "sub_region_code": "BALD",
        "region_slug": "balod",
        "latitude": "20.7311",
        "longitude": "81.2023"
    },
    {
        "city_code": "BBCH",
        "region_code": "BBCH",
        "sub_region_code": "BBCH",
        "region_slug": "baloda-bazar",
        "latitude": "21.656966",
        "longitude": "82.155384"
    },
    {
        "city_code": "BALO",
        "region_code": "BALO",
        "sub_region_code": "BALO",
        "region_slug": "balotra",
        "latitude": "25.8309",
        "longitude": "72.2401"
    },
    {
        "city_code": "BLUR",
        "region_code": "BLUR",
        "sub_region_code": "BLUR",
        "region_slug": "balrampur",
        "latitude": "27.4307",
        "longitude": "82.1805"
    },
    {
        "city_code": "BALU",
        "region_code": "BALU",
        "sub_region_code": "BALU",
        "region_slug": "balurghat",
        "latitude": "25.2373",
        "longitude": "88.7831"
    },
    {
        "city_code": "BNPL",
        "region_code": "BNPL",
        "sub_region_code": "BNPL",
        "region_slug": "banaganapalli",
        "latitude": "15.3184",
        "longitude": "78.2279"
    },
    {
        "city_code": "BANZ",
        "region_code": "BANZ",
        "sub_region_code": "BANZ",
        "region_slug": "banahatti",
        "latitude": "16.4823",
        "longitude": "75.1224"
    },
    {
        "city_code": "BANA",
        "region_code": "BANA",
        "sub_region_code": "BANA",
        "region_slug": "banaskantha",
        "latitude": "24.3455",
        "longitude": "71.7622"
    },
    {
        "city_code": "BNGA",
        "region_code": "BNGA",
        "sub_region_code": "BNGA",
        "region_slug": "banga",
        "latitude": "31.11",
        "longitude": "75.59"
    },
    {
        "city_code": "BAGO",
        "region_code": "BAGO",
        "sub_region_code": "BAGO",
        "region_slug": "bangaon",
        "latitude": "23.0467",
        "longitude": "88.8291"
    },
    {
        "city_code": "BAGT",
        "region_code": "BAGT",
        "sub_region_code": "BAGT",
        "region_slug": "bangarpet",
        "latitude": "12.9915",
        "longitude": "78.1788"
    },
    {
        "city_code": "BGPM",
        "region_code": "BGPM",
        "sub_region_code": "BGPM",
        "region_slug": "bangarupalem",
        "latitude": "13.5508",
        "longitude": "74.8185"
    },
    {
        "city_code": "BANK",
        "region_code": "BANK",
        "sub_region_code": "BANK",
        "region_slug": "banki",
        "latitude": "20.3766",
        "longitude": "85.529"
    },
    {
        "city_code": "BNKU",
        "region_code": "BNKU",
        "sub_region_code": "BNKU",
        "region_slug": "bankura",
        "latitude": "23.233061",
        "longitude": "87.048755"
    },
    {
        "city_code": "BNSA",
        "region_code": "BNSA",
        "sub_region_code": "BNSA",
        "region_slug": "banswada",
        "latitude": "18.3818",
        "longitude": "77.8758"
    },
    {
        "city_code": "BANS",
        "region_code": "BANS",
        "sub_region_code": "BANS",
        "region_slug": "banswara",
        "latitude": "23.549983",
        "longitude": "74.450557"
    },
    {
        "city_code": "BANT",
        "region_code": "BANT",
        "sub_region_code": "BANT",
        "region_slug": "bantumilli",
        "latitude": "16.3703",
        "longitude": "81.2714"
    },
    {
        "city_code": "BAPA",
        "region_code": "BAPA",
        "sub_region_code": "BAPA",
        "region_slug": "bapatla",
        "latitude": "15.9059",
        "longitude": "80.4716"
    },
    {
        "city_code": "BARK",
        "region_code": "BARK",
        "sub_region_code": "BARK",
        "region_slug": "barabanki",
        "latitude": "26.9955",
        "longitude": "81.2519"
    },
    {
        "city_code": "BARA",
        "region_code": "BARA",
        "sub_region_code": "BARA",
        "region_slug": "baramati",
        "latitude": "18.1841",
        "longitude": "74.6108"
    },
    {
        "city_code": "BRML",
        "region_code": "BRML",
        "sub_region_code": "BRML",
        "region_slug": "baramulla",
        "latitude": "34.1473",
        "longitude": "74.2649"
    },
    {
        "city_code": "BARN",
        "region_code": "BARN",
        "sub_region_code": "BARN",
        "region_slug": "baran",
        "latitude": "25.1011",
        "longitude": "76.5132"
    },
    {
        "city_code": "BSRT",
        "region_code": "BSRT",
        "sub_region_code": "BSRT",
        "region_slug": "barasat",
        "latitude": "22.341493",
        "longitude": "88.146189"
    },
    {
        "city_code": "BARL",
        "region_code": "BARL",
        "sub_region_code": "BARL",
        "region_slug": "baraut",
        "latitude": "29.0999",
        "longitude": "77.2606"
    },
    {
        "city_code": "BABR",
        "region_code": "BABR",
        "sub_region_code": "BABR",
        "region_slug": "barbil",
        "latitude": "22.105999",
        "longitude": "85.387459"
    },
    {
        "city_code": "BRDL",
        "region_code": "BRDL",
        "sub_region_code": "BRDL",
        "region_slug": "bardoli",
        "latitude": "21.1257",
        "longitude": "73.1121"
    },
    {
        "city_code": "BARE",
        "region_code": "BARE",
        "sub_region_code": "BARE",
        "region_slug": "bareilly",
        "latitude": "28.364",
        "longitude": "79.415"
    },
    {
        "city_code": "BEJA",
        "region_code": "BEJA",
        "sub_region_code": "BEJA",
        "region_slug": "bareja",
        "latitude": "22.8545",
        "longitude": "72.5918"
    },
    {
        "city_code": "BARG",
        "region_code": "BARG",
        "sub_region_code": "BARG",
        "region_slug": "bargarh",
        "latitude": "21.255",
        "longitude": "83.507"
    },
    {
        "city_code": "BRWA",
        "region_code": "BRWA",
        "sub_region_code": "BRWA",
        "region_slug": "barharwa",
        "latitude": "24.8566",
        "longitude": "87.7776"
    },
    {
        "city_code": "BHAI",
        "region_code": "BHAI",
        "sub_region_code": "BHAI",
        "region_slug": "barhi",
        "latitude": "24.303252",
        "longitude": "85.406079"
    },
    {
        "city_code": "BARI",
        "region_code": "BARI",
        "sub_region_code": "BARI",
        "region_slug": "baripada",
        "latitude": "21.9322",
        "longitude": "86.7517"
    },
    {
        "city_code": "BARM",
        "region_code": "BARM",
        "sub_region_code": "BARM",
        "region_slug": "barmer",
        "latitude": "25.7532",
        "longitude": "71.4181"
    },
    {
        "city_code": "BAR",
        "region_code": "BAR",
        "sub_region_code": "BAR",
        "region_slug": "barnala",
        "latitude": "30.3819",
        "longitude": "75.5468"
    },
    {
        "city_code": "BRPD",
        "region_code": "BRPD",
        "sub_region_code": "BRPD",
        "region_slug": "barpeta-road",
        "latitude": "26.5028",
        "longitude": "90.9655"
    },
    {
        "city_code": "BARR",
        "region_code": "BARR",
        "sub_region_code": "BARR",
        "region_slug": "barrackpore",
        "latitude": "22.752709",
        "longitude": "88.351656"
    },
    {
        "city_code": "BRHI",
        "region_code": "BRHI",
        "sub_region_code": "BRHI",
        "region_slug": "barshi",
        "latitude": "18.2334",
        "longitude": "75.6941"
    },
    {
        "city_code": "BARU",
        "region_code": "BARU",
        "sub_region_code": "BARU",
        "region_slug": "baruipur",
        "latitude": "22.3597",
        "longitude": "88.4318"
    },
    {
        "city_code": "BARQ",
        "region_code": "BARQ",
        "sub_region_code": "BARQ",
        "region_slug": "barwadih",
        "latitude": "23.843732",
        "longitude": "84.116386"
    },
    {
        "city_code": "BARH",
        "region_code": "BARH",
        "sub_region_code": "BARH",
        "region_slug": "barwaha",
        "latitude": "22.2532",
        "longitude": "76.0408"
    },
    {
        "city_code": "BRWN",
        "region_code": "BRWN",
        "sub_region_code": "BRWN",
        "region_slug": "barwani",
        "latitude": "22.0363",
        "longitude": "74.9033"
    },
    {
        "city_code": "BABA",
        "region_code": "BABA",
        "sub_region_code": "BABA",
        "region_slug": "basantpur",
        "latitude": "26.1728",
        "longitude": "84.6642"
    },
    {
        "city_code": "BIRH",
        "region_code": "BIRH",
        "sub_region_code": "BIRH",
        "region_slug": "basirhat",
        "latitude": "22.6574",
        "longitude": "88.8672"
    },
    {
        "city_code": "BASN",
        "region_code": "BASN",
        "sub_region_code": "BASN",
        "region_slug": "basna",
        "latitude": "21.277329",
        "longitude": "82.822188"
    },
    {
        "city_code": "BAST",
        "region_code": "BAST",
        "sub_region_code": "BAST",
        "region_slug": "basti",
        "latitude": "26.814",
        "longitude": "82.763"
    },
    {
        "city_code": "BHAT",
        "region_code": "BHAT",
        "sub_region_code": "BHAT",
        "region_slug": "bathinda",
        "latitude": "30.210994",
        "longitude": "74.945475"
    },
    {
        "city_code": "BTGD",
        "region_code": "BTGD",
        "sub_region_code": "BTGD",
        "region_slug": "batlagundu",
        "latitude": "10.1638",
        "longitude": "77.7591"
    },
    {
        "city_code": "BAVL",
        "region_code": "BAVL",
        "sub_region_code": "BAVL",
        "region_slug": "bavla",
        "latitude": "22.8298",
        "longitude": "72.3638"
    },
    {
        "city_code": "BAYA",
        "region_code": "BAYA",
        "sub_region_code": "BAYA",
        "region_slug": "bayad",
        "latitude": "23.2298",
        "longitude": "73.2205"
    },
    {
        "city_code": "BANY",
        "region_code": "BANY",
        "sub_region_code": "BANY",
        "region_slug": "bayana",
        "latitude": "26.9158",
        "longitude": "77.2894"
    },
    {
        "city_code": "BAZP",
        "region_code": "BAZP",
        "sub_region_code": "BAZP",
        "region_slug": "bazpur",
        "latitude": "29.1585",
        "longitude": "79.1464"
    },
    {
        "city_code": "BEAW",
        "region_code": "BEAW",
        "sub_region_code": "BEAW",
        "region_slug": "beawar",
        "latitude": "26.101054",
        "longitude": "74.319248"
    },
    {
        "city_code": "BEED",
        "region_code": "BEED",
        "sub_region_code": "BEED",
        "region_slug": "beed",
        "latitude": "18.996469",
        "longitude": "75.731634"
    },
    {
        "city_code": "BEGU",
        "region_code": "BEGU",
        "sub_region_code": "BEGU",
        "region_slug": "beguniapada",
        "latitude": "19.6245",
        "longitude": "84.9411"
    },
    {
        "city_code": "BEGS",
        "region_code": "BEGS",
        "sub_region_code": "BEGS",
        "region_slug": "begusarai",
        "latitude": "25.4182",
        "longitude": "86.1272"
    },
    {
        "city_code": "BELG",
        "region_code": "BELG",
        "sub_region_code": "BELG",
        "region_slug": "belagavi-belgaum",
        "latitude": "15.85036",
        "longitude": "74.504669"
    },
    {
        "city_code": "BLVD",
        "region_code": "BLVD",
        "sub_region_code": "BLVD",
        "region_slug": "belakavadi",
        "latitude": "12.256719",
        "longitude": "77.122898"
    },
    {
        "city_code": "BELB",
        "region_code": "BELB",
        "sub_region_code": "BELB",
        "region_slug": "belghoria",
        "latitude": "22.667",
        "longitude": "88.3796"
    },
    {
        "city_code": "BELL",
        "region_code": "BELL",
        "sub_region_code": "BELL",
        "region_slug": "bellampalli",
        "latitude": "19.0716",
        "longitude": "79.4912"
    },
    {
        "city_code": "BLRY",
        "region_code": "BLRY",
        "sub_region_code": "BLRY",
        "region_slug": "bellary",
        "latitude": "15.1394",
        "longitude": "76.9214"
    },
    {
        "city_code": "BELU",
        "region_code": "BELU",
        "sub_region_code": "BELU",
        "region_slug": "belur",
        "latitude": "13.1623",
        "longitude": "75.8679"
    },
    {
        "city_code": "BMTA",
        "region_code": "BMTA",
        "sub_region_code": "BMTA",
        "region_slug": "bemetara",
        "latitude": "21.6894",
        "longitude": "81.5596"
    },
    {
        "city_code": "BRAC",
        "region_code": "BRAC",
        "sub_region_code": "BRAC",
        "region_slug": "berachampa",
        "latitude": "22.696882",
        "longitude": "88.669667"
    },
    {
        "city_code": "BEHA",
        "region_code": "BEHA",
        "sub_region_code": "BEHA",
        "region_slug": "berhampore-wb",
        "latitude": "24.0988",
        "longitude": "88.2679"
    },
    {
        "city_code": "BERP",
        "region_code": "BERP",
        "sub_region_code": "BERP",
        "region_slug": "berhampur-odisha",
        "latitude": "19.315",
        "longitude": "84.7941"
    },
    {
        "city_code": "BEST",
        "region_code": "BEST",
        "sub_region_code": "BEST",
        "region_slug": "bestavaripeta",
        "latitude": "15.5503",
        "longitude": "79.1026"
    },
    {
        "city_code": "BTBM",
        "region_code": "BTBM",
        "sub_region_code": "BTBM",
        "region_slug": "betalbatim",
        "latitude": "15.300619",
        "longitude": "73.919917"
    },
    {
        "city_code": "BETB",
        "region_code": "BETB",
        "sub_region_code": "BETB",
        "region_slug": "betberia",
        "latitude": "22.3529",
        "longitude": "88.5771"
    },
    {
        "city_code": "BETH",
        "region_code": "BETH",
        "sub_region_code": "BETH",
        "region_slug": "bethamcherla",
        "latitude": "15.4576",
        "longitude": "78.1518"
    },
    {
        "city_code": "BETU",
        "region_code": "BETU",
        "sub_region_code": "BETU",
        "region_slug": "betul",
        "latitude": "21.919408",
        "longitude": "78.063812"
    },
    {
        "city_code": "BHDR",
        "region_code": "BHDR",
        "sub_region_code": "BHDR",
        "region_slug": "bhadrachalam",
        "latitude": "17.6688",
        "longitude": "80.8936"
    },
    {
        "city_code": "BHAD",
        "region_code": "BHAD",
        "sub_region_code": "BHAD",
        "region_slug": "bhadrak",
        "latitude": "21.0574",
        "longitude": "86.4963"
    },
    {
        "city_code": "BDVT",
        "region_code": "BDVT",
        "sub_region_code": "BDVT",
        "region_slug": "bhadravati",
        "latitude": "13.833",
        "longitude": "75.7081"
    },
    {
        "city_code": "BHAG",
        "region_code": "BHAG",
        "sub_region_code": "BHAG",
        "region_slug": "bhagalpur",
        "latitude": "25.2372",
        "longitude": "86.9746"
    },
    {
        "city_code": "BHAN",
        "region_code": "BHAN",
        "sub_region_code": "BHAN",
        "region_slug": "bhainsa",
        "latitude": "19.1031",
        "longitude": "77.9653"
    },
    {
        "city_code": "BHAA",
        "region_code": "BHAA",
        "sub_region_code": "BHAA",
        "region_slug": "bhandara",
        "latitude": "21.0736",
        "longitude": "79.8297"
    },
    {
        "city_code": "BASA",
        "region_code": "BASA",
        "sub_region_code": "BASA",
        "region_slug": "bharamasagara",
        "latitude": "14.3334",
        "longitude": "76.7048"
    },
    {
        "city_code": "BHRT",
        "region_code": "BHRT",
        "sub_region_code": "BHRT",
        "region_slug": "bharatpur",
        "latitude": "27.218081",
        "longitude": "77.493289"
    },
    {
        "city_code": "BHAR",
        "region_code": "BHAR",
        "sub_region_code": "BHAR",
        "region_slug": "bharuch",
        "latitude": "21.724644",
        "longitude": "73.002294"
    },
    {
        "city_code": "BTAP",
        "region_code": "BTAP",
        "sub_region_code": "BTAP",
        "region_slug": "bhatapara",
        "latitude": "21.7384",
        "longitude": "81.948"
    },
    {
        "city_code": "BHAZ",
        "region_code": "BHAZ",
        "sub_region_code": "BHAZ",
        "region_slug": "bhatgaon",
        "latitude": "21.1576",
        "longitude": "81.7199"
    },
    {
        "city_code": "BAKL",
        "region_code": "BAKL",
        "sub_region_code": "BAKL",
        "region_slug": "bhatkal",
        "latitude": "13.9978",
        "longitude": "74.5405"
    },
    {
        "city_code": "BATT",
        "region_code": "BATT",
        "sub_region_code": "BATT",
        "region_slug": "bhattiprolu",
        "latitude": "16.10376",
        "longitude": "80.78423"
    },
    {
        "city_code": "BHNI",
        "region_code": "BHNI",
        "sub_region_code": "BHNI",
        "region_slug": "bhavani",
        "latitude": "11.4501",
        "longitude": "77.6822"
    },
    {
        "city_code": "BHNG",
        "region_code": "BHNG",
        "sub_region_code": "BHNG",
        "region_slug": "bhavnagar",
        "latitude": "21.763997",
        "longitude": "72.156404"
    },
    {
        "city_code": "BHAW",
        "region_code": "BHAW",
        "sub_region_code": "BHAW",
        "region_slug": "bhawanipatna",
        "latitude": "19.9074",
        "longitude": "83.1642"
    },
    {
        "city_code": "BHMG",
        "region_code": "BHMG",
        "sub_region_code": "BHMG",
        "region_slug": "bheemgal",
        "latitude": "18.7016",
        "longitude": "78.4553"
    },
    {
        "city_code": "BHILAI",
        "region_code": "BHILAI",
        "sub_region_code": "BHILAI",
        "region_slug": "bhilai",
        "latitude": "21.209545",
        "longitude": "81.378813"
    },
    {
        "city_code": "BHIL",
        "region_code": "BHIL",
        "sub_region_code": "BHIL",
        "region_slug": "bhilwara",
        "latitude": "25.3214",
        "longitude": "74.587"
    },
    {
        "city_code": "BMDE",
        "region_code": "BMDE",
        "sub_region_code": "BMDE",
        "region_slug": "bhimadole",
        "latitude": "16.8175",
        "longitude": "81.2601"
    },
    {
        "city_code": "BHIM",
        "region_code": "BHIM",
        "sub_region_code": "BHIM",
        "region_slug": "bhimavaram",
        "latitude": "16.5449",
        "longitude": "81.5212"
    },
    {
        "city_code": "BIND",
        "region_code": "BIND",
        "sub_region_code": "BIND",
        "region_slug": "bhind",
        "latitude": "26.5638",
        "longitude": "78.7861"
    },
    {
        "city_code": "BHWD",
        "region_code": "BHWD",
        "sub_region_code": "BHWD",
        "region_slug": "bhiwadi",
        "latitude": "28.203681",
        "longitude": "76.822409"
    },
    {
        "city_code": "BHWN",
        "region_code": "BHWN",
        "sub_region_code": "BHWN",
        "region_slug": "bhiwani",
        "latitude": "28.799",
        "longitude": "76.1335"
    },
    {
        "city_code": "BHOG",
        "region_code": "BHOG",
        "sub_region_code": "BHOG",
        "region_slug": "bhogapuram",
        "latitude": "18.0307",
        "longitude": "83.4937"
    },
    {
        "city_code": "BHON",
        "region_code": "BHON",
        "sub_region_code": "BHON",
        "region_slug": "bhongir",
        "latitude": "17.5035",
        "longitude": "78.8892"
    },
    {
        "city_code": "BHOP",
        "region_code": "BHOP",
        "sub_region_code": "BHOP",
        "region_slug": "bhopal",
        "latitude": "23.259933",
        "longitude": "77.412615"
    },
    {
        "city_code": "BHUB",
        "region_code": "BHUB",
        "sub_region_code": "BHUB",
        "region_slug": "bhubaneswar",
        "latitude": "20.296059",
        "longitude": "85.82454"
    },
    {
        "city_code": "BHUJ",
        "region_code": "BHUJ",
        "sub_region_code": "BHUJ",
        "region_slug": "bhuj",
        "latitude": "23.250736",
        "longitude": "69.633901"
    },
    {
        "city_code": "BHUN",
        "region_code": "BHUN",
        "sub_region_code": "BHUN",
        "region_slug": "bhuntar",
        "latitude": "31.8944",
        "longitude": "77.2178"
    },
    {
        "city_code": "BHUP",
        "region_code": "BHUP",
        "sub_region_code": "BHUP",
        "region_slug": "bhupalpalle",
        "latitude": "18.4314",
        "longitude": "79.8605"
    },
    {
        "city_code": "BHUS",
        "region_code": "BHUS",
        "sub_region_code": "BHUS",
        "region_slug": "bhusawal",
        "latitude": "21.04552",
        "longitude": "75.801096"
    },
    {
        "city_code": "BHUT",
        "region_code": "BHUT",
        "sub_region_code": "BHUT",
        "region_slug": "bhutan",
        "latitude": "27.413755",
        "longitude": "90.404506"
    },
    {
        "city_code": "BHUV",
        "region_code": "BHUV",
        "sub_region_code": "BHUV",
        "region_slug": "bhuvanagiri",
        "latitude": "11.4459",
        "longitude": "79.653"
    },
    {
        "city_code": "BIAR",
        "region_code": "BIAR",
        "sub_region_code": "BIAR",
        "region_slug": "biaora",
        "latitude": "23.9186",
        "longitude": "76.9113"
    },
    {
        "city_code": "BBNG",
        "region_code": "BBNG",
        "sub_region_code": "BBNG",
        "region_slug": "bibinagar",
        "latitude": "17.4723",
        "longitude": "78.7974"
    },
    {
        "city_code": "BHCK",
        "region_code": "BHCK",
        "sub_region_code": "BHCK",
        "region_slug": "bichkunda",
        "latitude": "18.4014",
        "longitude": "77.7066"
    },
    {
        "city_code": "BIDI",
        "region_code": "BIDI",
        "sub_region_code": "BIDI",
        "region_slug": "bidadi",
        "latitude": "12.7984",
        "longitude": "77.3872"
    },
    {
        "city_code": "BIDR",
        "region_code": "BIDR",
        "sub_region_code": "BIDR",
        "region_slug": "bidar",
        "latitude": "17.920053",
        "longitude": "77.519781"
    },
    {
        "city_code": "BIHS",
        "region_code": "BIHS",
        "sub_region_code": "BIHS",
        "region_slug": "bihar-sharif",
        "latitude": "25.205",
        "longitude": "85.5174"
    },
    {
        "city_code": "BIHP",
        "region_code": "BIHP",
        "sub_region_code": "BIHP",
        "region_slug": "bihpuria",
        "latitude": "27.0191",
        "longitude": "93.9216"
    },
    {
        "city_code": "BINW",
        "region_code": "BINW",
        "sub_region_code": "BINW",
        "region_slug": "bijainagar",
        "latitude": "25.9268",
        "longitude": "74.6506"
    },
    {
        "city_code": "BIJ",
        "region_code": "BIJ",
        "sub_region_code": "BIJ",
        "region_slug": "bijnor",
        "latitude": "29.372442",
        "longitude": "78.135847"
    },
    {
        "city_code": "BIJO",
        "region_code": "BIJO",
        "sub_region_code": "BIJO",
        "region_slug": "bijoynagar",
        "latitude": "26.100732",
        "longitude": "91.503208"
    },
    {
        "city_code": "BIK",
        "region_code": "BIK",
        "sub_region_code": "BIK",
        "region_slug": "bikaner",
        "latitude": "28.009436",
        "longitude": "73.300653"
    },
    {
        "city_code": "BANJ",
        "region_code": "BANJ",
        "sub_region_code": "BANJ",
        "region_slug": "bikramganj",
        "latitude": "25.2233",
        "longitude": "84.2664"
    },
    {
        "city_code": "BILR",
        "region_code": "BILR",
        "sub_region_code": "BILR",
        "region_slug": "bilara",
        "latitude": "26.168768",
        "longitude": "73.70036"
    },
    {
        "city_code": "BILA",
        "region_code": "BILA",
        "sub_region_code": "BILA",
        "region_slug": "bilaspur",
        "latitude": "22.063077",
        "longitude": "82.103576"
    },
    {
        "city_code": "BIPS",
        "region_code": "BIPS",
        "sub_region_code": "BIPS",
        "region_slug": "bilaspur-himachal-pradesh",
        "latitude": "31.4009",
        "longitude": "76.379691"
    },
    {
        "city_code": "BILG",
        "region_code": "BILG",
        "sub_region_code": "BILG",
        "region_slug": "bilgi",
        "latitude": "16.340545",
        "longitude": "75.629668"
    },
    {
        "city_code": "BILI",
        "region_code": "BILI",
        "sub_region_code": "BILI",
        "region_slug": "bilimora",
        "latitude": "20.769",
        "longitude": "72.9778"
    },
    {
        "city_code": "BILL",
        "region_code": "BILL",
        "sub_region_code": "BILL",
        "region_slug": "billawar",
        "latitude": "32.6136",
        "longitude": "75.6041"
    },
    {
        "city_code": "BIRL",
        "region_code": "BIRL",
        "sub_region_code": "BIRL",
        "region_slug": "biraul",
        "latitude": "25.9426",
        "longitude": "86.2438"
    },
    {
        "city_code": "BIRR",
        "region_code": "BIRR",
        "sub_region_code": "BIRR",
        "region_slug": "birra",
        "latitude": "21.7553",
        "longitude": "82.7935"
    },
    {
        "city_code": "VVDF",
        "region_code": "VVDF",
        "sub_region_code": "VVDF",
        "region_slug": "bishnupur",
        "latitude": "23.0679",
        "longitude": "87.3165"
    },
    {
        "city_code": "BSRM",
        "region_code": "BSRM",
        "sub_region_code": "BSRM",
        "region_slug": "bishrampur",
        "latitude": "23.22001",
        "longitude": "82.84999"
    },
    {
        "city_code": "BICH",
        "region_code": "BICH",
        "sub_region_code": "BICH",
        "region_slug": "biswanath-chariali",
        "latitude": "26.7267",
        "longitude": "93.1479"
    },
    {
        "city_code": "BOBB",
        "region_code": "BOBB",
        "sub_region_code": "BOBB",
        "region_slug": "bobbili",
        "latitude": "18.573504",
        "longitude": "83.357791"
    },
    {
        "city_code": "BODH",
        "region_code": "BODH",
        "sub_region_code": "BODH",
        "region_slug": "bodhan",
        "latitude": "18.6794",
        "longitude": "77.8767"
    },
    {
        "city_code": "BODI",
        "region_code": "BODI",
        "sub_region_code": "BODI",
        "region_slug": "bodinayakanur",
        "latitude": "10.0106",
        "longitude": "77.3497"
    },
    {
        "city_code": "BOIS",
        "region_code": "BOIS",
        "sub_region_code": "BOIS",
        "region_slug": "boisar",
        "latitude": "19.8",
        "longitude": "72.75"
    },
    {
        "city_code": "BOKA",
        "region_code": "BOKA",
        "sub_region_code": "BOKA",
        "region_slug": "bokaro",
        "latitude": "23.6693",
        "longitude": "86.1511"
    },
    {
        "city_code": "BLPR",
        "region_code": "BLPR",
        "sub_region_code": "BLPR",
        "region_slug": "bolpur",
        "latitude": "23.66837",
        "longitude": "87.682201"
    },
    {
        "city_code": "BMDA",
        "region_code": "BMDA",
        "sub_region_code": "BMDA",
        "region_slug": "bomdila",
        "latitude": "27.264494",
        "longitude": "92.415932"
    },
    {
        "city_code": "BOMM",
        "region_code": "BOMM",
        "sub_region_code": "BOMM",
        "region_slug": "bommidi",
        "latitude": "11.9836",
        "longitude": "78.2463"
    },
    {
        "city_code": "BNKL",
        "region_code": "BNKL",
        "sub_region_code": "BNKL",
        "region_slug": "bonakal",
        "latitude": "17.0252",
        "longitude": "80.2642"
    },
    {
        "city_code": "BONG",
        "region_code": "BONG",
        "sub_region_code": "BONG",
        "region_slug": "bongaigaon",
        "latitude": "26.489553",
        "longitude": "90.500879"
    },
    {
        "city_code": "BONI",
        "region_code": "BONI",
        "sub_region_code": "BONI",
        "region_slug": "bongaon",
        "latitude": "23.044",
        "longitude": "88.8277"
    },
    {
        "city_code": "BORM",
        "region_code": "BORM",
        "sub_region_code": "BORM",
        "region_slug": "borsad",
        "latitude": "22.4171",
        "longitude": "72.8967"
    },
    {
        "city_code": "BOTA",
        "region_code": "BOTA",
        "sub_region_code": "BOTA",
        "region_slug": "botad",
        "latitude": "22.172062",
        "longitude": "71.659544"
    },
    {
        "city_code": "KHUB",
        "region_code": "KHUB",
        "sub_region_code": "KHUB",
        "region_slug": "brahmapur",
        "latitude": "19.308232",
        "longitude": "84.738217"
    },
    {
        "city_code": "BHMP",
        "region_code": "BHMP",
        "sub_region_code": "BHMP",
        "region_slug": "brahmapuri",
        "latitude": "20.609698",
        "longitude": "79.855912"
    },
    {
        "city_code": "BJNG",
        "region_code": "BJNG",
        "sub_region_code": "BJNG",
        "region_slug": "brajrajnagar",
        "latitude": "21.8286",
        "longitude": "83.9215"
    },
    {
        "city_code": "BCHR",
        "region_code": "BCHR",
        "sub_region_code": "BCHR",
        "region_slug": "buchireddypalem",
        "latitude": "14.5351",
        "longitude": "79.8773"
    },
    {
        "city_code": "BUDL",
        "region_code": "BUDL",
        "sub_region_code": "BUDL",
        "region_slug": "budhlada",
        "latitude": "29.9267",
        "longitude": "75.5542"
    },
    {
        "city_code": "BUHA",
        "region_code": "BUHA",
        "sub_region_code": "BUHA",
        "region_slug": "buhari",
        "latitude": "22.16469",
        "longitude": "73.04608"
    },
    {
        "city_code": "BULA",
        "region_code": "BULA",
        "sub_region_code": "BULA",
        "region_slug": "bulandshahr",
        "latitude": "28.407",
        "longitude": "77.8498"
    },
    {
        "city_code": "BULD",
        "region_code": "BULD",
        "sub_region_code": "BULD",
        "region_slug": "buldana",
        "latitude": "20.4561",
        "longitude": "76.3637"
    },
    {
        "city_code": "BUND",
        "region_code": "BUND",
        "sub_region_code": "BUND",
        "region_slug": "bundu",
        "latitude": "23.16",
        "longitude": "85.5869"
    },
    {
        "city_code": "BURD",
        "region_code": "BURD",
        "sub_region_code": "BURD",
        "region_slug": "burdwan",
        "latitude": "23.23243",
        "longitude": "87.863731"
    },
    {
        "city_code": "BRHP",
        "region_code": "BRHP",
        "sub_region_code": "BRHP",
        "region_slug": "burhanpur",
        "latitude": "21.31939",
        "longitude": "76.222426"
    },
    {
        "city_code": "BRHR",
        "region_code": "BRHR",
        "sub_region_code": "BRHR",
        "region_slug": "burhar",
        "latitude": "23.192",
        "longitude": "81.5706"
    },
    {
        "city_code": "BUTY",
        "region_code": "BUTY",
        "sub_region_code": "BUTY",
        "region_slug": "buttayagudem",
        "latitude": "17.2027",
        "longitude": "81.32"
    },
    {
        "city_code": "BYAD",
        "region_code": "BYAD",
        "sub_region_code": "BYAD",
        "region_slug": "byadagi",
        "latitude": "14.6814",
        "longitude": "75.4869"
    },
    {
        "city_code": "BYDA",
        "region_code": "BYDA",
        "sub_region_code": "BYDA",
        "region_slug": "byadgi",
        "latitude": "14.6814",
        "longitude": "75.4869"
    },
    {
        "city_code": "BYAS",
        "region_code": "BYAS",
        "sub_region_code": "BYAS",
        "region_slug": "byasanagar",
        "latitude": "20.9551",
        "longitude": "86.1271"
    },
    {
        "city_code": "CALC",
        "region_code": "CALC",
        "sub_region_code": "CALC",
        "region_slug": "calicut",
        "latitude": "11.2588",
        "longitude": "75.7804"
    },
    {
        "city_code": "CANN",
        "region_code": "CANN",
        "sub_region_code": "CANN",
        "region_slug": "canning",
        "latitude": "22.314022",
        "longitude": "88.667895"
    },
    {
        "city_code": "CHAG",
        "region_code": "CHAG",
        "sub_region_code": "CHAG",
        "region_slug": "chagallu",
        "latitude": "16.993",
        "longitude": "81.6668"
    },
    {
        "city_code": "CHAL",
        "region_code": "CHAL",
        "sub_region_code": "CHAL",
        "region_slug": "chalakudy",
        "latitude": "10.307",
        "longitude": "76.3341"
    },
    {
        "city_code": "CHLS",
        "region_code": "CHLS",
        "sub_region_code": "CHLS",
        "region_slug": "chalisgaon",
        "latitude": "20.4641",
        "longitude": "74.9969"
    },
    {
        "city_code": "CHLA",
        "region_code": "CHLA",
        "sub_region_code": "CHLA",
        "region_slug": "challakere",
        "latitude": "14.3134",
        "longitude": "76.6528"
    },
    {
        "city_code": "CHAP",
        "region_code": "CHAP",
        "sub_region_code": "CHAP",
        "region_slug": "challapalli",
        "latitude": "16.1148",
        "longitude": "80.9291"
    },
    {
        "city_code": "CHAJ",
        "region_code": "CHAJ",
        "sub_region_code": "CHAJ",
        "region_slug": "chamarajnagar",
        "latitude": "11.926147",
        "longitude": "76.943733"
    },
    {
        "city_code": "CHMB",
        "region_code": "CHMB",
        "sub_region_code": "CHMB",
        "region_slug": "chamba",
        "latitude": "32.5534",
        "longitude": "76.1258"
    },
    {
        "city_code": "CHMK",
        "region_code": "CHMK",
        "sub_region_code": "CHMK",
        "region_slug": "chamoli",
        "latitude": "30.2937",
        "longitude": "79.5603"
    },
    {
        "city_code": "CHAM",
        "region_code": "CHAM",
        "sub_region_code": "CHAM",
        "region_slug": "champa",
        "latitude": "22.032",
        "longitude": "82.6537"
    },
    {
        "city_code": "CHAI",
        "region_code": "CHAI",
        "sub_region_code": "CHAI",
        "region_slug": "champahati",
        "latitude": "22.401168",
        "longitude": "88.474939"
    },
    {
        "city_code": "CCWC",
        "region_code": "CCWC",
        "sub_region_code": "CCWC",
        "region_slug": "chanchal",
        "latitude": "25.383",
        "longitude": "88.0167"
    },
    {
        "city_code": "CHDD",
        "region_code": "CHDD",
        "sub_region_code": "CHDD",
        "region_slug": "chandannagar",
        "latitude": "22.861635",
        "longitude": "88.350919"
    },
    {
        "city_code": "CHDN",
        "region_code": "CHDN",
        "sub_region_code": "CHDN",
        "region_slug": "chandausi",
        "latitude": "28.4481",
        "longitude": "78.7796"
    },
    {
        "city_code": "CHAZ",
        "region_code": "CHAZ",
        "sub_region_code": "CHAZ",
        "region_slug": "chandbali",
        "latitude": "20.774",
        "longitude": "86.7437"
    },
    {
        "city_code": "CHHA",
        "region_code": "CHHA",
        "sub_region_code": "CHHA",
        "region_slug": "chandpur-siau",
        "latitude": "29.134576",
        "longitude": "78.24978"
    },
    {
        "city_code": "CKNA",
        "region_code": "CKNA",
        "sub_region_code": "CKNA",
        "region_slug": "chandrakona",
        "latitude": "22.7329",
        "longitude": "87.5169"
    },
    {
        "city_code": "CHAN",
        "region_code": "CHAN",
        "sub_region_code": "CHAN",
        "region_slug": "chandrapur",
        "latitude": "19.95",
        "longitude": "79.3"
    },
    {
        "city_code": "CAND",
        "region_code": "CAND",
        "sub_region_code": "CAND",
        "region_slug": "chandur",
        "latitude": "16.9795",
        "longitude": "79.056"
    },
    {
        "city_code": "CNSY",
        "region_code": "CNSY",
        "sub_region_code": "CNSY",
        "region_slug": "changanassery",
        "latitude": "9.4459",
        "longitude": "76.541"
    },
    {
        "city_code": "CHAA",
        "region_code": "CHAA",
        "sub_region_code": "CHAA",
        "region_slug": "changaramkulam",
        "latitude": "10.7363",
        "longitude": "76.029"
    },
    {
        "city_code": "CHGI",
        "region_code": "CHGI",
        "sub_region_code": "CHGI",
        "region_slug": "channagiri",
        "latitude": "14.0242",
        "longitude": "75.926"
    },
    {
        "city_code": "CPTN",
        "region_code": "CPTN",
        "sub_region_code": "CPTN",
        "region_slug": "channapatna",
        "latitude": "12.6511",
        "longitude": "77.194619"
    },
    {
        "city_code": "CHNN",
        "region_code": "CHNN",
        "sub_region_code": "CHNN",
        "region_slug": "channarayapatna",
        "latitude": "12.9",
        "longitude": "76.3899"
    },
    {
        "city_code": "CHAT",
        "region_code": "CHAT",
        "sub_region_code": "CHAT",
        "region_slug": "chanpatia",
        "latitude": "26.9445",
        "longitude": "84.5379"
    },
    {
        "city_code": "CHPR",
        "region_code": "CHPR",
        "sub_region_code": "CHPR",
        "region_slug": "chapra",
        "latitude": "25.7811",
        "longitude": "84.7543"
    },
    {
        "city_code": "CCDD",
        "region_code": "CCDD",
        "sub_region_code": "CCDD",
        "region_slug": "charkhi-dadri",
        "latitude": "28.5921",
        "longitude": "76.2653"
    },
    {
        "city_code": "CHOG",
        "region_code": "CHOG",
        "sub_region_code": "CHOG",
        "region_slug": "chaygaon",
        "latitude": "26.0481",
        "longitude": "91.3867"
    },
    {
        "city_code": "CHEK",
        "region_code": "CHEK",
        "sub_region_code": "CHEK",
        "region_slug": "cheeka",
        "latitude": "30.049",
        "longitude": "76.342"
    },
    {
        "city_code": "CHEE",
        "region_code": "CHEE",
        "sub_region_code": "CHEE",
        "region_slug": "cheepurupalli",
        "latitude": "18.3105",
        "longitude": "83.5683"
    },
    {
        "city_code": "CHEL",
        "region_code": "CHEL",
        "sub_region_code": "CHEL",
        "region_slug": "chelpur",
        "latitude": "18.3705",
        "longitude": "79.8451"
    },
    {
        "city_code": "CNPI",
        "region_code": "CNPI",
        "sub_region_code": "CNPI",
        "region_slug": "chendrapinni",
        "latitude": "10.3564",
        "longitude": "76.1276"
    },
    {
        "city_code": "CHET",
        "region_code": "CHET",
        "sub_region_code": "CHET",
        "region_slug": "chengalpattu",
        "latitude": "12.684",
        "longitude": "79.9833"
    },
    {
        "city_code": "CHEG",
        "region_code": "CHEG",
        "sub_region_code": "CHEG",
        "region_slug": "chengannur",
        "latitude": "9.3183",
        "longitude": "76.6111"
    },
    {
        "city_code": "CHNU",
        "region_code": "CHNU",
        "sub_region_code": "CHNU",
        "region_slug": "chennur",
        "latitude": "18.8541",
        "longitude": "79.791"
    },
    {
        "city_code": "CHEI",
        "region_code": "CHEI",
        "sub_region_code": "CHEI",
        "region_slug": "chenthrapini",
        "latitude": "10.356484",
        "longitude": "76.123613"
    },
    {
        "city_code": "CHRY",
        "region_code": "CHRY",
        "sub_region_code": "CHRY",
        "region_slug": "cherial",
        "latitude": "17.9283",
        "longitude": "78.9684"
    },
    {
        "city_code": "CHRL",
        "region_code": "CHRL",
        "sub_region_code": "CHRL",
        "region_slug": "cherla",
        "latitude": "18.0725",
        "longitude": "80.8267"
    },
    {
        "city_code": "CHER",
        "region_code": "CHER",
        "sub_region_code": "CHER",
        "region_slug": "cherpulassery",
        "latitude": "10.8789",
        "longitude": "76.3114"
    },
    {
        "city_code": "CHPU",
        "region_code": "CHPU",
        "sub_region_code": "CHPU",
        "region_slug": "cherrapunji",
        "latitude": "25.273684",
        "longitude": "91.725358"
    },
    {
        "city_code": "CRTL",
        "region_code": "CRTL",
        "sub_region_code": "CRTL",
        "region_slug": "cherthala",
        "latitude": "9.6836",
        "longitude": "76.3365"
    },
    {
        "city_code": "PPPT",
        "region_code": "PPPT",
        "sub_region_code": "PPPT",
        "region_slug": "chetpet",
        "latitude": "13.0714",
        "longitude": "80.2417"
    },
    {
        "city_code": "CHEV",
        "region_code": "CHEV",
        "sub_region_code": "CHEV",
        "region_slug": "chevella",
        "latitude": "17.3124",
        "longitude": "78.1385"
    },
    {
        "city_code": "CHEY",
        "region_code": "CHEY",
        "sub_region_code": "CHEY",
        "region_slug": "cheyyar",
        "latitude": "12.662",
        "longitude": "79.5435"
    },
    {
        "city_code": "CHYR",
        "region_code": "CHYR",
        "sub_region_code": "CHYR",
        "region_slug": "cheyyur",
        "latitude": "12.34264",
        "longitude": "80.0114"
    },
    {
        "city_code": "CHHB",
        "region_code": "CHHB",
        "sub_region_code": "CHHB",
        "region_slug": "chhabra",
        "latitude": "24.66472",
        "longitude": "76.84379"
    },
    {
        "city_code": "CHHT",
        "region_code": "CHHT",
        "sub_region_code": "CHHT",
        "region_slug": "chhatarpur",
        "latitude": "24.9164",
        "longitude": "79.5812"
    },
    {
        "city_code": "AURA",
        "region_code": "AURA",
        "sub_region_code": "AURA",
        "region_slug": "chhatrapati-sambhajinagar",
        "latitude": "19.876",
        "longitude": "75.349"
    },
    {
        "city_code": "CHHI",
        "region_code": "CHHI",
        "sub_region_code": "CHHI",
        "region_slug": "chhibramau",
        "latitude": "27.15",
        "longitude": "79.4999"
    },
    {
        "city_code": "CHIN",
        "region_code": "CHIN",
        "sub_region_code": "CHIN",
        "region_slug": "chhindwara",
        "latitude": "22.057314",
        "longitude": "78.93602"
    },
    {
        "city_code": "CHKA",
        "region_code": "CHKA",
        "sub_region_code": "CHKA",
        "region_slug": "chickmagaluru",
        "latitude": "13.3153",
        "longitude": "75.7754"
    },
    {
        "city_code": "CHID",
        "region_code": "CHID",
        "sub_region_code": "CHID",
        "region_slug": "chidambaram",
        "latitude": "11.3982",
        "longitude": "79.6954"
    },
    {
        "city_code": "CHIH",
        "region_code": "CHIH",
        "sub_region_code": "CHIH",
        "region_slug": "chikhli",
        "latitude": "20.345909",
        "longitude": "76.252764"
    },
    {
        "city_code": "CHIK",
        "region_code": "CHIK",
        "sub_region_code": "CHIK",
        "region_slug": "chikkaballapur",
        "latitude": "13.4324",
        "longitude": "77.728"
    },
    {
        "city_code": "CHUR",
        "region_code": "CHUR",
        "sub_region_code": "CHUR",
        "region_slug": "chikmagalur",
        "latitude": "13.3153",
        "longitude": "75.7754"
    },
    {
        "city_code": "CHOK",
        "region_code": "CHOK",
        "sub_region_code": "CHOK",
        "region_slug": "chikodi",
        "latitude": "16.4292",
        "longitude": "74.5879"
    },
    {
        "city_code": "CHIL",
        "region_code": "CHIL",
        "sub_region_code": "CHIL",
        "region_slug": "chilakaluripet",
        "latitude": "16.0924",
        "longitude": "80.1624"
    },
    {
        "city_code": "CNPT",
        "region_code": "CNPT",
        "sub_region_code": "CNPT",
        "region_slug": "chinnalapatti",
        "latitude": "10.2851",
        "longitude": "77.9225"
    },
    {
        "city_code": "CHNA",
        "region_code": "CHNA",
        "sub_region_code": "CHNA",
        "region_slug": "chinnamandem",
        "latitude": "13.9365",
        "longitude": "78.6824"
    },
    {
        "city_code": "CHAR",
        "region_code": "CHAR",
        "sub_region_code": "CHAR",
        "region_slug": "chinnamanur",
        "latitude": "9.8422",
        "longitude": "77.3828"
    },
    {
        "city_code": "CHSA",
        "region_code": "CHSA",
        "sub_region_code": "CHSA",
        "region_slug": "chinsurah",
        "latitude": "22.9012",
        "longitude": "88.3899"
    },
    {
        "city_code": "CHPD",
        "region_code": "CHPD",
        "sub_region_code": "CHPD",
        "region_slug": "chintalapudi",
        "latitude": "17.0697",
        "longitude": "80.9876"
    },
    {
        "city_code": "CHTI",
        "region_code": "CHTI",
        "sub_region_code": "CHTI",
        "region_slug": "chintamani",
        "latitude": "13.402",
        "longitude": "78.0551"
    },
    {
        "city_code": "CHTN",
        "region_code": "CHTN",
        "sub_region_code": "CHTN",
        "region_slug": "chinturu",
        "latitude": "17.743896",
        "longitude": "81.397595"
    },
    {
        "city_code": "CHPL",
        "region_code": "CHPL",
        "sub_region_code": "CHPL",
        "region_slug": "chiplun",
        "latitude": "17.5319",
        "longitude": "73.5151"
    },
    {
        "city_code": "CHYO",
        "region_code": "CHYO",
        "sub_region_code": "CHYO",
        "region_slug": "chiraiyakot",
        "latitude": "25.8824",
        "longitude": "83.3308"
    },
    {
        "city_code": "CHIR",
        "region_code": "CHIR",
        "sub_region_code": "CHIR",
        "region_slug": "chirala",
        "latitude": "15.8136",
        "longitude": "80.3547"
    },
    {
        "city_code": "CWRJ",
        "region_code": "CWRJ",
        "sub_region_code": "CWRJ",
        "region_slug": "chirawa",
        "latitude": "28.2416",
        "longitude": "75.6499"
    },
    {
        "city_code": "CHIT",
        "region_code": "CHIT",
        "sub_region_code": "CHIT",
        "region_slug": "chitradurga",
        "latitude": "14.1823",
        "longitude": "76.5488"
    },
    {
        "city_code": "CHTT",
        "region_code": "CHTT",
        "sub_region_code": "CHTT",
        "region_slug": "chittoor",
        "latitude": "13.2218",
        "longitude": "79.101"
    },
    {
        "city_code": "COTT",
        "region_code": "COTT",
        "sub_region_code": "COTT",
        "region_slug": "chittorgarh",
        "latitude": "24.879999",
        "longitude": "74.629997"
    },
    {
        "city_code": "CDVM",
        "region_code": "CDVM",
        "sub_region_code": "CDVM",
        "region_slug": "chodavaram",
        "latitude": "17.831381",
        "longitude": "82.934022"
    },
    {
        "city_code": "CHBR",
        "region_code": "CHBR",
        "sub_region_code": "CHBR",
        "region_slug": "chon-buri",
        "latitude": "13.2017",
        "longitude": "101.2524"
    },
    {
        "city_code": "CHOT",
        "region_code": "CHOT",
        "sub_region_code": "CHOT",
        "region_slug": "chotila",
        "latitude": "22.4236",
        "longitude": "71.1946"
    },
    {
        "city_code": "CHOU",
        "region_code": "CHOU",
        "sub_region_code": "CHOU",
        "region_slug": "choutuppal",
        "latitude": "17.250523",
        "longitude": "78.897665"
    },
    {
        "city_code": "CHUC",
        "region_code": "CHUC",
        "sub_region_code": "CHUC",
        "region_slug": "churachandpur",
        "latitude": "24.331168",
        "longitude": "92.876492"
    },
    {
        "city_code": "CHRU",
        "region_code": "CHRU",
        "sub_region_code": "CHRU",
        "region_slug": "churu",
        "latitude": "28.3254",
        "longitude": "74.4057"
    },
    {
        "city_code": "COIM",
        "region_code": "COIM",
        "sub_region_code": "COIM",
        "region_slug": "coimbatore",
        "latitude": "11.016845",
        "longitude": "76.955832"
    },
    {
        "city_code": "COLO",
        "region_code": "COLO",
        "sub_region_code": "COLO",
        "region_slug": "colombo",
        "latitude": "6.9271",
        "longitude": "79.8612"
    },
    {
        "city_code": "COBE",
        "region_code": "COBE",
        "sub_region_code": "COBE",
        "region_slug": "cooch-behar",
        "latitude": "26.3234",
        "longitude": "89.3227"
    },
    {
        "city_code": "CUNR",
        "region_code": "CUNR",
        "sub_region_code": "CUNR",
        "region_slug": "coonoor",
        "latitude": "11.353",
        "longitude": "76.7959"
    },
    {
        "city_code": "CUDD",
        "region_code": "CUDD",
        "sub_region_code": "CUDD",
        "region_slug": "cuddalore",
        "latitude": "11.7447",
        "longitude": "79.768"
    },
    {
        "city_code": "CMBM",
        "region_code": "CMBM",
        "sub_region_code": "CMBM",
        "region_slug": "cumbum",
        "latitude": "9.7344",
        "longitude": "77.2807"
    },
    {
        "city_code": "CUMB",
        "region_code": "CUMB",
        "sub_region_code": "CUMB",
        "region_slug": "cumbum-ap",
        "latitude": "15.590055",
        "longitude": "79.112387"
    },
    {
        "city_code": "CUTT",
        "region_code": "CUTT",
        "sub_region_code": "CUTT",
        "region_slug": "cuttack",
        "latitude": "20.4625",
        "longitude": "85.883"
    },
    {
        "city_code": "DABR",
        "region_code": "DABR",
        "sub_region_code": "DABR",
        "region_slug": "dabra",
        "latitude": "25.8907",
        "longitude": "78.3325"
    },
    {
        "city_code": "DHAU",
        "region_code": "DHAU",
        "sub_region_code": "DHAU",
        "region_slug": "dahanu",
        "latitude": "19.9811",
        "longitude": "72.7452"
    },
    {
        "city_code": "DHGM",
        "region_code": "DHGM",
        "sub_region_code": "DHGM",
        "region_slug": "dahegam",
        "latitude": "23.164362",
        "longitude": "72.810512"
    },
    {
        "city_code": "DAHO",
        "region_code": "DAHO",
        "sub_region_code": "DAHO",
        "region_slug": "dahod",
        "latitude": "22.8596",
        "longitude": "74.124"
    },
    {
        "city_code": "DAKS",
        "region_code": "DAKS",
        "sub_region_code": "DAKS",
        "region_slug": "dakshin-barasat",
        "latitude": "22.2251",
        "longitude": "88.4452"
    },
    {
        "city_code": "DALL",
        "region_code": "DALL",
        "sub_region_code": "DALL",
        "region_slug": "dalli-rajhara",
        "latitude": "20.5831",
        "longitude": "81.081"
    },
    {
        "city_code": "DAAL",
        "region_code": "DAAL",
        "sub_region_code": "DAAL",
        "region_slug": "dalmianagar",
        "latitude": "24.9247",
        "longitude": "84.1883"
    },
    {
        "city_code": "DAMA",
        "region_code": "DAMA",
        "sub_region_code": "DAMA",
        "region_slug": "daman",
        "latitude": "20.4283",
        "longitude": "72.8397"
    },
    {
        "city_code": "DMPT",
        "region_code": "DMPT",
        "sub_region_code": "DMPT",
        "region_slug": "dammapeta",
        "latitude": "17.2674",
        "longitude": "81.0106"
    },
    {
        "city_code": "DAMO",
        "region_code": "DAMO",
        "sub_region_code": "DAMO",
        "region_slug": "damoh",
        "latitude": "23.8381",
        "longitude": "79.4422"
    },
    {
        "city_code": "DANA",
        "region_code": "DANA",
        "sub_region_code": "DANA",
        "region_slug": "danapur",
        "latitude": "25.6241",
        "longitude": "85.0414"
    },
    {
        "city_code": "DAND",
        "region_code": "DAND",
        "sub_region_code": "DAND",
        "region_slug": "dandeli",
        "latitude": "15.2497",
        "longitude": "74.6174"
    },
    {
        "city_code": "DANG",
        "region_code": "DANG",
        "sub_region_code": "DANG",
        "region_slug": "dang",
        "latitude": "20.8254",
        "longitude": "73.7007"
    },
    {
        "city_code": "DAUK",
        "region_code": "DAUK",
        "sub_region_code": "DAUK",
        "region_slug": "dankaur",
        "latitude": "28.3477",
        "longitude": "77.5533"
    },
    {
        "city_code": "DAPO",
        "region_code": "DAPO",
        "sub_region_code": "DAPO",
        "region_slug": "daporijo",
        "latitude": "27.9863",
        "longitude": "94.2205"
    },
    {
        "city_code": "DARB",
        "region_code": "DARB",
        "sub_region_code": "DARB",
        "region_slug": "darbhanga",
        "latitude": "26.1119",
        "longitude": "85.896"
    },
    {
        "city_code": "DARJ",
        "region_code": "DARJ",
        "sub_region_code": "DARJ",
        "region_slug": "darjeeling",
        "latitude": "27.035718",
        "longitude": "88.262358"
    },
    {
        "city_code": "DRLA",
        "region_code": "DRLA",
        "sub_region_code": "DRLA",
        "region_slug": "darlapudi",
        "latitude": "17.484624",
        "longitude": "82.735847"
    },
    {
        "city_code": "DARS",
        "region_code": "DARS",
        "sub_region_code": "DARS",
        "region_slug": "darsi",
        "latitude": "15.77",
        "longitude": "79.6794"
    },
    {
        "city_code": "DARA",
        "region_code": "DARA",
        "sub_region_code": "DARA",
        "region_slug": "darwha",
        "latitude": "20.3104",
        "longitude": "77.7738"
    },
    {
        "city_code": "DASU",
        "region_code": "DASU",
        "sub_region_code": "DASU",
        "region_slug": "dasuya",
        "latitude": "31.8132",
        "longitude": "75.6637"
    },
    {
        "city_code": "DATI",
        "region_code": "DATI",
        "sub_region_code": "DATI",
        "region_slug": "datia",
        "latitude": "25.6653",
        "longitude": "78.4609"
    },
    {
        "city_code": "DAUN",
        "region_code": "DAUN",
        "sub_region_code": "DAUN",
        "region_slug": "daund",
        "latitude": "18.4631",
        "longitude": "74.584"
    },
    {
        "city_code": "DAUS",
        "region_code": "DAUS",
        "sub_region_code": "DAUS",
        "region_slug": "dausa",
        "latitude": "26.873968",
        "longitude": "76.326712"
    },
    {
        "city_code": "DAVA",
        "region_code": "DAVA",
        "sub_region_code": "DAVA",
        "region_slug": "davanagere",
        "latitude": "14.4663",
        "longitude": "75.9238"
    },
    {
        "city_code": "DVLR",
        "region_code": "DVLR",
        "sub_region_code": "DVLR",
        "region_slug": "davuluru",
        "latitude": "16.2633",
        "longitude": "80.7429"
    },
    {
        "city_code": "DEES",
        "region_code": "DEES",
        "sub_region_code": "DEES",
        "region_slug": "deesa",
        "latitude": "24.2585",
        "longitude": "72.1907"
    },
    {
        "city_code": "DEH",
        "region_code": "DEH",
        "sub_region_code": "DEH",
        "region_slug": "dehradun",
        "latitude": "30.316495",
        "longitude": "78.032192"
    },
    {
        "city_code": "DEOD",
        "region_code": "DEOD",
        "sub_region_code": "DEOD",
        "region_slug": "deogadh",
        "latitude": "18.649045",
        "longitude": "73.498393"
    },
    {
        "city_code": "DOGH",
        "region_code": "DOGH",
        "sub_region_code": "DOGH",
        "region_slug": "deoghar",
        "latitude": "24.4763",
        "longitude": "86.6913"
    },
    {
        "city_code": "DEOL",
        "region_code": "DEOL",
        "sub_region_code": "DEOL",
        "region_slug": "deoli",
        "latitude": "20.65",
        "longitude": "78.4786"
    },
    {
        "city_code": "DEOY",
        "region_code": "DEOY",
        "sub_region_code": "DEOY",
        "region_slug": "deoli-rajasthan",
        "latitude": "25.7582",
        "longitude": "75.3818"
    },
    {
        "city_code": "DEOY",
        "region_code": "DEOY",
        "sub_region_code": "DEOY",
        "region_slug": "deolirajasthan",
        "latitude": "25.7582",
        "longitude": "75.3818"
    },
    {
        "city_code": "DEEO",
        "region_code": "DEEO",
        "sub_region_code": "DEEO",
        "region_slug": "deoria",
        "latitude": "26.5024",
        "longitude": "83.7791"
    },
    {
        "city_code": "DEVD",
        "region_code": "DEVD",
        "sub_region_code": "DEVD",
        "region_slug": "devadurga",
        "latitude": "16.4235",
        "longitude": "76.9355"
    },
    {
        "city_code": "DEVA",
        "region_code": "DEVA",
        "sub_region_code": "DEVA",
        "region_slug": "devakottai",
        "latitude": "9.944",
        "longitude": "78.8219"
    },
    {
        "city_code": "DEVR",
        "region_code": "DEVR",
        "sub_region_code": "DEVR",
        "region_slug": "devarakadra",
        "latitude": "16.6248",
        "longitude": "77.841"
    },
    {
        "city_code": "DEVK",
        "region_code": "DEVK",
        "sub_region_code": "DEVK",
        "region_slug": "devarakonda",
        "latitude": "16.688531",
        "longitude": "78.906362"
    },
    {
        "city_code": "DVRL",
        "region_code": "DVRL",
        "sub_region_code": "DVRL",
        "region_slug": "devarapalle",
        "latitude": "17.9878",
        "longitude": "82.9838"
    },
    {
        "city_code": "DVRP",
        "region_code": "DVRP",
        "sub_region_code": "DVRP",
        "region_slug": "devarapalli",
        "latitude": "17.035",
        "longitude": "81.5624"
    },
    {
        "city_code": "DEGA",
        "region_code": "DEGA",
        "sub_region_code": "DEGA",
        "region_slug": "devgad",
        "latitude": "16.3754",
        "longitude": "73.3886"
    },
    {
        "city_code": "DEWAS",
        "region_code": "DEWAS",
        "sub_region_code": "DEWAS",
        "region_slug": "dewas",
        "latitude": "22.9623",
        "longitude": "76.0508"
    },
    {
        "city_code": "DMND",
        "region_code": "DMND",
        "sub_region_code": "DMND",
        "region_slug": "dhamnod",
        "latitude": "22.2139",
        "longitude": "75.4723"
    },
    {
        "city_code": "DHPR",
        "region_code": "DHPR",
        "sub_region_code": "DHPR",
        "region_slug": "dhampur",
        "latitude": "29.309565",
        "longitude": "78.51083"
    },
    {
        "city_code": "DHMT",
        "region_code": "DHMT",
        "sub_region_code": "DHMT",
        "region_slug": "dhamtari",
        "latitude": "20.7015",
        "longitude": "81.5542"
    },
    {
        "city_code": "CFFG",
        "region_code": "CFFG",
        "sub_region_code": "CFFG",
        "region_slug": "dhanaura",
        "latitude": "28.9546",
        "longitude": "78.2647"
    },
    {
        "city_code": "DHAN",
        "region_code": "DHAN",
        "sub_region_code": "DHAN",
        "region_slug": "dhanbad",
        "latitude": "23.795653",
        "longitude": "86.430386"
    },
    {
        "city_code": "DHAC",
        "region_code": "DHAC",
        "sub_region_code": "DHAC",
        "region_slug": "dhanera",
        "latitude": "24.5064",
        "longitude": "72.0258"
    },
    {
        "city_code": "DARH",
        "region_code": "DARH",
        "sub_region_code": "DARH",
        "region_slug": "dhar",
        "latitude": "22.4959",
        "longitude": "75.1545"
    },
    {
        "city_code": "SHGA",
        "region_code": "SHGA",
        "sub_region_code": "SHGA",
        "region_slug": "dharamjaigarh",
        "latitude": "22.4622",
        "longitude": "83.2104"
    },
    {
        "city_code": "DPUR",
        "region_code": "DPUR",
        "sub_region_code": "DPUR",
        "region_slug": "dharampur",
        "latitude": "20.5401",
        "longitude": "73.1792"
    },
    {
        "city_code": "DMSL",
        "region_code": "DMSL",
        "sub_region_code": "DMSL",
        "region_slug": "dharamsala",
        "latitude": "32.219393",
        "longitude": "76.324487"
    },
    {
        "city_code": "DMSL",
        "region_code": "DMSL",
        "sub_region_code": "DMSL",
        "region_slug": "dharamshala",
        "latitude": "32.219393",
        "longitude": "76.324487"
    },
    {
        "city_code": "DHAR",
        "region_code": "DHAR",
        "sub_region_code": "DHAR",
        "region_slug": "dharapuram",
        "latitude": "10.7329",
        "longitude": "77.5218"
    },
    {
        "city_code": "DHAT",
        "region_code": "DHAT",
        "sub_region_code": "DHAT",
        "region_slug": "dharmanagar",
        "latitude": "24.3783",
        "longitude": "92.1548"
    },
    {
        "city_code": "DMPI",
        "region_code": "DMPI",
        "sub_region_code": "DMPI",
        "region_slug": "dharmapuri",
        "latitude": "12.0933",
        "longitude": "78.202"
    },
    {
        "city_code": "DDMA",
        "region_code": "DDMA",
        "sub_region_code": "DDMA",
        "region_slug": "dharmavaram",
        "latitude": "14.4137",
        "longitude": "77.7126"
    },
    {
        "city_code": "DPLL",
        "region_code": "DPLL",
        "sub_region_code": "DPLL",
        "region_slug": "dharpally",
        "latitude": "18.784848",
        "longitude": "78.295187"
    },
    {
        "city_code": "DUUU",
        "region_code": "DUUU",
        "sub_region_code": "DUUU",
        "region_slug": "dharpur",
        "latitude": "23.8444",
        "longitude": "72.2016"
    },
    {
        "city_code": "DHRA",
        "region_code": "DHRA",
        "sub_region_code": "DHRA",
        "region_slug": "dharuhera",
        "latitude": "28.20598",
        "longitude": "76.788995"
    },
    {
        "city_code": "DHAW",
        "region_code": "DHAW",
        "sub_region_code": "DHAW",
        "region_slug": "dharwad",
        "latitude": "15.4589",
        "longitude": "75.0078"
    },
    {
        "city_code": "DHAL",
        "region_code": "DHAL",
        "sub_region_code": "DHAL",
        "region_slug": "dhaulana",
        "latitude": "28.6324",
        "longitude": "77.6507"
    },
    {
        "city_code": "DHEM",
        "region_code": "DHEM",
        "sub_region_code": "DHEM",
        "region_slug": "dhemaji",
        "latitude": "27.472",
        "longitude": "94.5588"
    },
    {
        "city_code": "DNAL",
        "region_code": "DNAL",
        "sub_region_code": "DNAL",
        "region_slug": "dhenkanal",
        "latitude": "20.8424",
        "longitude": "85.4376"
    },
    {
        "city_code": "DHOL",
        "region_code": "DHOL",
        "sub_region_code": "DHOL",
        "region_slug": "dholka",
        "latitude": "22.7428",
        "longitude": "72.4436"
    },
    {
        "city_code": "DHUR",
        "region_code": "DHUR",
        "sub_region_code": "DHUR",
        "region_slug": "dholpur",
        "latitude": "26.7025",
        "longitude": "77.8934"
    },
    {
        "city_code": "DHON",
        "region_code": "DHON",
        "sub_region_code": "DHON",
        "region_slug": "dhone",
        "latitude": "15.396",
        "longitude": "77.8732"
    },
    {
        "city_code": "DHOR",
        "region_code": "DHOR",
        "sub_region_code": "DHOR",
        "region_slug": "dhoraji",
        "latitude": "21.7398",
        "longitude": "70.4491"
    },
    {
        "city_code": "DHRN",
        "region_code": "DHRN",
        "sub_region_code": "DHRN",
        "region_slug": "dhrangadhra",
        "latitude": "22.983225",
        "longitude": "71.474461"
    },
    {
        "city_code": "DHBR",
        "region_code": "DHBR",
        "sub_region_code": "DHBR",
        "region_slug": "dhubri",
        "latitude": "26.022339",
        "longitude": "89.978896"
    },
    {
        "city_code": "DHLE",
        "region_code": "DHLE",
        "sub_region_code": "DHLE",
        "region_slug": "dhule",
        "latitude": "20.9042",
        "longitude": "74.7749"
    },
    {
        "city_code": "DHAA",
        "region_code": "DHAA",
        "sub_region_code": "DHAA",
        "region_slug": "dhulian",
        "latitude": "24.6707",
        "longitude": "87.9482"
    },
    {
        "city_code": "DHUI",
        "region_code": "DHUI",
        "sub_region_code": "DHUI",
        "region_slug": "dhuliyan",
        "latitude": "24.6707",
        "longitude": "87.9482"
    },
    {
        "city_code": "DHRI",
        "region_code": "DHRI",
        "sub_region_code": "DHRI",
        "region_slug": "dhuri",
        "latitude": "30.37183",
        "longitude": "75.861707"
    },
    {
        "city_code": "MNHR",
        "region_code": "MNHR",
        "sub_region_code": "MNHR",
        "region_slug": "diamond-harbour",
        "latitude": "22.192499",
        "longitude": "88.189499"
    },
    {
        "city_code": "DIB",
        "region_code": "DIB",
        "sub_region_code": "DIB",
        "region_slug": "dibrugarh",
        "latitude": "27.472833",
        "longitude": "94.911962"
    },
    {
        "city_code": "DIGR",
        "region_code": "DIGR",
        "sub_region_code": "DIGR",
        "region_slug": "digras",
        "latitude": "20.1073",
        "longitude": "77.7166"
    },
    {
        "city_code": "DLDR",
        "region_code": "DLDR",
        "sub_region_code": "DLDR",
        "region_slug": "dildar-nagar",
        "latitude": "25.426151",
        "longitude": "83.672076"
    },
    {
        "city_code": "DMHO",
        "region_code": "DMHO",
        "sub_region_code": "DMHO",
        "region_slug": "dima-hasao",
        "latitude": "25.3478",
        "longitude": "93.0176"
    },
    {
        "city_code": "DMPR",
        "region_code": "DMPR",
        "sub_region_code": "DMPR",
        "region_slug": "dimapur",
        "latitude": "25.863",
        "longitude": "93.7537"
    },
    {
        "city_code": "DINA",
        "region_code": "DINA",
        "sub_region_code": "DINA",
        "region_slug": "dinanagar",
        "latitude": "32.1266",
        "longitude": "75.4636"
    },
    {
        "city_code": "DIND",
        "region_code": "DIND",
        "sub_region_code": "DIND",
        "region_slug": "dindigul",
        "latitude": "10.3673",
        "longitude": "77.9803"
    },
    {
        "city_code": "DIPH",
        "region_code": "DIPH",
        "sub_region_code": "DIPH",
        "region_slug": "diphu",
        "latitude": "25.8465",
        "longitude": "93.4299"
    },
    {
        "city_code": "DGGD",
        "region_code": "DGGD",
        "sub_region_code": "DGGD",
        "region_slug": "dirang",
        "latitude": "27.3584",
        "longitude": "92.2409"
    },
    {
        "city_code": "DDBP",
        "region_code": "DDBP",
        "sub_region_code": "DDBP",
        "region_slug": "doddaballapura",
        "latitude": "13.2957",
        "longitude": "77.5364"
    },
    {
        "city_code": "MDHK",
        "region_code": "MDHK",
        "sub_region_code": "MDHK",
        "region_slug": "doimukh",
        "latitude": "27.150007",
        "longitude": "93.749993"
    },
    {
        "city_code": "DMKL",
        "region_code": "DMKL",
        "sub_region_code": "DMKL",
        "region_slug": "domkal",
        "latitude": "24.1236",
        "longitude": "88.5432"
    },
    {
        "city_code": "DONG",
        "region_code": "DONG",
        "sub_region_code": "DONG",
        "region_slug": "dongargarh",
        "latitude": "21.1802",
        "longitude": "80.7602"
    },
    {
        "city_code": "DLBZ",
        "region_code": "DLBZ",
        "sub_region_code": "DLBZ",
        "region_slug": "doolahat-bazar",
        "latitude": "0.0",
        "longitude": "27.1789"
    },
    {
        "city_code": "DORH",
        "region_code": "DORH",
        "sub_region_code": "DORH",
        "region_slug": "doraha",
        "latitude": "30.8039",
        "longitude": "76.0334"
    },
    {
        "city_code": "DORN",
        "region_code": "DORN",
        "sub_region_code": "DORN",
        "region_slug": "dornakal",
        "latitude": "17.4451",
        "longitude": "80.1568"
    },
    {
        "city_code": "DOWL",
        "region_code": "DOWL",
        "sub_region_code": "DOWL",
        "region_slug": "dowlaiswaram",
        "latitude": "16.9558",
        "longitude": "81.7927"
    },
    {
        "city_code": "DAKR",
        "region_code": "DAKR",
        "sub_region_code": "DAKR",
        "region_slug": "draksharamam",
        "latitude": "16.7914",
        "longitude": "82.0598"
    },
    {
        "city_code": "DBBK",
        "region_code": "DBBK",
        "sub_region_code": "DBBK",
        "region_slug": "dubbaka",
        "latitude": "18.1765",
        "longitude": "78.6654"
    },
    {
        "city_code": "DUBR",
        "region_code": "DUBR",
        "sub_region_code": "DUBR",
        "region_slug": "dubrajpur",
        "latitude": "23.794709",
        "longitude": "87.341091"
    },
    {
        "city_code": "DUDH",
        "region_code": "DUDH",
        "sub_region_code": "DUDH",
        "region_slug": "dudhi",
        "latitude": "24.2129",
        "longitude": "83.2403"
    },
    {
        "city_code": "DUNG",
        "region_code": "DUNG",
        "sub_region_code": "DUNG",
        "region_slug": "dungarpur",
        "latitude": "23.8417",
        "longitude": "73.7147"
    },
    {
        "city_code": "DURG",
        "region_code": "DURG",
        "sub_region_code": "DURG",
        "region_slug": "durg",
        "latitude": "21.189367",
        "longitude": "81.283039"
    },
    {
        "city_code": "DURGA",
        "region_code": "DURGA",
        "sub_region_code": "DURGA",
        "region_slug": "durgapur",
        "latitude": "23.48",
        "longitude": "87.32"
    },
    {
        "city_code": "ESTG",
        "region_code": "ESTG",
        "sub_region_code": "ESTG",
        "region_slug": "east-godavari",
        "latitude": "17.3213",
        "longitude": "82.0407"
    },
    {
        "city_code": "EDPL",
        "region_code": "EDPL",
        "sub_region_code": "EDPL",
        "region_slug": "edappal",
        "latitude": "10.7839",
        "longitude": "76.0076"
    },
    {
        "city_code": "EDLP",
        "region_code": "EDLP",
        "sub_region_code": "EDLP",
        "region_slug": "edlapadu",
        "latitude": "16.1718",
        "longitude": "80.2286"
    },
    {
        "city_code": "EKMA",
        "region_code": "EKMA",
        "sub_region_code": "EKMA",
        "region_slug": "ekma",
        "latitude": "25.965105",
        "longitude": "84.535325"
    },
    {
        "city_code": "ELES",
        "region_code": "ELES",
        "sub_region_code": "ELES",
        "region_slug": "elesvaram",
        "latitude": "17.288251",
        "longitude": "82.106207"
    },
    {
        "city_code": "ELRU",
        "region_code": "ELRU",
        "sub_region_code": "ELRU",
        "region_slug": "eluru",
        "latitude": "16.703285",
        "longitude": "81.100388"
    },
    {
        "city_code": "ENKR",
        "region_code": "ENKR",
        "sub_region_code": "ENKR",
        "region_slug": "enkoor",
        "latitude": "17.331",
        "longitude": "80.4403"
    },
    {
        "city_code": "ERMR",
        "region_code": "ERMR",
        "sub_region_code": "ERMR",
        "region_slug": "eramalloor",
        "latitude": "9.8247",
        "longitude": "76.3145"
    },
    {
        "city_code": "ERAN",
        "region_code": "ERAN",
        "sub_region_code": "ERAN",
        "region_slug": "erandol",
        "latitude": "20.9266",
        "longitude": "75.3325"
    },
    {
        "city_code": "ERAT",
        "region_code": "ERAT",
        "sub_region_code": "ERAT",
        "region_slug": "erattupetta",
        "latitude": "9.6858",
        "longitude": "76.7751"
    },
    {
        "city_code": "ERNK",
        "region_code": "ERNK",
        "sub_region_code": "ERNK",
        "region_slug": "ernakulam",
        "latitude": "10.0718",
        "longitude": "76.5488"
    },
    {
        "city_code": "EROD",
        "region_code": "EROD",
        "sub_region_code": "EROD",
        "region_slug": "erode",
        "latitude": "11.340399",
        "longitude": "77.716942"
    },
    {
        "city_code": "ETAH",
        "region_code": "ETAH",
        "sub_region_code": "ETAH",
        "region_slug": "etah",
        "latitude": "27.5588",
        "longitude": "78.6626"
    },
    {
        "city_code": "ETWH",
        "region_code": "ETWH",
        "sub_region_code": "ETWH",
        "region_slug": "etawah",
        "latitude": "26.8117",
        "longitude": "79.0047"
    },
    {
        "city_code": "ETTU",
        "region_code": "ETTU",
        "sub_region_code": "ETTU",
        "region_slug": "ettumanoor",
        "latitude": "9.6706",
        "longitude": "76.5579"
    },
    {
        "city_code": "ETNR",
        "region_code": "ETNR",
        "sub_region_code": "ETNR",
        "region_slug": "eturnagaram",
        "latitude": "18.337729",
        "longitude": "80.429824"
    },
    {
        "city_code": "FAZA",
        "region_code": "FAZA",
        "sub_region_code": "FAZA",
        "region_slug": "faizabad",
        "latitude": "26.7732",
        "longitude": "82.1442"
    },
    {
        "city_code": "FALA",
        "region_code": "FALA",
        "sub_region_code": "FALA",
        "region_slug": "falakata",
        "latitude": "26.5175",
        "longitude": "89.2039"
    },
    {
        "city_code": "FALN",
        "region_code": "FALN",
        "sub_region_code": "FALN",
        "region_slug": "falna",
        "latitude": "25.2411",
        "longitude": "73.247"
    },
    {
        "city_code": "DKOT",
        "region_code": "DKOT",
        "sub_region_code": "DKOT",
        "region_slug": "faridkot",
        "latitude": "30.677",
        "longitude": "74.7584"
    },
    {
        "city_code": "FARU",
        "region_code": "FARU",
        "sub_region_code": "FARU",
        "region_slug": "farrukhabad",
        "latitude": "27.381211",
        "longitude": "79.557098"
    },
    {
        "city_code": "FATD",
        "region_code": "FATD",
        "sub_region_code": "FATD",
        "region_slug": "fatehabad",
        "latitude": "29.5077",
        "longitude": "75.452"
    },
    {
        "city_code": "FASA",
        "region_code": "FASA",
        "sub_region_code": "FASA",
        "region_slug": "fatehgarh-sahib",
        "latitude": "30.647836",
        "longitude": "76.388616"
    },
    {
        "city_code": "FATE",
        "region_code": "FATE",
        "sub_region_code": "FATE",
        "region_slug": "fatehpur",
        "latitude": "25.85",
        "longitude": "80.8987"
    },
    {
        "city_code": "FATR",
        "region_code": "FATR",
        "sub_region_code": "FATR",
        "region_slug": "fatehpurrajasthan",
        "latitude": "27.996403",
        "longitude": "74.922895"
    },
    {
        "city_code": "FAKA",
        "region_code": "FAKA",
        "sub_region_code": "FAKA",
        "region_slug": "fazilka",
        "latitude": "30.4036",
        "longitude": "74.028"
    },
    {
        "city_code": "FRZD",
        "region_code": "FRZD",
        "sub_region_code": "FRZD",
        "region_slug": "firozabad",
        "latitude": "27.159122",
        "longitude": "78.395733"
    },
    {
        "city_code": "FRZR",
        "region_code": "FRZR",
        "sub_region_code": "FRZR",
        "region_slug": "firozpur",
        "latitude": "30.9331",
        "longitude": "74.6225"
    },
    {
        "city_code": "FORB",
        "region_code": "FORB",
        "sub_region_code": "FORB",
        "region_slug": "forbesganj",
        "latitude": "26.2993",
        "longitude": "87.2666"
    },
    {
        "city_code": "FCR",
        "region_code": "FCR",
        "sub_region_code": "FCR",
        "region_slug": "france",
        "latitude": "2.2137",
        "longitude": "46.2276"
    },
    {
        "city_code": "GMAD",
        "region_code": "GMAD",
        "sub_region_code": "GMAD",
        "region_slug": "gmamidada",
        "latitude": "16.9385",
        "longitude": "82.0761"
    },
    {
        "city_code": "GADG",
        "region_code": "GADG",
        "sub_region_code": "GADG",
        "region_slug": "gadag",
        "latitude": "15.4325",
        "longitude": "75.638"
    },
    {
        "city_code": "GDWR",
        "region_code": "GDWR",
        "sub_region_code": "GDWR",
        "region_slug": "gadarwara",
        "latitude": "22.9225",
        "longitude": "78.7834"
    },
    {
        "city_code": "GDRO",
        "region_code": "GDRO",
        "sub_region_code": "GDRO",
        "region_slug": "gadchiroli",
        "latitude": "19.4969",
        "longitude": "80.2767"
    },
    {
        "city_code": "GADW",
        "region_code": "GADW",
        "sub_region_code": "GADW",
        "region_slug": "gadwal",
        "latitude": "16.2337",
        "longitude": "77.8081"
    },
    {
        "city_code": "GJPT",
        "region_code": "GJPT",
        "sub_region_code": "GJPT",
        "region_slug": "gajapathinagaram",
        "latitude": "18.2798",
        "longitude": "83.3333"
    },
    {
        "city_code": "GJGH",
        "region_code": "GJGH",
        "sub_region_code": "GJGH",
        "region_slug": "gajendragarh",
        "latitude": "15.7361",
        "longitude": "75.971"
    },
    {
        "city_code": "GAJW",
        "region_code": "GAJW",
        "sub_region_code": "GAJW",
        "region_slug": "gajwel",
        "latitude": "17.8452",
        "longitude": "78.6818"
    },
    {
        "city_code": "GMPL",
        "region_code": "GMPL",
        "sub_region_code": "GMPL",
        "region_slug": "gampalagudem",
        "latitude": "16.9923",
        "longitude": "80.5272"
    },
    {
        "city_code": "GANP",
        "region_code": "GANP",
        "sub_region_code": "GANP",
        "region_slug": "ganapavaram",
        "latitude": "16.6994",
        "longitude": "81.4635"
    },
    {
        "city_code": "GDHAM",
        "region_code": "GDHAM",
        "sub_region_code": "GDHAM",
        "region_slug": "gandhidham",
        "latitude": "23.0753",
        "longitude": "70.1337"
    },
    {
        "city_code": "GNAGAR",
        "region_code": "GNAGAR",
        "sub_region_code": "GNAGAR",
        "region_slug": "gandhinagar",
        "latitude": "23.22482",
        "longitude": "72.646377"
    },
    {
        "city_code": "GNGR",
        "region_code": "GNGR",
        "sub_region_code": "GNGR",
        "region_slug": "gangarampur",
        "latitude": "25.4009",
        "longitude": "88.5324"
    },
    {
        "city_code": "GAVT",
        "region_code": "GAVT",
        "sub_region_code": "GAVT",
        "region_slug": "gangavati",
        "latitude": "15.4319",
        "longitude": "76.5315"
    },
    {
        "city_code": "GANZ",
        "region_code": "GANZ",
        "sub_region_code": "GANZ",
        "region_slug": "gangoh",
        "latitude": "29.7788",
        "longitude": "77.2606"
    },
    {
        "city_code": "GANG",
        "region_code": "GANG",
        "sub_region_code": "GANG",
        "region_slug": "gangtok",
        "latitude": "27.3389",
        "longitude": "88.6065"
    },
    {
        "city_code": "GHZA",
        "region_code": "GHZA",
        "sub_region_code": "GHZA",
        "region_slug": "ganjam",
        "latitude": "19.586",
        "longitude": "84.6897"
    },
    {
        "city_code": "GANJ",
        "region_code": "GANJ",
        "sub_region_code": "GANJ",
        "region_slug": "ganjbasoda",
        "latitude": "23.8515",
        "longitude": "77.9263"
    },
    {
        "city_code": "GANN",
        "region_code": "GANN",
        "sub_region_code": "GANN",
        "region_slug": "gannavaram",
        "latitude": "16.5419",
        "longitude": "80.805"
    },
    {
        "city_code": "GRAH",
        "region_code": "GRAH",
        "sub_region_code": "GRAH",
        "region_slug": "garhwal",
        "latitude": "29.86876",
        "longitude": "78.83826"
    },
    {
        "city_code": "GALA",
        "region_code": "GALA",
        "sub_region_code": "GALA",
        "region_slug": "garla",
        "latitude": "17.488",
        "longitude": "80.1428"
    },
    {
        "city_code": "GAUR",
        "region_code": "GAUR",
        "sub_region_code": "GAUR",
        "region_slug": "gauribidanur",
        "latitude": "13.611159",
        "longitude": "77.51696"
    },
    {
        "city_code": "GNGJ",
        "region_code": "GNGJ",
        "sub_region_code": "GNGJ",
        "region_slug": "gauriganj",
        "latitude": "26.2073",
        "longitude": "81.6823"
    },
    {
        "city_code": "GAYA",
        "region_code": "GAYA",
        "sub_region_code": "GAYA",
        "region_slug": "gaya",
        "latitude": "24.7955",
        "longitude": "84.9994"
    },
    {
        "city_code": "GAZP",
        "region_code": "GAZP",
        "sub_region_code": "GAZP",
        "region_slug": "gazole",
        "latitude": "25.2109",
        "longitude": "88.1924"
    },
    {
        "city_code": "GEOR",
        "region_code": "GEOR",
        "sub_region_code": "GEOR",
        "region_slug": "georai",
        "latitude": "19.2606",
        "longitude": "75.7546"
    },
    {
        "city_code": "GHAT",
        "region_code": "GHAT",
        "sub_region_code": "GHAT",
        "region_slug": "ghatanji",
        "latitude": "20.1437",
        "longitude": "78.3117"
    },
    {
        "city_code": "GHAR",
        "region_code": "GHAR",
        "sub_region_code": "GHAR",
        "region_slug": "ghazipur",
        "latitude": "25.6135",
        "longitude": "83.507"
    },
    {
        "city_code": "GHOR",
        "region_code": "GHOR",
        "sub_region_code": "GHOR",
        "region_slug": "ghorasahan",
        "latitude": "26.8202",
        "longitude": "85.1307"
    },
    {
        "city_code": "GDAL",
        "region_code": "GDAL",
        "sub_region_code": "GDAL",
        "region_slug": "giddalur",
        "latitude": "15.376358",
        "longitude": "78.925087"
    },
    {
        "city_code": "GING",
        "region_code": "GING",
        "sub_region_code": "GING",
        "region_slug": "gingee",
        "latitude": "12.2524",
        "longitude": "79.4113"
    },
    {
        "city_code": "GIRI",
        "region_code": "GIRI",
        "sub_region_code": "GIRI",
        "region_slug": "giridih",
        "latitude": "24.191351",
        "longitude": "86.299637"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "GOA",
        "region_slug": "goa",
        "latitude": "15.378",
        "longitude": "74.019"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "PONA",
        "region_slug": "ponda",
        "latitude": "15.4027",
        "longitude": "74.0078"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "VAGG",
        "region_slug": "vasco-da-gama",
        "latitude": "15.386",
        "longitude": "73.844"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "MARG",
        "region_slug": "margao",
        "latitude": "15.2832",
        "longitude": "73.9862"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "MARC",
        "region_slug": "marcela",
        "latitude": "15.515458",
        "longitude": "73.961849"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "BARD",
        "region_slug": "bardez",
        "latitude": "15.5723",
        "longitude": "73.8184"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "BICG",
        "region_slug": "bicholim",
        "latitude": "15.5889",
        "longitude": "73.9654"
    },
    {
        "city_code": "GOA",
        "region_code": "GOA",
        "sub_region_code": "BABM",
        "region_slug": "bambolim",
        "latitude": "15.464919",
        "longitude": "73.865777"
    },
    {
        "city_code": "GOAL",
        "region_code": "GOAL",
        "sub_region_code": "GOAL",
        "region_slug": "goalpara",
        "latitude": "26.1641",
        "longitude": "90.6252"
    },
    {
        "city_code": "GOBI",
        "region_code": "GOBI",
        "sub_region_code": "GOBI",
        "region_slug": "gobichettipalayam",
        "latitude": "11.4504",
        "longitude": "77.43"
    },
    {
        "city_code": "GDVK",
        "region_code": "GDVK",
        "sub_region_code": "GDVK",
        "region_slug": "godavarikhani",
        "latitude": "18.7511",
        "longitude": "79.5059"
    },
    {
        "city_code": "GODH",
        "region_code": "GODH",
        "sub_region_code": "GODH",
        "region_slug": "godhra",
        "latitude": "22.7788",
        "longitude": "73.6143"
    },
    {
        "city_code": "GOGA",
        "region_code": "GOGA",
        "sub_region_code": "GOGA",
        "region_slug": "gogawa",
        "latitude": "22.19915",
        "longitude": "75.75295"
    },
    {
        "city_code": "GOHA",
        "region_code": "GOHA",
        "sub_region_code": "GOHA",
        "region_slug": "gohana",
        "latitude": "29.1393",
        "longitude": "76.6945"
    },
    {
        "city_code": "GKGK",
        "region_code": "GKGK",
        "sub_region_code": "GKGK",
        "region_slug": "gokak",
        "latitude": "16.1592",
        "longitude": "74.8156"
    },
    {
        "city_code": "GOKA",
        "region_code": "GOKA",
        "sub_region_code": "GOKA",
        "region_slug": "gokarna",
        "latitude": "14.5479",
        "longitude": "74.3188"
    },
    {
        "city_code": "GOKM",
        "region_code": "GOKM",
        "sub_region_code": "GOKM",
        "region_slug": "gokavaram",
        "latitude": "17.2563",
        "longitude": "81.8484"
    },
    {
        "city_code": "GABR",
        "region_code": "GABR",
        "sub_region_code": "GABR",
        "region_slug": "gola-bazar",
        "latitude": "26.3519",
        "longitude": "83.3429"
    },
    {
        "city_code": "GHT",
        "region_code": "GHT",
        "sub_region_code": "GHT",
        "region_slug": "golaghat",
        "latitude": "26.5239",
        "longitude": "93.9623"
    },
    {
        "city_code": "GOLL",
        "region_code": "GOLL",
        "sub_region_code": "GOLL",
        "region_slug": "gollaprolu",
        "latitude": "17.1562",
        "longitude": "82.2861"
    },
    {
        "city_code": "GOND",
        "region_code": "GOND",
        "sub_region_code": "GOND",
        "region_slug": "gonda",
        "latitude": "27.134",
        "longitude": "81.9619"
    },
    {
        "city_code": "GONA",
        "region_code": "GONA",
        "sub_region_code": "GONA",
        "region_slug": "gondal",
        "latitude": "21.9612",
        "longitude": "70.7939"
    },
    {
        "city_code": "GNDA",
        "region_code": "GNDA",
        "sub_region_code": "GNDA",
        "region_slug": "gondia",
        "latitude": "21.4624",
        "longitude": "80.221"
    },
    {
        "city_code": "GOOL",
        "region_code": "GOOL",
        "sub_region_code": "GOOL",
        "region_slug": "goolikkadavu",
        "latitude": "11.0956",
        "longitude": "76.6412"
    },
    {
        "city_code": "GOOT",
        "region_code": "GOOT",
        "sub_region_code": "GOOT",
        "region_slug": "gooty",
        "latitude": "15.1101",
        "longitude": "77.6362"
    },
    {
        "city_code": "GOPG",
        "region_code": "GOPG",
        "sub_region_code": "GOPG",
        "region_slug": "gopalganj",
        "latitude": "26.4685",
        "longitude": "84.4433"
    },
    {
        "city_code": "GOPA",
        "region_code": "GOPA",
        "sub_region_code": "GOPA",
        "region_slug": "gopalpet",
        "latitude": "18.109691",
        "longitude": "78.123248"
    },
    {
        "city_code": "GOPI",
        "region_code": "GOPI",
        "sub_region_code": "GOPI",
        "region_slug": "gopiganj",
        "latitude": "25.2859",
        "longitude": "82.4322"
    },
    {
        "city_code": "GRKP",
        "region_code": "GRKP",
        "sub_region_code": "GRKP",
        "region_slug": "gorakhpur",
        "latitude": "26.760555",
        "longitude": "83.373168"
    },
    {
        "city_code": "GMDU",
        "region_code": "GMDU",
        "sub_region_code": "GMDU",
        "region_slug": "goramadagu",
        "latitude": "13.374895",
        "longitude": "77.943228"
    },
    {
        "city_code": "GORA",
        "region_code": "GORA",
        "sub_region_code": "GORA",
        "region_slug": "gorantla",
        "latitude": "13.9838",
        "longitude": "77.7723"
    },
    {
        "city_code": "GTGN",
        "region_code": "GTGN",
        "sub_region_code": "GTGN",
        "region_slug": "gotegaon",
        "latitude": "23.0487",
        "longitude": "79.4873"
    },
    {
        "city_code": "GOWP",
        "region_code": "GOWP",
        "sub_region_code": "GOWP",
        "region_slug": "gownipalli",
        "latitude": "13.506",
        "longitude": "78.2241"
    },
    {
        "city_code": "GUDI",
        "region_code": "GUDI",
        "sub_region_code": "GUDI",
        "region_slug": "gudivada",
        "latitude": "16.441",
        "longitude": "80.9926"
    },
    {
        "city_code": "GDTM",
        "region_code": "GDTM",
        "sub_region_code": "GDTM",
        "region_slug": "gudiyatham",
        "latitude": "12.9447",
        "longitude": "78.8709"
    },
    {
        "city_code": "GULU",
        "region_code": "GULU",
        "sub_region_code": "GULU",
        "region_slug": "gudlavalleru",
        "latitude": "16.3487",
        "longitude": "81.0492"
    },
    {
        "city_code": "GUDR",
        "region_code": "GUDR",
        "sub_region_code": "GUDR",
        "region_slug": "gudur",
        "latitude": "14.146042",
        "longitude": "79.850736"
    },
    {
        "city_code": "GUHA",
        "region_code": "GUHA",
        "sub_region_code": "GUHA",
        "region_slug": "guhagar",
        "latitude": "17.479096",
        "longitude": "73.194771"
    },
    {
        "city_code": "GULL",
        "region_code": "GULL",
        "sub_region_code": "GULL",
        "region_slug": "gulaothi",
        "latitude": "28.5902",
        "longitude": "77.7936"
    },
    {
        "city_code": "GULD",
        "region_code": "GULD",
        "sub_region_code": "GULD",
        "region_slug": "guledgudda",
        "latitude": "16.0496",
        "longitude": "75.7895"
    },
    {
        "city_code": "GUMM",
        "region_code": "GUMM",
        "sub_region_code": "GUMM",
        "region_slug": "gummadidala",
        "latitude": "17.6847",
        "longitude": "78.3686"
    },
    {
        "city_code": "GUNA",
        "region_code": "GUNA",
        "sub_region_code": "GUNA",
        "region_slug": "guna",
        "latitude": "24.6348",
        "longitude": "77.298"
    },
    {
        "city_code": "GUND",
        "region_code": "GUND",
        "sub_region_code": "GUND",
        "region_slug": "gundlupet",
        "latitude": "11.8083",
        "longitude": "76.6927"
    },
    {
        "city_code": "GUNL",
        "region_code": "GUNL",
        "sub_region_code": "GUNL",
        "region_slug": "guntakal",
        "latitude": "15.1674",
        "longitude": "77.3736"
    },
    {
        "city_code": "GUNT",
        "region_code": "GUNT",
        "sub_region_code": "GUNT",
        "region_slug": "guntur",
        "latitude": "16.3008",
        "longitude": "80.4428"
    },
    {
        "city_code": "GUNT",
        "region_code": "GUNT",
        "sub_region_code": "KAKA",
        "region_slug": "chinnakakani",
        "latitude": "16.407",
        "longitude": "80.5522"
    },
    {
        "city_code": "GUNT",
        "region_code": "GUNT",
        "sub_region_code": "CHEB",
        "region_slug": "chebrolu",
        "latitude": "16.2007",
        "longitude": "80.5286"
    },
    {
        "city_code": "GUNT",
        "region_code": "GUNT",
        "sub_region_code": "PNRU",
        "region_slug": "ponnur",
        "latitude": "16.0686",
        "longitude": "80.5482"
    },
    {
        "city_code": "GUNT",
        "region_code": "GUNT",
        "sub_region_code": "PRTH",
        "region_slug": "prathipadu",
        "latitude": "17.2293",
        "longitude": "82.1911"
    },
    {
        "city_code": "GUNT",
        "region_code": "GUNT",
        "sub_region_code": "NSPT",
        "region_slug": "narasaraopet",
        "latitude": "16.2354",
        "longitude": "80.0479"
    },
    {
        "city_code": "GRAP",
        "region_code": "GRAP",
        "sub_region_code": "GRAP",
        "region_slug": "gurap",
        "latitude": "23.0348",
        "longitude": "88.1218"
    },
    {
        "city_code": "GURZ",
        "region_code": "GURZ",
        "sub_region_code": "GURZ",
        "region_slug": "gurazala",
        "latitude": "16.5557",
        "longitude": "79.6362"
    },
    {
        "city_code": "GSPR",
        "region_code": "GSPR",
        "sub_region_code": "GSPR",
        "region_slug": "gurdaspur",
        "latitude": "31.94",
        "longitude": "75.2479"
    },
    {
        "city_code": "GUVY",
        "region_code": "GUVY",
        "sub_region_code": "GUVY",
        "region_slug": "guruvayur",
        "latitude": "10.5946",
        "longitude": "76.0369"
    },
    {
        "city_code": "GUW",
        "region_code": "GUW",
        "sub_region_code": "GUW",
        "region_slug": "guwahati",
        "latitude": "26.144435",
        "longitude": "91.733179"
    },
    {
        "city_code": "GWAL",
        "region_code": "GWAL",
        "sub_region_code": "GWAL",
        "region_slug": "gwalior",
        "latitude": "26.218287",
        "longitude": "78.182831"
    },
    {
        "city_code": "HARR",
        "region_code": "HARR",
        "sub_region_code": "HARR",
        "region_slug": "habra",
        "latitude": "22.8489",
        "longitude": "88.664"
    },
    {
        "city_code": "HALG",
        "region_code": "HALG",
        "sub_region_code": "HALG",
        "region_slug": "haflong",
        "latitude": "25.1633",
        "longitude": "93.0128"
    },
    {
        "city_code": "HHGG",
        "region_code": "HHGG",
        "sub_region_code": "HHGG",
        "region_slug": "hagaribommanahalli",
        "latitude": "15.0456",
        "longitude": "76.2074"
    },
    {
        "city_code": "HAJI",
        "region_code": "HAJI",
        "sub_region_code": "HAJI",
        "region_slug": "hajipur",
        "latitude": "25.6858",
        "longitude": "85.2146"
    },
    {
        "city_code": "HLDI",
        "region_code": "HLDI",
        "sub_region_code": "HLDI",
        "region_slug": "haldia",
        "latitude": "22.0667",
        "longitude": "88.0698"
    },
    {
        "city_code": "HUCR",
        "region_code": "HUCR",
        "sub_region_code": "HUCR",
        "region_slug": "halduchaur",
        "latitude": "29.1121",
        "longitude": "79.5237"
    },
    {
        "city_code": "HALD",
        "region_code": "HALD",
        "sub_region_code": "HALD",
        "region_slug": "haldwani",
        "latitude": "29.2183",
        "longitude": "79.513"
    },
    {
        "city_code": "HALI",
        "region_code": "HALI",
        "sub_region_code": "HALI",
        "region_slug": "haliya",
        "latitude": "16.779611",
        "longitude": "79.319797"
    },
    {
        "city_code": "HALO",
        "region_code": "HALO",
        "sub_region_code": "HALO",
        "region_slug": "halol",
        "latitude": "22.5072",
        "longitude": "73.4718"
    },
    {
        "city_code": "HAMI",
        "region_code": "HAMI",
        "sub_region_code": "HAMI",
        "region_slug": "hamirpur-hp",
        "latitude": "31.686175",
        "longitude": "76.521309"
    },
    {
        "city_code": "HMPI",
        "region_code": "HMPI",
        "sub_region_code": "HMPI",
        "region_slug": "hampi",
        "latitude": "15.351771",
        "longitude": "76.475344"
    },
    {
        "city_code": "HNDW",
        "region_code": "HNDW",
        "sub_region_code": "HNDW",
        "region_slug": "handwara",
        "latitude": "34.3996",
        "longitude": "74.2817"
    },
    {
        "city_code": "HANU",
        "region_code": "HANU",
        "sub_region_code": "HANU",
        "region_slug": "hanuman-junction",
        "latitude": "16.6385",
        "longitude": "80.9705"
    },
    {
        "city_code": "HNMG",
        "region_code": "HNMG",
        "sub_region_code": "HNMG",
        "region_slug": "hanumangarh",
        "latitude": "29.5815",
        "longitude": "74.3294"
    },
    {
        "city_code": "HAPR",
        "region_code": "HAPR",
        "sub_region_code": "HAPR",
        "region_slug": "hapur",
        "latitude": "28.7306",
        "longitude": "77.7759"
    },
    {
        "city_code": "HRDA",
        "region_code": "HRDA",
        "sub_region_code": "HRDA",
        "region_slug": "harda",
        "latitude": "22.1984",
        "longitude": "77.1025"
    },
    {
        "city_code": "HRDI",
        "region_code": "HRDI",
        "sub_region_code": "HRDI",
        "region_slug": "hardoi",
        "latitude": "27.398774",
        "longitude": "80.128488"
    },
    {
        "city_code": "HARI",
        "region_code": "HARI",
        "sub_region_code": "HARI",
        "region_slug": "haria",
        "latitude": "25.840739",
        "longitude": "88.062317"
    },
    {
        "city_code": "HRDR",
        "region_code": "HRDR",
        "sub_region_code": "HRDR",
        "region_slug": "haridwar",
        "latitude": "29.945691",
        "longitude": "78.164248"
    },
    {
        "city_code": "HRRR",
        "region_code": "HRRR",
        "sub_region_code": "HRRR",
        "region_slug": "harihar",
        "latitude": "14.51821",
        "longitude": "75.782043"
    },
    {
        "city_code": "HRPD",
        "region_code": "HRPD",
        "sub_region_code": "HRPD",
        "region_slug": "haripad",
        "latitude": "9.2815",
        "longitude": "76.4534"
    },
    {
        "city_code": "HARU",
        "region_code": "HARU",
        "sub_region_code": "HARU",
        "region_slug": "harugeri",
        "latitude": "16.5177",
        "longitude": "74.9497"
    },
    {
        "city_code": "HRUR",
        "region_code": "HRUR",
        "sub_region_code": "HRUR",
        "region_slug": "harur",
        "latitude": "12.047",
        "longitude": "78.4833"
    },
    {
        "city_code": "HASA",
        "region_code": "HASA",
        "sub_region_code": "HASA",
        "region_slug": "hasanparthy",
        "latitude": "18.0691",
        "longitude": "79.5252"
    },
    {
        "city_code": "HASZ",
        "region_code": "HASZ",
        "sub_region_code": "HASZ",
        "region_slug": "hasanparthy",
        "latitude": "18.0691",
        "longitude": "79.5252"
    },
    {
        "city_code": "HANS",
        "region_code": "HANS",
        "sub_region_code": "HANS",
        "region_slug": "hasanpur",
        "latitude": "28.7238",
        "longitude": "78.2846"
    },
    {
        "city_code": "HSNA",
        "region_code": "HSNA",
        "sub_region_code": "HSNA",
        "region_slug": "hasnabad",
        "latitude": "22.5745",
        "longitude": "88.9174"
    },
    {
        "city_code": "HASN",
        "region_code": "HASN",
        "sub_region_code": "HASN",
        "region_slug": "hassan",
        "latitude": "13.0753",
        "longitude": "76.1784"
    },
    {
        "city_code": "HATH",
        "region_code": "HATH",
        "sub_region_code": "HATH",
        "region_slug": "hathras",
        "latitude": "27.6056",
        "longitude": "78.0538"
    },
    {
        "city_code": "HRE",
        "region_code": "HRE",
        "sub_region_code": "HRE",
        "region_slug": "haveri",
        "latitude": "14.661",
        "longitude": "75.4345"
    },
    {
        "city_code": "HAZA",
        "region_code": "HAZA",
        "sub_region_code": "HAZA",
        "region_slug": "hazaribagh",
        "latitude": "23.9966",
        "longitude": "85.3691"
    },
    {
        "city_code": "HIMM",
        "region_code": "HIMM",
        "sub_region_code": "HIMM",
        "region_slug": "himmatnagar",
        "latitude": "23.612356",
        "longitude": "72.960591"
    },
    {
        "city_code": "HIND",
        "region_code": "HIND",
        "sub_region_code": "HIND",
        "region_slug": "hindaun-city",
        "latitude": "26.731142",
        "longitude": "77.033752"
    },
    {
        "city_code": "HNDP",
        "region_code": "HNDP",
        "sub_region_code": "HNDP",
        "region_slug": "hindupur",
        "latitude": "13.8185",
        "longitude": "77.4989"
    },
    {
        "city_code": "HINA",
        "region_code": "HINA",
        "sub_region_code": "HINA",
        "region_slug": "hinganghat",
        "latitude": "20.5517",
        "longitude": "78.8418"
    },
    {
        "city_code": "HING",
        "region_code": "HING",
        "sub_region_code": "HING",
        "region_slug": "hingoli",
        "latitude": "19.5781",
        "longitude": "77.1025"
    },
    {
        "city_code": "HIRA",
        "region_code": "HIRA",
        "sub_region_code": "HIRA",
        "region_slug": "hiramandalam",
        "latitude": "18.6718",
        "longitude": "83.9506"
    },
    {
        "city_code": "HIRE",
        "region_code": "HIRE",
        "sub_region_code": "HIRE",
        "region_slug": "hirekerur",
        "latitude": "14.4555",
        "longitude": "75.3951"
    },
    {
        "city_code": "HIRI",
        "region_code": "HIRI",
        "sub_region_code": "HIRI",
        "region_slug": "hiriyur",
        "latitude": "13.9438",
        "longitude": "76.6161"
    },
    {
        "city_code": "HISR",
        "region_code": "HISR",
        "sub_region_code": "HISR",
        "region_slug": "hisar",
        "latitude": "29.1492",
        "longitude": "75.7217"
    },
    {
        "city_code": "HOLE",
        "region_code": "HOLE",
        "sub_region_code": "HOLE",
        "region_slug": "holenarasipura",
        "latitude": "12.7849",
        "longitude": "76.2436"
    },
    {
        "city_code": "HONV",
        "region_code": "HONV",
        "sub_region_code": "HONV",
        "region_slug": "honnali",
        "latitude": "14.2342",
        "longitude": "75.647"
    },
    {
        "city_code": "HNVR",
        "region_code": "HNVR",
        "sub_region_code": "HNVR",
        "region_slug": "honnavara",
        "latitude": "14.2798",
        "longitude": "74.4439"
    },
    {
        "city_code": "HOOG",
        "region_code": "HOOG",
        "sub_region_code": "HOOG",
        "region_slug": "hooghly",
        "latitude": "22.8963",
        "longitude": "88.2461"
    },
    {
        "city_code": "HSGB",
        "region_code": "HSGB",
        "sub_region_code": "HSGB",
        "region_slug": "hoshangabad",
        "latitude": "22.744108",
        "longitude": "77.736969"
    },
    {
        "city_code": "HOSH",
        "region_code": "HOSH",
        "sub_region_code": "HOSH",
        "region_slug": "hoshiarpur",
        "latitude": "31.5143",
        "longitude": "75.9115"
    },
    {
        "city_code": "HOKT",
        "region_code": "HOKT",
        "sub_region_code": "HOKT",
        "region_slug": "hoskote",
        "latitude": "13.0693",
        "longitude": "77.7982"
    },
    {
        "city_code": "HOSP",
        "region_code": "HOSP",
        "sub_region_code": "HOSP",
        "region_slug": "hospet",
        "latitude": "15.2689",
        "longitude": "76.3909"
    },
    {
        "city_code": "HSUR",
        "region_code": "HSUR",
        "sub_region_code": "HSUR",
        "region_slug": "hosur",
        "latitude": "12.735519",
        "longitude": "77.827987"
    },
    {
        "city_code": "HWRH",
        "region_code": "HWRH",
        "sub_region_code": "HWRH",
        "region_slug": "howrah",
        "latitude": "22.5958",
        "longitude": "88.2636"
    },
    {
        "city_code": "HUBL",
        "region_code": "HUBL",
        "sub_region_code": "HUBL",
        "region_slug": "hubballi-hubli",
        "latitude": "15.3647",
        "longitude": "75.124"
    },
    {
        "city_code": "HNGN",
        "region_code": "HNGN",
        "sub_region_code": "HNGN",
        "region_slug": "hunagunda",
        "latitude": "16.0576",
        "longitude": "76.0609"
    },
    {
        "city_code": "HUSR",
        "region_code": "HUSR",
        "sub_region_code": "HUSR",
        "region_slug": "hunsur",
        "latitude": "12.3009",
        "longitude": "76.2885"
    },
    {
        "city_code": "HSBD",
        "region_code": "HSBD",
        "sub_region_code": "HSBD",
        "region_slug": "husnabad",
        "latitude": "18.132",
        "longitude": "79.2085"
    },
    {
        "city_code": "HULI",
        "region_code": "HULI",
        "sub_region_code": "HULI",
        "region_slug": "huvinahadagali",
        "latitude": "15.02",
        "longitude": "75.9318"
    },
    {
        "city_code": "HZUB",
        "region_code": "HZUB",
        "sub_region_code": "HZUB",
        "region_slug": "huzurabad",
        "latitude": "18.2019",
        "longitude": "79.3967"
    },
    {
        "city_code": "HUZU",
        "region_code": "HUZU",
        "sub_region_code": "HUZU",
        "region_slug": "huzurnagar",
        "latitude": "16.9003",
        "longitude": "79.8745"
    },
    {
        "city_code": "ICHL",
        "region_code": "ICHL",
        "sub_region_code": "ICHL",
        "region_slug": "ichalkaranji",
        "latitude": "16.709",
        "longitude": "74.4561"
    },
    {
        "city_code": "ICPR",
        "region_code": "ICPR",
        "sub_region_code": "ICPR",
        "region_slug": "ichchapuram",
        "latitude": "19.1174",
        "longitude": "84.6845"
    },
    {
        "city_code": "IDPI",
        "region_code": "IDPI",
        "sub_region_code": "IDPI",
        "region_slug": "idappadi",
        "latitude": "11.5848",
        "longitude": "77.8388"
    },
    {
        "city_code": "IDAR",
        "region_code": "IDAR",
        "sub_region_code": "IDAR",
        "region_slug": "idar",
        "latitude": "23.82538",
        "longitude": "73.000556"
    },
    {
        "city_code": "IDKI",
        "region_code": "IDKI",
        "sub_region_code": "IDKI",
        "region_slug": "idukki",
        "latitude": "9.9189",
        "longitude": "77.1025"
    },
    {
        "city_code": "IEEJ",
        "region_code": "IEEJ",
        "sub_region_code": "IEEJ",
        "region_slug": "ieeja",
        "latitude": "16.0195",
        "longitude": "77.6679"
    },
    {
        "city_code": "IMPH",
        "region_code": "IMPH",
        "sub_region_code": "IMPH",
        "region_slug": "imphal",
        "latitude": "24.806134",
        "longitude": "93.86637"
    },
    {
        "city_code": "INDA",
        "region_code": "INDA",
        "sub_region_code": "INDA",
        "region_slug": "indapur",
        "latitude": "18.114",
        "longitude": "75.0319"
    },
    {
        "city_code": "IIND",
        "region_code": "IIND",
        "sub_region_code": "IIND",
        "region_slug": "indi",
        "latitude": "17.175165",
        "longitude": "75.955493"
    },
    {
        "city_code": "IND",
        "region_code": "IND",
        "sub_region_code": "IND",
        "region_slug": "indore",
        "latitude": "22.7287",
        "longitude": "75.8654"
    },
    {
        "city_code": "IDPA",
        "region_code": "IDPA",
        "sub_region_code": "IDPA",
        "region_slug": "indukurpeta",
        "latitude": "14.4713",
        "longitude": "80.0996"
    },
    {
        "city_code": "IRNK",
        "region_code": "IRNK",
        "sub_region_code": "IRNK",
        "region_slug": "irinjalakuda",
        "latitude": "10.3447",
        "longitude": "76.2094"
    },
    {
        "city_code": "ITNG",
        "region_code": "ITNG",
        "sub_region_code": "ITNG",
        "region_slug": "itanagar",
        "latitude": "27.084223",
        "longitude": "93.605238"
    },
    {
        "city_code": "ITAR",
        "region_code": "ITAR",
        "sub_region_code": "ITAR",
        "region_slug": "itarsi",
        "latitude": "22.6055",
        "longitude": "77.7535"
    },
    {
        "city_code": "JABL",
        "region_code": "JABL",
        "sub_region_code": "JABL",
        "region_slug": "jabalpur",
        "latitude": "23.1667",
        "longitude": "79.95"
    },
    {
        "city_code": "JADC",
        "region_code": "JADC",
        "sub_region_code": "JADC",
        "region_slug": "jadcherla",
        "latitude": "16.7626",
        "longitude": "78.1393"
    },
    {
        "city_code": "JAGA",
        "region_code": "JAGA",
        "sub_region_code": "JAGA",
        "region_slug": "jagalur",
        "latitude": "14.5201",
        "longitude": "76.3377"
    },
    {
        "city_code": "JGDL",
        "region_code": "JGDL",
        "sub_region_code": "JGDL",
        "region_slug": "jagatdal",
        "latitude": "22.861516",
        "longitude": "88.39841"
    },
    {
        "city_code": "JAGD",
        "region_code": "JAGD",
        "sub_region_code": "JAGD",
        "region_slug": "jagdalpur",
        "latitude": "19.07",
        "longitude": "82.03"
    },
    {
        "city_code": "JAGG",
        "region_code": "JAGG",
        "sub_region_code": "JAGG",
        "region_slug": "jaggampeta",
        "latitude": "17.1711",
        "longitude": "82.0637"
    },
    {
        "city_code": "JGGY",
        "region_code": "JGGY",
        "sub_region_code": "JGGY",
        "region_slug": "jaggayyapeta",
        "latitude": "16.902408",
        "longitude": "80.103929"
    },
    {
        "city_code": "JGRO",
        "region_code": "JGRO",
        "sub_region_code": "JGRO",
        "region_slug": "jagraon",
        "latitude": "30.7916",
        "longitude": "75.4694"
    },
    {
        "city_code": "JGTL",
        "region_code": "JGTL",
        "sub_region_code": "JGTL",
        "region_slug": "jagtial",
        "latitude": "18.7909",
        "longitude": "78.9119"
    },
    {
        "city_code": "JAIP",
        "region_code": "JAIP",
        "sub_region_code": "JAIP",
        "region_slug": "jaipur",
        "latitude": "26.912417",
        "longitude": "75.787288"
    },
    {
        "city_code": "JSMR",
        "region_code": "JSMR",
        "sub_region_code": "JSMR",
        "region_slug": "jaisalmer",
        "latitude": "26.92",
        "longitude": "70.9"
    },
    {
        "city_code": "JAJP",
        "region_code": "JAJP",
        "sub_region_code": "JAJP",
        "region_slug": "jajpur-road",
        "latitude": "20.9484",
        "longitude": "86.1192"
    },
    {
        "city_code": "JTTT",
        "region_code": "JTTT",
        "sub_region_code": "JTTT",
        "region_slug": "jajpur-town-odisha",
        "latitude": "20.8341",
        "longitude": "86.3326"
    },
    {
        "city_code": "JAKA",
        "region_code": "JAKA",
        "sub_region_code": "JAKA",
        "region_slug": "jalakandapuram",
        "latitude": "11.6966",
        "longitude": "77.8772"
    },
    {
        "city_code": "JLAB",
        "region_code": "JLAB",
        "sub_region_code": "JLAB",
        "region_slug": "jalalabad",
        "latitude": "30.605",
        "longitude": "74.2558"
    },
    {
        "city_code": "JALA",
        "region_code": "JALA",
        "sub_region_code": "JALA",
        "region_slug": "jalandhar",
        "latitude": "31.326015",
        "longitude": "75.576183"
    },
    {
        "city_code": "JAUN",
        "region_code": "JAUN",
        "sub_region_code": "JAUN",
        "region_slug": "jalaun",
        "latitude": "26.104259",
        "longitude": "79.165797"
    },
    {
        "city_code": "JALG",
        "region_code": "JALG",
        "sub_region_code": "JALG",
        "region_slug": "jalgaon",
        "latitude": "20.998138",
        "longitude": "75.567184"
    },
    {
        "city_code": "JALN",
        "region_code": "JALN",
        "sub_region_code": "JALN",
        "region_slug": "jalna",
        "latitude": "19.8297",
        "longitude": "75.88"
    },
    {
        "city_code": "LALO",
        "region_code": "LALO",
        "sub_region_code": "LALO",
        "region_slug": "jalore",
        "latitude": "25.3445",
        "longitude": "72.6254"
    },
    {
        "city_code": "JPG",
        "region_code": "JPG",
        "sub_region_code": "JPG",
        "region_slug": "jalpaiguri",
        "latitude": "26.6835",
        "longitude": "88.7689"
    },
    {
        "city_code": "JAMI",
        "region_code": "JAMI",
        "sub_region_code": "JAMI",
        "region_slug": "jami",
        "latitude": "18.0508",
        "longitude": "83.2626"
    },
    {
        "city_code": "JAAM",
        "region_code": "JAAM",
        "sub_region_code": "JAAM",
        "region_slug": "jamkhandi",
        "latitude": "16.5043",
        "longitude": "75.2918"
    },
    {
        "city_code": "JAMK",
        "region_code": "JAMK",
        "sub_region_code": "JAMK",
        "region_slug": "jamkhed",
        "latitude": "18.738",
        "longitude": "75.3121"
    },
    {
        "city_code": "JAMD",
        "region_code": "JAMD",
        "sub_region_code": "JAMD",
        "region_slug": "jammalamadugu",
        "latitude": "14.8474",
        "longitude": "78.3899"
    },
    {
        "city_code": "JMKN",
        "region_code": "JMKN",
        "sub_region_code": "JMKN",
        "region_slug": "jammikunta",
        "latitude": "18.2891",
        "longitude": "79.4739"
    },
    {
        "city_code": "JAMM",
        "region_code": "JAMM",
        "sub_region_code": "JAMM",
        "region_slug": "jammu",
        "latitude": "34.024288",
        "longitude": "76.092468"
    },
    {
        "city_code": "JAM",
        "region_code": "JAM",
        "sub_region_code": "JAM",
        "region_slug": "jamnagar",
        "latitude": "22.470702",
        "longitude": "70.05773"
    },
    {
        "city_code": "JAMN",
        "region_code": "JAMN",
        "sub_region_code": "JAMN",
        "region_slug": "jamner",
        "latitude": "20.8096",
        "longitude": "75.7787"
    },
    {
        "city_code": "JMDP",
        "region_code": "JMDP",
        "sub_region_code": "JMDP",
        "region_slug": "jamshedpur",
        "latitude": "22.805235",
        "longitude": "86.207356"
    },
    {
        "city_code": "JUMI",
        "region_code": "JUMI",
        "sub_region_code": "JUMI",
        "region_slug": "jamui",
        "latitude": "86.2259",
        "longitude": "24.9256"
    },
    {
        "city_code": "JNGN",
        "region_code": "JNGN",
        "sub_region_code": "JNGN",
        "region_slug": "jangaon",
        "latitude": "17.7288",
        "longitude": "79.1605"
    },
    {
        "city_code": "JANG",
        "region_code": "JANG",
        "sub_region_code": "JANG",
        "region_slug": "jangareddy-gudem",
        "latitude": "17.122213",
        "longitude": "81.292868"
    },
    {
        "city_code": "JANR",
        "region_code": "JANR",
        "sub_region_code": "JANR",
        "region_slug": "janjgir",
        "latitude": "22.0105",
        "longitude": "82.5727"
    },
    {
        "city_code": "JAOR",
        "region_code": "JAOR",
        "sub_region_code": "JAOR",
        "region_slug": "jaora",
        "latitude": "23.6376",
        "longitude": "75.126"
    },
    {
        "city_code": "JASD",
        "region_code": "JASD",
        "sub_region_code": "JASD",
        "region_slug": "jasdan",
        "latitude": "22.0356",
        "longitude": "71.2018"
    },
    {
        "city_code": "JASH",
        "region_code": "JASH",
        "sub_region_code": "JASH",
        "region_slug": "jashpur",
        "latitude": "22.7875",
        "longitude": "83.8473"
    },
    {
        "city_code": "JATN",
        "region_code": "JATN",
        "sub_region_code": "JATN",
        "region_slug": "jatni",
        "latitude": "20.1704",
        "longitude": "85.7059"
    },
    {
        "city_code": "JANP",
        "region_code": "JANP",
        "sub_region_code": "JANP",
        "region_slug": "jaunpur",
        "latitude": "25.74909",
        "longitude": "82.696831"
    },
    {
        "city_code": "JYAM",
        "region_code": "JYAM",
        "sub_region_code": "JYAM",
        "region_slug": "jayamkondacholapuram",
        "latitude": "11.2072",
        "longitude": "79.3676"
    },
    {
        "city_code": "JYSP",
        "region_code": "JYSP",
        "sub_region_code": "JYSP",
        "region_slug": "jaysingpur",
        "latitude": "16.777168",
        "longitude": "74.55036"
    },
    {
        "city_code": "JEHA",
        "region_code": "JEHA",
        "sub_region_code": "JEHA",
        "region_slug": "jehanabad",
        "latitude": "25.213928",
        "longitude": "84.989555"
    },
    {
        "city_code": "JEJU",
        "region_code": "JEJU",
        "sub_region_code": "JEJU",
        "region_slug": "jejuri",
        "latitude": "18.269781",
        "longitude": "74.172478"
    },
    {
        "city_code": "JETP",
        "region_code": "JETP",
        "sub_region_code": "JETP",
        "region_slug": "jetpur",
        "latitude": "21.754354",
        "longitude": "70.622134"
    },
    {
        "city_code": "JEWR",
        "region_code": "JEWR",
        "sub_region_code": "JEWR",
        "region_slug": "jewar",
        "latitude": "28.1207",
        "longitude": "77.5562"
    },
    {
        "city_code": "JEYP",
        "region_code": "JEYP",
        "sub_region_code": "JEYP",
        "region_slug": "jeypore",
        "latitude": "18.8606",
        "longitude": "82.551"
    },
    {
        "city_code": "JHAB",
        "region_code": "JHAB",
        "sub_region_code": "JHAB",
        "region_slug": "jhabua",
        "latitude": "22.9159",
        "longitude": "74.6869"
    },
    {
        "city_code": "JHAA",
        "region_code": "JHAA",
        "sub_region_code": "JHAA",
        "region_slug": "jhajha",
        "latitude": "24.7745",
        "longitude": "86.3757"
    },
    {
        "city_code": "JHAJ",
        "region_code": "JHAJ",
        "sub_region_code": "JHAJ",
        "region_slug": "jhajjar",
        "latitude": "28.6176",
        "longitude": "76.6875"
    },
    {
        "city_code": "JNSI",
        "region_code": "JNSI",
        "sub_region_code": "JNSI",
        "region_slug": "jhansi",
        "latitude": "25.4484",
        "longitude": "78.5685"
    },
    {
        "city_code": "JARG",
        "region_code": "JARG",
        "sub_region_code": "JARG",
        "region_slug": "jhargram",
        "latitude": "22.454399",
        "longitude": "86.998199"
    },
    {
        "city_code": "JRSG",
        "region_code": "JRSG",
        "sub_region_code": "JRSG",
        "region_slug": "jharsuguda",
        "latitude": "21.8554",
        "longitude": "84.0062"
    },
    {
        "city_code": "JHUN",
        "region_code": "JHUN",
        "sub_region_code": "JHUN",
        "region_slug": "jhunjhunu",
        "latitude": "28.1317",
        "longitude": "75.4022"
    },
    {
        "city_code": "JAGJ",
        "region_code": "JAGJ",
        "sub_region_code": "JAGJ",
        "region_slug": "jiaganj",
        "latitude": "24.244104",
        "longitude": "88.268021"
    },
    {
        "city_code": "JIIG",
        "region_code": "JIIG",
        "sub_region_code": "JIIG",
        "region_slug": "jigani",
        "latitude": "12.7844",
        "longitude": "77.6419"
    },
    {
        "city_code": "JIND",
        "region_code": "JIND",
        "sub_region_code": "JIND",
        "region_slug": "jind",
        "latitude": "29.3613",
        "longitude": "76.3637"
    },
    {
        "city_code": "JINT",
        "region_code": "JINT",
        "sub_region_code": "JINT",
        "region_slug": "jintur",
        "latitude": "19.6087",
        "longitude": "76.6846"
    },
    {
        "city_code": "JIRA",
        "region_code": "JIRA",
        "sub_region_code": "JIRA",
        "region_slug": "jirapur",
        "latitude": "24.018086",
        "longitude": "76.371943"
    },
    {
        "city_code": "JODH",
        "region_code": "JODH",
        "sub_region_code": "JODH",
        "region_slug": "jodhpur",
        "latitude": "26.238947",
        "longitude": "73.024309"
    },
    {
        "city_code": "JLPI",
        "region_code": "JLPI",
        "sub_region_code": "JLPI",
        "region_slug": "jolarpettai",
        "latitude": "12.5541",
        "longitude": "78.5718"
    },
    {
        "city_code": "JORT",
        "region_code": "JORT",
        "sub_region_code": "JORT",
        "region_slug": "jorhat",
        "latitude": "26.7465",
        "longitude": "94.2026"
    },
    {
        "city_code": "MAPR",
        "region_code": "MAPR",
        "sub_region_code": "MAPR",
        "region_slug": "joynagar-majilpur",
        "latitude": "22.1758",
        "longitude": "88.4178"
    },
    {
        "city_code": "JUGH",
        "region_code": "JUGH",
        "sub_region_code": "JUGH",
        "region_slug": "junagadh",
        "latitude": "21.5222",
        "longitude": "70.4579"
    },
    {
        "city_code": "PTDK",
        "region_code": "PTDK",
        "sub_region_code": "PTDK",
        "region_slug": "kd-peta",
        "latitude": "17.68969",
        "longitude": "83.01964"
    },
    {
        "city_code": "KDKL",
        "region_code": "KDKL",
        "sub_region_code": "KDKL",
        "region_slug": "kadakkal",
        "latitude": "8.8293",
        "longitude": "76.9222"
    },
    {
        "city_code": "KDPA",
        "region_code": "KDPA",
        "sub_region_code": "KDPA",
        "region_slug": "kadapa",
        "latitude": "14.4674",
        "longitude": "78.8241"
    },
    {
        "city_code": "KADI",
        "region_code": "KADI",
        "sub_region_code": "KADI",
        "region_slug": "kadi",
        "latitude": "23.2979",
        "longitude": "72.331"
    },
    {
        "city_code": "KADR",
        "region_code": "KADR",
        "sub_region_code": "KADR",
        "region_slug": "kadiri",
        "latitude": "14.112661",
        "longitude": "78.160736"
    },
    {
        "city_code": "KADY",
        "region_code": "KADY",
        "sub_region_code": "KADY",
        "region_slug": "kadiyam",
        "latitude": "16.9136",
        "longitude": "81.8183"
    },
    {
        "city_code": "KADT",
        "region_code": "KADT",
        "sub_region_code": "KADT",
        "region_slug": "kadthal",
        "latitude": "16.9837",
        "longitude": "78.5008"
    },
    {
        "city_code": "KAIK",
        "region_code": "KAIK",
        "sub_region_code": "KAIK",
        "region_slug": "kaikaluru",
        "latitude": "16.552723",
        "longitude": "81.212936"
    },
    {
        "city_code": "KAIT",
        "region_code": "KAIT",
        "sub_region_code": "KAIT",
        "region_slug": "kaithal",
        "latitude": "29.799904",
        "longitude": "76.379271"
    },
    {
        "city_code": "KAAP",
        "region_code": "KAAP",
        "sub_region_code": "KAAP",
        "region_slug": "kakarapalli",
        "latitude": "17.4849",
        "longitude": "82.4949"
    },
    {
        "city_code": "KAKI",
        "region_code": "KAKI",
        "sub_region_code": "KAKI",
        "region_slug": "kakinada",
        "latitude": "16.945181",
        "longitude": "82.238647"
    },
    {
        "city_code": "GULB",
        "region_code": "GULB",
        "sub_region_code": "GULB",
        "region_slug": "kalaburagi-gulbarga",
        "latitude": "17.329731",
        "longitude": "76.834296"
    },
    {
        "city_code": "KLDY",
        "region_code": "KLDY",
        "sub_region_code": "KLDY",
        "region_slug": "kalady",
        "latitude": "10.171",
        "longitude": "76.446"
    },
    {
        "city_code": "KANR",
        "region_code": "KANR",
        "sub_region_code": "KANR",
        "region_slug": "kalanaur",
        "latitude": "28.8312",
        "longitude": "76.3956"
    },
    {
        "city_code": "KALI",
        "region_code": "KALI",
        "sub_region_code": "KALI",
        "region_slug": "kalimpong",
        "latitude": "27.0594",
        "longitude": "88.4695"
    },
    {
        "city_code": "KLLL",
        "region_code": "KLLL",
        "sub_region_code": "KLLL",
        "region_slug": "kalla",
        "latitude": "16.5373",
        "longitude": "81.4087"
    },
    {
        "city_code": "KALD",
        "region_code": "KALD",
        "sub_region_code": "KALD",
        "region_slug": "kalladikode",
        "latitude": "10.8984",
        "longitude": "76.5402"
    },
    {
        "city_code": "KALL",
        "region_code": "KALL",
        "sub_region_code": "KALL",
        "region_slug": "kallakurichi",
        "latitude": "11.7387",
        "longitude": "78.9609"
    },
    {
        "city_code": "KLUR",
        "region_code": "KLUR",
        "sub_region_code": "KLUR",
        "region_slug": "kallur",
        "latitude": "13.5572",
        "longitude": "78.9995"
    },
    {
        "city_code": "KALR",
        "region_code": "KALR",
        "sub_region_code": "KALR",
        "region_slug": "kalluru",
        "latitude": "17.201",
        "longitude": "80.5522"
    },
    {
        "city_code": "KALN",
        "region_code": "KALN",
        "sub_region_code": "KALN",
        "region_slug": "kalna",
        "latitude": "23.226202",
        "longitude": "88.345525"
    },
    {
        "city_code": "KALG",
        "region_code": "KALG",
        "sub_region_code": "KALG",
        "region_slug": "kalol-gandhinagar",
        "latitude": "23.2464",
        "longitude": "72.5087"
    },
    {
        "city_code": "PANH",
        "region_code": "PANH",
        "sub_region_code": "PANH",
        "region_slug": "kalol-panchmahal",
        "latitude": "22.6087",
        "longitude": "73.4622"
    },
    {
        "city_code": "KALW",
        "region_code": "KALW",
        "sub_region_code": "KALW",
        "region_slug": "kalwakurthy",
        "latitude": "16.6685",
        "longitude": "78.4906"
    },
    {
        "city_code": "KALY",
        "region_code": "KALY",
        "sub_region_code": "KALY",
        "region_slug": "kalyani",
        "latitude": "22.9751",
        "longitude": "88.4345"
    },
    {
        "city_code": "KMLA",
        "region_code": "KMLA",
        "sub_region_code": "KMLA",
        "region_slug": "kamalaapur",
        "latitude": "18.1795",
        "longitude": "79.5223"
    },
    {
        "city_code": "KMLR",
        "region_code": "KMLR",
        "sub_region_code": "KMLR",
        "region_slug": "kamalapur",
        "latitude": "18.2669",
        "longitude": "80.4826"
    },
    {
        "city_code": "KPLA",
        "region_code": "KPLA",
        "sub_region_code": "KPLA",
        "region_slug": "kamanaickenpalayam",
        "latitude": "10.9067",
        "longitude": "77.2184"
    },
    {
        "city_code": "KMRD",
        "region_code": "KMRD",
        "sub_region_code": "KMRD",
        "region_slug": "kamareddy",
        "latitude": "18.324",
        "longitude": "78.3343"
    },
    {
        "city_code": "KPKT",
        "region_code": "KPKT",
        "sub_region_code": "KPKT",
        "region_slug": "kamavarapukota",
        "latitude": "17.0098",
        "longitude": "81.1939"
    },
    {
        "city_code": "KAMR",
        "region_code": "KAMR",
        "sub_region_code": "KAMR",
        "region_slug": "kambainallur",
        "latitude": "12.2079",
        "longitude": "78.3188"
    },
    {
        "city_code": "KAMP",
        "region_code": "KAMP",
        "sub_region_code": "KAMP",
        "region_slug": "kamptee",
        "latitude": "21.220538",
        "longitude": "79.178358"
    },
    {
        "city_code": "KMRJ",
        "region_code": "KMRJ",
        "sub_region_code": "KMRJ",
        "region_slug": "kamrej",
        "latitude": "21.2695",
        "longitude": "72.9577"
    },
    {
        "city_code": "KAKP",
        "region_code": "KAKP",
        "sub_region_code": "KAKP",
        "region_slug": "kanakapura",
        "latitude": "12.546244",
        "longitude": "77.419882"
    },
    {
        "city_code": "KANA",
        "region_code": "KANA",
        "sub_region_code": "KANA",
        "region_slug": "kanatal",
        "latitude": "30.4137",
        "longitude": "78.3458"
    },
    {
        "city_code": "KNCH",
        "region_code": "KNCH",
        "sub_region_code": "KNCH",
        "region_slug": "kanchikacherla",
        "latitude": "16.6834",
        "longitude": "80.3904"
    },
    {
        "city_code": "KNPM",
        "region_code": "KNPM",
        "sub_region_code": "KNPM",
        "region_slug": "kanchipuram",
        "latitude": "12.834368",
        "longitude": "79.698943"
    },
    {
        "city_code": "KNDM",
        "region_code": "KNDM",
        "sub_region_code": "KNDM",
        "region_slug": "kandamangalam",
        "latitude": "11.9133",
        "longitude": "79.6867"
    },
    {
        "city_code": "KAND",
        "region_code": "KAND",
        "sub_region_code": "KAND",
        "region_slug": "kandukur",
        "latitude": "15.2197",
        "longitude": "79.9025"
    },
    {
        "city_code": "KGKM",
        "region_code": "KGKM",
        "sub_region_code": "KGKM",
        "region_slug": "kangayam",
        "latitude": "11.005413",
        "longitude": "77.560671"
    },
    {
        "city_code": "KANG",
        "region_code": "KANG",
        "sub_region_code": "KANG",
        "region_slug": "kangra",
        "latitude": "32.0998",
        "longitude": "76.2691"
    },
    {
        "city_code": "KKNN",
        "region_code": "KKNN",
        "sub_region_code": "KKNN",
        "region_slug": "kanhangad",
        "latitude": "12.3325",
        "longitude": "75.0962"
    },
    {
        "city_code": "KANC",
        "region_code": "KANC",
        "sub_region_code": "KANC",
        "region_slug": "kanichar",
        "latitude": "11.9054",
        "longitude": "75.7855"
    },
    {
        "city_code": "KANI",
        "region_code": "KANI",
        "sub_region_code": "KANI",
        "region_slug": "kanigiri",
        "latitude": "15.433865",
        "longitude": "79.532234"
    },
    {
        "city_code": "KAAM",
        "region_code": "KAAM",
        "sub_region_code": "KAAM",
        "region_slug": "kanipakam",
        "latitude": "13.2776",
        "longitude": "79.0355"
    },
    {
        "city_code": "KNNJ",
        "region_code": "KNNJ",
        "sub_region_code": "KNNJ",
        "region_slug": "kanjirappally",
        "latitude": "9.5573",
        "longitude": "76.7894"
    },
    {
        "city_code": "KNKS",
        "region_code": "KNKS",
        "sub_region_code": "KNKS",
        "region_slug": "kankavli",
        "latitude": "16.2655",
        "longitude": "73.7083"
    },
    {
        "city_code": "KANK",
        "region_code": "KANK",
        "sub_region_code": "KANK",
        "region_slug": "kanker",
        "latitude": "20.199",
        "longitude": "81.0755"
    },
    {
        "city_code": "KADU",
        "region_code": "KADU",
        "sub_region_code": "KADU",
        "region_slug": "kankipadu",
        "latitude": "16.4344",
        "longitude": "80.7678"
    },
    {
        "city_code": "KANL",
        "region_code": "KANL",
        "sub_region_code": "KANL",
        "region_slug": "kankroli",
        "latitude": "25.0558",
        "longitude": "73.8894"
    },
    {
        "city_code": "KANJ",
        "region_code": "KANJ",
        "sub_region_code": "KANJ",
        "region_slug": "kannauj",
        "latitude": "27.0514",
        "longitude": "79.9137"
    },
    {
        "city_code": "KANN",
        "region_code": "KANN",
        "sub_region_code": "KANN",
        "region_slug": "kannur",
        "latitude": "11.9709",
        "longitude": "75.6208"
    },
    {
        "city_code": "KANP",
        "region_code": "KANP",
        "sub_region_code": "KANP",
        "region_slug": "kanpur",
        "latitude": "26.4634",
        "longitude": "80.3229"
    },
    {
        "city_code": "KTBJ",
        "region_code": "KTBJ",
        "sub_region_code": "KTBJ",
        "region_slug": "kantabanji",
        "latitude": "20.2859",
        "longitude": "82.55"
    },
    {
        "city_code": "KAKM",
        "region_code": "KAKM",
        "sub_region_code": "KAKM",
        "region_slug": "kanyakumari",
        "latitude": "8.0883",
        "longitude": "77.5385"
    },
    {
        "city_code": "KAPP",
        "region_code": "KAPP",
        "sub_region_code": "KAPP",
        "region_slug": "kapadvanj",
        "latitude": "23.02",
        "longitude": "73.07"
    },
    {
        "city_code": "IKGP",
        "region_code": "IKGP",
        "sub_region_code": "IKGP",
        "region_slug": "kapurthala",
        "latitude": "75.4018",
        "longitude": "31.3723"
    },
    {
        "city_code": "KARD",
        "region_code": "KARD",
        "sub_region_code": "KARD",
        "region_slug": "karad",
        "latitude": "17.276",
        "longitude": "74.2003"
    },
    {
        "city_code": "KARA",
        "region_code": "KARA",
        "sub_region_code": "KARA",
        "region_slug": "karaikal",
        "latitude": "10.9254",
        "longitude": "79.838"
    },
    {
        "city_code": "KRBK",
        "region_code": "KRBK",
        "sub_region_code": "KRBK",
        "region_slug": "karambakkudi",
        "latitude": "10.4584",
        "longitude": "79.1351"
    },
    {
        "city_code": "KLAD",
        "region_code": "KLAD",
        "sub_region_code": "KLAD",
        "region_slug": "karanja-lad",
        "latitude": "20.4827",
        "longitude": "77.4817"
    },
    {
        "city_code": "KARJ",
        "region_code": "KARJ",
        "sub_region_code": "KARJ",
        "region_slug": "karanjia",
        "latitude": "21.7633",
        "longitude": "85.9739"
    },
    {
        "city_code": "KARE",
        "region_code": "KARE",
        "sub_region_code": "KARE",
        "region_slug": "kareli",
        "latitude": "22.9286",
        "longitude": "79.0617"
    },
    {
        "city_code": "KRPL",
        "region_code": "KRPL",
        "sub_region_code": "KRPL",
        "region_slug": "karepalli",
        "latitude": "17.5096",
        "longitude": "80.272"
    },
    {
        "city_code": "KRRD",
        "region_code": "KRRD",
        "sub_region_code": "KRRD",
        "region_slug": "kargi-road",
        "latitude": "22.2976",
        "longitude": "82.0263"
    },
    {
        "city_code": "KARI",
        "region_code": "KARI",
        "sub_region_code": "KARI",
        "region_slug": "karimangalam",
        "latitude": "12.306",
        "longitude": "78.2045"
    },
    {
        "city_code": "KRNJ",
        "region_code": "KRNJ",
        "sub_region_code": "KRNJ",
        "region_slug": "karimganj",
        "latitude": "24.8649",
        "longitude": "92.3592"
    },
    {
        "city_code": "KARIM",
        "region_code": "KARIM",
        "sub_region_code": "KARIM",
        "region_slug": "karimnagar",
        "latitude": "18.5962",
        "longitude": "79.2902"
    },
    {
        "city_code": "KRYD",
        "region_code": "KRYD",
        "sub_region_code": "KRYD",
        "region_slug": "kariyad",
        "latitude": "11.6835",
        "longitude": "75.567"
    },
    {
        "city_code": "KART",
        "region_code": "KART",
        "sub_region_code": "KART",
        "region_slug": "karjat",
        "latitude": "18.9192",
        "longitude": "73.3277"
    },
    {
        "city_code": "KARK",
        "region_code": "KARK",
        "sub_region_code": "KARK",
        "region_slug": "karkala",
        "latitude": "13.214184",
        "longitude": "74.999843"
    },
    {
        "city_code": "KMML",
        "region_code": "KMML",
        "sub_region_code": "KMML",
        "region_slug": "karmala",
        "latitude": "18.4045",
        "longitude": "75.1954"
    },
    {
        "city_code": "KRMA",
        "region_code": "KRMA",
        "sub_region_code": "KRMA",
        "region_slug": "karmamthody",
        "latitude": "75.1564",
        "longitude": "12.5319"
    },
    {
        "city_code": "KARN",
        "region_code": "KARN",
        "sub_region_code": "KARN",
        "region_slug": "karnal",
        "latitude": "29.685693",
        "longitude": "76.990483"
    },
    {
        "city_code": "KARG",
        "region_code": "KARG",
        "sub_region_code": "KARG",
        "region_slug": "karunagapally",
        "latitude": "9.0654",
        "longitude": "76.5315"
    },
    {
        "city_code": "KARU",
        "region_code": "KARU",
        "sub_region_code": "KARU",
        "region_slug": "karur",
        "latitude": "10.8855",
        "longitude": "78.1564"
    },
    {
        "city_code": "KWAR",
        "region_code": "KWAR",
        "sub_region_code": "KWAR",
        "region_slug": "karwar",
        "latitude": "14.8185",
        "longitude": "74.1416"
    },
    {
        "city_code": "KASA",
        "region_code": "KASA",
        "sub_region_code": "KASA",
        "region_slug": "kasaragod",
        "latitude": "12.5102",
        "longitude": "74.9852"
    },
    {
        "city_code": "KASD",
        "region_code": "KASD",
        "sub_region_code": "KASD",
        "region_slug": "kasdol",
        "latitude": "21.627548",
        "longitude": "82.423812"
    },
    {
        "city_code": "KASG",
        "region_code": "KASG",
        "sub_region_code": "KASG",
        "region_slug": "kasganj",
        "latitude": "27.8129",
        "longitude": "78.6498"
    },
    {
        "city_code": "KSHG",
        "region_code": "KSHG",
        "sub_region_code": "KSHG",
        "region_slug": "kashig",
        "latitude": "18.613073",
        "longitude": "73.539986"
    },
    {
        "city_code": "KASH",
        "region_code": "KASH",
        "sub_region_code": "KASH",
        "region_slug": "kashipur",
        "latitude": "29.2104",
        "longitude": "78.9619"
    },
    {
        "city_code": "KAST",
        "region_code": "KAST",
        "sub_region_code": "KAST",
        "region_slug": "kashti",
        "latitude": "18.5499",
        "longitude": "74.5829"
    },
    {
        "city_code": "KSBG",
        "region_code": "KSBG",
        "sub_region_code": "KSBG",
        "region_slug": "kasibugga",
        "latitude": "18.7665",
        "longitude": "84.433"
    },
    {
        "city_code": "KATG",
        "region_code": "KATG",
        "sub_region_code": "KATG",
        "region_slug": "katghora",
        "latitude": "22.505",
        "longitude": "82.5457"
    },
    {
        "city_code": "KATP",
        "region_code": "KATP",
        "sub_region_code": "KATP",
        "region_slug": "kathipudi",
        "latitude": "17.2418",
        "longitude": "82.3371"
    },
    {
        "city_code": "KATM",
        "region_code": "KATM",
        "sub_region_code": "KATM",
        "region_slug": "kathmandu",
        "latitude": "27.709032",
        "longitude": "85.291113"
    },
    {
        "city_code": "KATH",
        "region_code": "KATH",
        "sub_region_code": "KATH",
        "region_slug": "kathua",
        "latitude": "32.3865",
        "longitude": "75.5173"
    },
    {
        "city_code": "KATI",
        "region_code": "KATI",
        "sub_region_code": "KATI",
        "region_slug": "katihar",
        "latitude": "25.552",
        "longitude": "87.5719"
    },
    {
        "city_code": "KATN",
        "region_code": "KATN",
        "sub_region_code": "KATN",
        "region_slug": "katni",
        "latitude": "23.8308",
        "longitude": "80.4072"
    },
    {
        "city_code": "KATR",
        "region_code": "KATR",
        "sub_region_code": "KATR",
        "region_slug": "katra",
        "latitude": "32.991809",
        "longitude": "74.932401"
    },
    {
        "city_code": "KTRN",
        "region_code": "KTRN",
        "sub_region_code": "KTRN",
        "region_slug": "katrenikona",
        "latitude": "16.5828",
        "longitude": "82.1537"
    },
    {
        "city_code": "AWCK",
        "region_code": "AWCK",
        "sub_region_code": "AWCK",
        "region_slug": "kattappana",
        "latitude": "9.753502",
        "longitude": "77.112271"
    },
    {
        "city_code": "KATW",
        "region_code": "KATW",
        "sub_region_code": "KATW",
        "region_slug": "katwa",
        "latitude": "23.64128",
        "longitude": "88.095648"
    },
    {
        "city_code": "KVLI",
        "region_code": "KVLI",
        "sub_region_code": "KVLI",
        "region_slug": "kavali",
        "latitude": "14.9132",
        "longitude": "79.993"
    },
    {
        "city_code": "KANM",
        "region_code": "KANM",
        "sub_region_code": "KANM",
        "region_slug": "kaveripattinam",
        "latitude": "12.4215",
        "longitude": "78.2174"
    },
    {
        "city_code": "KAVT",
        "region_code": "KAVT",
        "sub_region_code": "KAVT",
        "region_slug": "kaviti",
        "latitude": "19.0094",
        "longitude": "84.6884"
    },
    {
        "city_code": "KAWA",
        "region_code": "KAWA",
        "sub_region_code": "KAWA",
        "region_slug": "kawardha",
        "latitude": "22.009",
        "longitude": "81.2243"
    },
    {
        "city_code": "KAYA",
        "region_code": "KAYA",
        "sub_region_code": "KAYA",
        "region_slug": "kayamkulam",
        "latitude": "9.1748",
        "longitude": "76.5013"
    },
    {
        "city_code": "KAZI",
        "region_code": "KAZI",
        "sub_region_code": "KAZI",
        "region_slug": "kazipet",
        "latitude": "17.972366",
        "longitude": "79.503448"
    },
    {
        "city_code": "KEKR",
        "region_code": "KEKR",
        "sub_region_code": "KEKR",
        "region_slug": "kekri",
        "latitude": "25.9748",
        "longitude": "75.1529"
    },
    {
        "city_code": "KNDR",
        "region_code": "KNDR",
        "sub_region_code": "KNDR",
        "region_slug": "kendrapara",
        "latitude": "20.5035",
        "longitude": "86.4199"
    },
    {
        "city_code": "KNJH",
        "region_code": "KNJH",
        "sub_region_code": "KNJH",
        "region_slug": "keonjhar",
        "latitude": "21.6289",
        "longitude": "85.5817"
    },
    {
        "city_code": "KESA",
        "region_code": "KESA",
        "sub_region_code": "KESA",
        "region_slug": "kesamudram",
        "latitude": "17.6978",
        "longitude": "79.8913"
    },
    {
        "city_code": "KEGA",
        "region_code": "KEGA",
        "sub_region_code": "KEGA",
        "region_slug": "kesinga",
        "latitude": "20.185",
        "longitude": "83.2104"
    },
    {
        "city_code": "KEVA",
        "region_code": "KEVA",
        "sub_region_code": "KEVA",
        "region_slug": "kevadia",
        "latitude": "21.882",
        "longitude": "73.7037"
    },
    {
        "city_code": "KHCU",
        "region_code": "KHCU",
        "sub_region_code": "KHCU",
        "region_slug": "khachrod",
        "latitude": "23.4216",
        "longitude": "75.2798"
    },
    {
        "city_code": "KADA",
        "region_code": "KADA",
        "sub_region_code": "KADA",
        "region_slug": "khadda",
        "latitude": "26.9256",
        "longitude": "83.9473"
    },
    {
        "city_code": "KHAI",
        "region_code": "KHAI",
        "sub_region_code": "KHAI",
        "region_slug": "khajani",
        "latitude": "26.6559",
        "longitude": "83.2519"
    },
    {
        "city_code": "KHAJ",
        "region_code": "KHAJ",
        "sub_region_code": "KHAJ",
        "region_slug": "khajipet",
        "latitude": "14.6587",
        "longitude": "78.7533"
    },
    {
        "city_code": "KHRH",
        "region_code": "KHRH",
        "sub_region_code": "KHRH",
        "region_slug": "khajuraho",
        "latitude": "24.857005",
        "longitude": "79.92434"
    },
    {
        "city_code": "KHBD",
        "region_code": "KHBD",
        "sub_region_code": "KHBD",
        "region_slug": "khalilabad",
        "latitude": "26.7774",
        "longitude": "83.0657"
    },
    {
        "city_code": "KHBH",
        "region_code": "KHBH",
        "sub_region_code": "KHBH",
        "region_slug": "khambhat",
        "latitude": "22.3181",
        "longitude": "72.619"
    },
    {
        "city_code": "KHMG",
        "region_code": "KHMG",
        "sub_region_code": "KHMG",
        "region_slug": "khamgaon",
        "latitude": "20.713197",
        "longitude": "76.565047"
    },
    {
        "city_code": "KHAM",
        "region_code": "KHAM",
        "sub_region_code": "KHAM",
        "region_slug": "khammam",
        "latitude": "17.25",
        "longitude": "80.15"
    },
    {
        "city_code": "KHPR",
        "region_code": "KHPR",
        "sub_region_code": "KHPR",
        "region_slug": "khanapur",
        "latitude": "19.041206",
        "longitude": "78.648404"
    },
    {
        "city_code": "KHND",
        "region_code": "KHND",
        "sub_region_code": "KHND",
        "region_slug": "khandela",
        "latitude": "25.2225",
        "longitude": "76.8894"
    },
    {
        "city_code": "KHDW",
        "region_code": "KHDW",
        "sub_region_code": "KHDW",
        "region_slug": "khandwa",
        "latitude": "21.849689",
        "longitude": "76.324942"
    },
    {
        "city_code": "KHAN",
        "region_code": "KHAN",
        "sub_region_code": "KHAN",
        "region_slug": "khanna",
        "latitude": "30.6979",
        "longitude": "76.2112"
    },
    {
        "city_code": "KGPR",
        "region_code": "KGPR",
        "sub_region_code": "KGPR",
        "region_slug": "kharagpur",
        "latitude": "22.346",
        "longitude": "87.232"
    },
    {
        "city_code": "KHAG",
        "region_code": "KHAG",
        "sub_region_code": "KHAG",
        "region_slug": "kharghar",
        "latitude": "19.0473",
        "longitude": "73.0699"
    },
    {
        "city_code": "KHAR",
        "region_code": "KHAR",
        "sub_region_code": "KHAR",
        "region_slug": "khargone",
        "latitude": "21.9029",
        "longitude": "75.8069"
    },
    {
        "city_code": "KHRR",
        "region_code": "KHRR",
        "sub_region_code": "KHRR",
        "region_slug": "khariar-road",
        "latitude": "20.8968",
        "longitude": "82.5105"
    },
    {
        "city_code": "KHAS",
        "region_code": "KHAS",
        "sub_region_code": "KHAS",
        "region_slug": "kharsia",
        "latitude": "21.9893",
        "longitude": "83.0976"
    },
    {
        "city_code": "KTEG",
        "region_code": "KTEG",
        "sub_region_code": "KTEG",
        "region_slug": "khategaon",
        "latitude": "22.5918",
        "longitude": "76.9068"
    },
    {
        "city_code": "KHTM",
        "region_code": "KHTM",
        "sub_region_code": "KHTM",
        "region_slug": "khatima",
        "latitude": "28.9209",
        "longitude": "79.9696"
    },
    {
        "city_code": "KHED",
        "region_code": "KHED",
        "sub_region_code": "KHED",
        "region_slug": "khed",
        "latitude": "17.7196",
        "longitude": "73.3968"
    },
    {
        "city_code": "KHDA",
        "region_code": "KHDA",
        "sub_region_code": "KHDA",
        "region_slug": "kheda",
        "latitude": "22.748842",
        "longitude": "72.68635"
    },
    {
        "city_code": "KHMA",
        "region_code": "KHMA",
        "sub_region_code": "KHMA",
        "region_slug": "khedbrahma",
        "latitude": "24.0291",
        "longitude": "73.0435"
    },
    {
        "city_code": "KHOP",
        "region_code": "KHOP",
        "sub_region_code": "KHOP",
        "region_slug": "khopoli",
        "latitude": "18.789",
        "longitude": "73.3414"
    },
    {
        "city_code": "KHOW",
        "region_code": "KHOW",
        "sub_region_code": "KHOW",
        "region_slug": "khowai",
        "latitude": "24.0672",
        "longitude": "91.6057"
    },
    {
        "city_code": "KHUR",
        "region_code": "KHUR",
        "sub_region_code": "KHUR",
        "region_slug": "khurja",
        "latitude": "28.2514",
        "longitude": "77.8539"
    },
    {
        "city_code": "KCHA",
        "region_code": "KCHA",
        "sub_region_code": "KCHA",
        "region_slug": "kichha",
        "latitude": "28.9087",
        "longitude": "79.5098"
    },
    {
        "city_code": "KIMG",
        "region_code": "KIMG",
        "sub_region_code": "KIMG",
        "region_slug": "kim",
        "latitude": "21.402986",
        "longitude": "72.925386"
    },
    {
        "city_code": "KIAV",
        "region_code": "KIAV",
        "sub_region_code": "KIAV",
        "region_slug": "kinathukadavu",
        "latitude": "10.81811",
        "longitude": "76.990449"
    },
    {
        "city_code": "KIDI",
        "region_code": "KIDI",
        "sub_region_code": "KIDI",
        "region_slug": "kirlampudi",
        "latitude": "17.2005",
        "longitude": "82.1795"
    },
    {
        "city_code": "KSGJ",
        "region_code": "KSGJ",
        "sub_region_code": "KSGJ",
        "region_slug": "kishanganj",
        "latitude": "26.093898",
        "longitude": "87.912125"
    },
    {
        "city_code": "KISH",
        "region_code": "KISH",
        "sub_region_code": "KISH",
        "region_slug": "kishangarh",
        "latitude": "26.588",
        "longitude": "74.8589"
    },
    {
        "city_code": "KODA",
        "region_code": "KODA",
        "sub_region_code": "KODA",
        "region_slug": "kodad",
        "latitude": "16.9951",
        "longitude": "79.972"
    },
    {
        "city_code": "COOR",
        "region_code": "COOR",
        "sub_region_code": "COOR",
        "region_slug": "kodagu-coorg",
        "latitude": "12.3375",
        "longitude": "75.8069"
    },
    {
        "city_code": "KODI",
        "region_code": "KODI",
        "sub_region_code": "KODI",
        "region_slug": "kodaikanal",
        "latitude": "10.2381",
        "longitude": "77.4892"
    },
    {
        "city_code": "KDKR",
        "region_code": "KDKR",
        "sub_region_code": "KDKR",
        "region_slug": "kodakara",
        "latitude": "10.3723",
        "longitude": "76.3053"
    },
    {
        "city_code": "KOLY",
        "region_code": "KOLY",
        "sub_region_code": "KOLY",
        "region_slug": "kodaly",
        "latitude": "10.3759",
        "longitude": "76.374"
    },
    {
        "city_code": "KODZ",
        "region_code": "KODZ",
        "sub_region_code": "KODZ",
        "region_slug": "koderma",
        "latitude": "24.466786",
        "longitude": "85.589836"
    },
    {
        "city_code": "KODM",
        "region_code": "KODM",
        "sub_region_code": "KODM",
        "region_slug": "kodumur",
        "latitude": "15.686339",
        "longitude": "77.770747"
    },
    {
        "city_code": "KODM",
        "region_code": "KODM",
        "sub_region_code": "KODM",
        "region_slug": "kodumuru",
        "latitude": "15.686339",
        "longitude": "77.770747"
    },
    {
        "city_code": "KODU",
        "region_code": "KODU",
        "sub_region_code": "KODU",
        "region_slug": "kodungallur",
        "latitude": "10.2244",
        "longitude": "76.1978"
    },
    {
        "city_code": "KOHI",
        "region_code": "KOHI",
        "sub_region_code": "KOHI",
        "region_slug": "kohima",
        "latitude": "25.6586",
        "longitude": "94.1053"
    },
    {
        "city_code": "KOIL",
        "region_code": "KOIL",
        "sub_region_code": "KOIL",
        "region_slug": "koilkuntla",
        "latitude": "15.2304",
        "longitude": "78.3174"
    },
    {
        "city_code": "KKJR",
        "region_code": "KKJR",
        "sub_region_code": "KKJR",
        "region_slug": "kokrajhar",
        "latitude": "26.5136",
        "longitude": "90.2245"
    },
    {
        "city_code": "OLAR",
        "region_code": "OLAR",
        "sub_region_code": "OLAR",
        "region_slug": "kolar",
        "latitude": "13.136089",
        "longitude": "78.129937"
    },
    {
        "city_code": "KOLH",
        "region_code": "KOLH",
        "sub_region_code": "KOLH",
        "region_slug": "kolhapur",
        "latitude": "16.691308",
        "longitude": "74.244866"
    },
    {
        "city_code": "KOLM",
        "region_code": "KOLM",
        "sub_region_code": "KOLM",
        "region_slug": "kollam",
        "latitude": "8.8932",
        "longitude": "76.6141"
    },
    {
        "city_code": "KOLL",
        "region_code": "KOLL",
        "sub_region_code": "KOLL",
        "region_slug": "kollapur",
        "latitude": "16.106384",
        "longitude": "78.318735"
    },
    {
        "city_code": "KOLE",
        "region_code": "KOLE",
        "sub_region_code": "KOLE",
        "region_slug": "kollengode",
        "latitude": "10.6139",
        "longitude": "76.6908"
    },
    {
        "city_code": "KOMA",
        "region_code": "KOMA",
        "sub_region_code": "KOMA",
        "region_slug": "komarapalayam",
        "latitude": "11.4467",
        "longitude": "77.6943"
    },
    {
        "city_code": "KNGN",
        "region_code": "KNGN",
        "sub_region_code": "KNGN",
        "region_slug": "kondagaon",
        "latitude": "19.5959",
        "longitude": "81.6638"
    },
    {
        "city_code": "KNAI",
        "region_code": "KNAI",
        "sub_region_code": "KNAI",
        "region_slug": "kondlahalli",
        "latitude": "14.596319",
        "longitude": "76.716336"
    },
    {
        "city_code": "KNTH",
        "region_code": "KNTH",
        "sub_region_code": "KNTH",
        "region_slug": "konithiwada",
        "latitude": "16.6",
        "longitude": "81.6556"
    },
    {
        "city_code": "KONI",
        "region_code": "KONI",
        "sub_region_code": "KONI",
        "region_slug": "konni",
        "latitude": "9.2267",
        "longitude": "76.8497"
    },
    {
        "city_code": "KTTM",
        "region_code": "KTTM",
        "sub_region_code": "KTTM",
        "region_slug": "koothattukulam",
        "latitude": "9.8627",
        "longitude": "76.5942"
    },
    {
        "city_code": "KOPG",
        "region_code": "KOPG",
        "sub_region_code": "KOPG",
        "region_slug": "kopargaon",
        "latitude": "19.8849",
        "longitude": "74.4728"
    },
    {
        "city_code": "KOPP",
        "region_code": "KOPP",
        "sub_region_code": "KOPP",
        "region_slug": "koppam",
        "latitude": "10.8652",
        "longitude": "76.1866"
    },
    {
        "city_code": "KOPT",
        "region_code": "KOPT",
        "sub_region_code": "KOPT",
        "region_slug": "koraput",
        "latitude": "18.8135",
        "longitude": "82.7123"
    },
    {
        "city_code": "ORAG",
        "region_code": "ORAG",
        "sub_region_code": "ORAG",
        "region_slug": "koratagere",
        "latitude": "13.5212",
        "longitude": "77.239403"
    },
    {
        "city_code": "KRBA",
        "region_code": "KRBA",
        "sub_region_code": "KRBA",
        "region_slug": "korba",
        "latitude": "22.3595",
        "longitude": "82.7501"
    },
    {
        "city_code": "KCKA",
        "region_code": "KCKA",
        "sub_region_code": "KCKA",
        "region_slug": "korutla",
        "latitude": "18.8269",
        "longitude": "78.714"
    },
    {
        "city_code": "KORW",
        "region_code": "KORW",
        "sub_region_code": "KORW",
        "region_slug": "korwa",
        "latitude": "26.2075",
        "longitude": "81.8252"
    },
    {
        "city_code": "KOSA",
        "region_code": "KOSA",
        "sub_region_code": "KOSA",
        "region_slug": "kosamba",
        "latitude": "21.4554",
        "longitude": "72.9579"
    },
    {
        "city_code": "KOSG",
        "region_code": "KOSG",
        "sub_region_code": "KOSG",
        "region_slug": "kosgi",
        "latitude": "16.9878",
        "longitude": "77.7169"
    },
    {
        "city_code": "KOTA",
        "region_code": "KOTA",
        "sub_region_code": "KOTA",
        "region_slug": "kota",
        "latitude": "25.169511",
        "longitude": "75.85399"
    },
    {
        "city_code": "KOAN",
        "region_code": "KOAN",
        "sub_region_code": "KOAN",
        "region_slug": "kota-ap",
        "latitude": "14.0352",
        "longitude": "80.0465"
    },
    {
        "city_code": "KTAB",
        "region_code": "KTAB",
        "sub_region_code": "KTAB",
        "region_slug": "kotabommali",
        "latitude": "18.5184",
        "longitude": "84.1514"
    },
    {
        "city_code": "KTND",
        "region_code": "KTND",
        "sub_region_code": "KTND",
        "region_slug": "kotananduru",
        "latitude": "17.482865",
        "longitude": "82.488968"
    },
    {
        "city_code": "KOTD",
        "region_code": "KOTD",
        "sub_region_code": "KOTD",
        "region_slug": "kotdwara",
        "latitude": "29.7524",
        "longitude": "78.5269"
    },
    {
        "city_code": "KTCR",
        "region_code": "KTCR",
        "sub_region_code": "KTCR",
        "region_slug": "kothacheruvu",
        "latitude": "14.1884",
        "longitude": "77.7652"
    },
    {
        "city_code": "KTGM",
        "region_code": "KTGM",
        "sub_region_code": "KTGM",
        "region_slug": "kothagudem",
        "latitude": "17.556",
        "longitude": "80.6144"
    },
    {
        "city_code": "KOTL",
        "region_code": "KOTL",
        "sub_region_code": "KOTL",
        "region_slug": "kothakota",
        "latitude": "16.3787",
        "longitude": "77.941"
    },
    {
        "city_code": "KTMM",
        "region_code": "KTMM",
        "sub_region_code": "KTMM",
        "region_slug": "kothamangalam",
        "latitude": "10.0602",
        "longitude": "76.6351"
    },
    {
        "city_code": "KOTC",
        "region_code": "KOTC",
        "sub_region_code": "KOTC",
        "region_slug": "kothapalli",
        "latitude": "17.2878",
        "longitude": "81.8943"
    },
    {
        "city_code": "KTPE",
        "region_code": "KTPE",
        "sub_region_code": "KTPE",
        "region_slug": "kothapeta",
        "latitude": "16.716",
        "longitude": "81.8958"
    },
    {
        "city_code": "KTVL",
        "region_code": "KTVL",
        "sub_region_code": "KTVL",
        "region_slug": "kothavalasa",
        "latitude": "17.8909",
        "longitude": "83.1908"
    },
    {
        "city_code": "KOTK",
        "region_code": "KOTK",
        "sub_region_code": "KOTK",
        "region_slug": "kotkapura",
        "latitude": "30.5913",
        "longitude": "74.8115"
    },
    {
        "city_code": "KOTM",
        "region_code": "KOTM",
        "sub_region_code": "KOTM",
        "region_slug": "kotma",
        "latitude": "23.208326",
        "longitude": "81.97924"
    },
    {
        "city_code": "KTPD",
        "region_code": "KTPD",
        "sub_region_code": "KTPD",
        "region_slug": "kotpad",
        "latitude": "19.141944",
        "longitude": "82.328376"
    },
    {
        "city_code": "KPLI",
        "region_code": "KPLI",
        "sub_region_code": "KPLI",
        "region_slug": "kotputli",
        "latitude": "27.7046",
        "longitude": "76.2013"
    },
    {
        "city_code": "KTYM",
        "region_code": "KTYM",
        "sub_region_code": "KTYM",
        "region_slug": "kottayam",
        "latitude": "9.591649",
        "longitude": "76.522065"
    },
    {
        "city_code": "KOTT",
        "region_code": "KOTT",
        "sub_region_code": "KOTT",
        "region_slug": "kottayi",
        "latitude": "10.7469",
        "longitude": "76.543"
    },
    {
        "city_code": "KTTY",
        "region_code": "KTTY",
        "sub_region_code": "KTTY",
        "region_slug": "kottiyam",
        "latitude": "8.86601",
        "longitude": "76.670837"
    },
    {
        "city_code": "KTUR",
        "region_code": "KTUR",
        "sub_region_code": "KTUR",
        "region_slug": "kotturu",
        "latitude": "18.73073",
        "longitude": "84.09572"
    },
    {
        "city_code": "KOVI",
        "region_code": "KOVI",
        "sub_region_code": "KOVI",
        "region_slug": "kovilpatti",
        "latitude": "9.1674",
        "longitude": "77.8767"
    },
    {
        "city_code": "KOVR",
        "region_code": "KOVR",
        "sub_region_code": "KOVR",
        "region_slug": "kovur-nellore",
        "latitude": "14.5012",
        "longitude": "79.9881"
    },
    {
        "city_code": "KOVU",
        "region_code": "KOVU",
        "sub_region_code": "KOVU",
        "region_slug": "kovvur",
        "latitude": "17.012685",
        "longitude": "81.726888"
    },
    {
        "city_code": "KOEM",
        "region_code": "KOEM",
        "sub_region_code": "KOEM",
        "region_slug": "koyyalagudem",
        "latitude": "17.4521",
        "longitude": "81.6528"
    },
    {
        "city_code": "KOZH",
        "region_code": "KOZH",
        "sub_region_code": "KOZH",
        "region_slug": "kozhikode",
        "latitude": "11.255827",
        "longitude": "75.740774"
    },
    {
        "city_code": "KOZA",
        "region_code": "KOZA",
        "sub_region_code": "KOZA",
        "region_slug": "kozhinjampara",
        "latitude": "10.7402",
        "longitude": "76.8346"
    },
    {
        "city_code": "KRHN",
        "region_code": "KRHN",
        "sub_region_code": "KRHN",
        "region_slug": "krishnagiri",
        "latitude": "12.5186",
        "longitude": "78.2137"
    },
    {
        "city_code": "KNWB",
        "region_code": "KNWB",
        "sub_region_code": "KNWB",
        "region_slug": "krishnanagar",
        "latitude": "23.401675",
        "longitude": "88.463308"
    },
    {
        "city_code": "KRJT",
        "region_code": "KRJT",
        "sub_region_code": "KRJT",
        "region_slug": "krishnarajanagara",
        "latitude": "12.44",
        "longitude": "76.3811"
    },
    {
        "city_code": "KEKE",
        "region_code": "KEKE",
        "sub_region_code": "KEKE",
        "region_slug": "krishnarajpete-krpete",
        "latitude": "12.6558",
        "longitude": "76.4881"
    },
    {
        "city_code": "KRSR",
        "region_code": "KRSR",
        "sub_region_code": "KRSR",
        "region_slug": "krosuru",
        "latitude": "16.5453",
        "longitude": "80.1401"
    },
    {
        "city_code": "KRTH",
        "region_code": "KRTH",
        "sub_region_code": "KRTH",
        "region_slug": "kruthivennu",
        "latitude": "16.3746",
        "longitude": "81.3564"
    },
    {
        "city_code": "KHCY",
        "region_code": "KHCY",
        "sub_region_code": "KHCY",
        "region_slug": "kuchaman-city",
        "latitude": "27.147",
        "longitude": "74.8566"
    },
    {
        "city_code": "KCPD",
        "region_code": "KCPD",
        "sub_region_code": "KCPD",
        "region_slug": "kuchipudi",
        "latitude": "16.2542",
        "longitude": "80.918"
    },
    {
        "city_code": "KUDU",
        "region_code": "KUDU",
        "sub_region_code": "KUDU",
        "region_slug": "kudus",
        "latitude": "19.5328",
        "longitude": "73.0974"
    },
    {
        "city_code": "KUAG",
        "region_code": "KUAG",
        "sub_region_code": "KUAG",
        "region_slug": "kujang",
        "latitude": "20.3174",
        "longitude": "86.5274"
    },
    {
        "city_code": "KUKS",
        "region_code": "KUKS",
        "sub_region_code": "KUKS",
        "region_slug": "kukshi",
        "latitude": "22.2068",
        "longitude": "74.7557"
    },
    {
        "city_code": "KULI",
        "region_code": "KULI",
        "sub_region_code": "KULI",
        "region_slug": "kulithalai",
        "latitude": "10.9373",
        "longitude": "78.4212"
    },
    {
        "city_code": "KULU",
        "region_code": "KULU",
        "sub_region_code": "KULU",
        "region_slug": "kullu",
        "latitude": "31.957851",
        "longitude": "77.10946"
    },
    {
        "city_code": "KMOA",
        "region_code": "KMOA",
        "sub_region_code": "KMOA",
        "region_slug": "kumarakom",
        "latitude": "9.5946",
        "longitude": "76.430946"
    },
    {
        "city_code": "KUMB",
        "region_code": "KUMB",
        "sub_region_code": "KUMB",
        "region_slug": "kumbakonam",
        "latitude": "10.9617",
        "longitude": "79.3881"
    },
    {
        "city_code": "KUMI",
        "region_code": "KUMI",
        "sub_region_code": "KUMI",
        "region_slug": "kumily",
        "latitude": "9.6037",
        "longitude": "77.1675"
    },
    {
        "city_code": "KUDD",
        "region_code": "KUDD",
        "sub_region_code": "KUDD",
        "region_slug": "kunda",
        "latitude": "25.7175",
        "longitude": "81.5212"
    },
    {
        "city_code": "KUNA",
        "region_code": "KUNA",
        "sub_region_code": "KUNA",
        "region_slug": "kundapura",
        "latitude": "13.623611",
        "longitude": "74.675918"
    },
    {
        "city_code": "KUUN",
        "region_code": "KUUN",
        "sub_region_code": "KUUN",
        "region_slug": "kunigal",
        "latitude": "13.0255",
        "longitude": "77.0255"
    },
    {
        "city_code": "KKRI",
        "region_code": "KKRI",
        "sub_region_code": "KKRI",
        "region_slug": "kunkuri",
        "latitude": "22.742543",
        "longitude": "83.953349"
    },
    {
        "city_code": "KUNN",
        "region_code": "KUNN",
        "sub_region_code": "KUNN",
        "region_slug": "kunnamkulam",
        "latitude": "10.6516",
        "longitude": "76.0711"
    },
    {
        "city_code": "KURA",
        "region_code": "KURA",
        "sub_region_code": "KURA",
        "region_slug": "kuravilangad",
        "latitude": "9.7576",
        "longitude": "76.561"
    },
    {
        "city_code": "KURN",
        "region_code": "KURN",
        "sub_region_code": "KURN",
        "region_slug": "kurnool",
        "latitude": "15.8281",
        "longitude": "78.0373"
    },
    {
        "city_code": "KURS",
        "region_code": "KURS",
        "sub_region_code": "KURS",
        "region_slug": "kurseong",
        "latitude": "26.882313",
        "longitude": "88.279193"
    },
    {
        "city_code": "KURU",
        "region_code": "KURU",
        "sub_region_code": "KURU",
        "region_slug": "kurukshetra",
        "latitude": "29.969512",
        "longitude": "76.878282"
    },
    {
        "city_code": "KURY",
        "region_code": "KURY",
        "sub_region_code": "KURY",
        "region_slug": "kurumaseri",
        "latitude": "10.1803",
        "longitude": "76.3319"
    },
    {
        "city_code": "KURD",
        "region_code": "KURD",
        "sub_region_code": "KURD",
        "region_slug": "kurundwad",
        "latitude": "16.6809",
        "longitude": "74.5906"
    },
    {
        "city_code": "KUSA",
        "region_code": "KUSA",
        "sub_region_code": "KUSA",
        "region_slug": "kushalnagar",
        "latitude": "12.4555",
        "longitude": "75.957"
    },
    {
        "city_code": "KUSH",
        "region_code": "KUSH",
        "sub_region_code": "KUSH",
        "region_slug": "kushinagar",
        "latitude": "26.7399",
        "longitude": "83.887"
    },
    {
        "city_code": "KTCH",
        "region_code": "KTCH",
        "sub_region_code": "KTCH",
        "region_slug": "kutch",
        "latitude": "23.7337",
        "longitude": "69.8597"
    },
    {
        "city_code": "KUTH",
        "region_code": "KUTH",
        "sub_region_code": "KUTH",
        "region_slug": "kuthuparamba",
        "latitude": "11.8319",
        "longitude": "75.5655"
    },
    {
        "city_code": "LEHA",
        "region_code": "LEHA",
        "sub_region_code": "LEHA",
        "region_slug": "ladakh",
        "latitude": "34.15258",
        "longitude": "77.57704"
    },
    {
        "city_code": "LAHA",
        "region_code": "LAHA",
        "sub_region_code": "LAHA",
        "region_slug": "lakhimpur",
        "latitude": "27.2064",
        "longitude": "94.1514"
    },
    {
        "city_code": "LKPK",
        "region_code": "LKPK",
        "sub_region_code": "LKPK",
        "region_slug": "lakhimpur-kheri",
        "latitude": "27.947147",
        "longitude": "80.777747"
    },
    {
        "city_code": "LASK",
        "region_code": "LASK",
        "sub_region_code": "LASK",
        "region_slug": "lakhisarai",
        "latitude": "25.1571",
        "longitude": "86.0952"
    },
    {
        "city_code": "LRAM",
        "region_code": "LRAM",
        "sub_region_code": "LRAM",
        "region_slug": "lakkavaram",
        "latitude": "15.6995",
        "longitude": "79.7947"
    },
    {
        "city_code": "LKSH",
        "region_code": "LKSH",
        "sub_region_code": "LKSH",
        "region_slug": "lakshmeshwara",
        "latitude": "15.1275",
        "longitude": "75.4723"
    },
    {
        "city_code": "LKMP",
        "region_code": "LKMP",
        "sub_region_code": "LKMP",
        "region_slug": "lakshmikantapur",
        "latitude": "22.1099",
        "longitude": "88.3209"
    },
    {
        "city_code": "LALG",
        "region_code": "LALG",
        "sub_region_code": "LALG",
        "region_slug": "lalgudi",
        "latitude": "10.875032",
        "longitude": "78.807185"
    },
    {
        "city_code": "LLTP",
        "region_code": "LLTP",
        "sub_region_code": "LLTP",
        "region_slug": "lalitpur",
        "latitude": "24.68813",
        "longitude": "78.39659"
    },
    {
        "city_code": "LADW",
        "region_code": "LADW",
        "sub_region_code": "LADW",
        "region_slug": "lansdowne",
        "latitude": "29.8377",
        "longitude": "78.6871"
    },
    {
        "city_code": "LAT",
        "region_code": "LAT",
        "sub_region_code": "LAT",
        "region_slug": "latur",
        "latitude": "18.399821",
        "longitude": "76.559543"
    },
    {
        "city_code": "LAVA",
        "region_code": "LAVA",
        "sub_region_code": "LAVA",
        "region_slug": "lavasa",
        "latitude": "18.4077",
        "longitude": "73.5075"
    },
    {
        "city_code": "LEEJ",
        "region_code": "LEEJ",
        "sub_region_code": "LEEJ",
        "region_slug": "leeja",
        "latitude": "16.0195",
        "longitude": "77.6679"
    },
    {
        "city_code": "LEHL",
        "region_code": "LEHL",
        "sub_region_code": "LEHL",
        "region_slug": "leh",
        "latitude": "34.1526",
        "longitude": "77.5771"
    },
    {
        "city_code": "LING",
        "region_code": "LING",
        "sub_region_code": "LING",
        "region_slug": "lingasugur",
        "latitude": "16.155",
        "longitude": "76.5199"
    },
    {
        "city_code": "LOHA",
        "region_code": "LOHA",
        "sub_region_code": "LOHA",
        "region_slug": "lohardaga",
        "latitude": "23.47708",
        "longitude": "84.390058"
    },
    {
        "city_code": "LONZ",
        "region_code": "LONZ",
        "sub_region_code": "LONZ",
        "region_slug": "lonand",
        "latitude": "18.0417",
        "longitude": "74.1862"
    },
    {
        "city_code": "LONA",
        "region_code": "LONA",
        "sub_region_code": "LONA",
        "region_slug": "lonar",
        "latitude": "19.984737",
        "longitude": "76.521237"
    },
    {
        "city_code": "LNVL",
        "region_code": "LNVL",
        "sub_region_code": "LNVL",
        "region_slug": "lonavala",
        "latitude": "18.748101",
        "longitude": "73.405629"
    },
    {
        "city_code": "LONI",
        "region_code": "LONI",
        "sub_region_code": "LONI",
        "region_slug": "loni",
        "latitude": "18.6558",
        "longitude": "75.4083"
    },
    {
        "city_code": "LUCK",
        "region_code": "LUCK",
        "sub_region_code": "LUCK",
        "region_slug": "lucknow",
        "latitude": "26.846511",
        "longitude": "80.946683"
    },
    {
        "city_code": "LUDH",
        "region_code": "LUDH",
        "sub_region_code": "LUDH",
        "region_slug": "ludhiana",
        "latitude": "30.900965",
        "longitude": "75.857276"
    },
    {
        "city_code": "LUNA",
        "region_code": "LUNA",
        "sub_region_code": "LUNA",
        "region_slug": "lunawada",
        "latitude": "23.13",
        "longitude": "73.6109"
    },
    {
        "city_code": "LAKS",
        "region_code": "LAKS",
        "sub_region_code": "LAKS",
        "region_slug": "luxettipet",
        "latitude": "18.8755",
        "longitude": "79.2028"
    },
    {
        "city_code": "MUNN",
        "region_code": "MUNN",
        "sub_region_code": "MUNN",
        "region_slug": "munnar",
        "latitude": "10.0889",
        "longitude": "77.0595"
    },
    {
        "city_code": "MACH",
        "region_code": "MACH",
        "sub_region_code": "MACH",
        "region_slug": "macherla",
        "latitude": "16.476",
        "longitude": "79.4394"
    },
    {
        "city_code": "MAPM",
        "region_code": "MAPM",
        "sub_region_code": "MAPM",
        "region_slug": "machilipatnam",
        "latitude": "16.1905",
        "longitude": "81.1362"
    },
    {
        "city_code": "MADA",
        "region_code": "MADA",
        "sub_region_code": "MADA",
        "region_slug": "madalu",
        "latitude": "13.4749",
        "longitude": "76.3695"
    },
    {
        "city_code": "MDNP",
        "region_code": "MDNP",
        "sub_region_code": "MDNP",
        "region_slug": "madanapalle",
        "latitude": "13.5603",
        "longitude": "78.5036"
    },
    {
        "city_code": "MADD",
        "region_code": "MADD",
        "sub_region_code": "MADD",
        "region_slug": "maddur",
        "latitude": "12.5839",
        "longitude": "77.0435"
    },
    {
        "city_code": "MDHA",
        "region_code": "MDHA",
        "sub_region_code": "MDHA",
        "region_slug": "madhavaram",
        "latitude": "16.906536",
        "longitude": "80.693708"
    },
    {
        "city_code": "MHEA",
        "region_code": "MHEA",
        "sub_region_code": "MHEA",
        "region_slug": "madhepura",
        "latitude": "25.924",
        "longitude": "86.7946"
    },
    {
        "city_code": "MADR",
        "region_code": "MADR",
        "sub_region_code": "MADR",
        "region_slug": "madhira",
        "latitude": "16.9236",
        "longitude": "80.3686"
    },
    {
        "city_code": "MADI",
        "region_code": "MADI",
        "sub_region_code": "MADI",
        "region_slug": "madikeri",
        "latitude": "12.4244",
        "longitude": "75.7382"
    },
    {
        "city_code": "MADU",
        "region_code": "MADU",
        "sub_region_code": "MADU",
        "region_slug": "madurai",
        "latitude": "9.925201",
        "longitude": "78.119775"
    },
    {
        "city_code": "MAGA",
        "region_code": "MAGA",
        "sub_region_code": "MAGA",
        "region_slug": "magadi",
        "latitude": "12.9577",
        "longitude": "77.2261"
    },
    {
        "city_code": "MABL",
        "region_code": "MABL",
        "sub_region_code": "MABL",
        "region_slug": "mahabaleshwar",
        "latitude": "17.9307",
        "longitude": "73.6477"
    },
    {
        "city_code": "MAHA",
        "region_code": "MAHA",
        "sub_region_code": "MAHA",
        "region_slug": "mahabubabad",
        "latitude": "17.5975",
        "longitude": "80.0015"
    },
    {
        "city_code": "MHAD",
        "region_code": "MHAD",
        "sub_region_code": "MHAD",
        "region_slug": "mahad",
        "latitude": "18.109394",
        "longitude": "73.418459"
    },
    {
        "city_code": "MAGP",
        "region_code": "MAGP",
        "sub_region_code": "MAGP",
        "region_slug": "mahalingpur",
        "latitude": "16.3897",
        "longitude": "75.1108"
    },
    {
        "city_code": "RAJG",
        "region_code": "RAJG",
        "sub_region_code": "RAJG",
        "region_slug": "maharajganj",
        "latitude": "27.149432",
        "longitude": "83.544834"
    },
    {
        "city_code": "MAMU",
        "region_code": "MAMU",
        "sub_region_code": "MAMU",
        "region_slug": "mahasamund",
        "latitude": "21.1091",
        "longitude": "82.0979"
    },
    {
        "city_code": "MAHB",
        "region_code": "MAHB",
        "sub_region_code": "MAHB",
        "region_slug": "mahbubnagar",
        "latitude": "16.3841",
        "longitude": "78.1108"
    },
    {
        "city_code": "MAHM",
        "region_code": "MAHM",
        "sub_region_code": "MAHM",
        "region_slug": "mahemdavad",
        "latitude": "22.8256",
        "longitude": "72.7571"
    },
    {
        "city_code": "MAHE",
        "region_code": "MAHE",
        "sub_region_code": "MAHE",
        "region_slug": "maheshwar",
        "latitude": "22.1773",
        "longitude": "75.583"
    },
    {
        "city_code": "MHSR",
        "region_code": "MHSR",
        "sub_region_code": "MHSR",
        "region_slug": "maheshwaram",
        "latitude": "17.132875",
        "longitude": "78.43665"
    },
    {
        "city_code": "MMAI",
        "region_code": "MMAI",
        "sub_region_code": "MMAI",
        "region_slug": "mahishadal",
        "latitude": "22.1814",
        "longitude": "87.9898"
    },
    {
        "city_code": "MAHU",
        "region_code": "MAHU",
        "sub_region_code": "MAHU",
        "region_slug": "mahudha",
        "latitude": "22.8187",
        "longitude": "72.941"
    },
    {
        "city_code": "MAHV",
        "region_code": "MAHV",
        "sub_region_code": "MAHV",
        "region_slug": "mahuva",
        "latitude": "21.0942",
        "longitude": "71.756104"
    },
    {
        "city_code": "MAKA",
        "region_code": "MAKA",
        "sub_region_code": "MAKA",
        "region_slug": "makrana",
        "latitude": "27.037702",
        "longitude": "74.693144"
    },
    {
        "city_code": "MAKT",
        "region_code": "MAKT",
        "sub_region_code": "MAKT",
        "region_slug": "makthal",
        "latitude": "16.5021",
        "longitude": "77.5075"
    },
    {
        "city_code": "MALP",
        "region_code": "MALP",
        "sub_region_code": "MALP",
        "region_slug": "malappuram",
        "latitude": "11.0732",
        "longitude": "76.074"
    },
    {
        "city_code": "MALD",
        "region_code": "MALD",
        "sub_region_code": "MALD",
        "region_slug": "malda",
        "latitude": "25.1786",
        "longitude": "88.2461"
    },
    {
        "city_code": "MEBN",
        "region_code": "MEBN",
        "sub_region_code": "MEBN",
        "region_slug": "malebennur",
        "latitude": "14.352182",
        "longitude": "75.739651"
    },
    {
        "city_code": "MALE",
        "region_code": "MALE",
        "sub_region_code": "MALE",
        "region_slug": "malegaon",
        "latitude": "20.5505",
        "longitude": "74.5309"
    },
    {
        "city_code": "MALR",
        "region_code": "MALR",
        "sub_region_code": "MALR",
        "region_slug": "malerkotla",
        "latitude": "30.5232",
        "longitude": "75.8883"
    },
    {
        "city_code": "MALK",
        "region_code": "MALK",
        "sub_region_code": "MALK",
        "region_slug": "malikipuram",
        "latitude": "16.4043",
        "longitude": "81.806"
    },
    {
        "city_code": "MALG",
        "region_code": "MALG",
        "sub_region_code": "MALG",
        "region_slug": "malkangiri",
        "latitude": "18.350481",
        "longitude": "81.87086"
    },
    {
        "city_code": "MAMA",
        "region_code": "MAMA",
        "sub_region_code": "MAMA",
        "region_slug": "malkapur",
        "latitude": "20.8865",
        "longitude": "76.2163"
    },
    {
        "city_code": "MAAL",
        "region_code": "MAAL",
        "sub_region_code": "MAAL",
        "region_slug": "mall",
        "latitude": "16.969184",
        "longitude": "78.729047"
    },
    {
        "city_code": "MALO",
        "region_code": "MALO",
        "sub_region_code": "MALO",
        "region_slug": "malout",
        "latitude": "30.1892",
        "longitude": "74.5053"
    },
    {
        "city_code": "MLLR",
        "region_code": "MLLR",
        "sub_region_code": "MLLR",
        "region_slug": "malur",
        "latitude": "13.0037",
        "longitude": "77.9383"
    },
    {
        "city_code": "MMLL",
        "region_code": "MMLL",
        "sub_region_code": "MMLL",
        "region_slug": "mamallapuram",
        "latitude": "12.6269",
        "longitude": "80.1927"
    },
    {
        "city_code": "MANA",
        "region_code": "MANA",
        "sub_region_code": "MANA",
        "region_slug": "manali",
        "latitude": "32.239633",
        "longitude": "77.188715"
    },
    {
        "city_code": "MNMI",
        "region_code": "MNMI",
        "sub_region_code": "MNMI",
        "region_slug": "manamadurai",
        "latitude": "9.689",
        "longitude": "78.4581"
    },
    {
        "city_code": "MAVY",
        "region_code": "MAVY",
        "sub_region_code": "MAVY",
        "region_slug": "mananthavady",
        "latitude": "11.8014",
        "longitude": "76.0044"
    },
    {
        "city_code": "MAPI",
        "region_code": "MAPI",
        "sub_region_code": "MAPI",
        "region_slug": "manapparai",
        "latitude": "10.607463",
        "longitude": "78.421338"
    },
    {
        "city_code": "MANW",
        "region_code": "MANW",
        "sub_region_code": "MANW",
        "region_slug": "manawar",
        "latitude": "22.2367",
        "longitude": "75.0874"
    },
    {
        "city_code": "MANC",
        "region_code": "MANC",
        "sub_region_code": "MANC",
        "region_slug": "mancherial",
        "latitude": "18.8756",
        "longitude": "79.4591"
    },
    {
        "city_code": "MAND",
        "region_code": "MAND",
        "sub_region_code": "MAND",
        "region_slug": "mandapeta",
        "latitude": "16.8653",
        "longitude": "81.9262"
    },
    {
        "city_code": "MNWS",
        "region_code": "MNWS",
        "sub_region_code": "MNWS",
        "region_slug": "mandarmoni",
        "latitude": "21.6681",
        "longitude": "87.7025"
    },
    {
        "city_code": "MDAS",
        "region_code": "MDAS",
        "sub_region_code": "MDAS",
        "region_slug": "mandasa",
        "latitude": "18.872422",
        "longitude": "84.460637"
    },
    {
        "city_code": "MMND",
        "region_code": "MMND",
        "sub_region_code": "MMND",
        "region_slug": "mandav",
        "latitude": "22.334701",
        "longitude": "75.402345"
    },
    {
        "city_code": "MARJ",
        "region_code": "MARJ",
        "sub_region_code": "MARJ",
        "region_slug": "mandawa",
        "latitude": "28.052997",
        "longitude": "75.131238"
    },
    {
        "city_code": "MIHP",
        "region_code": "MIHP",
        "sub_region_code": "MIHP",
        "region_slug": "mandi",
        "latitude": "31.7082",
        "longitude": "76.9314"
    },
    {
        "city_code": "DABW",
        "region_code": "DABW",
        "sub_region_code": "DABW",
        "region_slug": "mandi-dabwali",
        "latitude": "29.9671",
        "longitude": "74.7001"
    },
    {
        "city_code": "MBBH",
        "region_code": "MBBH",
        "sub_region_code": "MBBH",
        "region_slug": "mandi-gobindgarh",
        "latitude": "30.6637",
        "longitude": "76.3"
    },
    {
        "city_code": "MADL",
        "region_code": "MADL",
        "sub_region_code": "MADL",
        "region_slug": "mandla",
        "latitude": "22.595786",
        "longitude": "80.361879"
    },
    {
        "city_code": "MNDS",
        "region_code": "MNDS",
        "sub_region_code": "MNDS",
        "region_slug": "mandsaur",
        "latitude": "24.0768",
        "longitude": "75.0693"
    },
    {
        "city_code": "MNDW",
        "region_code": "MNDW",
        "sub_region_code": "MNDW",
        "region_slug": "mandwa",
        "latitude": "17.5567",
        "longitude": "73.9704"
    },
    {
        "city_code": "MND",
        "region_code": "MND",
        "sub_region_code": "MND",
        "region_slug": "mandya",
        "latitude": "12.5644",
        "longitude": "76.7337"
    },
    {
        "city_code": "MANE",
        "region_code": "MANE",
        "sub_region_code": "MANE",
        "region_slug": "manendragarh",
        "latitude": "23.214655",
        "longitude": "82.187894"
    },
    {
        "city_code": "MGLR",
        "region_code": "MGLR",
        "sub_region_code": "MGLR",
        "region_slug": "mangalagiri",
        "latitude": "16.433255",
        "longitude": "80.552141"
    },
    {
        "city_code": "MANG",
        "region_code": "MANG",
        "sub_region_code": "MANG",
        "region_slug": "mangaldoi",
        "latitude": "26.4463",
        "longitude": "92.0322"
    },
    {
        "city_code": "MLR",
        "region_code": "MLR",
        "sub_region_code": "MLR",
        "region_slug": "mangaluru-mangalore",
        "latitude": "12.91379",
        "longitude": "74.853977"
    },
    {
        "city_code": "MNGR",
        "region_code": "MNGR",
        "sub_region_code": "MNGR",
        "region_slug": "mangar",
        "latitude": "28.378745",
        "longitude": "77.174256"
    },
    {
        "city_code": "MNAP",
        "region_code": "MNAP",
        "sub_region_code": "MNAP",
        "region_slug": "manikonda-ap",
        "latitude": "16.4502",
        "longitude": "80.8366"
    },
    {
        "city_code": "MANI",
        "region_code": "MANI",
        "sub_region_code": "MANI",
        "region_slug": "manipal",
        "latitude": "13.350338",
        "longitude": "74.787312"
    },
    {
        "city_code": "MAJR",
        "region_code": "MAJR",
        "sub_region_code": "MAJR",
        "region_slug": "manjeri",
        "latitude": "11.1203",
        "longitude": "76.12"
    },
    {
        "city_code": "MNMD",
        "region_code": "MNMD",
        "sub_region_code": "MNMD",
        "region_slug": "manmad",
        "latitude": "20.2512",
        "longitude": "74.4366"
    },
    {
        "city_code": "MANB",
        "region_code": "MANB",
        "sub_region_code": "MANB",
        "region_slug": "mannargudi",
        "latitude": "10.6649",
        "longitude": "79.4507"
    },
    {
        "city_code": "MKKA",
        "region_code": "MKKA",
        "sub_region_code": "MKKA",
        "region_slug": "mannarkkad",
        "latitude": "10.9932",
        "longitude": "76.461"
    },
    {
        "city_code": "MANR",
        "region_code": "MANR",
        "sub_region_code": "MANR",
        "region_slug": "mannur",
        "latitude": "13.0231",
        "longitude": "79.957"
    },
    {
        "city_code": "MNSA",
        "region_code": "MNSA",
        "sub_region_code": "MNSA",
        "region_slug": "mansa",
        "latitude": "29.9995",
        "longitude": "75.3937"
    },
    {
        "city_code": "MATY",
        "region_code": "MATY",
        "sub_region_code": "MATY",
        "region_slug": "manthani",
        "latitude": "18.651",
        "longitude": "79.6682"
    },
    {
        "city_code": "MNGU",
        "region_code": "MNGU",
        "sub_region_code": "MNGU",
        "region_slug": "manuguru",
        "latitude": "17.9312",
        "longitude": "80.8266"
    },
    {
        "city_code": "MLAK",
        "region_code": "MLAK",
        "sub_region_code": "MLAK",
        "region_slug": "manvi",
        "latitude": "15.9951",
        "longitude": "77.0478"
    },
    {
        "city_code": "MMNR",
        "region_code": "MMNR",
        "sub_region_code": "MMNR",
        "region_slug": "maraimalai-nagar",
        "latitude": "12.793",
        "longitude": "80.0252"
    },
    {
        "city_code": "MAYR",
        "region_code": "MAYR",
        "sub_region_code": "MAYR",
        "region_slug": "marayur",
        "latitude": "10.2762",
        "longitude": "77.1615"
    },
    {
        "city_code": "MARG",
        "region_code": "MARG",
        "sub_region_code": "MARG",
        "region_slug": "margao",
        "latitude": "15.2832",
        "longitude": "73.9862"
    },
    {
        "city_code": "MARH",
        "region_code": "MARH",
        "sub_region_code": "MARH",
        "region_slug": "margherita",
        "latitude": "27.2911",
        "longitude": "95.6695"
    },
    {
        "city_code": "MARK",
        "region_code": "MARK",
        "sub_region_code": "MARK",
        "region_slug": "markapur",
        "latitude": "15.736154",
        "longitude": "79.269125"
    },
    {
        "city_code": "MRPL",
        "region_code": "MRPL",
        "sub_region_code": "MRPL",
        "region_slug": "marpalle",
        "latitude": "17.5403",
        "longitude": "77.7667"
    },
    {
        "city_code": "MARR",
        "region_code": "MARR",
        "sub_region_code": "MARR",
        "region_slug": "marripeda",
        "latitude": "17.3729",
        "longitude": "79.8829"
    },
    {
        "city_code": "MRDM",
        "region_code": "MRDM",
        "sub_region_code": "MRDM",
        "region_slug": "marthandam",
        "latitude": "8.3075",
        "longitude": "77.2218"
    },
    {
        "city_code": "MART",
        "region_code": "MART",
        "sub_region_code": "MART",
        "region_slug": "martur",
        "latitude": "15.9938",
        "longitude": "80.1038"
    },
    {
        "city_code": "MASL",
        "region_code": "MASL",
        "sub_region_code": "MASL",
        "region_slug": "maslandapur",
        "latitude": "22.855522",
        "longitude": "88.743988"
    },
    {
        "city_code": "MPUR",
        "region_code": "MPUR",
        "sub_region_code": "MPUR",
        "region_slug": "math-chandipur",
        "latitude": "22.0914",
        "longitude": "87.8582"
    },
    {
        "city_code": "MABH",
        "region_code": "MABH",
        "sub_region_code": "MABH",
        "region_slug": "mathabhanga",
        "latitude": "26.3427",
        "longitude": "89.2153"
    },
    {
        "city_code": "MATH",
        "region_code": "MATH",
        "sub_region_code": "MATH",
        "region_slug": "mathura",
        "latitude": "27.492413",
        "longitude": "77.673673"
    },
    {
        "city_code": "MATT",
        "region_code": "MATT",
        "sub_region_code": "MATT",
        "region_slug": "mattannur",
        "latitude": "11.9293",
        "longitude": "75.5735"
    },
    {
        "city_code": "MAAU",
        "region_code": "MAAU",
        "sub_region_code": "MAAU",
        "region_slug": "mau",
        "latitude": "25.9431",
        "longitude": "83.5562"
    },
    {
        "city_code": "MVLR",
        "region_code": "MVLR",
        "sub_region_code": "MVLR",
        "region_slug": "mavelikkara",
        "latitude": "9.250324",
        "longitude": "76.539568"
    },
    {
        "city_code": "MAYA",
        "region_code": "MAYA",
        "sub_region_code": "MAYA",
        "region_slug": "mayannur",
        "latitude": "10.7507",
        "longitude": "76.3811"
    },
    {
        "city_code": "MAYI",
        "region_code": "MAYI",
        "sub_region_code": "MAYI",
        "region_slug": "mayiladuthurai",
        "latitude": "11.1018",
        "longitude": "79.6526"
    },
    {
        "city_code": "MDAK",
        "region_code": "MDAK",
        "sub_region_code": "MDAK",
        "region_slug": "medak",
        "latitude": "17.8716",
        "longitude": "78.1108"
    },
    {
        "city_code": "MDRM",
        "region_code": "MDRM",
        "sub_region_code": "MDRM",
        "region_slug": "medarametla",
        "latitude": "15.7221",
        "longitude": "80.0158"
    },
    {
        "city_code": "MDCH",
        "region_code": "MDCH",
        "sub_region_code": "MDCH",
        "region_slug": "medchal",
        "latitude": "17.6302",
        "longitude": "78.4842"
    },
    {
        "city_code": "MERT",
        "region_code": "MERT",
        "sub_region_code": "MERT",
        "region_slug": "meerut",
        "latitude": "28.984462",
        "longitude": "77.706414"
    },
    {
        "city_code": "MEHK",
        "region_code": "MEHK",
        "sub_region_code": "MEHK",
        "region_slug": "mehkar",
        "latitude": "20.1478",
        "longitude": "76.5713"
    },
    {
        "city_code": "MEHS",
        "region_code": "MEHS",
        "sub_region_code": "MEHS",
        "region_slug": "mehsana",
        "latitude": "23.588",
        "longitude": "72.3693"
    },
    {
        "city_code": "MELA",
        "region_code": "MELA",
        "sub_region_code": "MELA",
        "region_slug": "melattur",
        "latitude": "11.0684",
        "longitude": "76.2682"
    },
    {
        "city_code": "MELL",
        "region_code": "MELL",
        "sub_region_code": "MELL",
        "region_slug": "melli",
        "latitude": "27.0908",
        "longitude": "88.4567"
    },
    {
        "city_code": "MMRR",
        "region_code": "MMRR",
        "sub_region_code": "MMRR",
        "region_slug": "memari",
        "latitude": "23.1745",
        "longitude": "88.1047"
    },
    {
        "city_code": "METT",
        "region_code": "METT",
        "sub_region_code": "METT",
        "region_slug": "metpally",
        "latitude": "18.279756",
        "longitude": "79.579837"
    },
    {
        "city_code": "MTPM",
        "region_code": "MTPM",
        "sub_region_code": "MTPM",
        "region_slug": "mettuppalayam",
        "latitude": "11.2891",
        "longitude": "76.941"
    },
    {
        "city_code": "METZ",
        "region_code": "METZ",
        "sub_region_code": "METZ",
        "region_slug": "mettur",
        "latitude": "11.7863",
        "longitude": "77.8008"
    },
    {
        "city_code": "MHOW",
        "region_code": "MHOW",
        "sub_region_code": "MHOW",
        "region_slug": "mhow",
        "latitude": "22.550749",
        "longitude": "75.762211"
    },
    {
        "city_code": "MIRJ",
        "region_code": "MIRJ",
        "sub_region_code": "MIRJ",
        "region_slug": "miraj",
        "latitude": "16.8165",
        "longitude": "74.6425"
    },
    {
        "city_code": "MRGJ",
        "region_code": "MRGJ",
        "sub_region_code": "MRGJ",
        "region_slug": "mirganj",
        "latitude": "26.3696",
        "longitude": "84.3358"
    },
    {
        "city_code": "MRGD",
        "region_code": "MRGD",
        "sub_region_code": "MRGD",
        "region_slug": "miryalaguda",
        "latitude": "16.8753",
        "longitude": "79.566"
    },
    {
        "city_code": "MIZP",
        "region_code": "MIZP",
        "sub_region_code": "MIZP",
        "region_slug": "mirzapur",
        "latitude": "25.1337",
        "longitude": "82.5644"
    },
    {
        "city_code": "MOGA",
        "region_code": "MOGA",
        "sub_region_code": "MOGA",
        "region_slug": "moga",
        "latitude": "30.8",
        "longitude": "75.17"
    },
    {
        "city_code": "MOHL",
        "region_code": "MOHL",
        "sub_region_code": "MOHL",
        "region_slug": "mohali",
        "latitude": "30.705704",
        "longitude": "76.721413"
    },
    {
        "city_code": "MOKA",
        "region_code": "MOKA",
        "sub_region_code": "MOKA",
        "region_slug": "mokama",
        "latitude": "25.3984",
        "longitude": "85.9158"
    },
    {
        "city_code": "MOLA",
        "region_code": "MOLA",
        "sub_region_code": "MOLA",
        "region_slug": "molakalmuru",
        "latitude": "14.7165",
        "longitude": "76.7466"
    },
    {
        "city_code": "MOMT",
        "region_code": "MOMT",
        "sub_region_code": "MOMT",
        "region_slug": "mominpet",
        "latitude": "17.5165",
        "longitude": "77.8982"
    },
    {
        "city_code": "MOOD",
        "region_code": "MOOD",
        "sub_region_code": "MOOD",
        "region_slug": "moodbidri",
        "latitude": "13.0688",
        "longitude": "74.998187"
    },
    {
        "city_code": "MORA",
        "region_code": "MORA",
        "sub_region_code": "MORA",
        "region_slug": "moradabad",
        "latitude": "28.831593",
        "longitude": "78.778276"
    },
    {
        "city_code": "MORH",
        "region_code": "MORH",
        "sub_region_code": "MORH",
        "region_slug": "moranhat",
        "latitude": "27.175325",
        "longitude": "94.894907"
    },
    {
        "city_code": "MOBI",
        "region_code": "MOBI",
        "sub_region_code": "MOBI",
        "region_slug": "morbi",
        "latitude": "22.812",
        "longitude": "70.8236"
    },
    {
        "city_code": "MRMP",
        "region_code": "MRMP",
        "sub_region_code": "MRMP",
        "region_slug": "morena",
        "latitude": "26.493178",
        "longitude": "77.990954"
    },
    {
        "city_code": "MRGO",
        "region_code": "MRGO",
        "sub_region_code": "MRGO",
        "region_slug": "morigaon",
        "latitude": "26.22221",
        "longitude": "92.239487"
    },
    {
        "city_code": "MORI",
        "region_code": "MORI",
        "sub_region_code": "MORI",
        "region_slug": "morinda",
        "latitude": "30.7893",
        "longitude": "76.4997"
    },
    {
        "city_code": "MTKR",
        "region_code": "MTKR",
        "sub_region_code": "MTKR",
        "region_slug": "mothkur",
        "latitude": "17.4569",
        "longitude": "79.2592"
    },
    {
        "city_code": "MOTI",
        "region_code": "MOTI",
        "sub_region_code": "MOTI",
        "region_slug": "motihari",
        "latitude": "26.647",
        "longitude": "84.9089"
    },
    {
        "city_code": "MAYN",
        "region_code": "MAYN",
        "sub_region_code": "MAYN",
        "region_slug": "moyna",
        "latitude": "22.2738",
        "longitude": "87.7697"
    },
    {
        "city_code": "MUDG",
        "region_code": "MUDG",
        "sub_region_code": "MUDG",
        "region_slug": "mudalagi",
        "latitude": "16.337302",
        "longitude": "74.9665"
    },
    {
        "city_code": "MUDD",
        "region_code": "MUDD",
        "sub_region_code": "MUDD",
        "region_slug": "muddebihal",
        "latitude": "16.3396",
        "longitude": "76.1291"
    },
    {
        "city_code": "MUDL",
        "region_code": "MUDL",
        "sub_region_code": "MUDL",
        "region_slug": "mudhol",
        "latitude": "16.3333",
        "longitude": "75.2858"
    },
    {
        "city_code": "MDGR",
        "region_code": "MDGR",
        "sub_region_code": "MDGR",
        "region_slug": "mudigere",
        "latitude": "13.1365",
        "longitude": "75.6403"
    },
    {
        "city_code": "MGSI",
        "region_code": "MGSI",
        "sub_region_code": "MGSI",
        "region_slug": "mughalsarai",
        "latitude": "25.2815",
        "longitude": "83.1198"
    },
    {
        "city_code": "MUKE",
        "region_code": "MUKE",
        "sub_region_code": "MUKE",
        "region_slug": "mukerian",
        "latitude": "31.9563",
        "longitude": "75.6168"
    },
    {
        "city_code": "MUKM",
        "region_code": "MUKM",
        "sub_region_code": "MUKM",
        "region_slug": "mukkam",
        "latitude": "11.3212",
        "longitude": "75.9963"
    },
    {
        "city_code": "MKST",
        "region_code": "MKST",
        "sub_region_code": "MKST",
        "region_slug": "muktsar",
        "latitude": "30.4766",
        "longitude": "74.5112"
    },
    {
        "city_code": "MULB",
        "region_code": "MULB",
        "sub_region_code": "MULB",
        "region_slug": "mulbagal",
        "latitude": "13.1667",
        "longitude": "78.3941"
    },
    {
        "city_code": "MULK",
        "region_code": "MULK",
        "sub_region_code": "MULK",
        "region_slug": "mulkanoor",
        "latitude": "18.087094",
        "longitude": "79.367931"
    },
    {
        "city_code": "MULL",
        "region_code": "MULL",
        "sub_region_code": "MULL",
        "region_slug": "mullanpur",
        "latitude": "30.8427",
        "longitude": "75.6732"
    },
    {
        "city_code": "MULZ",
        "region_code": "MULZ",
        "sub_region_code": "MULZ",
        "region_slug": "mulleria",
        "latitude": "12.551",
        "longitude": "75.1633"
    },
    {
        "city_code": "MULU",
        "region_code": "MULU",
        "sub_region_code": "MULU",
        "region_slug": "mulugu",
        "latitude": "18.1932",
        "longitude": "79.9414"
    },
    {
        "city_code": "GHNP",
        "region_code": "GHNP",
        "sub_region_code": "GHNP",
        "region_slug": "mulugu-ghanpur",
        "latitude": "18.2941",
        "longitude": "79.8689"
    },
    {
        "city_code": "MUMM",
        "region_code": "MUMM",
        "sub_region_code": "MUMM",
        "region_slug": "mummidivaram",
        "latitude": "16.6415",
        "longitude": "82.1043"
    },
    {
        "city_code": "MUAM",
        "region_code": "MUAM",
        "sub_region_code": "MUAM",
        "region_slug": "mundakayam",
        "latitude": "9.537",
        "longitude": "76.8868"
    },
    {
        "city_code": "MNDR",
        "region_code": "MNDR",
        "sub_region_code": "MNDR",
        "region_slug": "mundargi",
        "latitude": "15.2075",
        "longitude": "75.884598"
    },
    {
        "city_code": "MUDA",
        "region_code": "MUDA",
        "sub_region_code": "MUDA",
        "region_slug": "mundra",
        "latitude": "22.8395",
        "longitude": "69.7213"
    },
    {
        "city_code": "BDPR",
        "region_code": "BDPR",
        "sub_region_code": "BDPR",
        "region_slug": "mungra-badshahpur",
        "latitude": "25.658",
        "longitude": "82.1904"
    },
    {
        "city_code": "MUNI",
        "region_code": "MUNI",
        "sub_region_code": "MUNI",
        "region_slug": "muniguda",
        "latitude": "19.6212",
        "longitude": "83.4987"
    },
    {
        "city_code": "MRDG",
        "region_code": "MRDG",
        "sub_region_code": "MRDG",
        "region_slug": "muradnagar",
        "latitude": "28.768979",
        "longitude": "77.483395"
    },
    {
        "city_code": "MURS",
        "region_code": "MURS",
        "sub_region_code": "MURS",
        "region_slug": "murshidabad",
        "latitude": "24.229",
        "longitude": "88.2461"
    },
    {
        "city_code": "MUUR",
        "region_code": "MUUR",
        "sub_region_code": "MUUR",
        "region_slug": "murtizapur",
        "latitude": "20.7296",
        "longitude": "77.3679"
    },
    {
        "city_code": "MUSI",
        "region_code": "MUSI",
        "sub_region_code": "MUSI",
        "region_slug": "musiri",
        "latitude": "10.954855",
        "longitude": "78.443654"
    },
    {
        "city_code": "MSS",
        "region_code": "MSS",
        "sub_region_code": "MSS",
        "region_slug": "mussoorie",
        "latitude": "30.4599",
        "longitude": "78.0664"
    },
    {
        "city_code": "MUVA",
        "region_code": "MUVA",
        "sub_region_code": "MUVA",
        "region_slug": "muvattupuzha",
        "latitude": "9.981815",
        "longitude": "76.56673"
    },
    {
        "city_code": "MUZ",
        "region_code": "MUZ",
        "sub_region_code": "MUZ",
        "region_slug": "muzaffarnagar",
        "latitude": "29.4727",
        "longitude": "77.7085"
    },
    {
        "city_code": "MUZA",
        "region_code": "MUZA",
        "sub_region_code": "MUZA",
        "region_slug": "muzaffarpur",
        "latitude": "26.122272",
        "longitude": "85.377883"
    },
    {
        "city_code": "MYDU",
        "region_code": "MYDU",
        "sub_region_code": "MYDU",
        "region_slug": "mydukur",
        "latitude": "14.7302",
        "longitude": "78.7294"
    },
    {
        "city_code": "MYLA",
        "region_code": "MYLA",
        "sub_region_code": "MYLA",
        "region_slug": "mylavaram",
        "latitude": "16.7638",
        "longitude": "80.6382"
    },
    {
        "city_code": "MYS",
        "region_code": "MYS",
        "sub_region_code": "MYS",
        "region_slug": "mysuru-mysore",
        "latitude": "12.29581",
        "longitude": "76.639381"
    },
    {
        "city_code": "NABB",
        "region_code": "NABB",
        "sub_region_code": "NABB",
        "region_slug": "nabadwip",
        "latitude": "23.4036",
        "longitude": "88.3676"
    },
    {
        "city_code": "NAGU",
        "region_code": "NAGU",
        "sub_region_code": "NAGU",
        "region_slug": "nabarangpur",
        "latitude": "19.2281",
        "longitude": "82.547"
    },
    {
        "city_code": "NABH",
        "region_code": "NABH",
        "sub_region_code": "NABH",
        "region_slug": "nabha",
        "latitude": "30.3737",
        "longitude": "76.1452"
    },
    {
        "city_code": "NDWB",
        "region_code": "NDWB",
        "sub_region_code": "NDWB",
        "region_slug": "nadia",
        "latitude": "23.471",
        "longitude": "88.5565"
    },
    {
        "city_code": "NADI",
        "region_code": "NADI",
        "sub_region_code": "NADI",
        "region_slug": "nadiad",
        "latitude": "22.7",
        "longitude": "72.8667"
    },
    {
        "city_code": "NAGA",
        "region_code": "NAGA",
        "sub_region_code": "NAGA",
        "region_slug": "nagamangala",
        "latitude": "12.8271",
        "longitude": "76.7596"
    },
    {
        "city_code": "NAAM",
        "region_code": "NAAM",
        "sub_region_code": "NAAM",
        "region_slug": "nagaon",
        "latitude": "26.3464",
        "longitude": "92.684"
    },
    {
        "city_code": "NGPT",
        "region_code": "NGPT",
        "sub_region_code": "NGPT",
        "region_slug": "nagapattinam",
        "latitude": "10.7656",
        "longitude": "79.8424"
    },
    {
        "city_code": "NAGI",
        "region_code": "NAGI",
        "sub_region_code": "NAGI",
        "region_slug": "nagari",
        "latitude": "13.3201",
        "longitude": "79.5856"
    },
    {
        "city_code": "NGKL",
        "region_code": "NGKL",
        "sub_region_code": "NGKL",
        "region_slug": "nagarkurnool",
        "latitude": "16.4939",
        "longitude": "78.3102"
    },
    {
        "city_code": "NAGR",
        "region_code": "NAGR",
        "sub_region_code": "NAGR",
        "region_slug": "nagaur",
        "latitude": "27.1854",
        "longitude": "74.03"
    },
    {
        "city_code": "NYLK",
        "region_code": "NYLK",
        "sub_region_code": "NYLK",
        "region_slug": "nagayalanka",
        "latitude": "15.9455",
        "longitude": "80.918"
    },
    {
        "city_code": "NAGD",
        "region_code": "NAGD",
        "sub_region_code": "NAGD",
        "region_slug": "nagda",
        "latitude": "23.4455",
        "longitude": "75.417"
    },
    {
        "city_code": "NAGE",
        "region_code": "NAGE",
        "sub_region_code": "NAGE",
        "region_slug": "nagercoil",
        "latitude": "8.1833",
        "longitude": "77.4119"
    },
    {
        "city_code": "NAGO",
        "region_code": "NAGO",
        "sub_region_code": "NAGO",
        "region_slug": "nagothane",
        "latitude": "18.543596",
        "longitude": "73.130178"
    },
    {
        "city_code": "NAGP",
        "region_code": "NAGP",
        "sub_region_code": "NAGP",
        "region_slug": "nagpur",
        "latitude": "21.1458",
        "longitude": "79.088155"
    },
    {
        "city_code": "NAHA",
        "region_code": "NAHA",
        "sub_region_code": "NAHA",
        "region_slug": "naharlagun",
        "latitude": "27.1086",
        "longitude": "93.6984"
    },
    {
        "city_code": "NDPT",
        "region_code": "NDPT",
        "sub_region_code": "NDPT",
        "region_slug": "naidupeta",
        "latitude": "13.9066",
        "longitude": "79.894"
    },
    {
        "city_code": "NHTA",
        "region_code": "NHTA",
        "sub_region_code": "NHTA",
        "region_slug": "naihati",
        "latitude": "22.8929",
        "longitude": "88.422"
    },
    {
        "city_code": "NAIN",
        "region_code": "NAIN",
        "sub_region_code": "NAIN",
        "region_slug": "nainital",
        "latitude": "29.3803",
        "longitude": "79.4636"
    },
    {
        "city_code": "NAJA",
        "region_code": "NAJA",
        "sub_region_code": "NAJA",
        "region_slug": "najafgarh",
        "latitude": "28.609",
        "longitude": "76.9855"
    },
    {
        "city_code": "NAJI",
        "region_code": "NAJI",
        "sub_region_code": "NAJI",
        "region_slug": "najibabad",
        "latitude": "29.6123",
        "longitude": "78.3442"
    },
    {
        "city_code": "NKHT",
        "region_code": "NKHT",
        "sub_region_code": "NKHT",
        "region_slug": "nakhatrana",
        "latitude": "23.3431",
        "longitude": "69.2669"
    },
    {
        "city_code": "NAKO",
        "region_code": "NAKO",
        "sub_region_code": "NAKO",
        "region_slug": "nakodar",
        "latitude": "31.126958",
        "longitude": "75.481584"
    },
    {
        "city_code": "NKRL",
        "region_code": "NKRL",
        "sub_region_code": "NKRL",
        "region_slug": "nakrekal",
        "latitude": "17.1647",
        "longitude": "79.4275"
    },
    {
        "city_code": "NALK",
        "region_code": "NALK",
        "sub_region_code": "NALK",
        "region_slug": "nalgonda",
        "latitude": "17.1883",
        "longitude": "79.2"
    },
    {
        "city_code": "NALJ",
        "region_code": "NALJ",
        "sub_region_code": "NALJ",
        "region_slug": "nallajerla",
        "latitude": "16.9479",
        "longitude": "81.4045"
    },
    {
        "city_code": "NMKL",
        "region_code": "NMKL",
        "sub_region_code": "NMKL",
        "region_slug": "namakkal",
        "latitude": "11.284",
        "longitude": "78.1108"
    },
    {
        "city_code": "NAMI",
        "region_code": "NAMI",
        "sub_region_code": "NAMI",
        "region_slug": "namchi",
        "latitude": "27.167",
        "longitude": "88.3652"
    },
    {
        "city_code": "RAMS",
        "region_code": "RAMS",
        "sub_region_code": "RAMS",
        "region_slug": "namkhana",
        "latitude": "21.7699",
        "longitude": "88.2315"
    },
    {
        "city_code": "NAMS",
        "region_code": "NAMS",
        "sub_region_code": "NAMS",
        "region_slug": "namsai",
        "latitude": "27.6692",
        "longitude": "95.8644"
    },
    {
        "city_code": "NAKM",
        "region_code": "NAKM",
        "sub_region_code": "NAKM",
        "region_slug": "nandakumar",
        "latitude": "22.188597",
        "longitude": "87.919014"
    },
    {
        "city_code": "NAND",
        "region_code": "NAND",
        "sub_region_code": "NAND",
        "region_slug": "nanded",
        "latitude": "19.153061",
        "longitude": "77.305847"
    },
    {
        "city_code": "NDGM",
        "region_code": "NDGM",
        "sub_region_code": "NDGM",
        "region_slug": "nandigama",
        "latitude": "16.772621",
        "longitude": "80.286005"
    },
    {
        "city_code": "NDKT",
        "region_code": "NDKT",
        "sub_region_code": "NDKT",
        "region_slug": "nandikotkur",
        "latitude": "15.8556",
        "longitude": "78.2646"
    },
    {
        "city_code": "NANZ",
        "region_code": "NANZ",
        "sub_region_code": "NANZ",
        "region_slug": "nandipet",
        "latitude": "18.8786",
        "longitude": "78.1498"
    },
    {
        "city_code": "NDNB",
        "region_code": "NDNB",
        "sub_region_code": "NDNB",
        "region_slug": "nandurbar",
        "latitude": "21.375731",
        "longitude": "74.246417"
    },
    {
        "city_code": "NADY",
        "region_code": "NADY",
        "sub_region_code": "NADY",
        "region_slug": "nandyal",
        "latitude": "15.4786",
        "longitude": "78.4831"
    },
    {
        "city_code": "NADY",
        "region_code": "NADY",
        "sub_region_code": "ALGD",
        "region_slug": "allagadda",
        "latitude": "15.0735",
        "longitude": "78.2824"
    },
    {
        "city_code": "NJGU",
        "region_code": "NJGU",
        "sub_region_code": "NJGU",
        "region_slug": "nanjanagudu",
        "latitude": "12.12",
        "longitude": "76.6801"
    },
    {
        "city_code": "NANP",
        "region_code": "NANP",
        "sub_region_code": "NANP",
        "region_slug": "nanpara",
        "latitude": "27.8675",
        "longitude": "81.4993"
    },
    {
        "city_code": "NRPT",
        "region_code": "NRPT",
        "sub_region_code": "NRPT",
        "region_slug": "narasannapeta",
        "latitude": "18.4164",
        "longitude": "84.0459"
    },
    {
        "city_code": "NARY",
        "region_code": "NARY",
        "sub_region_code": "NARY",
        "region_slug": "narayankhed",
        "latitude": "18.0328",
        "longitude": "77.7732"
    },
    {
        "city_code": "NRYN",
        "region_code": "NRYN",
        "sub_region_code": "NRYN",
        "region_slug": "narayanpet",
        "latitude": "16.7445",
        "longitude": "77.496"
    },
    {
        "city_code": "NRYA",
        "region_code": "NRYA",
        "sub_region_code": "NRYA",
        "region_slug": "narayanpur",
        "latitude": "19.4524",
        "longitude": "81.2519"
    },
    {
        "city_code": "NSAZ",
        "region_code": "NSAZ",
        "sub_region_code": "NSAZ",
        "region_slug": "narayanpur-assam",
        "latitude": "26.952",
        "longitude": "93.8561"
    },
    {
        "city_code": "NRYA",
        "region_code": "NRYA",
        "sub_region_code": "NRYA",
        "region_slug": "narayanpur-ch",
        "latitude": "19.4524",
        "longitude": "81.2519"
    },
    {
        "city_code": "NRGD",
        "region_code": "NRGD",
        "sub_region_code": "NRGD",
        "region_slug": "nargund",
        "latitude": "15.7214",
        "longitude": "75.3849"
    },
    {
        "city_code": "NARN",
        "region_code": "NARN",
        "sub_region_code": "NARN",
        "region_slug": "narnaul",
        "latitude": "28.0658",
        "longitude": "76.1015"
    },
    {
        "city_code": "NASP",
        "region_code": "NASP",
        "sub_region_code": "NASP",
        "region_slug": "narsampet",
        "latitude": "17.9281",
        "longitude": "79.8945"
    },
    {
        "city_code": "NARP",
        "region_code": "NARP",
        "sub_region_code": "NARP",
        "region_slug": "narsapur",
        "latitude": "16.433",
        "longitude": "81.6966"
    },
    {
        "city_code": "NRPR",
        "region_code": "NRPR",
        "sub_region_code": "NRPR",
        "region_slug": "narsapur-medak",
        "latitude": "17.7394",
        "longitude": "78.2846"
    },
    {
        "city_code": "NARR",
        "region_code": "NARR",
        "sub_region_code": "NARR",
        "region_slug": "narsinghpur",
        "latitude": "22.9113",
        "longitude": "79.1097"
    },
    {
        "city_code": "NARS",
        "region_code": "NARS",
        "sub_region_code": "NARS",
        "region_slug": "narsipatnam",
        "latitude": "17.6664",
        "longitude": "82.6105"
    },
    {
        "city_code": "NARA",
        "region_code": "NARA",
        "sub_region_code": "NARA",
        "region_slug": "narwana",
        "latitude": "29.590949",
        "longitude": "76.114698"
    },
    {
        "city_code": "NASK",
        "region_code": "NASK",
        "sub_region_code": "NASK",
        "region_slug": "nashik",
        "latitude": "20.0014",
        "longitude": "73.7869"
    },
    {
        "city_code": "NATH",
        "region_code": "NATH",
        "sub_region_code": "NATH",
        "region_slug": "natham",
        "latitude": "10.2222",
        "longitude": "78.2334"
    },
    {
        "city_code": "NATW",
        "region_code": "NATW",
        "sub_region_code": "NATW",
        "region_slug": "nathdwara",
        "latitude": "24.932",
        "longitude": "73.8191"
    },
    {
        "city_code": "NAUT",
        "region_code": "NAUT",
        "sub_region_code": "NAUT",
        "region_slug": "nautanwa",
        "latitude": "27.424166",
        "longitude": "83.427002"
    },
    {
        "city_code": "NVSR",
        "region_code": "NVSR",
        "sub_region_code": "NVSR",
        "region_slug": "navsari",
        "latitude": "20.946849",
        "longitude": "72.950914"
    },
    {
        "city_code": "NAWD",
        "region_code": "NAWD",
        "sub_region_code": "NAWD",
        "region_slug": "nawada",
        "latitude": "24.890653",
        "longitude": "85.499725"
    },
    {
        "city_code": "NANA",
        "region_code": "NANA",
        "sub_region_code": "NANA",
        "region_slug": "nawalgarh",
        "latitude": "27.8454",
        "longitude": "75.2546"
    },
    {
        "city_code": "NAVN",
        "region_code": "NAVN",
        "sub_region_code": "NAVN",
        "region_slug": "nawanshahr",
        "latitude": "31.124325",
        "longitude": "76.114783"
    },
    {
        "city_code": "NAWA",
        "region_code": "NAWA",
        "sub_region_code": "NAWA",
        "region_slug": "nawapara",
        "latitude": "20.982144",
        "longitude": "81.855582"
    },
    {
        "city_code": "NAYG",
        "region_code": "NAYG",
        "sub_region_code": "NAYG",
        "region_slug": "nayagarh",
        "latitude": "20.1231",
        "longitude": "85.1038"
    },
    {
        "city_code": "NZRA",
        "region_code": "NZRA",
        "sub_region_code": "NZRA",
        "region_slug": "nazira",
        "latitude": "26.905893",
        "longitude": "94.653294"
    },
    {
        "city_code": "NAZR",
        "region_code": "NAZR",
        "sub_region_code": "NAZR",
        "region_slug": "nazirpur",
        "latitude": "23.874044",
        "longitude": "88.523819"
    },
    {
        "city_code": "NEDM",
        "region_code": "NEDM",
        "sub_region_code": "NEDM",
        "region_slug": "nedumbassery",
        "latitude": "10.167786",
        "longitude": "76.355097"
    },
    {
        "city_code": "NEDU",
        "region_code": "NEDU",
        "sub_region_code": "NEDU",
        "region_slug": "nedumkandam",
        "latitude": "9.8363",
        "longitude": "77.1571"
    },
    {
        "city_code": "NELP",
        "region_code": "NELP",
        "sub_region_code": "NELP",
        "region_slug": "neelapalli",
        "latitude": "16.7349",
        "longitude": "82.2271"
    },
    {
        "city_code": "NEEM",
        "region_code": "NEEM",
        "sub_region_code": "NEEM",
        "region_slug": "neemrana",
        "latitude": "27.9854",
        "longitude": "76.3827"
    },
    {
        "city_code": "NMCH",
        "region_code": "NMCH",
        "sub_region_code": "NMCH",
        "region_slug": "neemuch",
        "latitude": "24.4764",
        "longitude": "74.8624"
    },
    {
        "city_code": "NELA",
        "region_code": "NELA",
        "sub_region_code": "NELA",
        "region_slug": "nelakondapalli",
        "latitude": "17.1009",
        "longitude": "80.0507"
    },
    {
        "city_code": "NMGL",
        "region_code": "NMGL",
        "sub_region_code": "NMGL",
        "region_slug": "nelamangala",
        "latitude": "13.0874",
        "longitude": "77.411"
    },
    {
        "city_code": "NLEM",
        "region_code": "NLEM",
        "sub_region_code": "NLEM",
        "region_slug": "nellimarla",
        "latitude": "18.1649",
        "longitude": "83.451"
    },
    {
        "city_code": "NELL",
        "region_code": "NELL",
        "sub_region_code": "NELL",
        "region_slug": "nellore",
        "latitude": "14.4426",
        "longitude": "79.9865"
    },
    {
        "city_code": "NENM",
        "region_code": "NENM",
        "sub_region_code": "NENM",
        "region_slug": "nemmara",
        "latitude": "10.5934",
        "longitude": "76.6006"
    },
    {
        "city_code": "NENM",
        "region_code": "NENM",
        "sub_region_code": "NENM",
        "region_slug": "nenmara",
        "latitude": "10.5934",
        "longitude": "76.6006"
    },
    {
        "city_code": "NEPJ",
        "region_code": "NEPJ",
        "sub_region_code": "NEPJ",
        "region_slug": "nepalgunj",
        "latitude": "28.059325",
        "longitude": "81.61159"
    },
    {
        "city_code": "NERP",
        "region_code": "NERP",
        "sub_region_code": "NERP",
        "region_slug": "ner-parsopant",
        "latitude": "20.4913",
        "longitude": "77.8669"
    },
    {
        "city_code": "NERA",
        "region_code": "NERA",
        "sub_region_code": "NERA",
        "region_slug": "neral",
        "latitude": "19.023",
        "longitude": "73.3175"
    },
    {
        "city_code": "TEHR",
        "region_code": "TEHR",
        "sub_region_code": "TEHR",
        "region_slug": "new-tehri",
        "latitude": "30.3739",
        "longitude": "78.4325"
    },
    {
        "city_code": "NYVL",
        "region_code": "NYVL",
        "sub_region_code": "NYVL",
        "region_slug": "neyveli",
        "latitude": "11.5432",
        "longitude": "79.476"
    },
    {
        "city_code": "NCUL",
        "region_code": "NCUL",
        "sub_region_code": "NCUL",
        "region_slug": "nichlaul",
        "latitude": "27.3092",
        "longitude": "83.7252"
    },
    {
        "city_code": "NDVD",
        "region_code": "NDVD",
        "sub_region_code": "NDVD",
        "region_slug": "nidadavolu",
        "latitude": "16.9016",
        "longitude": "81.6638"
    },
    {
        "city_code": "NIGA",
        "region_code": "NIGA",
        "sub_region_code": "NIGA",
        "region_slug": "nilagiri",
        "latitude": "21.4619",
        "longitude": "86.7567"
    },
    {
        "city_code": "NILA",
        "region_code": "NILA",
        "sub_region_code": "NILA",
        "region_slug": "nilakottai",
        "latitude": "10.1655",
        "longitude": "77.8525"
    },
    {
        "city_code": "NLNG",
        "region_code": "NLNG",
        "sub_region_code": "NLNG",
        "region_slug": "nilanga",
        "latitude": "18.125875",
        "longitude": "76.750969"
    },
    {
        "city_code": "NIMA",
        "region_code": "NIMA",
        "sub_region_code": "NIMA",
        "region_slug": "nimapara",
        "latitude": "20.0537",
        "longitude": "86.0071"
    },
    {
        "city_code": "NIPA",
        "region_code": "NIPA",
        "sub_region_code": "NIPA",
        "region_slug": "nimbahera",
        "latitude": "24.6257",
        "longitude": "74.681"
    },
    {
        "city_code": "NNDR",
        "region_code": "NNDR",
        "sub_region_code": "NNDR",
        "region_slug": "nindra",
        "latitude": "13.3618",
        "longitude": "79.7007"
    },
    {
        "city_code": "NIPN",
        "region_code": "NIPN",
        "sub_region_code": "NIPN",
        "region_slug": "nipani",
        "latitude": "16.407409",
        "longitude": "74.376458"
    },
    {
        "city_code": "NIPD",
        "region_code": "NIPD",
        "sub_region_code": "NIPD",
        "region_slug": "niphad",
        "latitude": "20.08",
        "longitude": "74.1093"
    },
    {
        "city_code": "NIRJ",
        "region_code": "NIRJ",
        "sub_region_code": "NIRJ",
        "region_slug": "nirjuli",
        "latitude": "27.123694",
        "longitude": "93.737669"
    },
    {
        "city_code": "NIZA",
        "region_code": "NIZA",
        "sub_region_code": "NIZA",
        "region_slug": "nizamabad",
        "latitude": "18.6833",
        "longitude": "78.1"
    },
    {
        "city_code": "NKHA",
        "region_code": "NKHA",
        "sub_region_code": "NKHA",
        "region_slug": "nokha",
        "latitude": "27.5562",
        "longitude": "73.4732"
    },
    {
        "city_code": "NOOR",
        "region_code": "NOOR",
        "sub_region_code": "NOOR",
        "region_slug": "nooranad",
        "latitude": "9.1637",
        "longitude": "76.6429"
    },
    {
        "city_code": "NURP",
        "region_code": "NURP",
        "sub_region_code": "NURP",
        "region_slug": "nurpur",
        "latitude": "32.300133",
        "longitude": "75.885345"
    },
    {
        "city_code": "NZVD",
        "region_code": "NZVD",
        "sub_region_code": "NZVD",
        "region_slug": "nuzvid",
        "latitude": "16.787527",
        "longitude": "80.848968"
    },
    {
        "city_code": "NYNT",
        "region_code": "NYNT",
        "sub_region_code": "NYNT",
        "region_slug": "nyamathi",
        "latitude": "14.150287",
        "longitude": "75.565445"
    },
    {
        "city_code": "ODDA",
        "region_code": "ODDA",
        "sub_region_code": "ODDA",
        "region_slug": "oddanchatram",
        "latitude": "10.4851",
        "longitude": "77.7481"
    },
    {
        "city_code": "OKAH",
        "region_code": "OKAH",
        "sub_region_code": "OKAH",
        "region_slug": "okha",
        "latitude": "22.455182",
        "longitude": "69.071194"
    },
    {
        "city_code": "ONGL",
        "region_code": "ONGL",
        "sub_region_code": "ONGL",
        "region_slug": "ongole",
        "latitude": "15.5057",
        "longitude": "80.0499"
    },
    {
        "city_code": "OOTY",
        "region_code": "OOTY",
        "sub_region_code": "OOTY",
        "region_slug": "ooty",
        "latitude": "11.4064",
        "longitude": "76.6932"
    },
    {
        "city_code": "ORAI",
        "region_code": "ORAI",
        "sub_region_code": "ORAI",
        "region_slug": "orai",
        "latitude": "25.9875",
        "longitude": "79.4489"
    },
    {
        "city_code": "ORHH",
        "region_code": "ORHH",
        "sub_region_code": "ORHH",
        "region_slug": "orchha",
        "latitude": "25.3683",
        "longitude": "78.6285"
    },
    {
        "city_code": "OSMA",
        "region_code": "OSMA",
        "sub_region_code": "OSMA",
        "region_slug": "osmanabad",
        "latitude": "18.207",
        "longitude": "76.1784"
    },
    {
        "city_code": "OTTP",
        "region_code": "OTTP",
        "sub_region_code": "OTTP",
        "region_slug": "ottapalam",
        "latitude": "10.7723",
        "longitude": "76.3695"
    },
    {
        "city_code": "PDHR",
        "region_code": "PDHR",
        "sub_region_code": "PDHR",
        "region_slug": "p-dharmavaram",
        "latitude": "17.4745",
        "longitude": "82.7786"
    },
    {
        "city_code": "PADA",
        "region_code": "PADA",
        "sub_region_code": "PADA",
        "region_slug": "padampur",
        "latitude": "29.7075",
        "longitude": "73.6257"
    },
    {
        "city_code": "PADR",
        "region_code": "PADR",
        "sub_region_code": "PADR",
        "region_slug": "padrauna",
        "latitude": "26.8984",
        "longitude": "83.9797"
    },
    {
        "city_code": "PUYI",
        "region_code": "PUYI",
        "sub_region_code": "PUYI",
        "region_slug": "padubidri",
        "latitude": "13.1408",
        "longitude": "74.7721"
    },
    {
        "city_code": "PAKA",
        "region_code": "PAKA",
        "sub_region_code": "PAKA",
        "region_slug": "pakala",
        "latitude": "13.4505",
        "longitude": "79.1165"
    },
    {
        "city_code": "PALL",
        "region_code": "PALL",
        "sub_region_code": "PALL",
        "region_slug": "pala",
        "latitude": "9.7138",
        "longitude": "76.6829"
    },
    {
        "city_code": "PLKK",
        "region_code": "PLKK",
        "sub_region_code": "PLKK",
        "region_slug": "palakkad",
        "latitude": "10.7867",
        "longitude": "76.6548"
    },
    {
        "city_code": "PLKL",
        "region_code": "PLKL",
        "sub_region_code": "PLKL",
        "region_slug": "palakollu",
        "latitude": "16.5175",
        "longitude": "81.7253"
    },
    {
        "city_code": "PALK",
        "region_code": "PALK",
        "sub_region_code": "PALK",
        "region_slug": "palakonda",
        "latitude": "18.6007",
        "longitude": "83.7576"
    },
    {
        "city_code": "PLAT",
        "region_code": "PLAT",
        "sub_region_code": "PLAT",
        "region_slug": "palakurthy",
        "latitude": "17.6599",
        "longitude": "79.4311"
    },
    {
        "city_code": "PLMN",
        "region_code": "PLMN",
        "sub_region_code": "PLMN",
        "region_slug": "palamaner",
        "latitude": "13.1949",
        "longitude": "78.7474"
    },
    {
        "city_code": "PALM",
        "region_code": "PALM",
        "sub_region_code": "PALM",
        "region_slug": "palampur",
        "latitude": "32.1109",
        "longitude": "76.5363"
    },
    {
        "city_code": "PALA",
        "region_code": "PALA",
        "sub_region_code": "PALA",
        "region_slug": "palani",
        "latitude": "10.4489",
        "longitude": "77.5209"
    },
    {
        "city_code": "PALN",
        "region_code": "PALN",
        "sub_region_code": "PALN",
        "region_slug": "palanpur",
        "latitude": "24.171181",
        "longitude": "72.438393"
    },
    {
        "city_code": "PALT",
        "region_code": "PALT",
        "sub_region_code": "PALT",
        "region_slug": "palapetty",
        "latitude": "10.3628",
        "longitude": "76.1175"
    },
    {
        "city_code": "PALS",
        "region_code": "PALS",
        "sub_region_code": "PALS",
        "region_slug": "palasa",
        "latitude": "18.7747",
        "longitude": "84.4094"
    },
    {
        "city_code": "PALG",
        "region_code": "PALG",
        "sub_region_code": "PALG",
        "region_slug": "palghar",
        "latitude": "19.6936",
        "longitude": "72.7655"
    },
    {
        "city_code": "PAAL",
        "region_code": "PAAL",
        "sub_region_code": "PAAL",
        "region_slug": "pali",
        "latitude": "25.7711",
        "longitude": "73.3234"
    },
    {
        "city_code": "PAKN",
        "region_code": "PAKN",
        "sub_region_code": "PAKN",
        "region_slug": "palia-kalan",
        "latitude": "28.435954",
        "longitude": "80.571446"
    },
    {
        "city_code": "PALI",
        "region_code": "PALI",
        "sub_region_code": "PALI",
        "region_slug": "palitana",
        "latitude": "21.5346",
        "longitude": "71.8275"
    },
    {
        "city_code": "PLDM",
        "region_code": "PLDM",
        "sub_region_code": "PLDM",
        "region_slug": "palladam",
        "latitude": "10.9957",
        "longitude": "77.2795"
    },
    {
        "city_code": "PKTU",
        "region_code": "PKTU",
        "sub_region_code": "PKTU",
        "region_slug": "pallickathodu",
        "latitude": "9.6042",
        "longitude": "76.6813"
    },
    {
        "city_code": "PLLI",
        "region_code": "PLLI",
        "sub_region_code": "PLLI",
        "region_slug": "pallipalayam",
        "latitude": "11.375",
        "longitude": "77.7509"
    },
    {
        "city_code": "PALY",
        "region_code": "PALY",
        "sub_region_code": "PALY",
        "region_slug": "palluruthy",
        "latitude": "9.9087",
        "longitude": "76.273"
    },
    {
        "city_code": "PLWL",
        "region_code": "PLWL",
        "sub_region_code": "PLWL",
        "region_slug": "palwal",
        "latitude": "28.1487",
        "longitude": "77.332"
    },
    {
        "city_code": "PLWA",
        "region_code": "PLWA",
        "sub_region_code": "PLWA",
        "region_slug": "palwancha",
        "latitude": "18.3198",
        "longitude": "78.4359"
    },
    {
        "city_code": "PAMA",
        "region_code": "PAMA",
        "sub_region_code": "PAMA",
        "region_slug": "pamarru",
        "latitude": "16.323",
        "longitude": "80.9612"
    },
    {
        "city_code": "PAMI",
        "region_code": "PAMI",
        "sub_region_code": "PAMI",
        "region_slug": "pamidi",
        "latitude": "14.952117",
        "longitude": "77.594795"
    },
    {
        "city_code": "PMMR",
        "region_code": "PMMR",
        "sub_region_code": "PMMR",
        "region_slug": "pamuru",
        "latitude": "15.09612",
        "longitude": "79.41102"
    },
    {
        "city_code": "PAMO",
        "region_code": "PAMO",
        "sub_region_code": "PAMO",
        "region_slug": "panachamoodu",
        "latitude": "8.4281",
        "longitude": "77.1956"
    },
    {
        "city_code": "PANA",
        "region_code": "PANA",
        "sub_region_code": "PANA",
        "region_slug": "panaji",
        "latitude": "15.4909",
        "longitude": "73.8278"
    },
    {
        "city_code": "PANP",
        "region_code": "PANP",
        "sub_region_code": "PANP",
        "region_slug": "panapakkam",
        "latitude": "12.9225",
        "longitude": "79.5674"
    },
    {
        "city_code": "PANC",
        "region_code": "PANC",
        "sub_region_code": "PANC",
        "region_slug": "panchgani",
        "latitude": "17.9236",
        "longitude": "73.7983"
    },
    {
        "city_code": "PNCH",
        "region_code": "PNCH",
        "sub_region_code": "PNCH",
        "region_slug": "panchkula",
        "latitude": "30.6942",
        "longitude": "76.8606"
    },
    {
        "city_code": "PADM",
        "region_code": "PADM",
        "sub_region_code": "PADM",
        "region_slug": "pandalam",
        "latitude": "9.2251",
        "longitude": "76.6785"
    },
    {
        "city_code": "PAVA",
        "region_code": "PAVA",
        "sub_region_code": "PAVA",
        "region_slug": "pandavapura",
        "latitude": "12.4929",
        "longitude": "76.6643"
    },
    {
        "city_code": "PAND",
        "region_code": "PAND",
        "sub_region_code": "PAND",
        "region_slug": "pandhana",
        "latitude": "21.6948",
        "longitude": "76.2204"
    },
    {
        "city_code": "PANR",
        "region_code": "PANR",
        "sub_region_code": "PANR",
        "region_slug": "pandharkawada",
        "latitude": "20.023",
        "longitude": "78.549"
    },
    {
        "city_code": "PNDH",
        "region_code": "PNDH",
        "sub_region_code": "PNDH",
        "region_slug": "pandharpur",
        "latitude": "17.6746",
        "longitude": "75.3237"
    },
    {
        "city_code": "PANU",
        "region_code": "PANU",
        "sub_region_code": "PANU",
        "region_slug": "pandua",
        "latitude": "23.082645",
        "longitude": "88.27252"
    },
    {
        "city_code": "PAN",
        "region_code": "PAN",
        "sub_region_code": "PAN",
        "region_slug": "panipat",
        "latitude": "29.391126",
        "longitude": "76.962233"
    },
    {
        "city_code": "PANN",
        "region_code": "PANN",
        "sub_region_code": "PANN",
        "region_slug": "panna",
        "latitude": "24.718",
        "longitude": "80.1819"
    },
    {
        "city_code": "PANT",
        "region_code": "PANT",
        "sub_region_code": "PANT",
        "region_slug": "panruti",
        "latitude": "11.7666",
        "longitude": "79.5629"
    },
    {
        "city_code": "PNSM",
        "region_code": "PNSM",
        "sub_region_code": "PNSM",
        "region_slug": "pansemal",
        "latitude": "21.6582",
        "longitude": "74.6971"
    },
    {
        "city_code": "POTA",
        "region_code": "POTA",
        "sub_region_code": "POTA",
        "region_slug": "paonta-sahib",
        "latitude": "30.4453",
        "longitude": "77.6021"
    },
    {
        "city_code": "PAPA",
        "region_code": "PAPA",
        "sub_region_code": "PAPA",
        "region_slug": "papanasam",
        "latitude": "10.9252",
        "longitude": "79.2708"
    },
    {
        "city_code": "PARD",
        "region_code": "PARD",
        "sub_region_code": "PARD",
        "region_slug": "paradeep",
        "latitude": "20.285819",
        "longitude": "86.622047"
    },
    {
        "city_code": "PRKM",
        "region_code": "PRKM",
        "sub_region_code": "PRKM",
        "region_slug": "paralakhemundi",
        "latitude": "18.7783",
        "longitude": "84.0936"
    },
    {
        "city_code": "PAVP",
        "region_code": "PAVP",
        "sub_region_code": "PAVP",
        "region_slug": "parappanangadi",
        "latitude": "11.054",
        "longitude": "75.8555"
    },
    {
        "city_code": "PARA",
        "region_code": "PARA",
        "sub_region_code": "PARA",
        "region_slug": "paratwada",
        "latitude": "21.2576",
        "longitude": "77.5087"
    },
    {
        "city_code": "PARB",
        "region_code": "PARB",
        "sub_region_code": "PARB",
        "region_slug": "parbhani",
        "latitude": "19.261063",
        "longitude": "76.775894"
    },
    {
        "city_code": "PARC",
        "region_code": "PARC",
        "sub_region_code": "PARC",
        "region_slug": "parchur",
        "latitude": "15.9639",
        "longitude": "80.2739"
    },
    {
        "city_code": "PARI",
        "region_code": "PARI",
        "sub_region_code": "PARI",
        "region_slug": "parigi-telangana",
        "latitude": "13.8865",
        "longitude": "77.4659"
    },
    {
        "city_code": "PARL",
        "region_code": "PARL",
        "sub_region_code": "PARL",
        "region_slug": "parkal",
        "latitude": "18.1977",
        "longitude": "79.7027"
    },
    {
        "city_code": "PRLI",
        "region_code": "PRLI",
        "sub_region_code": "PRLI",
        "region_slug": "parli",
        "latitude": "18.855867",
        "longitude": "76.488441"
    },
    {
        "city_code": "PRVT",
        "region_code": "PRVT",
        "sub_region_code": "PRVT",
        "region_slug": "parvathipuram",
        "latitude": "18.7817",
        "longitude": "83.4268"
    },
    {
        "city_code": "PARW",
        "region_code": "PARW",
        "sub_region_code": "PARW",
        "region_slug": "parwanoo",
        "latitude": "30.8372",
        "longitude": "76.9614"
    },
    {
        "city_code": "PSHG",
        "region_code": "PSHG",
        "sub_region_code": "PSHG",
        "region_slug": "pasighat",
        "latitude": "28.0667",
        "longitude": "95.3275"
    },
    {
        "city_code": "PATA",
        "region_code": "PATA",
        "sub_region_code": "PATA",
        "region_slug": "patan",
        "latitude": "23.849204",
        "longitude": "72.125502"
    },
    {
        "city_code": "PATM",
        "region_code": "PATM",
        "sub_region_code": "PATM",
        "region_slug": "patan-satara",
        "latitude": "17.3735",
        "longitude": "73.8992"
    },
    {
        "city_code": "PAHT",
        "region_code": "PAHT",
        "sub_region_code": "PAHT",
        "region_slug": "pathalgaon",
        "latitude": "22.5564",
        "longitude": "83.461"
    },
    {
        "city_code": "PTNM",
        "region_code": "PTNM",
        "sub_region_code": "PTNM",
        "region_slug": "pathanamthitta",
        "latitude": "9.2601",
        "longitude": "76.9643"
    },
    {
        "city_code": "PTPM",
        "region_code": "PTPM",
        "sub_region_code": "PTPM",
        "region_slug": "pathanapuram",
        "latitude": "9.0927",
        "longitude": "76.8612"
    },
    {
        "city_code": "PATH",
        "region_code": "PATH",
        "sub_region_code": "PATH",
        "region_slug": "pathankot",
        "latitude": "32.27064",
        "longitude": "75.642554"
    },
    {
        "city_code": "PTPT",
        "region_code": "PTPT",
        "sub_region_code": "PTPT",
        "region_slug": "pathapatnam",
        "latitude": "18.7505",
        "longitude": "84.0916"
    },
    {
        "city_code": "PATS",
        "region_code": "PATS",
        "sub_region_code": "PATS",
        "region_slug": "pathsala",
        "latitude": "26.5119",
        "longitude": "91.1809"
    },
    {
        "city_code": "PATI",
        "region_code": "PATI",
        "sub_region_code": "PATI",
        "region_slug": "patiala",
        "latitude": "30.32062",
        "longitude": "76.395126"
    },
    {
        "city_code": "PATN",
        "region_code": "PATN",
        "sub_region_code": "PATN",
        "region_slug": "patna",
        "latitude": "25.61046",
        "longitude": "85.141667"
    },
    {
        "city_code": "PATR",
        "region_code": "PATR",
        "sub_region_code": "PATR",
        "region_slug": "patran",
        "latitude": "29.9593",
        "longitude": "76.0566"
    },
    {
        "city_code": "PARY",
        "region_code": "PARY",
        "sub_region_code": "PARY",
        "region_slug": "patratu",
        "latitude": "23.6329",
        "longitude": "85.3033"
    },
    {
        "city_code": "PTMB",
        "region_code": "PTMB",
        "sub_region_code": "PTMB",
        "region_slug": "pattambi",
        "latitude": "10.8068",
        "longitude": "76.1965"
    },
    {
        "city_code": "PATU",
        "region_code": "PATU",
        "sub_region_code": "PATU",
        "region_slug": "pattukkottai",
        "latitude": "10.4253",
        "longitude": "79.314"
    },
    {
        "city_code": "PAGD",
        "region_code": "PAGD",
        "sub_region_code": "PAGD",
        "region_slug": "pavagada",
        "latitude": "14.1031",
        "longitude": "77.2807"
    },
    {
        "city_code": "PATE",
        "region_code": "PATE",
        "sub_region_code": "PATE",
        "region_slug": "payakaraopeta",
        "latitude": "17.3617",
        "longitude": "82.5592"
    },
    {
        "city_code": "PAYY",
        "region_code": "PAYY",
        "sub_region_code": "PAYY",
        "region_slug": "payyanur",
        "latitude": "12.1051",
        "longitude": "75.2058"
    },
    {
        "city_code": "PAYO",
        "region_code": "PAYO",
        "sub_region_code": "PAYO",
        "region_slug": "payyoli",
        "latitude": "11.5129",
        "longitude": "75.6179"
    },
    {
        "city_code": "PLYN",
        "region_code": "PLYN",
        "sub_region_code": "PLYN",
        "region_slug": "pazhayannur",
        "latitude": "10.6824",
        "longitude": "76.423"
    },
    {
        "city_code": "PEIR",
        "region_code": "PEIR",
        "sub_region_code": "PEIR",
        "region_slug": "pebbair",
        "latitude": "16.2074",
        "longitude": "77.9932"
    },
    {
        "city_code": "PEDZ",
        "region_code": "PEDZ",
        "sub_region_code": "PEDZ",
        "region_slug": "pedana",
        "latitude": "16.2579",
        "longitude": "81.1444"
    },
    {
        "city_code": "PEDN",
        "region_code": "PEDN",
        "sub_region_code": "PEDN",
        "region_slug": "pedanandipadu",
        "latitude": "16.071",
        "longitude": "80.3297"
    },
    {
        "city_code": "PEDD",
        "region_code": "PEDD",
        "sub_region_code": "PEDD",
        "region_slug": "pedapadu",
        "latitude": "16.637",
        "longitude": "81.0334"
    },
    {
        "city_code": "PEDA",
        "region_code": "PEDA",
        "sub_region_code": "PEDA",
        "region_slug": "peddapalli",
        "latitude": "18.6151",
        "longitude": "79.3827"
    },
    {
        "city_code": "PEDP",
        "region_code": "PEDP",
        "sub_region_code": "PEDP",
        "region_slug": "peddapuram",
        "latitude": "17.0757",
        "longitude": "82.136"
    },
    {
        "city_code": "PEN",
        "region_code": "PEN",
        "sub_region_code": "PEN",
        "region_slug": "pen",
        "latitude": "18.737532",
        "longitude": "73.094415"
    },
    {
        "city_code": "PEND",
        "region_code": "PEND",
        "sub_region_code": "PEND",
        "region_slug": "pendra",
        "latitude": "22.7774",
        "longitude": "81.9562"
    },
    {
        "city_code": "PENM",
        "region_code": "PENM",
        "sub_region_code": "PENM",
        "region_slug": "pennagaram",
        "latitude": "12.1334",
        "longitude": "77.8967"
    },
    {
        "city_code": "PENU",
        "region_code": "PENU",
        "sub_region_code": "PENU",
        "region_slug": "penuganchiprolu",
        "latitude": "16.9017",
        "longitude": "80.2475"
    },
    {
        "city_code": "PDDG",
        "region_code": "PDDG",
        "sub_region_code": "PDDG",
        "region_slug": "penugonda",
        "latitude": "16.6547",
        "longitude": "81.7445"
    },
    {
        "city_code": "PERL",
        "region_code": "PERL",
        "sub_region_code": "PERL",
        "region_slug": "peralam",
        "latitude": "10.9612",
        "longitude": "79.66"
    },
    {
        "city_code": "PERA",
        "region_code": "PERA",
        "sub_region_code": "PERA",
        "region_slug": "perambalur",
        "latitude": "11.2266",
        "longitude": "78.9288"
    },
    {
        "city_code": "PPVR",
        "region_code": "PPVR",
        "sub_region_code": "PPVR",
        "region_slug": "peravoor",
        "latitude": "11.8962",
        "longitude": "75.7342"
    },
    {
        "city_code": "PRGM",
        "region_code": "PRGM",
        "sub_region_code": "PRGM",
        "region_slug": "peringamala",
        "latitude": "8.76973",
        "longitude": "77.034264"
    },
    {
        "city_code": "PERN",
        "region_code": "PERN",
        "sub_region_code": "PERN",
        "region_slug": "peringottukurissi",
        "latitude": "10.7527",
        "longitude": "76.4881"
    },
    {
        "city_code": "PNTM",
        "region_code": "PNTM",
        "sub_region_code": "PNTM",
        "region_slug": "perinthalmanna",
        "latitude": "10.9755",
        "longitude": "76.2305"
    },
    {
        "city_code": "PERI",
        "region_code": "PERI",
        "sub_region_code": "PERI",
        "region_slug": "periyapatna",
        "latitude": "12.3374",
        "longitude": "76.0987"
    },
    {
        "city_code": "PERM",
        "region_code": "PERM",
        "sub_region_code": "PERM",
        "region_slug": "pernambut",
        "latitude": "12.9393",
        "longitude": "78.719"
    },
    {
        "city_code": "PEDR",
        "region_code": "PEDR",
        "sub_region_code": "PEDR",
        "region_slug": "perundurai",
        "latitude": "11.2758",
        "longitude": "77.583"
    },
    {
        "city_code": "PETL",
        "region_code": "PETL",
        "sub_region_code": "PETL",
        "region_slug": "petlad",
        "latitude": "22.4836",
        "longitude": "72.8014"
    },
    {
        "city_code": "PHAG",
        "region_code": "PHAG",
        "sub_region_code": "PHAG",
        "region_slug": "phagwara",
        "latitude": "31.224",
        "longitude": "75.7708"
    },
    {
        "city_code": "PHLD",
        "region_code": "PHLD",
        "sub_region_code": "PHLD",
        "region_slug": "phalodi",
        "latitude": "27.1312",
        "longitude": "72.3589"
    },
    {
        "city_code": "PHAL",
        "region_code": "PHAL",
        "sub_region_code": "PHAL",
        "region_slug": "phaltan",
        "latitude": "17.9845",
        "longitude": "74.436"
    },
    {
        "city_code": "PHBN",
        "region_code": "PHBN",
        "sub_region_code": "PHBN",
        "region_slug": "phulbani",
        "latitude": "20.4797",
        "longitude": "84.2331"
    },
    {
        "city_code": "PIDU",
        "region_code": "PIDU",
        "sub_region_code": "PIDU",
        "region_slug": "piduguralla",
        "latitude": "16.4852",
        "longitude": "79.8901"
    },
    {
        "city_code": "PILA",
        "region_code": "PILA",
        "sub_region_code": "PILA",
        "region_slug": "pilani",
        "latitude": "28.3802",
        "longitude": "75.6092"
    },
    {
        "city_code": "PLRU",
        "region_code": "PLRU",
        "sub_region_code": "PLRU",
        "region_slug": "pileru",
        "latitude": "13.6556",
        "longitude": "78.9432"
    },
    {
        "city_code": "PIHI",
        "region_code": "PIHI",
        "sub_region_code": "PIHI",
        "region_slug": "pilibhit",
        "latitude": "28.5835",
        "longitude": "80.0088"
    },
    {
        "city_code": "PPAL",
        "region_code": "PPAL",
        "sub_region_code": "PPAL",
        "region_slug": "pimpalner",
        "latitude": "18.9142",
        "longitude": "74.3907"
    },
    {
        "city_code": "PIMP",
        "region_code": "PIMP",
        "sub_region_code": "PIMP",
        "region_slug": "pimpri",
        "latitude": "18.6298",
        "longitude": "73.7997"
    },
    {
        "city_code": "PINJ",
        "region_code": "PINJ",
        "sub_region_code": "PINJ",
        "region_slug": "pinjore",
        "latitude": "30.797",
        "longitude": "76.9178"
    },
    {
        "city_code": "PIPY",
        "region_code": "PIPY",
        "sub_region_code": "PIPY",
        "region_slug": "pipariya",
        "latitude": "22.762886",
        "longitude": "78.352478"
    },
    {
        "city_code": "PIPR",
        "region_code": "PIPR",
        "sub_region_code": "PIPR",
        "region_slug": "pipraich",
        "latitude": "26.8294",
        "longitude": "83.5294"
    },
    {
        "city_code": "PITH",
        "region_code": "PITH",
        "sub_region_code": "PITH",
        "region_slug": "pithampur",
        "latitude": "22.6133",
        "longitude": "75.6823"
    },
    {
        "city_code": "PITA",
        "region_code": "PITA",
        "sub_region_code": "PITA",
        "region_slug": "pithapuram",
        "latitude": "17.1127",
        "longitude": "82.252828"
    },
    {
        "city_code": "PHOR",
        "region_code": "PHOR",
        "sub_region_code": "PHOR",
        "region_slug": "pithora",
        "latitude": "21.2525",
        "longitude": "82.5159"
    },
    {
        "city_code": "PITO",
        "region_code": "PITO",
        "sub_region_code": "PITO",
        "region_slug": "pithoragarh",
        "latitude": "29.5829",
        "longitude": "80.2182"
    },
    {
        "city_code": "PILM",
        "region_code": "PILM",
        "sub_region_code": "PILM",
        "region_slug": "pitlam",
        "latitude": "18.317835",
        "longitude": "78.347131"
    },
    {
        "city_code": "POCH",
        "region_code": "POCH",
        "sub_region_code": "POCH",
        "region_slug": "pochampally",
        "latitude": "17.3454",
        "longitude": "78.8241"
    },
    {
        "city_code": "PODA",
        "region_code": "PODA",
        "sub_region_code": "PODA",
        "region_slug": "podalakur",
        "latitude": "14.3841",
        "longitude": "79.7324"
    },
    {
        "city_code": "PODI",
        "region_code": "PODI",
        "sub_region_code": "PODI",
        "region_slug": "podili",
        "latitude": "15.607",
        "longitude": "79.6146"
    },
    {
        "city_code": "PLAB",
        "region_code": "PLAB",
        "sub_region_code": "PLAB",
        "region_slug": "polavaram",
        "latitude": "17.2479",
        "longitude": "81.6432"
    },
    {
        "city_code": "POLL",
        "region_code": "POLL",
        "sub_region_code": "POLL",
        "region_slug": "pollachi",
        "latitude": "10.6573",
        "longitude": "77.0107"
    },
    {
        "city_code": "POND",
        "region_code": "POND",
        "sub_region_code": "POND",
        "region_slug": "pondicherry",
        "latitude": "11.931",
        "longitude": "79.7852"
    },
    {
        "city_code": "PONU",
        "region_code": "PONU",
        "sub_region_code": "PONU",
        "region_slug": "ponduru",
        "latitude": "18.3497",
        "longitude": "83.7584"
    },
    {
        "city_code": "PONK",
        "region_code": "PONK",
        "sub_region_code": "PONK",
        "region_slug": "ponkunnam",
        "latitude": "9.5656",
        "longitude": "76.7546"
    },
    {
        "city_code": "PONM",
        "region_code": "PONM",
        "sub_region_code": "PONM",
        "region_slug": "ponnamaravathi",
        "latitude": "10.283563",
        "longitude": "78.540006"
    },
    {
        "city_code": "PONN",
        "region_code": "PONN",
        "sub_region_code": "PONN",
        "region_slug": "ponnani",
        "latitude": "10.767731",
        "longitude": "75.926757"
    },
    {
        "city_code": "PONE",
        "region_code": "PONE",
        "sub_region_code": "PONE",
        "region_slug": "ponneri",
        "latitude": "13.3378",
        "longitude": "80.1929"
    },
    {
        "city_code": "POOV",
        "region_code": "POOV",
        "sub_region_code": "POOV",
        "region_slug": "poovar",
        "latitude": "8.3177",
        "longitude": "77.0708"
    },
    {
        "city_code": "PORB",
        "region_code": "PORB",
        "sub_region_code": "PORB",
        "region_slug": "porbandar",
        "latitude": "21.635461",
        "longitude": "69.630286"
    },
    {
        "city_code": "PORT",
        "region_code": "PORT",
        "sub_region_code": "PORT",
        "region_slug": "port-blair",
        "latitude": "11.6683",
        "longitude": "92.7378"
    },
    {
        "city_code": "PORU",
        "region_code": "PORU",
        "sub_region_code": "PORU",
        "region_slug": "porumamilla",
        "latitude": "14.9994",
        "longitude": "78.9915"
    },
    {
        "city_code": "PTRT",
        "region_code": "PTRT",
        "sub_region_code": "PTRT",
        "region_slug": "pratapgarh-rajasthan",
        "latitude": "24.0317",
        "longitude": "74.7787"
    },
    {
        "city_code": "PRAT",
        "region_code": "PRAT",
        "sub_region_code": "PRAT",
        "region_slug": "pratapgarh-up",
        "latitude": "25.8973",
        "longitude": "81.9453"
    },
    {
        "city_code": "ALLH",
        "region_code": "ALLH",
        "sub_region_code": "ALLH",
        "region_slug": "prayagraj-allahabad",
        "latitude": "25.402247",
        "longitude": "81.731545"
    },
    {
        "city_code": "PROD",
        "region_code": "PROD",
        "sub_region_code": "PROD",
        "region_slug": "proddatur",
        "latitude": "14.7492",
        "longitude": "78.5532"
    },
    {
        "city_code": "PUDH",
        "region_code": "PUDH",
        "sub_region_code": "PUDH",
        "region_slug": "pudukkottai",
        "latitude": "10.379849",
        "longitude": "78.822098"
    },
    {
        "city_code": "PUON",
        "region_code": "PUON",
        "sub_region_code": "PUON",
        "region_slug": "pulgaon",
        "latitude": "20.7238",
        "longitude": "78.3216"
    },
    {
        "city_code": "PAPT",
        "region_code": "PAPT",
        "sub_region_code": "PAPT",
        "region_slug": "puliampatti",
        "latitude": "11.353225",
        "longitude": "77.167951"
    },
    {
        "city_code": "PLVN",
        "region_code": "PLVN",
        "sub_region_code": "PLVN",
        "region_slug": "pulivendula",
        "latitude": "14.4222",
        "longitude": "78.2263"
    },
    {
        "city_code": "PULI",
        "region_code": "PULI",
        "sub_region_code": "PULI",
        "region_slug": "puliyangudi",
        "latitude": "9.1725",
        "longitude": "77.3956"
    },
    {
        "city_code": "PULA",
        "region_code": "PULA",
        "sub_region_code": "PULA",
        "region_slug": "pulluvila",
        "latitude": "8.347412",
        "longitude": "77.037736"
    },
    {
        "city_code": "PULP",
        "region_code": "PULP",
        "sub_region_code": "PULP",
        "region_slug": "pulpally",
        "latitude": "11.792271",
        "longitude": "76.167295"
    },
    {
        "city_code": "PUNA",
        "region_code": "PUNA",
        "sub_region_code": "PUNA",
        "region_slug": "punalur",
        "latitude": "9.0098",
        "longitude": "76.9297"
    },
    {
        "city_code": "PGNR",
        "region_code": "PGNR",
        "sub_region_code": "PGNR",
        "region_slug": "punganur",
        "latitude": "13.3659",
        "longitude": "78.575"
    },
    {
        "city_code": "PURI",
        "region_code": "PURI",
        "sub_region_code": "PURI",
        "region_slug": "puri",
        "latitude": "19.8134",
        "longitude": "85.8315"
    },
    {
        "city_code": "PURN",
        "region_code": "PURN",
        "sub_region_code": "PURN",
        "region_slug": "purnea",
        "latitude": "25.7771",
        "longitude": "87.4753"
    },
    {
        "city_code": "PURU",
        "region_code": "PURU",
        "sub_region_code": "PURU",
        "region_slug": "purulia",
        "latitude": "23.2483",
        "longitude": "86.4997"
    },
    {
        "city_code": "PUSD",
        "region_code": "PUSD",
        "sub_region_code": "PUSD",
        "region_slug": "pusad",
        "latitude": "19.90928",
        "longitude": "77.528328"
    },
    {
        "city_code": "PREG",
        "region_code": "PREG",
        "sub_region_code": "PREG",
        "region_slug": "pusapatirega",
        "latitude": "18.093",
        "longitude": "83.551"
    },
    {
        "city_code": "PUSH",
        "region_code": "PUSH",
        "sub_region_code": "PUSH",
        "region_slug": "pushkar",
        "latitude": "26.4897",
        "longitude": "74.5511"
    },
    {
        "city_code": "PUTH",
        "region_code": "PUTH",
        "sub_region_code": "PUTH",
        "region_slug": "puthenvelikara",
        "latitude": "10.1847",
        "longitude": "76.2421"
    },
    {
        "city_code": "PUTD",
        "region_code": "PUTD",
        "sub_region_code": "PUTD",
        "region_slug": "puthenvelikkara",
        "latitude": "10.1847",
        "longitude": "76.2421"
    },
    {
        "city_code": "PUTR",
        "region_code": "PUTR",
        "sub_region_code": "PUTR",
        "region_slug": "puthoor",
        "latitude": "9.0425",
        "longitude": "76.7134"
    },
    {
        "city_code": "PUTT",
        "region_code": "PUTT",
        "sub_region_code": "PUTT",
        "region_slug": "puttur-andhra-pradesh",
        "latitude": "13.4384",
        "longitude": "79.5519"
    },
    {
        "city_code": "PTTU",
        "region_code": "PTTU",
        "sub_region_code": "PTTU",
        "region_slug": "puttur-karnataka",
        "latitude": "12.7687",
        "longitude": "75.2071"
    },
    {
        "city_code": "RBKH",
        "region_code": "RBKH",
        "sub_region_code": "RBKH",
        "region_slug": "rabkavi-banhatti",
        "latitude": "16.482677",
        "longitude": "75.12256"
    },
    {
        "city_code": "RDHM",
        "region_code": "RDHM",
        "sub_region_code": "RDHM",
        "region_slug": "radhamoni",
        "latitude": "22.3141",
        "longitude": "87.8714"
    },
    {
        "city_code": "RAEB",
        "region_code": "RAEB",
        "sub_region_code": "RAEB",
        "region_slug": "raebareli",
        "latitude": "26.2345",
        "longitude": "81.2409"
    },
    {
        "city_code": "RAHO",
        "region_code": "RAHO",
        "sub_region_code": "RAHO",
        "region_slug": "raghopur",
        "latitude": "25.5338",
        "longitude": "85.3835"
    },
    {
        "city_code": "RAGH",
        "region_code": "RAGH",
        "sub_region_code": "RAGH",
        "region_slug": "raghunathganj",
        "latitude": "24.45705",
        "longitude": "88.060055"
    },
    {
        "city_code": "RAHA",
        "region_code": "RAHA",
        "sub_region_code": "RAHA",
        "region_slug": "rahata",
        "latitude": "19.7115",
        "longitude": "74.4837"
    },
    {
        "city_code": "RAHI",
        "region_code": "RAHI",
        "sub_region_code": "RAHI",
        "region_slug": "rahimatpur",
        "latitude": "17.5904",
        "longitude": "74.1989"
    },
    {
        "city_code": "RAHU",
        "region_code": "RAHU",
        "sub_region_code": "RAHU",
        "region_slug": "rahuri",
        "latitude": "19.3927",
        "longitude": "74.6488"
    },
    {
        "city_code": "RAIB",
        "region_code": "RAIB",
        "sub_region_code": "RAIB",
        "region_slug": "raibag",
        "latitude": "16.4941",
        "longitude": "74.7747"
    },
    {
        "city_code": "RAUR",
        "region_code": "RAUR",
        "sub_region_code": "RAUR",
        "region_slug": "raichur",
        "latitude": "16.212",
        "longitude": "77.3439"
    },
    {
        "city_code": "RAI",
        "region_code": "RAI",
        "sub_region_code": "RAI",
        "region_slug": "raigad",
        "latitude": "18.5158",
        "longitude": "73.1822"
    },
    {
        "city_code": "RAIJ",
        "region_code": "RAIJ",
        "sub_region_code": "RAIJ",
        "region_slug": "raiganj",
        "latitude": "25.6185",
        "longitude": "88.1256"
    },
    {
        "city_code": "RAIG",
        "region_code": "RAIG",
        "sub_region_code": "RAIG",
        "region_slug": "raigarh",
        "latitude": "21.8974",
        "longitude": "83.395"
    },
    {
        "city_code": "RYKL",
        "region_code": "RYKL",
        "sub_region_code": "RYKL",
        "region_slug": "raikal",
        "latitude": "18.905",
        "longitude": "78.8128"
    },
    {
        "city_code": "RKOT",
        "region_code": "RKOT",
        "sub_region_code": "RKOT",
        "region_slug": "raikot",
        "latitude": "30.6536",
        "longitude": "75.5917"
    },
    {
        "city_code": "RLKD",
        "region_code": "RLKD",
        "sub_region_code": "RLKD",
        "region_slug": "railway-koduru",
        "latitude": "13.95739",
        "longitude": "79.350618"
    },
    {
        "city_code": "RAIPUR",
        "region_code": "RAIPUR",
        "sub_region_code": "RAIPUR",
        "region_slug": "raipur",
        "latitude": "21.251384",
        "longitude": "81.629641"
    },
    {
        "city_code": "YAYA",
        "region_code": "YAYA",
        "sub_region_code": "YAYA",
        "region_slug": "raipuriya",
        "latitude": "23.744812",
        "longitude": "76.658272"
    },
    {
        "city_code": "RSNG",
        "region_code": "RSNG",
        "sub_region_code": "RSNG",
        "region_slug": "raisinghnagar",
        "latitude": "29.5337",
        "longitude": "73.447139"
    },
    {
        "city_code": "RJKB",
        "region_code": "RJKB",
        "sub_region_code": "RJKB",
        "region_slug": "raja-ka-bagh",
        "latitude": "32.27",
        "longitude": "75.8156"
    },
    {
        "city_code": "RAAJ",
        "region_code": "RAAJ",
        "sub_region_code": "RAAJ",
        "region_slug": "rajakumari",
        "latitude": "9.9735",
        "longitude": "77.1686"
    },
    {
        "city_code": "RJAM",
        "region_code": "RJAM",
        "sub_region_code": "RJAM",
        "region_slug": "rajam",
        "latitude": "18.4556",
        "longitude": "83.6494"
    },
    {
        "city_code": "RJMU",
        "region_code": "RJMU",
        "sub_region_code": "RJMU",
        "region_slug": "rajamahendravaram-rajahmundry",
        "latitude": "17.0005",
        "longitude": "81.804"
    },
    {
        "city_code": "RAYM",
        "region_code": "RAYM",
        "sub_region_code": "RAYM",
        "region_slug": "rajapalayam",
        "latitude": "9.4653",
        "longitude": "77.5275"
    },
    {
        "city_code": "RJPR",
        "region_code": "RJPR",
        "sub_region_code": "RJPR",
        "region_slug": "rajapur",
        "latitude": "16.657301",
        "longitude": "73.5215"
    },
    {
        "city_code": "RJRP",
        "region_code": "RJRP",
        "sub_region_code": "RJRP",
        "region_slug": "rajarampalli",
        "latitude": "18.6774",
        "longitude": "79.1104"
    },
    {
        "city_code": "RJGR",
        "region_code": "RJGR",
        "sub_region_code": "RJGR",
        "region_slug": "rajgangpur",
        "latitude": "22.1902",
        "longitude": "84.5799"
    },
    {
        "city_code": "RAJR",
        "region_code": "RAJR",
        "sub_region_code": "RAJR",
        "region_slug": "rajgurunagar",
        "latitude": "18.855",
        "longitude": "73.8875"
    },
    {
        "city_code": "RIJA",
        "region_code": "RIJA",
        "sub_region_code": "RIJA",
        "region_slug": "rajiana",
        "latitude": "30.662",
        "longitude": "75.0655"
    },
    {
        "city_code": "RAJK",
        "region_code": "RAJK",
        "sub_region_code": "RAJK",
        "region_slug": "rajkot",
        "latitude": "22.303895",
        "longitude": "70.80216"
    },
    {
        "city_code": "RAJA",
        "region_code": "RAJA",
        "sub_region_code": "RAJA",
        "region_slug": "rajnandgaon",
        "latitude": "21.0971",
        "longitude": "81.0302"
    },
    {
        "city_code": "RJPA",
        "region_code": "RJPA",
        "sub_region_code": "RJPA",
        "region_slug": "rajpipla",
        "latitude": "21.8715",
        "longitude": "73.5031"
    },
    {
        "city_code": "RAJP",
        "region_code": "RAJP",
        "sub_region_code": "RAJP",
        "region_slug": "rajpur",
        "latitude": "21.9401",
        "longitude": "75.1356"
    },
    {
        "city_code": "RARA",
        "region_code": "RARA",
        "sub_region_code": "RARA",
        "region_slug": "rajpura",
        "latitude": "30.484",
        "longitude": "76.594"
    },
    {
        "city_code": "RAJS",
        "region_code": "RAJS",
        "sub_region_code": "RAJS",
        "region_slug": "rajsamand",
        "latitude": "25.071486",
        "longitude": "73.883072"
    },
    {
        "city_code": "RJLA",
        "region_code": "RJLA",
        "sub_region_code": "RJLA",
        "region_slug": "rajula",
        "latitude": "21.03627",
        "longitude": "71.443757"
    },
    {
        "city_code": "RCPR",
        "region_code": "RCPR",
        "sub_region_code": "RCPR",
        "region_slug": "ramachandrapuram",
        "latitude": "16.8372",
        "longitude": "82.0325"
    },
    {
        "city_code": "RANG",
        "region_code": "RANG",
        "sub_region_code": "RANG",
        "region_slug": "ramanagara",
        "latitude": "12.6003",
        "longitude": "77.4702"
    },
    {
        "city_code": "RAPU",
        "region_code": "RAPU",
        "sub_region_code": "RAPU",
        "region_slug": "ramanathapuram",
        "latitude": "9.364185",
        "longitude": "78.838759"
    },
    {
        "city_code": "RAMP",
        "region_code": "RAMP",
        "sub_region_code": "RAMP",
        "region_slug": "ramayampet",
        "latitude": "18.1159",
        "longitude": "78.4326"
    },
    {
        "city_code": "RAMD",
        "region_code": "RAMD",
        "sub_region_code": "RAMD",
        "region_slug": "ramdurg",
        "latitude": "15.95",
        "longitude": "75.2975"
    },
    {
        "city_code": "RMPR",
        "region_code": "RMPR",
        "sub_region_code": "RMPR",
        "region_slug": "rameswarpur",
        "latitude": "20.8791",
        "longitude": "86.456"
    },
    {
        "city_code": "GGHH",
        "region_code": "GGHH",
        "sub_region_code": "GGHH",
        "region_slug": "ramgarh",
        "latitude": "23.6363",
        "longitude": "85.5124"
    },
    {
        "city_code": "RGHA",
        "region_code": "RGHA",
        "sub_region_code": "RGHA",
        "region_slug": "ramgarhwa",
        "latitude": "26.8714",
        "longitude": "84.7786"
    },
    {
        "city_code": "PUUR",
        "region_code": "PUUR",
        "sub_region_code": "PUUR",
        "region_slug": "ramjibanpur",
        "latitude": "22.8226",
        "longitude": "87.6137"
    },
    {
        "city_code": "RAMN",
        "region_code": "RAMN",
        "sub_region_code": "RAMN",
        "region_slug": "ramnagar",
        "latitude": "29.394747",
        "longitude": "79.126634"
    },
    {
        "city_code": "RACD",
        "region_code": "RACD",
        "sub_region_code": "RACD",
        "region_slug": "rampachodavaram",
        "latitude": "17.4367",
        "longitude": "81.776"
    },
    {
        "city_code": "RAMU",
        "region_code": "RAMU",
        "sub_region_code": "RAMU",
        "region_slug": "rampur",
        "latitude": "25.4842",
        "longitude": "82.5916"
    },
    {
        "city_code": "RMTE",
        "region_code": "RMTE",
        "sub_region_code": "RMTE",
        "region_slug": "ramtek",
        "latitude": "21.39351",
        "longitude": "79.299541"
    },
    {
        "city_code": "RANA",
        "region_code": "RANA",
        "sub_region_code": "RANA",
        "region_slug": "ranaghat",
        "latitude": "23.174",
        "longitude": "88.5639"
    },
    {
        "city_code": "RNST",
        "region_code": "RNST",
        "sub_region_code": "RNST",
        "region_slug": "ranastalam",
        "latitude": "18.202529",
        "longitude": "83.690337"
    },
    {
        "city_code": "RANC",
        "region_code": "RANC",
        "sub_region_code": "RANC",
        "region_slug": "ranchi",
        "latitude": "23.3441",
        "longitude": "85.309562"
    },
    {
        "city_code": "RANE",
        "region_code": "RANE",
        "sub_region_code": "RANE",
        "region_slug": "ranebennur",
        "latitude": "14.6113",
        "longitude": "75.6383"
    },
    {
        "city_code": "RAAA",
        "region_code": "RAAA",
        "sub_region_code": "RAAA",
        "region_slug": "rangia",
        "latitude": "26.43225",
        "longitude": "91.601219"
    },
    {
        "city_code": "RNGJ",
        "region_code": "RNGJ",
        "sub_region_code": "RNGJ",
        "region_slug": "raniganj",
        "latitude": "23.6291",
        "longitude": "87.0924"
    },
    {
        "city_code": "RANI",
        "region_code": "RANI",
        "sub_region_code": "RANI",
        "region_slug": "ranipet",
        "latitude": "12.9321",
        "longitude": "79.3335"
    },
    {
        "city_code": "RANN",
        "region_code": "RANN",
        "sub_region_code": "RANN",
        "region_slug": "ranni",
        "latitude": "9.3866",
        "longitude": "76.7856"
    },
    {
        "city_code": "RAPR",
        "region_code": "RAPR",
        "sub_region_code": "RAPR",
        "region_slug": "rapur",
        "latitude": "14.1998",
        "longitude": "79.5336"
    },
    {
        "city_code": "RSPM",
        "region_code": "RSPM",
        "sub_region_code": "RSPM",
        "region_slug": "rasipuram",
        "latitude": "11.4429",
        "longitude": "78.1792"
    },
    {
        "city_code": "ATRH",
        "region_code": "ATRH",
        "sub_region_code": "ATRH",
        "region_slug": "rath",
        "latitude": "25.5935",
        "longitude": "79.565"
    },
    {
        "city_code": "RATL",
        "region_code": "RATL",
        "sub_region_code": "RATL",
        "region_slug": "ratlam",
        "latitude": "23.334332",
        "longitude": "75.037394"
    },
    {
        "city_code": "RATN",
        "region_code": "RATN",
        "sub_region_code": "RATN",
        "region_slug": "ratnagiri",
        "latitude": "17.2478",
        "longitude": "73.3709"
    },
    {
        "city_code": "RATO",
        "region_code": "RATO",
        "sub_region_code": "RATO",
        "region_slug": "ratnagiri-odisha",
        "latitude": "20.642637",
        "longitude": "86.336708"
    },
    {
        "city_code": "RVPL",
        "region_code": "RVPL",
        "sub_region_code": "RVPL",
        "region_slug": "ravulapalem",
        "latitude": "16.7635",
        "longitude": "81.842"
    },
    {
        "city_code": "RAXA",
        "region_code": "RAXA",
        "sub_region_code": "RAXA",
        "region_slug": "raxaul",
        "latitude": "26.980611",
        "longitude": "84.829028"
    },
    {
        "city_code": "RYCT",
        "region_code": "RYCT",
        "sub_region_code": "RYCT",
        "region_slug": "rayachoti",
        "latitude": "14.058599",
        "longitude": "78.75192"
    },
    {
        "city_code": "RADA",
        "region_code": "RADA",
        "sub_region_code": "RADA",
        "region_slug": "rayagada",
        "latitude": "19.1712",
        "longitude": "83.4163"
    },
    {
        "city_code": "RAYA",
        "region_code": "RAYA",
        "sub_region_code": "RAYA",
        "region_slug": "rayavaram",
        "latitude": "16.9006",
        "longitude": "82.0053"
    },
    {
        "city_code": "RAZO",
        "region_code": "RAZO",
        "sub_region_code": "RAZO",
        "region_slug": "razole",
        "latitude": "16.4743",
        "longitude": "81.8402"
    },
    {
        "city_code": "RENT",
        "region_code": "RENT",
        "sub_region_code": "RENT",
        "region_slug": "rentachintala",
        "latitude": "16.5515",
        "longitude": "79.5519"
    },
    {
        "city_code": "RENU",
        "region_code": "RENU",
        "sub_region_code": "RENU",
        "region_slug": "renukoot",
        "latitude": "24.2195",
        "longitude": "83.0335"
    },
    {
        "city_code": "REPA",
        "region_code": "REPA",
        "sub_region_code": "REPA",
        "region_slug": "repalle",
        "latitude": "16.0174",
        "longitude": "80.8295"
    },
    {
        "city_code": "REVD",
        "region_code": "REVD",
        "sub_region_code": "REVD",
        "region_slug": "revdanda",
        "latitude": "18.553123",
        "longitude": "72.915285"
    },
    {
        "city_code": "RWAA",
        "region_code": "RWAA",
        "sub_region_code": "RWAA",
        "region_slug": "rewa",
        "latitude": "24.5373",
        "longitude": "81.3042"
    },
    {
        "city_code": "REWA",
        "region_code": "REWA",
        "sub_region_code": "REWA",
        "region_slug": "rewari",
        "latitude": "28.1928",
        "longitude": "76.6239"
    },
    {
        "city_code": "RIBH",
        "region_code": "RIBH",
        "sub_region_code": "RIBH",
        "region_slug": "ribhoi",
        "latitude": "25.745401",
        "longitude": "92.121634"
    },
    {
        "city_code": "RGAS",
        "region_code": "RGAS",
        "sub_region_code": "RGAS",
        "region_slug": "ringas",
        "latitude": "27.3766",
        "longitude": "75.558"
    },
    {
        "city_code": "RKES",
        "region_code": "RKES",
        "sub_region_code": "RKES",
        "region_slug": "rishikesh",
        "latitude": "30.0869",
        "longitude": "78.2676"
    },
    {
        "city_code": "RSRA",
        "region_code": "RSRA",
        "sub_region_code": "RSRA",
        "region_slug": "rishra",
        "latitude": "22.7244",
        "longitude": "88.3288"
    },
    {
        "city_code": "ROH",
        "region_code": "ROH",
        "sub_region_code": "ROH",
        "region_slug": "rohtak",
        "latitude": "28.892361",
        "longitude": "76.59124"
    },
    {
        "city_code": "RONC",
        "region_code": "RONC",
        "sub_region_code": "RONC",
        "region_slug": "ron",
        "latitude": "15.6996",
        "longitude": "75.733"
    },
    {
        "city_code": "RNG",
        "region_code": "RNG",
        "sub_region_code": "RNG",
        "region_slug": "rongjeng",
        "latitude": "25.6308",
        "longitude": "90.7786"
    },
    {
        "city_code": "ROOR",
        "region_code": "ROOR",
        "sub_region_code": "ROOR",
        "region_slug": "roorkee",
        "latitude": "29.8543",
        "longitude": "77.888"
    },
    {
        "city_code": "RKOR",
        "region_code": "RKOR",
        "sub_region_code": "RKOR",
        "region_slug": "rourkela",
        "latitude": "22.221935",
        "longitude": "84.857382"
    },
    {
        "city_code": "ROUT",
        "region_code": "ROUT",
        "sub_region_code": "ROUT",
        "region_slug": "routhulapudi",
        "latitude": "17.3773",
        "longitude": "82.3689"
    },
    {
        "city_code": "RUDU",
        "region_code": "RUDU",
        "sub_region_code": "RUDU",
        "region_slug": "rudauli",
        "latitude": "26.7509",
        "longitude": "81.7514"
    },
    {
        "city_code": "RUDP",
        "region_code": "RUDP",
        "sub_region_code": "RUDP",
        "region_slug": "rudrapur",
        "latitude": "28.979682",
        "longitude": "79.400876"
    },
    {
        "city_code": "RUPN",
        "region_code": "RUPN",
        "sub_region_code": "RUPN",
        "region_slug": "rupnagar",
        "latitude": "30.96595",
        "longitude": "76.522522"
    },
    {
        "city_code": "SABB",
        "region_code": "SABB",
        "sub_region_code": "SABB",
        "region_slug": "sabbavaram",
        "latitude": "17.7893",
        "longitude": "83.118"
    },
    {
        "city_code": "SADA",
        "region_code": "SADA",
        "sub_region_code": "SADA",
        "region_slug": "sadasivpet",
        "latitude": "17.6203",
        "longitude": "77.9539"
    },
    {
        "city_code": "SAFI",
        "region_code": "SAFI",
        "sub_region_code": "SAFI",
        "region_slug": "safidon",
        "latitude": "29.406065",
        "longitude": "76.661485"
    },
    {
        "city_code": "SAMP",
        "region_code": "SAMP",
        "sub_region_code": "SAMP",
        "region_slug": "sagar",
        "latitude": "23.8388",
        "longitude": "78.7378"
    },
    {
        "city_code": "SAGA",
        "region_code": "SAGA",
        "sub_region_code": "SAGA",
        "region_slug": "sagwara",
        "latitude": "23.6657",
        "longitude": "74.0241"
    },
    {
        "city_code": "SAHA",
        "region_code": "SAHA",
        "sub_region_code": "SAHA",
        "region_slug": "saharanpur",
        "latitude": "29.9667",
        "longitude": "77.55"
    },
    {
        "city_code": "SAHH",
        "region_code": "SAHH",
        "sub_region_code": "SAHH",
        "region_slug": "saharsa",
        "latitude": "25.8835",
        "longitude": "86.6006"
    },
    {
        "city_code": "SAHJ",
        "region_code": "SAHJ",
        "sub_region_code": "SAHJ",
        "region_slug": "sahjanwa",
        "latitude": "26.7538",
        "longitude": "83.2135"
    },
    {
        "city_code": "SASA",
        "region_code": "SASA",
        "sub_region_code": "SASA",
        "region_slug": "sakleshpur",
        "latitude": "12.9442",
        "longitude": "75.7866"
    },
    {
        "city_code": "SAKT",
        "region_code": "SAKT",
        "sub_region_code": "SAKT",
        "region_slug": "sakti",
        "latitude": "22.0238",
        "longitude": "82.9602"
    },
    {
        "city_code": "SALM",
        "region_code": "SALM",
        "sub_region_code": "SALM",
        "region_slug": "salem",
        "latitude": "11.65",
        "longitude": "78.16"
    },
    {
        "city_code": "SGMA",
        "region_code": "SGMA",
        "sub_region_code": "SGMA",
        "region_slug": "saligrama",
        "latitude": "12.5603",
        "longitude": "76.2682"
    },
    {
        "city_code": "SAHM",
        "region_code": "SAHM",
        "sub_region_code": "SAHM",
        "region_slug": "salihundam",
        "latitude": "18.3263",
        "longitude": "84.0564"
    },
    {
        "city_code": "SALU",
        "region_code": "SALU",
        "sub_region_code": "SALU",
        "region_slug": "salur",
        "latitude": "18.5164",
        "longitude": "83.2051"
    },
    {
        "city_code": "SAMA",
        "region_code": "SAMA",
        "sub_region_code": "SAMA",
        "region_slug": "samalkota",
        "latitude": "17.0504",
        "longitude": "82.1659"
    },
    {
        "city_code": "SMST",
        "region_code": "SMST",
        "sub_region_code": "SMST",
        "region_slug": "samastipur",
        "latitude": "25.856",
        "longitude": "85.7868"
    },
    {
        "city_code": "SAMB",
        "region_code": "SAMB",
        "sub_region_code": "SAMB",
        "region_slug": "sambalpur",
        "latitude": "21.4669",
        "longitude": "83.9812"
    },
    {
        "city_code": "SAML",
        "region_code": "SAML",
        "sub_region_code": "SAML",
        "region_slug": "sambhal",
        "latitude": "28.5904",
        "longitude": "78.5718"
    },
    {
        "city_code": "SABH",
        "region_code": "SABH",
        "sub_region_code": "SABH",
        "region_slug": "sambhar",
        "latitude": "26.9096",
        "longitude": "75.1859"
    },
    {
        "city_code": "SAMS",
        "region_code": "SAMS",
        "sub_region_code": "SAMS",
        "region_slug": "samsi",
        "latitude": "25.2735",
        "longitude": "88.004"
    },
    {
        "city_code": "SANA",
        "region_code": "SANA",
        "sub_region_code": "SANA",
        "region_slug": "sanand",
        "latitude": "22.991703",
        "longitude": "72.368061"
    },
    {
        "city_code": "SNWD",
        "region_code": "SNWD",
        "sub_region_code": "SNWD",
        "region_slug": "sanawad",
        "latitude": "22.1764",
        "longitude": "76.0682"
    },
    {
        "city_code": "SMNE",
        "region_code": "SMNE",
        "sub_region_code": "SMNE",
        "region_slug": "sangamner",
        "latitude": "19.5771",
        "longitude": "74.208"
    },
    {
        "city_code": "SARE",
        "region_code": "SARE",
        "sub_region_code": "SARE",
        "region_slug": "sangareddy",
        "latitude": "17.6194",
        "longitude": "78.0823"
    },
    {
        "city_code": "SAGR",
        "region_code": "SAGR",
        "sub_region_code": "SAGR",
        "region_slug": "sangaria",
        "latitude": "24.33785",
        "longitude": "75.93625"
    },
    {
        "city_code": "SANG",
        "region_code": "SANG",
        "sub_region_code": "SANG",
        "region_slug": "sangli",
        "latitude": "16.85438",
        "longitude": "74.564171"
    },
    {
        "city_code": "SNGO",
        "region_code": "SNGO",
        "sub_region_code": "SNGO",
        "region_slug": "sangola",
        "latitude": "17.4341",
        "longitude": "75.1954"
    },
    {
        "city_code": "SANR",
        "region_code": "SANR",
        "sub_region_code": "SANR",
        "region_slug": "sangrur",
        "latitude": "30.2506",
        "longitude": "75.8442"
    },
    {
        "city_code": "SAKL",
        "region_code": "SAKL",
        "sub_region_code": "SAKL",
        "region_slug": "sankarankoil",
        "latitude": "9.1791",
        "longitude": "77.5309"
    },
    {
        "city_code": "SKPM",
        "region_code": "SKPM",
        "sub_region_code": "SKPM",
        "region_slug": "sankarapuram",
        "latitude": "11.8895",
        "longitude": "78.9147"
    },
    {
        "city_code": "SKHW",
        "region_code": "SKHW",
        "sub_region_code": "SKHW",
        "region_slug": "sankeshwar",
        "latitude": "16.26",
        "longitude": "74.4836"
    },
    {
        "city_code": "SANK",
        "region_code": "SANK",
        "sub_region_code": "SANK",
        "region_slug": "sankri",
        "latitude": "31.078224",
        "longitude": "78.184439"
    },
    {
        "city_code": "STHB",
        "region_code": "STHB",
        "sub_region_code": "STHB",
        "region_slug": "santhebennur",
        "latitude": "14.17074",
        "longitude": "76.001366"
    },
    {
        "city_code": "SAWR",
        "region_code": "SAWR",
        "sub_region_code": "SAWR",
        "region_slug": "sanwer",
        "latitude": "22.9737",
        "longitude": "75.826"
    },
    {
        "city_code": "SAOR",
        "region_code": "SAOR",
        "sub_region_code": "SAOR",
        "region_slug": "saoner",
        "latitude": "21.3856",
        "longitude": "78.9218"
    },
    {
        "city_code": "SPAL",
        "region_code": "SPAL",
        "sub_region_code": "SPAL",
        "region_slug": "saraipali",
        "latitude": "21.332",
        "longitude": "82.9975"
    },
    {
        "city_code": "SARH",
        "region_code": "SARH",
        "sub_region_code": "SARH",
        "region_slug": "sarangarh",
        "latitude": "21.5877",
        "longitude": "83.0737"
    },
    {
        "city_code": "SARA",
        "region_code": "SARA",
        "sub_region_code": "SARA",
        "region_slug": "sarangpur",
        "latitude": "23.5665",
        "longitude": "76.4723"
    },
    {
        "city_code": "SARP",
        "region_code": "SARP",
        "sub_region_code": "SARP",
        "region_slug": "sarapaka",
        "latitude": "17.6943",
        "longitude": "80.8628"
    },
    {
        "city_code": "DDDD",
        "region_code": "DDDD",
        "sub_region_code": "DDDD",
        "region_slug": "sardhana",
        "latitude": "29.1451",
        "longitude": "77.6164"
    },
    {
        "city_code": "SARD",
        "region_code": "SARD",
        "sub_region_code": "SARD",
        "region_slug": "sardulgarh",
        "latitude": "29.6949",
        "longitude": "75.2352"
    },
    {
        "city_code": "SART",
        "region_code": "SART",
        "sub_region_code": "SART",
        "region_slug": "sarnath",
        "latitude": "25.3762",
        "longitude": "83.0227"
    },
    {
        "city_code": "SARN",
        "region_code": "SARN",
        "sub_region_code": "SARN",
        "region_slug": "sarni",
        "latitude": "22.101267",
        "longitude": "78.168862"
    },
    {
        "city_code": "SARS",
        "region_code": "SARS",
        "sub_region_code": "SARS",
        "region_slug": "sarsiwa",
        "latitude": "21.6306",
        "longitude": "82.93"
    },
    {
        "city_code": "SARM",
        "region_code": "SARM",
        "sub_region_code": "SARM",
        "region_slug": "sasaram",
        "latitude": "24.949",
        "longitude": "84.0314"
    },
    {
        "city_code": "STNA",
        "region_code": "STNA",
        "sub_region_code": "STNA",
        "region_slug": "satana",
        "latitude": "20.5982",
        "longitude": "74.2033"
    },
    {
        "city_code": "SATA",
        "region_code": "SATA",
        "sub_region_code": "SATA",
        "region_slug": "satara",
        "latitude": "17.6805",
        "longitude": "74.0183"
    },
    {
        "city_code": "SNTK",
        "region_code": "SNTK",
        "sub_region_code": "SNTK",
        "region_slug": "sathankulam",
        "latitude": "8.4413",
        "longitude": "77.9139"
    },
    {
        "city_code": "SATH",
        "region_code": "SATH",
        "sub_region_code": "SATH",
        "region_slug": "sathupally",
        "latitude": "17.2055",
        "longitude": "80.8378"
    },
    {
        "city_code": "STHY",
        "region_code": "STHY",
        "sub_region_code": "STHY",
        "region_slug": "sathyamangalam",
        "latitude": "11.5048",
        "longitude": "77.2384"
    },
    {
        "city_code": "SATN",
        "region_code": "SATN",
        "sub_region_code": "SATN",
        "region_slug": "satna",
        "latitude": "24.6005",
        "longitude": "80.8322"
    },
    {
        "city_code": "SATL",
        "region_code": "SATL",
        "sub_region_code": "SATL",
        "region_slug": "sattenapalle",
        "latitude": "16.3944",
        "longitude": "80.1512"
    },
    {
        "city_code": "SAUN",
        "region_code": "SAUN",
        "sub_region_code": "SAUN",
        "region_slug": "saundatti",
        "latitude": "15.7522",
        "longitude": "75.1253"
    },
    {
        "city_code": "SWMP",
        "region_code": "SWMP",
        "sub_region_code": "SWMP",
        "region_slug": "sawai-madhopur",
        "latitude": "26.019006",
        "longitude": "76.357489"
    },
    {
        "city_code": "SAWA",
        "region_code": "SAWA",
        "sub_region_code": "SAWA",
        "region_slug": "sawantwadi",
        "latitude": "15.9053",
        "longitude": "73.8213"
    },
    {
        "city_code": "SYAN",
        "region_code": "SYAN",
        "sub_region_code": "SYAN",
        "region_slug": "sayan",
        "latitude": "21.3179",
        "longitude": "72.8812"
    },
    {
        "city_code": "SCBD",
        "region_code": "SCBD",
        "sub_region_code": "SCBD",
        "region_slug": "secunderabad",
        "latitude": "17.4399",
        "longitude": "78.4983"
    },
    {
        "city_code": "SEET",
        "region_code": "SEET",
        "sub_region_code": "SEET",
        "region_slug": "seethanagaram",
        "latitude": "17.176976",
        "longitude": "81.692616"
    },
    {
        "city_code": "SEHL",
        "region_code": "SEHL",
        "sub_region_code": "SEHL",
        "region_slug": "sehmalpur",
        "latitude": "25.4064",
        "longitude": "82.8843"
    },
    {
        "city_code": "SEHO",
        "region_code": "SEHO",
        "sub_region_code": "SEHO",
        "region_slug": "sehore",
        "latitude": "23.205",
        "longitude": "77.0851"
    },
    {
        "city_code": "SELU",
        "region_code": "SELU",
        "sub_region_code": "SELU",
        "region_slug": "selu",
        "latitude": "19.4532",
        "longitude": "76.439"
    },
    {
        "city_code": "SIMI",
        "region_code": "SIMI",
        "sub_region_code": "SIMI",
        "region_slug": "semiliguda",
        "latitude": "18.7112",
        "longitude": "82.8508"
    },
    {
        "city_code": "SENA",
        "region_code": "SENA",
        "sub_region_code": "SENA",
        "region_slug": "senapati",
        "latitude": "25.270311",
        "longitude": "94.022498"
    },
    {
        "city_code": "SEND",
        "region_code": "SEND",
        "sub_region_code": "SEND",
        "region_slug": "sendhwa",
        "latitude": "21.6819",
        "longitude": "75.0943"
    },
    {
        "city_code": "SEAI",
        "region_code": "SEAI",
        "sub_region_code": "SEAI",
        "region_slug": "sendurai",
        "latitude": "11.2534",
        "longitude": "79.1729"
    },
    {
        "city_code": "SENG",
        "region_code": "SENG",
        "sub_region_code": "SENG",
        "region_slug": "sengottai",
        "latitude": "8.9751",
        "longitude": "77.2491"
    },
    {
        "city_code": "SEON",
        "region_code": "SEON",
        "sub_region_code": "SEON",
        "region_slug": "seoni",
        "latitude": "22.0869",
        "longitude": "79.5435"
    },
    {
        "city_code": "SEMA",
        "region_code": "SEMA",
        "sub_region_code": "SEMA",
        "region_slug": "seoni-malwa",
        "latitude": "22.4514",
        "longitude": "77.466"
    },
    {
        "city_code": "SERA",
        "region_code": "SERA",
        "sub_region_code": "SERA",
        "region_slug": "serampore",
        "latitude": "22.748841",
        "longitude": "88.320237"
    },
    {
        "city_code": "SHAD",
        "region_code": "SHAD",
        "sub_region_code": "SHAD",
        "region_slug": "shadnagar",
        "latitude": "17.0712",
        "longitude": "78.2049"
    },
    {
        "city_code": "SHHA",
        "region_code": "SHHA",
        "sub_region_code": "SHHA",
        "region_slug": "shahada",
        "latitude": "21.5456",
        "longitude": "74.4683"
    },
    {
        "city_code": "SHAP",
        "region_code": "SHAP",
        "sub_region_code": "SHAP",
        "region_slug": "shahapur",
        "latitude": "16.6957",
        "longitude": "76.8432"
    },
    {
        "city_code": "SHAH",
        "region_code": "SHAH",
        "sub_region_code": "SHAH",
        "region_slug": "shahdol",
        "latitude": "23.6213",
        "longitude": "81.4279"
    },
    {
        "city_code": "SHJH",
        "region_code": "SHJH",
        "sub_region_code": "SHJH",
        "region_slug": "shahjahanpur",
        "latitude": "27.884054",
        "longitude": "79.912503"
    },
    {
        "city_code": "SUPH",
        "region_code": "SUPH",
        "sub_region_code": "SUPH",
        "region_slug": "shahpur",
        "latitude": "32.21231",
        "longitude": "76.17634"
    },
    {
        "city_code": "SHAA",
        "region_code": "SHAA",
        "sub_region_code": "SHAA",
        "region_slug": "shahpura",
        "latitude": "27.3858",
        "longitude": "75.9609"
    },
    {
        "city_code": "SJUR",
        "region_code": "SJUR",
        "sub_region_code": "SJUR",
        "region_slug": "shajapur",
        "latitude": "23.4273",
        "longitude": "76.273"
    },
    {
        "city_code": "SGAH",
        "region_code": "SGAH",
        "sub_region_code": "SGAH",
        "region_slug": "shamgarh",
        "latitude": "24.1883",
        "longitude": "75.6353"
    },
    {
        "city_code": "SHAN",
        "region_code": "SHAN",
        "sub_region_code": "SHAN",
        "region_slug": "shankarampet",
        "latitude": "18.0502",
        "longitude": "77.9125"
    },
    {
        "city_code": "SKRP",
        "region_code": "SKRP",
        "sub_region_code": "SKRP",
        "region_slug": "shankarpally",
        "latitude": "17.4554",
        "longitude": "78.1312"
    },
    {
        "city_code": "SHNC",
        "region_code": "SHNC",
        "sub_region_code": "SHNC",
        "region_slug": "shankarpur",
        "latitude": "21.648789",
        "longitude": "87.570792"
    },
    {
        "city_code": "SHEL",
        "region_code": "SHEL",
        "sub_region_code": "SHEL",
        "region_slug": "shela",
        "latitude": "23.0003",
        "longitude": "72.459"
    },
    {
        "city_code": "SHPR",
        "region_code": "SHPR",
        "sub_region_code": "SHPR",
        "region_slug": "sheopur",
        "latitude": "25.669748",
        "longitude": "76.69784"
    },
    {
        "city_code": "SHEO",
        "region_code": "SHEO",
        "sub_region_code": "SHEO",
        "region_slug": "sheorinarayan",
        "latitude": "21.7218",
        "longitude": "82.5949"
    },
    {
        "city_code": "SHKR",
        "region_code": "SHKR",
        "sub_region_code": "SHKR",
        "region_slug": "shikaripur",
        "latitude": "14.263342",
        "longitude": "75.335183"
    },
    {
        "city_code": "SHIP",
        "region_code": "SHIP",
        "sub_region_code": "SHIP",
        "region_slug": "shikarpur",
        "latitude": "28.2798",
        "longitude": "78.011"
    },
    {
        "city_code": "SHLG",
        "region_code": "SHLG",
        "sub_region_code": "SHLG",
        "region_slug": "shillong",
        "latitude": "25.577967",
        "longitude": "91.893982"
    },
    {
        "city_code": "SMLA",
        "region_code": "SMLA",
        "sub_region_code": "SMLA",
        "region_slug": "shimla",
        "latitude": "31.104605",
        "longitude": "77.173424"
    },
    {
        "city_code": "SHDK",
        "region_code": "SHDK",
        "sub_region_code": "SHDK",
        "region_slug": "shindkheda",
        "latitude": "21.2726",
        "longitude": "74.7455"
    },
    {
        "city_code": "SHTI",
        "region_code": "SHTI",
        "sub_region_code": "SHTI",
        "region_slug": "shirahatti",
        "latitude": "15.2313",
        "longitude": "75.5772"
    },
    {
        "city_code": "SHIR",
        "region_code": "SHIR",
        "sub_region_code": "SHIR",
        "region_slug": "shirali",
        "latitude": "14.030851",
        "longitude": "74.528472"
    },
    {
        "city_code": "SRUR",
        "region_code": "SRUR",
        "sub_region_code": "SRUR",
        "region_slug": "shirpur",
        "latitude": "21.3496",
        "longitude": "74.8797"
    },
    {
        "city_code": "SHRU",
        "region_code": "SHRU",
        "sub_region_code": "SHRU",
        "region_slug": "shirur",
        "latitude": "18.8272",
        "longitude": "74.373"
    },
    {
        "city_code": "SHIA",
        "region_code": "SHIA",
        "sub_region_code": "SHIA",
        "region_slug": "shivamogga",
        "latitude": "13.9299",
        "longitude": "75.5681"
    },
    {
        "city_code": "SHIV",
        "region_code": "SHIV",
        "sub_region_code": "SHIV",
        "region_slug": "shivpuri",
        "latitude": "25.4358",
        "longitude": "77.6651"
    },
    {
        "city_code": "SPHN",
        "region_code": "SPHN",
        "sub_region_code": "SPHN",
        "region_slug": "shopian",
        "latitude": "74.8361",
        "longitude": "33.717"
    },
    {
        "city_code": "SHNR",
        "region_code": "SHNR",
        "sub_region_code": "SHNR",
        "region_slug": "shoranur",
        "latitude": "10.7593",
        "longitude": "76.2714"
    },
    {
        "city_code": "SHUR",
        "region_code": "SHUR",
        "sub_region_code": "SHUR",
        "region_slug": "shrirampur",
        "latitude": "19.6222",
        "longitude": "74.6576"
    },
    {
        "city_code": "SKLG",
        "region_code": "SKLG",
        "sub_region_code": "SKLG",
        "region_slug": "shuklaganj",
        "latitude": "26.4763",
        "longitude": "80.3813"
    },
    {
        "city_code": "SIDZ",
        "region_code": "SIDZ",
        "sub_region_code": "SIDZ",
        "region_slug": "siddharthnagar",
        "latitude": "27.2991",
        "longitude": "83.0928"
    },
    {
        "city_code": "SIDD",
        "region_code": "SIDD",
        "sub_region_code": "SIDD",
        "region_slug": "siddhpur",
        "latitude": "23.9309",
        "longitude": "72.3621"
    },
    {
        "city_code": "SDDP",
        "region_code": "SDDP",
        "sub_region_code": "SDDP",
        "region_slug": "siddipet",
        "latitude": "18.1019",
        "longitude": "78.8521"
    },
    {
        "city_code": "SIDL",
        "region_code": "SIDL",
        "sub_region_code": "SIDL",
        "region_slug": "sidlaghatta",
        "latitude": "13.3937",
        "longitude": "77.8653"
    },
    {
        "city_code": "SIHO",
        "region_code": "SIHO",
        "sub_region_code": "SIHO",
        "region_slug": "sihora",
        "latitude": "23.4866",
        "longitude": "80.1066"
    },
    {
        "city_code": "SIKR",
        "region_code": "SIKR",
        "sub_region_code": "SIKR",
        "region_slug": "sikar",
        "latitude": "27.6094",
        "longitude": "75.1399"
    },
    {
        "city_code": "SIL",
        "region_code": "SIL",
        "sub_region_code": "SIL",
        "region_slug": "silchar",
        "latitude": "24.820142",
        "longitude": "92.797995"
    },
    {
        "city_code": "SILI",
        "region_code": "SILI",
        "sub_region_code": "SILI",
        "region_slug": "siliguri",
        "latitude": "26.708698",
        "longitude": "88.425536"
    },
    {
        "city_code": "SILV",
        "region_code": "SILV",
        "sub_region_code": "SILV",
        "region_slug": "silvassa",
        "latitude": "20.27643",
        "longitude": "73.008077"
    },
    {
        "city_code": "SIND",
        "region_code": "SIND",
        "sub_region_code": "SIND",
        "region_slug": "sindhanur",
        "latitude": "15.7917",
        "longitude": "76.6875"
    },
    {
        "city_code": "SNDH",
        "region_code": "SNDH",
        "sub_region_code": "SNDH",
        "region_slug": "sindhudurg",
        "latitude": "16.3492",
        "longitude": "73.5594"
    },
    {
        "city_code": "SING",
        "region_code": "SING",
        "sub_region_code": "SING",
        "region_slug": "singapore",
        "latitude": "1.282056",
        "longitude": "103.854336"
    },
    {
        "city_code": "SIGN",
        "region_code": "SIGN",
        "sub_region_code": "SIGN",
        "region_slug": "singarayakonda",
        "latitude": "15.25",
        "longitude": "80.0212"
    },
    {
        "city_code": "SNGR",
        "region_code": "SNGR",
        "sub_region_code": "SNGR",
        "region_slug": "singrauli",
        "latitude": "24.1443",
        "longitude": "82.3886"
    },
    {
        "city_code": "SINA",
        "region_code": "SINA",
        "sub_region_code": "SINA",
        "region_slug": "sinnar",
        "latitude": "19.850338",
        "longitude": "73.976471"
    },
    {
        "city_code": "SIRA",
        "region_code": "SIRA",
        "sub_region_code": "SIRA",
        "region_slug": "sira",
        "latitude": "13.7451",
        "longitude": "76.898"
    },
    {
        "city_code": "SIRC",
        "region_code": "SIRC",
        "sub_region_code": "SIRC",
        "region_slug": "sircilla",
        "latitude": "18.4042",
        "longitude": "78.8305"
    },
    {
        "city_code": "SIRM",
        "region_code": "SIRM",
        "sub_region_code": "SIRM",
        "region_slug": "sirmaur",
        "latitude": "30.699305",
        "longitude": "77.094301"
    },
    {
        "city_code": "SIRO",
        "region_code": "SIRO",
        "sub_region_code": "SIRO",
        "region_slug": "sirohi",
        "latitude": "24.7467",
        "longitude": "72.8043"
    },
    {
        "city_code": "SISA",
        "region_code": "SISA",
        "sub_region_code": "SISA",
        "region_slug": "sirsa",
        "latitude": "29.5333",
        "longitude": "75.0167"
    },
    {
        "city_code": "SRSI",
        "region_code": "SRSI",
        "sub_region_code": "SRSI",
        "region_slug": "sirsi",
        "latitude": "14.618773",
        "longitude": "74.820153"
    },
    {
        "city_code": "SPPA",
        "region_code": "SPPA",
        "sub_region_code": "SPPA",
        "region_slug": "siruguppa",
        "latitude": "15.6175",
        "longitude": "76.9006"
    },
    {
        "city_code": "SIMA",
        "region_code": "SIMA",
        "sub_region_code": "SIMA",
        "region_slug": "sitamarhi",
        "latitude": "26.5952",
        "longitude": "85.4808"
    },
    {
        "city_code": "SITA",
        "region_code": "SITA",
        "sub_region_code": "SITA",
        "region_slug": "sitapur",
        "latitude": "27.5325",
        "longitude": "80.8987"
    },
    {
        "city_code": "SHVG",
        "region_code": "SHVG",
        "sub_region_code": "SHVG",
        "region_slug": "sivaganga",
        "latitude": "9.9726",
        "longitude": "78.5661"
    },
    {
        "city_code": "SIV",
        "region_code": "SIV",
        "sub_region_code": "SIV",
        "region_slug": "sivakasi",
        "latitude": "9.4533",
        "longitude": "77.8024"
    },
    {
        "city_code": "SVSG",
        "region_code": "SVSG",
        "sub_region_code": "SVSG",
        "region_slug": "sivasagar",
        "latitude": "26.9826",
        "longitude": "94.6425"
    },
    {
        "city_code": "SWNB",
        "region_code": "SWNB",
        "sub_region_code": "SWNB",
        "region_slug": "siwan",
        "latitude": "26.2243",
        "longitude": "84.36"
    },
    {
        "city_code": "SCO",
        "region_code": "SCO",
        "sub_region_code": "SCO",
        "region_slug": "solan",
        "latitude": "30.9045",
        "longitude": "77.0967"
    },
    {
        "city_code": "SOLA",
        "region_code": "SOLA",
        "sub_region_code": "SOLA",
        "region_slug": "solapur",
        "latitude": "17.659834",
        "longitude": "75.906601"
    },
    {
        "city_code": "SOLU",
        "region_code": "SOLU",
        "sub_region_code": "SOLU",
        "region_slug": "solukhumbu",
        "latitude": "27.791",
        "longitude": "86.6611"
    },
    {
        "city_code": "SOMA",
        "region_code": "SOMA",
        "sub_region_code": "SOMA",
        "region_slug": "sompeta",
        "latitude": "18.9456",
        "longitude": "84.5825"
    },
    {
        "city_code": "SOYW",
        "region_code": "SOYW",
        "sub_region_code": "SOYW",
        "region_slug": "sonari",
        "latitude": "27.028",
        "longitude": "95.0312"
    },
    {
        "city_code": "SONG",
        "region_code": "SONG",
        "sub_region_code": "SONG",
        "region_slug": "songadh",
        "latitude": "21.1664",
        "longitude": "73.5645"
    },
    {
        "city_code": "RAIH",
        "region_code": "RAIH",
        "sub_region_code": "RAIH",
        "region_slug": "sonipat",
        "latitude": "28.9288",
        "longitude": "77.0913"
    },
    {
        "city_code": "SONH",
        "region_code": "SONH",
        "sub_region_code": "SONH",
        "region_slug": "sonkatch",
        "latitude": "22.9729",
        "longitude": "76.3469"
    },
    {
        "city_code": "SORO",
        "region_code": "SORO",
        "sub_region_code": "SORO",
        "region_slug": "soron",
        "latitude": "27.8866",
        "longitude": "78.7448"
    },
    {
        "city_code": "SPAR",
        "region_code": "SPAR",
        "sub_region_code": "SPAR",
        "region_slug": "south-24-parganas",
        "latitude": "22.08438",
        "longitude": "88.034985"
    },
    {
        "city_code": "SRIG",
        "region_code": "SRIG",
        "sub_region_code": "SRIG",
        "region_slug": "sri-ganganagar",
        "latitude": "29.9167",
        "longitude": "73.8833"
    },
    {
        "city_code": "SRKL",
        "region_code": "SRKL",
        "sub_region_code": "SRKL",
        "region_slug": "srikakulam",
        "latitude": "18.4285",
        "longitude": "84.0167"
    },
    {
        "city_code": "SRNG",
        "region_code": "SRNG",
        "sub_region_code": "SRNG",
        "region_slug": "srinagar",
        "latitude": "34.0837",
        "longitude": "74.7973"
    },
    {
        "city_code": "SRIR",
        "region_code": "SRIR",
        "sub_region_code": "SRIR",
        "region_slug": "srirangapatna",
        "latitude": "12.4216",
        "longitude": "76.6931"
    },
    {
        "city_code": "SRTA",
        "region_code": "SRTA",
        "sub_region_code": "SRTA",
        "region_slug": "srivaikuntam",
        "latitude": "8.6312",
        "longitude": "77.9125"
    },
    {
        "city_code": "SRIV",
        "region_code": "SRIV",
        "sub_region_code": "SRIV",
        "region_slug": "srivilliputhur",
        "latitude": "9.5121",
        "longitude": "77.6341"
    },
    {
        "city_code": "STGH",
        "region_code": "STGH",
        "sub_region_code": "STGH",
        "region_slug": "station-ghanpur",
        "latitude": "17.8471",
        "longitude": "79.3972"
    },
    {
        "city_code": "SSBI",
        "region_code": "SSBI",
        "sub_region_code": "SSBI",
        "region_slug": "sugauli",
        "latitude": "26.7577",
        "longitude": "84.7211"
    },
    {
        "city_code": "SJNG",
        "region_code": "SJNG",
        "sub_region_code": "SJNG",
        "region_slug": "sujangarh",
        "latitude": "27.7045",
        "longitude": "74.4643"
    },
    {
        "city_code": "SULX",
        "region_code": "SULX",
        "sub_region_code": "SULX",
        "region_slug": "sultanabad",
        "latitude": "18.5217",
        "longitude": "79.3184"
    },
    {
        "city_code": "SLUT",
        "region_code": "SLUT",
        "sub_region_code": "SLUT",
        "region_slug": "sultanpur",
        "latitude": "26.2648",
        "longitude": "82.0727"
    },
    {
        "city_code": "SULY",
        "region_code": "SULY",
        "sub_region_code": "SULY",
        "region_slug": "sulthan-bathery",
        "latitude": "11.6656",
        "longitude": "76.2627"
    },
    {
        "city_code": "SURJ",
        "region_code": "SURJ",
        "sub_region_code": "SURJ",
        "region_slug": "sumerpur",
        "latitude": "25.1526",
        "longitude": "73.0823"
    },
    {
        "city_code": "SUNR",
        "region_code": "SUNR",
        "sub_region_code": "SUNR",
        "region_slug": "sundar-nagar",
        "latitude": "31.5332",
        "longitude": "76.8923"
    },
    {
        "city_code": "SUND",
        "region_code": "SUND",
        "sub_region_code": "SUND",
        "region_slug": "sundargarh",
        "latitude": "22.0571",
        "longitude": "84.6897"
    },
    {
        "city_code": "SPUL",
        "region_code": "SPUL",
        "sub_region_code": "SPUL",
        "region_slug": "supaul",
        "latitude": "26.1234",
        "longitude": "86.6045"
    },
    {
        "city_code": "SURA",
        "region_code": "SURA",
        "sub_region_code": "SURA",
        "region_slug": "surajpur",
        "latitude": "23.2148",
        "longitude": "82.8694"
    },
    {
        "city_code": "SURT",
        "region_code": "SURT",
        "sub_region_code": "SURT",
        "region_slug": "surat",
        "latitude": "21.195",
        "longitude": "72.819444"
    },
    {
        "city_code": "SURT",
        "region_code": "SURT",
        "sub_region_code": "KREJ",
        "region_slug": "kamrej",
        "latitude": "21.2695",
        "longitude": "72.9577"
    },
    {
        "city_code": "SURT",
        "region_code": "SURT",
        "sub_region_code": "VACH",
        "region_slug": "varachha",
        "latitude": "21.2021",
        "longitude": "72.8673"
    },
    {
        "city_code": "SRTK",
        "region_code": "SRTK",
        "sub_region_code": "SRTK",
        "region_slug": "surathkal",
        "latitude": "12.9951",
        "longitude": "74.8094"
    },
    {
        "city_code": "SRDN",
        "region_code": "SRDN",
        "sub_region_code": "SRDN",
        "region_slug": "surendranagar",
        "latitude": "22.7201",
        "longitude": "71.6495"
    },
    {
        "city_code": "BSRI",
        "region_code": "BSRI",
        "sub_region_code": "BSRI",
        "region_slug": "suri",
        "latitude": "23.905685",
        "longitude": "87.481727"
    },
    {
        "city_code": "SURY",
        "region_code": "SURY",
        "sub_region_code": "SURY",
        "region_slug": "suryapet",
        "latitude": "17.1353",
        "longitude": "79.6334"
    },
    {
        "city_code": "TNRP",
        "region_code": "TNRP",
        "sub_region_code": "TNRP",
        "region_slug": "tnarasapuram",
        "latitude": "17.1012",
        "longitude": "81.0775"
    },
    {
        "city_code": "TADP",
        "region_code": "TADP",
        "sub_region_code": "TADP",
        "region_slug": "tadepalligudem",
        "latitude": "16.8138",
        "longitude": "81.5212"
    },
    {
        "city_code": "TADK",
        "region_code": "TADK",
        "sub_region_code": "TADK",
        "region_slug": "tadikalapudi",
        "latitude": "16.9002",
        "longitude": "81.1755"
    },
    {
        "city_code": "TDPT",
        "region_code": "TDPT",
        "sub_region_code": "TDPT",
        "region_slug": "tadipatri",
        "latitude": "14.907",
        "longitude": "78.0093"
    },
    {
        "city_code": "TALC",
        "region_code": "TALC",
        "sub_region_code": "TALC",
        "region_slug": "talcher",
        "latitude": "20.9501",
        "longitude": "85.2168"
    },
    {
        "city_code": "TALI",
        "region_code": "TALI",
        "sub_region_code": "TALI",
        "region_slug": "taliparamba",
        "latitude": "12.0351",
        "longitude": "75.3611"
    },
    {
        "city_code": "TTPP",
        "region_code": "TTPP",
        "sub_region_code": "TTPP",
        "region_slug": "tallapudi",
        "latitude": "17.1257",
        "longitude": "81.6651"
    },
    {
        "city_code": "TALL",
        "region_code": "TALL",
        "sub_region_code": "TALL",
        "region_slug": "tallarevu",
        "latitude": "16.7819",
        "longitude": "82.2325"
    },
    {
        "city_code": "TALW",
        "region_code": "TALW",
        "sub_region_code": "TALW",
        "region_slug": "talwandi-bhai",
        "latitude": "30.8576",
        "longitude": "74.9267"
    },
    {
        "city_code": "TMLU",
        "region_code": "TMLU",
        "sub_region_code": "TMLU",
        "region_slug": "tamluk",
        "latitude": "22.2788",
        "longitude": "87.9188"
    },
    {
        "city_code": "TNDA",
        "region_code": "TNDA",
        "sub_region_code": "TNDA",
        "region_slug": "tanda",
        "latitude": "31.678074",
        "longitude": "75.638641"
    },
    {
        "city_code": "TAND",
        "region_code": "TAND",
        "sub_region_code": "TAND",
        "region_slug": "tandur",
        "latitude": "17.2576",
        "longitude": "77.5875"
    },
    {
        "city_code": "TAAA",
        "region_code": "TAAA",
        "sub_region_code": "TAAA",
        "region_slug": "tangla",
        "latitude": "26.6573",
        "longitude": "91.9124"
    },
    {
        "city_code": "TANG",
        "region_code": "TANG",
        "sub_region_code": "TANG",
        "region_slug": "tangutur",
        "latitude": "15.337688",
        "longitude": "80.0333"
    },
    {
        "city_code": "TANK",
        "region_code": "TANK",
        "sub_region_code": "TANK",
        "region_slug": "tanuku",
        "latitude": "16.7572",
        "longitude": "81.68"
    },
    {
        "city_code": "TRPM",
        "region_code": "TRPM",
        "sub_region_code": "TRPM",
        "region_slug": "tarapur",
        "latitude": "19.861181",
        "longitude": "72.68272"
    },
    {
        "city_code": "TERE",
        "region_code": "TERE",
        "sub_region_code": "TERE",
        "region_slug": "tarikere",
        "latitude": "13.7087",
        "longitude": "75.8159"
    },
    {
        "city_code": "TASG",
        "region_code": "TASG",
        "sub_region_code": "TASG",
        "region_slug": "tasgaon",
        "latitude": "17.0295",
        "longitude": "74.6078"
    },
    {
        "city_code": "TATI",
        "region_code": "TATI",
        "sub_region_code": "TATI",
        "region_slug": "tatipaka",
        "latitude": "16.505",
        "longitude": "81.8784"
    },
    {
        "city_code": "TAWA",
        "region_code": "TAWA",
        "sub_region_code": "TAWA",
        "region_slug": "tawang",
        "latitude": "27.6325",
        "longitude": "91.7539"
    },
    {
        "city_code": "TKLI",
        "region_code": "TKLI",
        "sub_region_code": "TKLI",
        "region_slug": "tekkali",
        "latitude": "18.6058",
        "longitude": "84.2302"
    },
    {
        "city_code": "TENA",
        "region_code": "TENA",
        "sub_region_code": "TENA",
        "region_slug": "tenali",
        "latitude": "16.243152",
        "longitude": "80.639716"
    },
    {
        "city_code": "TENK",
        "region_code": "TENK",
        "sub_region_code": "TENK",
        "region_slug": "tenkasi",
        "latitude": "8.959157",
        "longitude": "77.312795"
    },
    {
        "city_code": "TERD",
        "region_code": "TERD",
        "sub_region_code": "TERD",
        "region_slug": "terdal",
        "latitude": "16.49469",
        "longitude": "75.052028"
    },
    {
        "city_code": "TEZP",
        "region_code": "TEZP",
        "sub_region_code": "TEZP",
        "region_slug": "tezpur",
        "latitude": "26.676069",
        "longitude": "92.76059"
    },
    {
        "city_code": "TEZU",
        "region_code": "TEZU",
        "sub_region_code": "TEZU",
        "region_slug": "tezu",
        "latitude": "27.9277",
        "longitude": "96.1533"
    },
    {
        "city_code": "THAY",
        "region_code": "THAY",
        "sub_region_code": "THAY",
        "region_slug": "thalassery",
        "latitude": "11.7533",
        "longitude": "75.4929"
    },
    {
        "city_code": "THAL",
        "region_code": "THAL",
        "sub_region_code": "THAL",
        "region_slug": "thalayolaparambu",
        "latitude": "9.785442",
        "longitude": "76.448922"
    },
    {
        "city_code": "TMRY",
        "region_code": "TMRY",
        "sub_region_code": "TMRY",
        "region_slug": "thamarassery",
        "latitude": "11.4152",
        "longitude": "75.9405"
    },
    {
        "city_code": "THPD",
        "region_code": "THPD",
        "sub_region_code": "THPD",
        "region_slug": "thanipadi",
        "latitude": "12.107423",
        "longitude": "78.834099"
    },
    {
        "city_code": "TANJ",
        "region_code": "TANJ",
        "sub_region_code": "TANJ",
        "region_slug": "thanjavur",
        "latitude": "10.787",
        "longitude": "79.1378"
    },
    {
        "city_code": "THRD",
        "region_code": "THRD",
        "sub_region_code": "THRD",
        "region_slug": "tharad",
        "latitude": "24.3967",
        "longitude": "71.6272"
    },
    {
        "city_code": "THEN",
        "region_code": "THEN",
        "sub_region_code": "THEN",
        "region_slug": "theni",
        "latitude": "9.933",
        "longitude": "77.4702"
    },
    {
        "city_code": "TMPR",
        "region_code": "TMPR",
        "sub_region_code": "TMPR",
        "region_slug": "thimmapuram-addu-road",
        "latitude": "17.4319",
        "longitude": "82.7495"
    },
    {
        "city_code": "THRU",
        "region_code": "THRU",
        "sub_region_code": "THRU",
        "region_slug": "thirubuvanai",
        "latitude": "11.923525",
        "longitude": "79.647842"
    },
    {
        "city_code": "THRM",
        "region_code": "THRM",
        "sub_region_code": "THRM",
        "region_slug": "thirumalagiri",
        "latitude": "16.7231",
        "longitude": "79.3374"
    },
    {
        "city_code": "THND",
        "region_code": "THND",
        "sub_region_code": "THND",
        "region_slug": "thiruthuraipoondi",
        "latitude": "10.5251",
        "longitude": "79.6362"
    },
    {
        "city_code": "THTN",
        "region_code": "THTN",
        "sub_region_code": "THTN",
        "region_slug": "thiruttani",
        "latitude": "13.1758",
        "longitude": "79.6109"
    },
    {
        "city_code": "THVL",
        "region_code": "THVL",
        "sub_region_code": "THVL",
        "region_slug": "thiruvalla",
        "latitude": "9.3835",
        "longitude": "76.5741"
    },
    {
        "city_code": "THVR",
        "region_code": "THVR",
        "sub_region_code": "THVR",
        "region_slug": "thiruvarur",
        "latitude": "10.7713",
        "longitude": "79.637"
    },
    {
        "city_code": "THOD",
        "region_code": "THOD",
        "sub_region_code": "THOD",
        "region_slug": "thodupuzha",
        "latitude": "9.893",
        "longitude": "76.7221"
    },
    {
        "city_code": "THOO",
        "region_code": "THOO",
        "sub_region_code": "THOO",
        "region_slug": "thoothukudi",
        "latitude": "8.7642",
        "longitude": "78.1348"
    },
    {
        "city_code": "THOR",
        "region_code": "THOR",
        "sub_region_code": "THOR",
        "region_slug": "thorrur",
        "latitude": "17.5834",
        "longitude": "79.6586"
    },
    {
        "city_code": "THYM",
        "region_code": "THYM",
        "sub_region_code": "THYM",
        "region_slug": "thottiyam",
        "latitude": "10.9896",
        "longitude": "78.3359"
    },
    {
        "city_code": "THPR",
        "region_code": "THPR",
        "sub_region_code": "THPR",
        "region_slug": "thriprayar",
        "latitude": "10.4171",
        "longitude": "76.1059"
    },
    {
        "city_code": "THSR",
        "region_code": "THSR",
        "sub_region_code": "THSR",
        "region_slug": "thrissur",
        "latitude": "10.5276",
        "longitude": "76.2144"
    },
    {
        "city_code": "THUL",
        "region_code": "THUL",
        "sub_region_code": "THUL",
        "region_slug": "thullur",
        "latitude": "16.524644",
        "longitude": "80.458613"
    },
    {
        "city_code": "THYR",
        "region_code": "THYR",
        "sub_region_code": "THYR",
        "region_slug": "thuraiyur",
        "latitude": "11.1415",
        "longitude": "78.5945"
    },
    {
        "city_code": "TNO",
        "region_code": "TNO",
        "sub_region_code": "TNO",
        "region_slug": "tilda-neora",
        "latitude": "21.5528",
        "longitude": "81.7842"
    },
    {
        "city_code": "TNVM",
        "region_code": "TNVM",
        "sub_region_code": "TNVM",
        "region_slug": "tindivanam",
        "latitude": "12.2369",
        "longitude": "79.65"
    },
    {
        "city_code": "TINS",
        "region_code": "TINS",
        "sub_region_code": "TINS",
        "region_slug": "tinsukia",
        "latitude": "27.489464",
        "longitude": "95.360144"
    },
    {
        "city_code": "TIPT",
        "region_code": "TIPT",
        "sub_region_code": "TIPT",
        "region_slug": "tiptur",
        "latitude": "13.2638",
        "longitude": "76.4703"
    },
    {
        "city_code": "TRCD",
        "region_code": "TRCD",
        "sub_region_code": "TRCD",
        "region_slug": "tiruchendur",
        "latitude": "8.4963",
        "longitude": "78.1251"
    },
    {
        "city_code": "TRKR",
        "region_code": "TRKR",
        "sub_region_code": "TRKR",
        "region_slug": "tirukoilur",
        "latitude": "11.9687",
        "longitude": "79.2087"
    },
    {
        "city_code": "TINA",
        "region_code": "TINA",
        "sub_region_code": "TINA",
        "region_slug": "tirumakudalu-narasipura",
        "latitude": "12.211",
        "longitude": "76.9038"
    },
    {
        "city_code": "TIRV",
        "region_code": "TIRV",
        "sub_region_code": "TIRV",
        "region_slug": "tirunelveli",
        "latitude": "8.73",
        "longitude": "77.7"
    },
    {
        "city_code": "TIRU",
        "region_code": "TIRU",
        "sub_region_code": "TIRU",
        "region_slug": "tirupati",
        "latitude": "13.6288",
        "longitude": "79.4192"
    },
    {
        "city_code": "TIRU",
        "region_code": "TIRU",
        "sub_region_code": "CHAD",
        "region_slug": "chandragiri",
        "latitude": "13.5881",
        "longitude": "79.3156"
    },
    {
        "city_code": "TIRU",
        "region_code": "TIRU",
        "sub_region_code": "SRTI",
        "region_slug": "srikalahasti",
        "latitude": "13.752",
        "longitude": "79.7037"
    },
    {
        "city_code": "TRPR",
        "region_code": "TRPR",
        "sub_region_code": "TRPR",
        "region_slug": "tirupattur",
        "latitude": "12.5081",
        "longitude": "78.5702"
    },
    {
        "city_code": "TIRP",
        "region_code": "TIRP",
        "sub_region_code": "TIRP",
        "region_slug": "tirupur",
        "latitude": "11.108524",
        "longitude": "77.341066"
    },
    {
        "city_code": "TRUR",
        "region_code": "TRUR",
        "sub_region_code": "TRUR",
        "region_slug": "tirur",
        "latitude": "10.9146",
        "longitude": "75.9221"
    },
    {
        "city_code": "TRVL",
        "region_code": "TRVL",
        "sub_region_code": "TRVL",
        "region_slug": "tiruvallur",
        "latitude": "13.1444",
        "longitude": "79.894"
    },
    {
        "city_code": "TVNM",
        "region_code": "TVNM",
        "sub_region_code": "TVNM",
        "region_slug": "tiruvannamalai",
        "latitude": "12.2253",
        "longitude": "79.0747"
    },
    {
        "city_code": "TIVA",
        "region_code": "TIVA",
        "sub_region_code": "TIVA",
        "region_slug": "tiruvarur",
        "latitude": "10.6683",
        "longitude": "79.5154"
    },
    {
        "city_code": "TRVR",
        "region_code": "TRVR",
        "sub_region_code": "TRVR",
        "region_slug": "tiruvuru",
        "latitude": "17.1099",
        "longitude": "80.6094"
    },
    {
        "city_code": "TTGH",
        "region_code": "TTGH",
        "sub_region_code": "TTGH",
        "region_slug": "titagarh",
        "latitude": "22.739199",
        "longitude": "88.366728"
    },
    {
        "city_code": "TITL",
        "region_code": "TITL",
        "sub_region_code": "TITL",
        "region_slug": "titlagarh",
        "latitude": "20.2871",
        "longitude": "83.1466"
    },
    {
        "city_code": "TITT",
        "region_code": "TITT",
        "sub_region_code": "TITT",
        "region_slug": "tittakudi",
        "latitude": "11.4096",
        "longitude": "79.1182"
    },
    {
        "city_code": "TONK",
        "region_code": "TONK",
        "sub_region_code": "TONK",
        "region_slug": "tonk",
        "latitude": "26.162",
        "longitude": "75.7895"
    },
    {
        "city_code": "TOOP",
        "region_code": "TOOP",
        "sub_region_code": "TOOP",
        "region_slug": "toopran",
        "latitude": "17.8443",
        "longitude": "78.478"
    },
    {
        "city_code": "TRIC",
        "region_code": "TRIC",
        "sub_region_code": "TRIC",
        "region_slug": "trichy",
        "latitude": "10.805",
        "longitude": "78.6856"
    },
    {
        "city_code": "TRIV",
        "region_code": "TRIV",
        "sub_region_code": "TRIV",
        "region_slug": "trivandrum",
        "latitude": "8.4875",
        "longitude": "76.9525"
    },
    {
        "city_code": "TUMK",
        "region_code": "TUMK",
        "sub_region_code": "TUMK",
        "region_slug": "tumakuru-tumkur",
        "latitude": "13.340138",
        "longitude": "77.100098"
    },
    {
        "city_code": "TUSR",
        "region_code": "TUSR",
        "sub_region_code": "TUSR",
        "region_slug": "tumsar",
        "latitude": "21.3808",
        "longitude": "79.7456"
    },
    {
        "city_code": "TURA",
        "region_code": "TURA",
        "sub_region_code": "TURA",
        "region_slug": "tura",
        "latitude": "25.525359",
        "longitude": "90.197153"
    },
    {
        "city_code": "TUPP",
        "region_code": "TUPP",
        "sub_region_code": "TUPP",
        "region_slug": "turputallu",
        "latitude": "16.4295",
        "longitude": "81.6425"
    },
    {
        "city_code": "TUKE",
        "region_code": "TUKE",
        "sub_region_code": "TUKE",
        "region_slug": "turuvekere",
        "latitude": "13.1605",
        "longitude": "76.6673"
    },
    {
        "city_code": "UDAI",
        "region_code": "UDAI",
        "sub_region_code": "UDAI",
        "region_slug": "udaipur",
        "latitude": "24.58",
        "longitude": "73.68"
    },
    {
        "city_code": "UDAY",
        "region_code": "UDAY",
        "sub_region_code": "UDAY",
        "region_slug": "udaynarayanpur",
        "latitude": "22.7174",
        "longitude": "87.9751"
    },
    {
        "city_code": "UDGR",
        "region_code": "UDGR",
        "sub_region_code": "UDGR",
        "region_slug": "udgir",
        "latitude": "18.3943",
        "longitude": "77.1126"
    },
    {
        "city_code": "UDHM",
        "region_code": "UDHM",
        "sub_region_code": "UDHM",
        "region_slug": "udhampur",
        "latitude": "32.916",
        "longitude": "75.1416"
    },
    {
        "city_code": "UDMP",
        "region_code": "UDMP",
        "sub_region_code": "UDMP",
        "region_slug": "udumalpet",
        "latitude": "10.584301",
        "longitude": "77.250333"
    },
    {
        "city_code": "UDUP",
        "region_code": "UDUP",
        "sub_region_code": "UDUP",
        "region_slug": "udupi",
        "latitude": "13.3409",
        "longitude": "74.7421"
    },
    {
        "city_code": "UJHA",
        "region_code": "UJHA",
        "sub_region_code": "UJHA",
        "region_slug": "ujhani",
        "latitude": "28.001448",
        "longitude": "78.990589"
    },
    {
        "city_code": "UJJN",
        "region_code": "UJJN",
        "sub_region_code": "UJJN",
        "region_slug": "ujjain",
        "latitude": "23.1828",
        "longitude": "75.7772"
    },
    {
        "city_code": "ULLI",
        "region_code": "ULLI",
        "sub_region_code": "ULLI",
        "region_slug": "ulikkal",
        "latitude": "12.0375",
        "longitude": "75.6703"
    },
    {
        "city_code": "ULUR",
        "region_code": "ULUR",
        "sub_region_code": "ULUR",
        "region_slug": "uluberia",
        "latitude": "22.4744",
        "longitude": "88.1"
    },
    {
        "city_code": "ULPT",
        "region_code": "ULPT",
        "sub_region_code": "ULPT",
        "region_slug": "ulundurpet",
        "latitude": "11.6849",
        "longitude": "79.2874"
    },
    {
        "city_code": "UMR",
        "region_code": "UMR",
        "sub_region_code": "UMR",
        "region_slug": "umaria",
        "latitude": "23.604447",
        "longitude": "80.504907"
    },
    {
        "city_code": "UMR",
        "region_code": "UMR",
        "sub_region_code": "UMRE",
        "region_slug": "umaria",
        "latitude": "23.604447",
        "longitude": "80.504907"
    },
    {
        "city_code": "UMER",
        "region_code": "UMER",
        "sub_region_code": "UMER",
        "region_slug": "umbergaon",
        "latitude": "20.175675",
        "longitude": "72.734766"
    },
    {
        "city_code": "UMBR",
        "region_code": "UMBR",
        "sub_region_code": "UMBR",
        "region_slug": "umbraj",
        "latitude": "17.396294",
        "longitude": "74.084697"
    },
    {
        "city_code": "UMEK",
        "region_code": "UMEK",
        "sub_region_code": "UMEK",
        "region_slug": "umerkote",
        "latitude": "19.6647",
        "longitude": "82.2121"
    },
    {
        "city_code": "UMRD",
        "region_code": "UMRD",
        "sub_region_code": "UMRD",
        "region_slug": "umred",
        "latitude": "20.8421",
        "longitude": "79.3261"
    },
    {
        "city_code": "BEEL",
        "region_code": "BEEL",
        "sub_region_code": "BEEL",
        "region_slug": "una",
        "latitude": "31.4685",
        "longitude": "76.2708"
    },
    {
        "city_code": "UNAU",
        "region_code": "UNAU",
        "sub_region_code": "UNAU",
        "region_slug": "una-gujarat",
        "latitude": "20.8235",
        "longitude": "71.0409"
    },
    {
        "city_code": "UVLI",
        "region_code": "UVLI",
        "sub_region_code": "UVLI",
        "region_slug": "undavalli",
        "latitude": "16.4957",
        "longitude": "80.58"
    },
    {
        "city_code": "UNNA",
        "region_code": "UNNA",
        "sub_region_code": "UNNA",
        "region_slug": "unnao",
        "latitude": "26.539233",
        "longitude": "80.487848"
    },
    {
        "city_code": "UPDA",
        "region_code": "UPDA",
        "sub_region_code": "UPDA",
        "region_slug": "uppada",
        "latitude": "17.0883",
        "longitude": "82.3333"
    },
    {
        "city_code": "UTHM",
        "region_code": "UTHM",
        "sub_region_code": "UTHM",
        "region_slug": "uthamapalayam",
        "latitude": "9.8086",
        "longitude": "77.3281"
    },
    {
        "city_code": "UHGR",
        "region_code": "UHGR",
        "sub_region_code": "UHGR",
        "region_slug": "uthangarai",
        "latitude": "12.31106",
        "longitude": "78.38567"
    },
    {
        "city_code": "UTHI",
        "region_code": "UTHI",
        "sub_region_code": "UTHI",
        "region_slug": "uthiramerur",
        "latitude": "12.6149",
        "longitude": "79.7594"
    },
    {
        "city_code": "UTHU",
        "region_code": "UTHU",
        "sub_region_code": "UTHU",
        "region_slug": "uthukottai",
        "latitude": "13.3339",
        "longitude": "79.8927"
    },
    {
        "city_code": "UTRA",
        "region_code": "UTRA",
        "sub_region_code": "UTRA",
        "region_slug": "utraula",
        "latitude": "27.3175",
        "longitude": "82.4184"
    },
    {
        "city_code": "UTK",
        "region_code": "UTK",
        "sub_region_code": "UTK",
        "region_slug": "uttara-kannada",
        "latitude": "14.7937",
        "longitude": "74.6869"
    },
    {
        "city_code": "UTTA",
        "region_code": "UTTA",
        "sub_region_code": "UTTA",
        "region_slug": "uttarkashi",
        "latitude": "30.7268",
        "longitude": "78.4354"
    },
    {
        "city_code": "VDKR",
        "region_code": "VDKR",
        "sub_region_code": "VDKR",
        "region_slug": "vadakara",
        "latitude": "11.6085",
        "longitude": "75.5917"
    },
    {
        "city_code": "VDCY",
        "region_code": "VDCY",
        "sub_region_code": "VDCY",
        "region_slug": "vadakkencherry",
        "latitude": "10.5928",
        "longitude": "76.4823"
    },
    {
        "city_code": "VADA",
        "region_code": "VADA",
        "sub_region_code": "VADA",
        "region_slug": "vadalur",
        "latitude": "11.5573",
        "longitude": "79.5547"
    },
    {
        "city_code": "VADN",
        "region_code": "VADN",
        "sub_region_code": "VADN",
        "region_slug": "vadanappally",
        "latitude": "10.474478",
        "longitude": "76.069517"
    },
    {
        "city_code": "VAD",
        "region_code": "VAD",
        "sub_region_code": "VAD",
        "region_slug": "vadodara",
        "latitude": "22.30731",
        "longitude": "73.181098"
    },
    {
        "city_code": "VADJ",
        "region_code": "VADJ",
        "sub_region_code": "VADJ",
        "region_slug": "vaduj",
        "latitude": "17.5935",
        "longitude": "74.4511"
    },
    {
        "city_code": "VAIJ",
        "region_code": "VAIJ",
        "sub_region_code": "VAIJ",
        "region_slug": "vaijapur",
        "latitude": "19.9257",
        "longitude": "74.7285"
    },
    {
        "city_code": "VLAP",
        "region_code": "VLAP",
        "sub_region_code": "VLAP",
        "region_slug": "valaparla",
        "latitude": "15.93216",
        "longitude": "80.044487"
    },
    {
        "city_code": "VALI",
        "region_code": "VALI",
        "sub_region_code": "VALI",
        "region_slug": "valigonda",
        "latitude": "17.376347",
        "longitude": "79.021693"
    },
    {
        "city_code": "VALL",
        "region_code": "VALL",
        "sub_region_code": "VALL",
        "region_slug": "valluru",
        "latitude": "16.558",
        "longitude": "81.83"
    },
    {
        "city_code": "VLSD",
        "region_code": "VLSD",
        "sub_region_code": "VLSD",
        "region_slug": "valsad",
        "latitude": "20.610069",
        "longitude": "72.925858"
    },
    {
        "city_code": "VANI",
        "region_code": "VANI",
        "sub_region_code": "VANI",
        "region_slug": "vaniyambadi",
        "latitude": "12.695",
        "longitude": "78.6219"
    },
    {
        "city_code": "VAPI",
        "region_code": "VAPI",
        "sub_region_code": "VAPI",
        "region_slug": "vapi",
        "latitude": "20.371237",
        "longitude": "72.90634"
    },
    {
        "city_code": "VARA",
        "region_code": "VARA",
        "sub_region_code": "VARA",
        "region_slug": "varadaiahpalem",
        "latitude": "13.6012",
        "longitude": "79.9347"
    },
    {
        "city_code": "VRYM",
        "region_code": "VRYM",
        "sub_region_code": "VRYM",
        "region_slug": "varadiyam",
        "latitude": "10.5916",
        "longitude": "76.174"
    },
    {
        "city_code": "VAR",
        "region_code": "VAR",
        "sub_region_code": "VAR",
        "region_slug": "varanasi",
        "latitude": "25.317645",
        "longitude": "82.973914"
    },
    {
        "city_code": "VKAL",
        "region_code": "VKAL",
        "sub_region_code": "VKAL",
        "region_slug": "varkala",
        "latitude": "8.743375",
        "longitude": "76.720871"
    },
    {
        "city_code": "VASI",
        "region_code": "VASI",
        "sub_region_code": "VASI",
        "region_slug": "vasind",
        "latitude": "19.4082",
        "longitude": "73.2646"
    },
    {
        "city_code": "VAST",
        "region_code": "VAST",
        "sub_region_code": "VAST",
        "region_slug": "vatsavai",
        "latitude": "16.9804",
        "longitude": "80.2447"
    },
    {
        "city_code": "VAZH",
        "region_code": "VAZH",
        "sub_region_code": "VAZH",
        "region_slug": "vazhapadi",
        "latitude": "11.6555",
        "longitude": "78.4013"
    },
    {
        "city_code": "VEDA",
        "region_code": "VEDA",
        "sub_region_code": "VEDA",
        "region_slug": "vedasandur",
        "latitude": "10.5315",
        "longitude": "77.9482"
    },
    {
        "city_code": "VEER",
        "region_code": "VEER",
        "sub_region_code": "VEER",
        "region_slug": "veeraghattam",
        "latitude": "18.6886",
        "longitude": "83.6096"
    },
    {
        "city_code": "VELG",
        "region_code": "VELG",
        "sub_region_code": "VELG",
        "region_slug": "velangi",
        "latitude": "16.8697",
        "longitude": "82.1142"
    },
    {
        "city_code": "VELA",
        "region_code": "VELA",
        "sub_region_code": "VELA",
        "region_slug": "velanja",
        "latitude": "21.3082",
        "longitude": "72.9151"
    },
    {
        "city_code": "VELM",
        "region_code": "VELM",
        "sub_region_code": "VELM",
        "region_slug": "velanthavalam",
        "latitude": "10.8129",
        "longitude": "76.8577"
    },
    {
        "city_code": "VELI",
        "region_code": "VELI",
        "sub_region_code": "VELI",
        "region_slug": "vellakoil",
        "latitude": "10.946",
        "longitude": "77.7126"
    },
    {
        "city_code": "VELL",
        "region_code": "VELL",
        "sub_region_code": "VELL",
        "region_slug": "vellore",
        "latitude": "12.9202",
        "longitude": "79.1333"
    },
    {
        "city_code": "VLGD",
        "region_code": "VLGD",
        "sub_region_code": "VLGD",
        "region_slug": "velugodu",
        "latitude": "15.7183",
        "longitude": "78.5746"
    },
    {
        "city_code": "VAIM",
        "region_code": "VAIM",
        "sub_region_code": "VAIM",
        "region_slug": "vempalli",
        "latitude": "14.3662",
        "longitude": "78.4586"
    },
    {
        "city_code": "VERU",
        "region_code": "VERU",
        "sub_region_code": "VERU",
        "region_slug": "vemulawada",
        "latitude": "18.4681",
        "longitude": "78.8671"
    },
    {
        "city_code": "VENG",
        "region_code": "VENG",
        "sub_region_code": "VENG",
        "region_slug": "vengurla",
        "latitude": "15.760721",
        "longitude": "73.663858"
    },
    {
        "city_code": "VNKT",
        "region_code": "VNKT",
        "sub_region_code": "VNKT",
        "region_slug": "venkatapuram",
        "latitude": "18.3062",
        "longitude": "80.5504"
    },
    {
        "city_code": "VRAL",
        "region_code": "VRAL",
        "sub_region_code": "VRAL",
        "region_slug": "veraval",
        "latitude": "20.9159",
        "longitude": "70.3629"
    },
    {
        "city_code": "VLEM",
        "region_code": "VLEM",
        "sub_region_code": "VLEM",
        "region_slug": "vetapalem",
        "latitude": "10.7723",
        "longitude": "76.3695"
    },
    {
        "city_code": "VETA",
        "region_code": "VETA",
        "sub_region_code": "VETA",
        "region_slug": "vettaikaranpudur",
        "latitude": "10.562",
        "longitude": "76.9211"
    },
    {
        "city_code": "VETT",
        "region_code": "VETT",
        "sub_region_code": "VETT",
        "region_slug": "vettavalam",
        "latitude": "12.1092",
        "longitude": "79.2437"
    },
    {
        "city_code": "VIDI",
        "region_code": "VIDI",
        "sub_region_code": "VIDI",
        "region_slug": "vidisha",
        "latitude": "23.5251",
        "longitude": "77.8081"
    },
    {
        "city_code": "VIUR",
        "region_code": "VIUR",
        "sub_region_code": "VIUR",
        "region_slug": "vijapur",
        "latitude": "23.5609",
        "longitude": "72.7511"
    },
    {
        "city_code": "VIJP",
        "region_code": "VIJP",
        "sub_region_code": "VIJP",
        "region_slug": "vijayapura-bengaluru-rural",
        "latitude": "13.2955",
        "longitude": "77.801"
    },
    {
        "city_code": "VJPR",
        "region_code": "VJPR",
        "sub_region_code": "VJPR",
        "region_slug": "vijayapura-bijapur",
        "latitude": "16.8302",
        "longitude": "75.71"
    },
    {
        "city_code": "VRAI",
        "region_code": "VRAI",
        "sub_region_code": "VRAI",
        "region_slug": "vijayarai",
        "latitude": "16.8121",
        "longitude": "81.0327"
    },
    {
        "city_code": "VIJA",
        "region_code": "VIJA",
        "sub_region_code": "VIJA",
        "region_slug": "vijayawada",
        "latitude": "16.519",
        "longitude": "80.6215"
    },
    {
        "city_code": "VIJA",
        "region_code": "VIJA",
        "sub_region_code": "GANN",
        "region_slug": "gannavaram",
        "latitude": "16.538591",
        "longitude": "80.798218"
    },
    {
        "city_code": "VIJA",
        "region_code": "VIJA",
        "sub_region_code": "TELP",
        "region_slug": "telaprolu",
        "latitude": "16.5811",
        "longitude": "80.8917"
    },
    {
        "city_code": "VKBD",
        "region_code": "VKBD",
        "sub_region_code": "VKBD",
        "region_slug": "vikarabad",
        "latitude": "17.3364",
        "longitude": "77.9048"
    },
    {
        "city_code": "VKNG",
        "region_code": "VKNG",
        "sub_region_code": "VKNG",
        "region_slug": "vikasnagar",
        "latitude": "30.475322",
        "longitude": "77.764275"
    },
    {
        "city_code": "VIVI",
        "region_code": "VIVI",
        "sub_region_code": "VIVI",
        "region_slug": "vikravandi",
        "latitude": "12.0372",
        "longitude": "79.5458"
    },
    {
        "city_code": "VILL",
        "region_code": "VILL",
        "sub_region_code": "VILL",
        "region_slug": "villupuram",
        "latitude": "11.9369",
        "longitude": "79.4873"
    },
    {
        "city_code": "VNKD",
        "region_code": "VNKD",
        "sub_region_code": "VNKD",
        "region_slug": "vinukonda",
        "latitude": "16.0568",
        "longitude": "79.7453"
    },
    {
        "city_code": "VIRA",
        "region_code": "VIRA",
        "sub_region_code": "VIRA",
        "region_slug": "viralimalai",
        "latitude": "10.6037",
        "longitude": "78.5462"
    },
    {
        "city_code": "VIDM",
        "region_code": "VIDM",
        "sub_region_code": "VIDM",
        "region_slug": "virudhachalam",
        "latitude": "11.5196",
        "longitude": "79.3252"
    },
    {
        "city_code": "VIRU",
        "region_code": "VIRU",
        "sub_region_code": "VIRU",
        "region_slug": "virudhunagar",
        "latitude": "9.568",
        "longitude": "77.9624"
    },
    {
        "city_code": "VISN",
        "region_code": "VISN",
        "sub_region_code": "VISN",
        "region_slug": "visnagar",
        "latitude": "23.6977",
        "longitude": "72.5382"
    },
    {
        "city_code": "VSNP",
        "region_code": "VSNP",
        "sub_region_code": "VSNP",
        "region_slug": "vissannapeta",
        "latitude": "16.9426",
        "longitude": "80.7796"
    },
    {
        "city_code": "VITA",
        "region_code": "VITA",
        "sub_region_code": "VITA",
        "region_slug": "vita",
        "latitude": "17.273096",
        "longitude": "74.538826"
    },
    {
        "city_code": "VTHC",
        "region_code": "VTHC",
        "sub_region_code": "VTHC",
        "region_slug": "vithlapur",
        "latitude": "23.3637",
        "longitude": "72.0542"
    },
    {
        "city_code": "VIZA",
        "region_code": "VIZA",
        "sub_region_code": "VIZA",
        "region_slug": "vizag-visakhapatnam",
        "latitude": "17.686816",
        "longitude": "83.218482"
    },
    {
        "city_code": "VIZI",
        "region_code": "VIZI",
        "sub_region_code": "VIZI",
        "region_slug": "vizianagaram",
        "latitude": "18.107144",
        "longitude": "83.392975"
    },
    {
        "city_code": "VRIN",
        "region_code": "VRIN",
        "sub_region_code": "VRIN",
        "region_slug": "vrindavan",
        "latitude": "27.565",
        "longitude": "77.6593"
    },
    {
        "city_code": "VYUR",
        "region_code": "VYUR",
        "sub_region_code": "VYUR",
        "region_slug": "vuyyuru",
        "latitude": "16.3675",
        "longitude": "80.8435"
    },
    {
        "city_code": "VYAR",
        "region_code": "VYAR",
        "sub_region_code": "VYAR",
        "region_slug": "vyara",
        "latitude": "21.1104",
        "longitude": "73.3861"
    },
    {
        "city_code": "WADA",
        "region_code": "WADA",
        "sub_region_code": "WADA",
        "region_slug": "wadakkancherry",
        "latitude": "10.6617",
        "longitude": "76.2363"
    },
    {
        "city_code": "WAIP",
        "region_code": "WAIP",
        "sub_region_code": "WAIP",
        "region_slug": "wai",
        "latitude": "17.9487",
        "longitude": "73.8919"
    },
    {
        "city_code": "WALU",
        "region_code": "WALU",
        "sub_region_code": "WALU",
        "region_slug": "waluj",
        "latitude": "19.839911",
        "longitude": "75.236237"
    },
    {
        "city_code": "WANA",
        "region_code": "WANA",
        "sub_region_code": "WANA",
        "region_slug": "wanaparthy",
        "latitude": "16.362514",
        "longitude": "78.063183"
    },
    {
        "city_code": "WANI",
        "region_code": "WANI",
        "sub_region_code": "WANI",
        "region_slug": "wani",
        "latitude": "20.060804",
        "longitude": "78.957059"
    },
    {
        "city_code": "WAR",
        "region_code": "WAR",
        "sub_region_code": "WAR",
        "region_slug": "warangal",
        "latitude": "18.000055",
        "longitude": "79.588167"
    },
    {
        "city_code": "WARD",
        "region_code": "WARD",
        "sub_region_code": "WARD",
        "region_slug": "wardha",
        "latitude": "20.745257",
        "longitude": "78.600217"
    },
    {
        "city_code": "WRRA",
        "region_code": "WRRA",
        "sub_region_code": "WRRA",
        "region_slug": "warora",
        "latitude": "20.2407",
        "longitude": "79.0136"
    },
    {
        "city_code": "WASH",
        "region_code": "WASH",
        "sub_region_code": "WASH",
        "region_slug": "washim",
        "latitude": "20.139",
        "longitude": "77.1025"
    },
    {
        "city_code": "WAYA",
        "region_code": "WAYA",
        "sub_region_code": "WAYA",
        "region_slug": "wayanad",
        "latitude": "11.6854",
        "longitude": "76.132"
    },
    {
        "city_code": "WTKN",
        "region_code": "WTKN",
        "sub_region_code": "WTKN",
        "region_slug": "west-kameng",
        "latitude": "27.3428",
        "longitude": "92.3024"
    },
    {
        "city_code": "WWAR",
        "region_code": "WWAR",
        "sub_region_code": "WWAR",
        "region_slug": "wyra",
        "latitude": "17.193825",
        "longitude": "80.34712"
    },
    {
        "city_code": "YADG",
        "region_code": "YADG",
        "sub_region_code": "YADG",
        "region_slug": "yadagirigutta",
        "latitude": "17.5892",
        "longitude": "78.9448"
    },
    {
        "city_code": "YAMU",
        "region_code": "YAMU",
        "sub_region_code": "YAMU",
        "region_slug": "yamunanagar",
        "latitude": "30.129",
        "longitude": "77.2674"
    },
    {
        "city_code": "YANM",
        "region_code": "YANM",
        "sub_region_code": "YANM",
        "region_slug": "yanam",
        "latitude": "16.7272",
        "longitude": "82.2176"
    },
    {
        "city_code": "MYAN",
        "region_code": "MYAN",
        "sub_region_code": "MYAN",
        "region_slug": "yangon",
        "latitude": "16.8661",
        "longitude": "96.1951"
    },
    {
        "city_code": "YAVA",
        "region_code": "YAVA",
        "sub_region_code": "YAVA",
        "region_slug": "yavatmal",
        "latitude": "20.117",
        "longitude": "78.1108"
    },
    {
        "city_code": "YLGA",
        "region_code": "YLGA",
        "sub_region_code": "YLGA",
        "region_slug": "yelagiri",
        "latitude": "12.575045",
        "longitude": "78.624902"
    },
    {
        "city_code": "YELB",
        "region_code": "YELB",
        "sub_region_code": "YELB",
        "region_slug": "yelburga",
        "latitude": "15.6142",
        "longitude": "76.0131"
    },
    {
        "city_code": "YELE",
        "region_code": "YELE",
        "sub_region_code": "YELE",
        "region_slug": "yeleswaram",
        "latitude": "17.2883",
        "longitude": "82.1064"
    },
    {
        "city_code": "YLMN",
        "region_code": "YLMN",
        "sub_region_code": "YLMN",
        "region_slug": "yellamanchili",
        "latitude": "17.5497",
        "longitude": "82.8518"
    },
    {
        "city_code": "YRLL",
        "region_code": "YRLL",
        "sub_region_code": "YRLL",
        "region_slug": "yellandu",
        "latitude": "17.5941",
        "longitude": "80.3224"
    },
    {
        "city_code": "YLLR",
        "region_code": "YLLR",
        "sub_region_code": "YLLR",
        "region_slug": "yellareddy",
        "latitude": "18.191229",
        "longitude": "78.023183"
    },
    {
        "city_code": "YLRD",
        "region_code": "YLRD",
        "sub_region_code": "YLRD",
        "region_slug": "yellareddypet",
        "latitude": "18.3965",
        "longitude": "78.8186"
    },
    {
        "city_code": "YEMM",
        "region_code": "YEMM",
        "sub_region_code": "YEMM",
        "region_slug": "yemmiganur",
        "latitude": "15.760086",
        "longitude": "77.465458"
    },
    {
        "city_code": "YEOL",
        "region_code": "YEOL",
        "sub_region_code": "YEOL",
        "region_slug": "yeola",
        "latitude": "20.0432",
        "longitude": "74.484"
    },
    {
        "city_code": "YERA",
        "region_code": "YERA",
        "sub_region_code": "YERA",
        "region_slug": "yerragondapalem",
        "latitude": "16.0367",
        "longitude": "79.3071"
    },
    {
        "city_code": "YERR",
        "region_code": "YERR",
        "sub_region_code": "YERR",
        "region_slug": "yerraguntla",
        "latitude": "14.6394",
        "longitude": "78.5349"
    },
    {
        "city_code": "YEWE",
        "region_code": "YEWE",
        "sub_region_code": "YEWE",
        "region_slug": "yewat",
        "latitude": "18.478185",
        "longitude": "74.269946"
    },
    {
        "city_code": "YUKS",
        "region_code": "YUKS",
        "sub_region_code": "YUKS",
        "region_slug": "yuksom",
        "latitude": "27.372462",
        "longitude": "88.222472"
    },
    {
        "city_code": "ZAGE",
        "region_code": "ZAGE",
        "sub_region_code": "ZAGE",
        "region_slug": "zaheerabad",
        "latitude": "17.6748",
        "longitude": "77.6164"
    },
    {
        "city_code": "ZARA",
        "region_code": "ZARA",
        "sub_region_code": "ZARA",
        "region_slug": "zarap",
        "latitude": "15.9474",
        "longitude": "73.7341"
    },
    {
        "city_code": "ZARA",
        "region_code": "ZARA",
        "sub_region_code": "ZAEA",
        "region_slug": "zarap",
        "latitude": "15.9474",
        "longitude": "73.7341"
    },
    {
        "city_code": "ZIRO",
        "region_code": "ZIRO",
        "sub_region_code": "ZIRO",
        "region_slug": "ziro",
        "latitude": "27.5448",
        "longitude": "93.8196"
    }
];

// Fetch showtimes for each city
cities.forEach(city => {
  fetchShowtimes(city);
});
