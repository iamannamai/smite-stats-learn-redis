const router = require('express').Router();
const { GodPlayerStats, God, GodInfo } = require('../../db');
const godStats = require('../util/godStats');
const defaultStats = Object.keys(require('../util/defaultPlayerGodStats'));
const redisClient = require('../redis');
const {promisify} = require('util');
const getAsync = promisify(redisClient.get).bind(redisClient);

const setStatsIfNX = async (key, dbQuery) => {
    let stats = await getAsync(key);
    if (stats) {
        stats = JSON.parse(stats);
    } else {
        stats = await dbQuery();
        redisClient.set(key, JSON.stringify(stats));
    }
};

router.get('/', async(req, res, next) => {
    try {
        res.send(defaultStats.slice(0, -3));
    } catch(err){
        next(err);
    }
})

router.get('/all', async(req, res, next) => {
    try {
        let stats = await getAsync('stats');
        if (stats) {
            stats = JSON.parse(stats);
        } else {
            stats = await godStats.getStats(null, defaultStats, req.query);
            redisClient.set('stats', JSON.stringify(stats));
        }
        let maxStats = defaultStats.reduce((obj, stat) => {
            let max = Math.max(...stats.map(god => god[stat] || 0));
            obj[stat] = max;
            return obj;
        }, {});
        res.send(maxStats);
    } catch(err){
        next(err);
    }
})

router.get('/:statName', async(req, res, next) => {
    try {
        let stats;
        if(req.params.statName.toUpperCase() === 'KDA'){
            // stats = await setStatsIfNX('statsKda', () => godStats.getKDA(null, req.query));
            stats = await getAsync('statsKDA');
            if (stats) {
                stats = JSON.parse(stats);
            } else {
                stats = await godStats.getKDA(null, req.query);
                redisClient.set('statsKDA', JSON.stringify(stats));
            }
        } else if(req.params.statName.toUpperCase() === 'GAMES'){
            stats = await getAsync('statsGAMES');
            if (stats) {
                stats = JSON.parse(stats);
            } else {
                stats = await godStats.getGames(null, req.query);
                redisClient.set('statsGAMES', JSON.stringify(stats));
            }
            // stats = await godStats.getGames(null, req.query);
        } else {
            // stats = await getAsync('stats');
            // if (stats) {
            //     stats = JSON.parse(stats);
            // } else {
            //     stats = await godStats.getStats(null, [req.params.statName], req.query);
            //     redisClient.set('statsOTHER', JSON.stringify(stats));
            // }
            stats = await godStats.getStats(null, [req.params.statName], req.query);
        }
        res.send(stats);
    } catch(err){
        next(err);
    }
})

module.exports = router;
