import fs from "fs";
import lighthouse from "lighthouse";
import * as constants from "lighthouse/core/config/constants.js";
import * as chromeLauncher from "chrome-launcher";
import minimist from "minimist";

const defaultParams = {
  u: "http://localhost:3000",
  o: "result.json",
  c: 5,
  t: 5000,
};

const params = minimist(process.argv.slice(2));

const URL = params.u || params.url || defaultParams.u;
const COUNT = params.c || params.count || defaultParams.c;
const TIMEOUT = params.t || params.timeout || defaultParams.t;
const OUTPUT_FILE = params.o || params.output || defaultParams.o;

const getMetrics = async (isDesktop) => {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "",
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
    ...(isDesktop
      ? {
          formFactor: "desktop",
          throttling: constants.throttling.desktopDense4G,
          screenEmulation: constants.screenEmulationMetrics.desktop,
          emulatedUserAgent: constants.userAgents.desktop,
        }
      : {}),
  };
  const { lhr } = await lighthouse(URL, options);
  const audits = lhr.categories.performance.auditRefs.filter((item) => item.weight > 0);
  const values = audits.map(({ id, acronym }) => [acronym, lhr.audits[id].numericValue]);
  const results = Object.fromEntries([
    ["SCORE", lhr.categories.performance.score],
    ["TTFB", lhr.audits["server-response-time"].numericValue],
    ...values,
  ]);

  await chrome.kill();

  return results;
};

const loopMesurement = async (isDesktop) => {
  const data = [];

  for (let i = 0; i < COUNT; i++) {
    console.log(`${isDesktop ? "Desktop" : "Mobile"} iteration`, i);
    const result = await getMetrics(isDesktop);
    data.push(result);
    await new Promise((res) => setTimeout(res, TIMEOUT));
  }

  return data;
};

const calculateAverageAndMedian = (results) => {
  const combinedValues = results.reduce((acc, item) => {
    Object.entries(item).forEach(([key, value]) => {
      if (!acc[key]) acc[key] = [];
      acc[key].push(value);
    });
    return acc;
  }, {});

  const min = Object.entries(combinedValues).reduce((acc, [key, values]) => {
    acc[key] = Math.min(...values);
    return acc;
  }, {});

  const max = Object.entries(combinedValues).reduce((acc, [key, values]) => {
    acc[key] = Math.max(...values);
    return acc;
  }, {});

  const average = Object.keys(combinedValues).reduce((acc, key) => {
    acc[key] = (min[key] + max[key]) / 2;
    return acc;
  }, {});

  const median = Object.entries(combinedValues).reduce((acc, [key, values]) => {
    const sorted = Array.from(values).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    acc[key] = sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
    return acc;
  }, {});

  return {
    min,
    max,
    average,
    median,
    results,
  };
};

const mobileData = await loopMesurement(false);
const desktopData = await loopMesurement(true);

const results = {
  mobile: calculateAverageAndMedian(mobileData),
  desktop: calculateAverageAndMedian(desktopData),
};

console.log("Mobile average", results.mobile.average);
console.log("Desktop average", results.desktop.average);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
