import express, {type Request, type Response} from 'express';

import { getCurrentWeather, getForecast} from '../services/openweather.ts';

const router = express.Router();

function parseWeatherQuery(req: Request){
    const lat = typeof req.query.lat === 'string' ? Number(req.query.lat) : undefined
    const lon = typeof req.query.lon === 'string' ? Number(req.query.lon) : undefined
    const units = typeof req.query.units === 'string' ? req.query.units : undefined
    const lang = typeof req.query.lang === 'string' ? req.query.lang : undefined
    const cnt = typeof req.query.cnt === 'string' ? Number(req.query.cnt) : undefined
    return { lat, lon, units, lang, cnt }
}

router.get('/weather', async (req: Request, res: Response) => {
    const { lat, lon, units, lang } = parseWeatherQuery(req);
    const result = await getCurrentWeather(lat, lon, units, lang);
    res.send(result)
})

router.get('/forecast', async (req: Request, res: Response) => {
    const { lat, lon, units, lang, cnt } = parseWeatherQuery(req);
    const result = await getForecast(lat, lon, units, lang, cnt);
    res.send(result)
})


export default router
