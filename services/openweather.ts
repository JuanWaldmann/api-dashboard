import { checkResponseOk, fetchWithRetry } from "./httpUtils.ts";

const OPENWEATHER_SECRET = process.env.OPENWEATHER_APIKEY;


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