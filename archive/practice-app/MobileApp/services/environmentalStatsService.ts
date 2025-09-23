interface CO2Data {
  co2: number;
  trend: string;
  year: number;
  month: number;
  day: number;
  cycle: string;
}

interface CO2Response {
  co2: Array<{
    year: string;
    month: string;
    day: string;
    cycle: string;
    trend: string;
  }>;
}

interface ArcticData {
  year: number;
  month: number;
  extent: number;
  anomaly: number;
}

interface ArcticResponse {
  error: null | string;
  arcticData: {
    description: {
      title: string;
      units: string;
      basePeriod: string;
      annualMean: number;
      decadalTrend: number;
      missing: number;
    };
    data: {
      [key: string]: {
        value: number;
        anom: number;
        monthlyMean: number;
      };
    };
  };
}

interface TemperatureData {
  year: number;
  month: number;
  station: number;
  land: number;
}

interface TemperatureResponse {
  result: Array<{
    time: string;
    station: string;
    land: string;
  }>;
}

/**
 * Fetches the latest CO2 levels from the global-warming.org API
 * @returns The latest CO2 data
 */
export const fetchLatestCO2Level = async (): Promise<CO2Data | null> => {
  try {
    const response = await fetch('https://global-warming.org/api/co2-api');
    
    if (!response.ok) {
      throw new Error('Failed to fetch CO2 data');
    }
    
    const data = await response.json() as CO2Response;
    
    // Make sure we have valid data
    if (!data.co2 || !Array.isArray(data.co2) || data.co2.length === 0) {
      throw new Error('Invalid CO2 data format');
    }
    
    // Get the most recent entry
    const latestEntry = data.co2[data.co2.length - 1];
    
    return {
      co2: parseFloat(latestEntry.trend),
      trend: latestEntry.trend,
      year: parseInt(latestEntry.year, 10),
      month: parseInt(latestEntry.month, 10),
      day: parseInt(latestEntry.day, 10),
      cycle: latestEntry.cycle
    };
  } catch (error) {
    console.error('Error fetching CO2 data:', error);
    return null;
  }
};

/**
 * Fetches the latest Arctic sea ice extent data from the global-warming.org API
 * @returns The latest Arctic sea ice extent data
 */
export const fetchLatestArcticIceData = async (): Promise<ArcticData | null> => {
  try {
    const response = await fetch('https://global-warming.org/api/arctic-api');
    
    if (!response.ok) {
      throw new Error('Failed to fetch Arctic ice data');
    }
    
    // Parse the JSON directly
    const data = await response.json() as ArcticResponse;
    
    // Check if we have the expected structure
    if (!data.arcticData || !data.arcticData.data) {
      throw new Error('Unexpected Arctic API response structure');
    }
    
    // The data is stored as an object with keys like "202501", "202502", etc.
    // representing year and month. We need to find the most recent one.
    const keys = Object.keys(data.arcticData.data);
    if (keys.length === 0) {
      throw new Error('No data in Arctic API response');
    }
    
    // Sort keys in descending order (most recent first)
    keys.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    const latestKey = keys[0];
    const latestData = data.arcticData.data[latestKey];
    
    // Extract year and month from the key (format: YYYYMM)
    const year = parseInt(latestKey.substring(0, 4), 10);
    const month = parseInt(latestKey.substring(4), 10);
    
    return {
      year: year,
      month: month,
      extent: latestData.value, // The actual sea ice extent
      anomaly: latestData.anom  // The anomaly compared to the baseline
    };
  } catch (error) {
    console.error('Error fetching Arctic ice data:', error);
    return null;
  }
};

/**
 * Fetches the latest global temperature data from the global-warming.org API
 * @returns The latest global temperature data
 */
export const fetchLatestTemperatureData = async (): Promise<TemperatureData | null> => {
  try {
    const response = await fetch('https://global-warming.org/api/temperature-api');
    
    if (!response.ok) {
      throw new Error('Failed to fetch temperature data');
    }
    
    const data = await response.json() as TemperatureResponse;
    
    // Make sure we have valid data
    if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
      throw new Error('Invalid temperature data format');
    }
    
    // Get the most recent entry
    const latestEntry = data.result[data.result.length - 1];
    
    // Make sure time is formatted as expected
    if (!latestEntry.time || !latestEntry.time.includes('.')) {
      throw new Error('Unexpected temperature data time format');
    }
    
    const [year, month] = latestEntry.time.split('.');
    
    return {
      year: parseInt(year, 10),
      month: parseInt(month, 10),
      station: parseFloat(latestEntry.station),
      land: parseFloat(latestEntry.land)
    };
  } catch (error) {
    console.error('Error fetching temperature data:', error);
    return null;
  }
};

/**
 * Generate a random environmental statistic with a concerning statement
 * @returns An object containing a statistic and a statement
 */
export const getRandomEnvironmentalStat = async (): Promise<{ title: string; value: string; unit: string; statement: string } | null> => {
  try {
    // Try to fetch data from all three APIs
    const co2DataPromise = fetchLatestCO2Level();
    const arcticDataPromise = fetchLatestArcticIceData();
    const tempDataPromise = fetchLatestTemperatureData();
    
    // Use Promise.allSettled to ensure that even if some APIs fail, we still get results from the ones that succeed
    const results = await Promise.allSettled([
      co2DataPromise,
      arcticDataPromise,
      tempDataPromise
    ]);
    
    // Pick a random stat from the available data
    const availableStats = [];
    
    if (results[0].status === 'fulfilled' && results[0].value) {
      const co2Data = results[0].value;
      availableStats.push({
        title: "Atmospheric CO₂",
        value: co2Data.co2.toFixed(2),
        unit: "ppm",
        statement: "CO₂ levels are higher now than at any time in the past 800,000 years."
      });
    }
    
    if (results[1].status === 'fulfilled' && results[1].value) {
      const arcticData = results[1].value;
      availableStats.push({
        title: "Arctic Sea Ice Extent",
        value: arcticData.extent.toFixed(2),
        unit: "million km²",
        statement: "Arctic sea ice is declining at a rate of approximately 13% per decade."
      });
      
      // Add another stat based on the anomaly
      availableStats.push({
        title: "Arctic Ice Anomaly",
        value: arcticData.anomaly.toFixed(2),
        unit: "million km²",
        statement: "Current Arctic sea ice extent is significantly below the 1991-2020 average."
      });
    }
    
    if (results[2].status === 'fulfilled' && results[2].value) {
      const tempData = results[2].value;
      availableStats.push({
        title: "Global Temperature Anomaly",
        value: tempData.land.toFixed(2),
        unit: "°C",
        statement: "Earth is warming faster now than at any time in the past 10,000 years."
      });
    }
    
    // Add fallback stats that don't require API calls
    availableStats.push(
      {
        title: "Plastic Waste",
        value: "8",
        unit: "million tons",
        statement: "About 8 million tons of plastic waste enters the oceans each year."
      },
      {
        title: "Deforestation Rate",
        value: "4.7",
        unit: "million hectares",
        statement: "Tropical forests are being lost at a rate of 4.7 million hectares per year."
      },
      {
        title: "Species Extinction",
        value: "1,000",
        unit: "times",
        statement: "Current extinction rates are 1,000 times higher than natural background rates."
      },
      {
        title: "Global Water Scarcity",
        value: "2.3",
        unit: "billion people",
        statement: "2.3 billion people live in water-stressed countries today."
      }
    );
    
    // Return a random stat from the available ones
    const randomIndex = Math.floor(Math.random() * availableStats.length);
    return availableStats[randomIndex];
  } catch (error) {
    console.error('Error fetching environmental stats:', error);
    // Return a fallback stat if all else fails
    return {
      title: "Plastic Waste",
      value: "8",
      unit: "million tons",
      statement: "About 8 million tons of plastic waste enters the oceans each year."
    };
  }
}; 