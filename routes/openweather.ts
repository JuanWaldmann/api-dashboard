import express, {type Request, type Response} from 'express';

import { getCurrentWeather} from '../services/openweather.ts';

const router = express.Router();


router.get('/weather', async (req: Request, res: Response) => {
    const lat = typeof req.query.lat === 'string' ? Number(req.query.lat) : undefined
    const lon = typeof req.query.lon === 'string' ? Number(req.query.lon) : undefined
    const units = typeof req.query.units === 'string' ? req.query.units : undefined
    const lang = typeof req.query.lang === 'string' ? req.query.lang : undefined

    const result = await getCurrentWeather(lat, lon, units, lang);
    res.send(result)
})
export default router
