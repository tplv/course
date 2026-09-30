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

self.onmessage = () => {
  const result = slowFunction(3000);
  self.postMessage(result);
};