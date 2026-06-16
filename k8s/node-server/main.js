const express = require('express');
const { MongoClient } = require('mongodb');
const redis = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8081;
const APP_NAME = process.env.APP_NAME || 'app';
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:27017';
const MONGO_DB = process.env.MONGO_DB || 'demo';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

let mongoClient;
let redisClient;

async function connectServices() {
	mongoClient = new MongoClient(MONGO_URL);
	await mongoClient.connect();

	redisClient = redis.createClient({ url: REDIS_URL });
	redisClient.on('error', (err) => {
		console.error('Redis error:', err.message);
	});
	await redisClient.connect();
}

app.get('/', async (_req, res) => {
	const db = mongoClient.db(MONGO_DB);
	const stats = await db.command({ ping: 1 });
	const redisValue = await redisClient.get('visits');
	const visits = Number(redisValue || 0) + 1;
	await redisClient.set('visits', String(visits));

	res.json({
		app: APP_NAME,
		port: PORT,
		mongo: stats.ok === 1 ? 'connected' : 'not-connected',
		redis: 'connected',
		visits,
	});
});

app.get('/health', (_req, res) => {
	res.json({ status: 'ok', app: APP_NAME });
});

connectServices()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`${APP_NAME} running on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.error('Startup failed:', error);
		process.exit(1);
	});
