import { AwsClient } from 'aws4fetch'

const hostname = `${GCS_BUCKET}.storage.googleapis.com`

const aws = new AwsClient({
	accessKeyId: GCS_ACCESS_KEY_ID,
	secretAccessKey: GCS_SECRET_ACCESS_KEY,
	service: "s3",
});

addEventListener('fetch', function (event) {
	event.respondWith(handleRequest(event))
});

async function handleRequest(event) {
	const request = event.request
	const cacheUrl = new URL(request.url);
	const cacheKey = new Request(cacheUrl.toString(), request);
	const cache = caches.default;
	let response = await cache.match(cacheKey);

	if (!response) {
		console.log(
			`Response for request url: ${request.url} not present in cache. Fetching and caching request.`
		);
		const pathname = cacheUrl.pathname;
		//console.log(pathname);
		const gcsurl = `https://${hostname}${pathname}`
		const signedRequest = await aws.sign(gcsurl);
		response = await fetch(signedRequest, {
			/* This does not work because authorization header result cf-cache-status: BYPASS
			"cf": {
				// resolveOverride,
				cacheEverything: true,
				cacheTtl: 3,
			}*/
		})
		response = new Response(response.body, response);
		response.headers.set("Cache-Control", "s-maxage=30");
		//response.headers.append("Cloudflare-CDN-Cache-Control", "max-age=30")
		console.log(JSON.stringify([...request.headers]));
		console.log(JSON.stringify([...response.headers]));
		event.waitUntil(cache.put(cacheKey, response.clone()));
		console.log(`Response from Origin`);
	} else {
		console.log(`Cache hit for: ${request.url}.`);
	}
	return response;
}