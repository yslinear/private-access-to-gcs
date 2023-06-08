# private-access-to-gcs

```
git clone https://github.com/kyouheicf/private-access-to-gcs.git && cd $(basename $_ .git)

npm install aws4fetch
wrangler secret put GCS_BUCKET
wrangler secret put GCS_ACCESS_KEY_ID
wrangler secret put GCS_SECRET_ACCESS_KEY

vi wrangler.toml
--
routes = [
	{ pattern = "private-access-to-gcs.example.com/*", zone_name = "example.com" }
]
--

wrangler publish src/cache-api-worker.js
or
wrangler publish src/image-resizing-private-gcs.js
```
