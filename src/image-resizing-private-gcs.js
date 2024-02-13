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
  if (pathname === '/') {
    return new Response('Not Found', { status: 404 });
  }

  if (!url.searchParams.has("width") && !url.searchParams.has("height")) {
    return new Response('Not Found', { status: 404 });
  }

  if (url.searchParams.get("width") > 2000 || url.searchParams.get("height") > 2000) {
    return new Response('Not Found', { status: 404 });
  }

  const gcsurl = `https://${hostname}${pathname}`
  const signedRequest = await aws.sign(gcsurl);
  console.log(JSON.stringify([...signedRequest.headers]));

  let options = { cf: { image: { "origin-auth": "share-publicly" } } };
  if (url.searchParams.has("fit")) options.cf.image.fit = url.searchParams.get("fit")
  if (url.searchParams.has("width")) options.cf.image.width = url.searchParams.get("width")
  if (url.searchParams.has("height")) options.cf.image.height = url.searchParams.get("height")
  if (url.searchParams.has("quality")) options.cf.image.quality = url.searchParams.get("quality")
  const accept = request.headers.get("Accept");
  if (/image\/avif/.test(accept)) {
    options.cf.image.format = 'avif';
  } else if (/image\/webp/.test(accept)) {
    options.cf.image.format = 'webp';
  }

  return await fetch(signedRequest, options)
}
