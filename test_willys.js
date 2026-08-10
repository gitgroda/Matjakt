async function test() {
  const url = 'https://www.willys.se/c/Kott-chark-och-fagel?page=0&size=5';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
  const data = await res.json();
  console.log(data.results[0]);
}
test();
