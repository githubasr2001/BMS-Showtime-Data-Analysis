 BMS Showtime Data Analysis

## Project Overview

This project is designed to automate the process of collecting and analyzing movie showtimes across various cities. The data is sourced from multiple locations, providing insights into cinema occupancy levels, geographical data of cities, and ticket availability patterns. The project focuses on processing data using JavaScript objects and JSON files to handle city information and occupancy levels.

## Project Structure

The project contains the following key components:

1. **City Data (`cities_TS.json`)**:  
   Contains the geographical information for cities in the Telangana region, including city codes, region slugs, latitudes, and longitudes. This data helps in mapping showtime information to specific locations.

2. **High and Low Occupancy Data**:  
   - `highoccupancy.js`: This file contains data on cities where cinemas have high occupancy rates.
   - `lowoccupancy.js`: This file contains data on cities where cinema occupancy rates are low.

3. **Metro Cities Data (`cities_metro.js`)**:  
   Contains data for major metropolitan cities, helping to segregate metro-level cinema showtime information.

4. **BMS Data (`bms_data.js`)**:  
   A data file that captures the core movie showtime and ticket information. It includes time slots, ticket availability, and occupancy rates for different cities.

## Features

- **Data Automation**: Automates the process of fetching cinema occupancy and showtime data for various cities.
- **City Information Mapping**: Integrates city-specific data with cinema showtimes for more granular insights.
- **Occupancy Analysis**: Classifies cities into high and low occupancy categories based on available ticket data.
- **Scalability**: Easily extendable to include new cities or data sources as needed.

## How to Use

1. **Clone the Repository**:  
   Clone the repository to your local machine using the following command:
   ```bash
   git clone https://github.com/YourGitHubUsername/BMS-Showtime-Data-Analysis.git
   ```

2. **Add City Data**:  
   The city information is stored in the `cities_TS.json` file. You can add more cities by extending the JSON structure:
   ```json
   {
       "city_code": "NEW",
       "region_code": "NEW",
       "sub_region_code": "NEW",
       "region_slug": "newcity",
       "latitude": "0.0000",
       "longitude": "0.0000"
   }
   ```

3. **Data Analysis**:  
   - Run the JavaScript files (`bms_data.js`, `cities_metro.js`, `highoccupancy.js`, `lowoccupancy.js`) to fetch and analyze cinema showtimes.
   - You can use Node.js to run these files:
     ```bash
     node bms_data.js
     ```

4. **Occupancy Categorization**:  
   The files `highoccupancy.js` and `lowoccupancy.js` categorize cities based on the occupancy levels. Modify these files as necessary to adjust occupancy thresholds or add more cities.

## Future Enhancements

- **Visualization**: Implement data visualization tools to graphically represent occupancy and showtime trends.
- **Real-Time Data**: Integrate real-time data collection for more accurate and up-to-date insights.
- **Additional Regions**: Expand the analysis to other states and cities beyond Telangana.
