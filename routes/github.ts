import express, {type Request, type Response} from 'express';
import { getRepo, getUserRepos } from '../services/github.ts';

const router = express.Router();


router.get('/repos/:user/:repo', async (req: Request, res: Response) => {
    const user = req.params.user
    const repo = req.params.repo

    if (typeof user !== 'string' || typeof repo !== 'string') {
    res.status(400).send('Missing user or repo');
    return;
}
    const result = await getRepo(user, repo);
    res.send(result)
})

router.get('/users/:user/repos', async (req: Request, res: Response) => {
    const user = req.params.user
    const page = typeof req.query.page === 'string' ? Number(req.query.page) : undefined
    const perPage = typeof req.query.per_page === 'string' ? Number(req.query.per_page) : undefined

    if (typeof user !== 'string') {
    res.status(400).send('Missing user');
    return;
}

    const resultPaginated = await getUserRepos(user, page, perPage)
    res.send(resultPaginated)

})
export default router
