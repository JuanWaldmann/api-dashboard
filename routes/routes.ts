import express from 'express';
import githubRouter from './github.ts';
//import openweatherRouter from './openweather.ts';

const router = express.Router();

router.use('/github', githubRouter)
// router.use('/openweather', openweatherRouter)

export default router