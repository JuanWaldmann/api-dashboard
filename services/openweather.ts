import { checkResponseOk, fetchWithRetry } from "./httpUtils.ts";

const OPENWEATHER_SECRET = process.env.OPENWEATHER_APIKEY;

interface apiRaw {
  dt: number;
  main: {temp_min: number, temp_max: number};
  weather: Array<{description: string}>;
  wind: {speed: number};
}

interface forecastDay {
    forecastedDate: string;
    minTemp: number;
    maxTemp: number;
    description: string;
    wind: number;
}

export async function getCurrentWeather(lat = -34, lon = -58 , units = 'metric', lang = 'es'){
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${OPENWEATHER_SECRET}`;

    try {
        const response = await fetchWithRetry(()=> fetch(url));

    checkResponseOk(response);

    const dataResponse = await response.json();

    return {
        weather: dataResponse.weather[0].main,
        temp: dataResponse.main.temp,
        feelLike: dataResponse.main.feels_like,
        windSpeed: dataResponse.wind.speed
    };
}catch(error) {
    console.error(`Failed to fetch weather for lat${lat} lon${lon}`, error);
    throw error
  }

}


export async function getForecast(lat = -34, lon = -58 , units = 'metric', lang = 'es', cnt = 40): Promise<forecastDay[]> {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&cnt=${cnt}&appid=${OPENWEATHER_SECRET}`;
    try{
        const response = await fetchWithRetry(()=> fetch(url));

    checkResponseOk(response);

    const dataResponse = await response.json()
        const result = dataResponse.list.filter(
            (element: apiRaw) => {
                let dtHour = new Date(element.dt * 1000).getUTCHours()
                if (dtHour === 12) return true
            })

            const forecast = result.map((element: apiRaw)=> {
                let forecastedDate = new Date(element.dt * 1000).toLocaleString('en-US', { day: '2-digit', month: 'long', timeZone: 'UTC' })
                let minTemp = element.main.temp_min
                let maxTemp = element.main.temp_max
                let description = element.weather[0]?.description ?? 'Unknown';
                let wind = element.wind.speed
                return { forecastedDate, minTemp, maxTemp, description, wind }
            })


    return forecast

    } catch (error){
    console.error(`Failed to fetch forecast for lat${lat} lon${lon}`, error);
    throw error

    }
}