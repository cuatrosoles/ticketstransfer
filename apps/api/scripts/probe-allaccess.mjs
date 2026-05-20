const url = 'https://www.allaccess.com.ar/event/un-poco-de-ruido';
const res = await fetch(url, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html',
    'Accept-Language': 'es-AR,es;q=0.9',
  },
});
const t = await res.text();
console.log('status', res.status, 'len', t.length);
const imgs = [...t.matchAll(/https:\/\/[^"'\s]+\.(?:png|jpe?g|webp)(?:\?[^"'\s]*)?/gi)].map((m) => m[0]);
const interesting = imgs.filter(
  (u) =>
    u.includes('crowder') ||
    u.includes('boletius') ||
    u.includes('allaccess') ||
    u.includes('cloudfront')
);
console.log('interesting', [...new Set(interesting)].slice(0, 20));
const og = t.match(/property="og:image"[^>]+content="([^"]+)"/i);
console.log('og:image', og?.[1]);
const jsonLd = t.match(/"image"\s*:\s*"([^"]+)"/i);
console.log('json image', jsonLd?.[1]);
const imgTags = [...t.matchAll(/<img[^>]+src=['"](https:\/\/cdn\.getcrowder\.com\/images\/[^'"]+)['"]/gi)];
console.log('img tags', imgTags.map((m, i) => `${i}: ${m[1]}`));
