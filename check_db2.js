async function run() {
  const res = await fetch('http://localhost:3000/api/sync-offers');
  // Wait, sync-offers doesn't return the DB, it syncs.
}
run();
