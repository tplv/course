const slowFunction = (timeout = 3000) => {
  let start = performance.now();
  let x = 0;
  let i = 0;
  do {
    i += 1;
    x += (Math.random() - 0.5) * i;
  } while (performance.now() - start < timeout);
  return x;
};

const cache = {
  result: null
};

const recalculate = (timeout) => {
  cache.result = slowFunction(timeout);
  return cache.result;
};

const getCachedResult = (timeout) => {
  if (cache.result !== null) {
    return cache.result;
  }
  return recalculate(timeout);
};

const broadcast = async (msg) => {
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage(msg);
  }
};

self.addEventListener('activate', (evt) => {
  evt.waitUntil(self.clients.claim());
});

self.addEventListener('message', async (evt) => {
  const { type, payload } = evt.data;

  if (type === "GET_CACHED") {
    const result = getCachedResult(payload.timeout);
    await broadcast({ type: "RESULT", payload: result });
  }

  if (type === "RECALCULATE") {
    const result = recalculate(payload.timeout);
    await broadcast({ type: "RESULT", payload: result });
  }
});