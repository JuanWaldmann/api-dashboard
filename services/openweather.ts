import { checkResponseOk, fetchWithRetry } from "./httpUtils.ts";

const OPENWEATHER_APIKEY = process.env.OPENWEATHER_APIKEY;

if (!OPENWEATHER_APIKEY) {
  throw new Error('OPENWEATHER_APIKEY is not set');
}

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

function buildOpenWeatherUrl(type: 'weather' | 'forecast', lat = -34, lon = -58 , units = 'metric', lang = 'es', cnt?: number){
    return `https://api.openweathermap.org/data/2.5/${type}?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}${cnt !== undefined ? `&cnt=${cnt}` : ''}&appid=${OPENWEATHER_APIKEY}`;
}




export async function getCurrentWeather(lat = -34, lon = -58 , units = 'metric', lang = 'es'){
    const url = buildOpenWeatherUrl('weather', lat, lon, units, lang)

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
    const url = buildOpenWeatherUrl('forecast', lat, lon, units, lang, cnt)
    try{
        const response = await fetchWithRetry(()=> fetch(url));

    checkResponseOk(response);

    const dataResponse = await response.json()
        const result = dataResponse.list.filter(
            (element: apiRaw) => {
                const dtHour = new Date(element.dt * 1000).getUTCHours()
                if (dtHour === 12) return true
                else return false
            })

            const forecast = result.map((element: apiRaw)=> {
                const forecastedDate = new Date(element.dt * 1000).toLocaleString('en-US', { day: '2-digit', month: 'long', timeZone: 'UTC' })
                const minTemp = element.main.temp_min
                const maxTemp = element.main.temp_max
                const description = element.weather[0]?.description ?? 'Unknown';
                const wind = element.wind.speed
                return { forecastedDate, minTemp, maxTemp, description, wind }
            })


    return forecast

    } catch (error){
    console.error(`Failed to fetch forecast for lat${lat} lon${lon}`, error);
    throw error

    }
}