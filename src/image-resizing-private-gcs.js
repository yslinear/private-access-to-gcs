import { AwsClient } from 'aws4fetch'

const hostname = `${GCS_BUCKET}.storage.googleapis.com`

const aws = new AwsClient({
	accessKeyId: GCS_ACCESS_KEY_ID,
	secretAccessKey: GCS_SECRET_ACCESS_KEY,
	service: "s3",
});

addEventListener('fetch', function (event) {
	event.respondWith(handleRequest(event.request))
});

async function handleRequest(request) {
	const url = new URL(request.url);
	const pathname = url.pathname;
	const gcsurl = `https://${hostname}${pathname}`
	const signedRequest = await aws.sign(gcsurl);
	console.log(JSON.stringify([...signedRequest.headers]));

	return await fetch(signedRequest, {
		"cf": {
			// resolveOverride,
			cacheEverything: true,
			cacheTtl: 30,
			image: {
				//anim: true,
				//background: "#RRGGBB",
				//blur: 50,
				//border: {color: "#FFFFFF", width: 10},
				//brightness: 0.5,
				//compression: "fast",
				//contrast: 0.5,
				//dpr: 1,
				//fit: "scale-down",
				//format: "webp",
				//gamma: 0.5,
				//gravity: "auto",
				//height: 250,
				//metadata: "keep",
				//onerror: "redirect",
				//quality: 50,
				rotate: 90,
				"origin-auth": "share-publicly"
				//sharpen: 2,
				//trim: {"top": 12,  "right": 78, "bottom": 34, "left": 56,},
				//width: 250,
			}
		}
	})
}
