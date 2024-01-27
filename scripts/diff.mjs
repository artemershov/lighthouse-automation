import fs from "fs";
import minimist from "minimist";

const defaultParams = {
  o: "diff.md",
};

const params = minimist(process.argv.slice(2));

const BEFORE = params.b || params.before;
const AFTER = params.a || params.after;
const OUTPUT_FILE = params.o || params.output || defaultParams.o;

if (!BEFORE || !AFTER) {
  throw "No input files";
}

const beforeData = JSON.parse(fs.readFileSync(BEFORE, { encoding: "utf-8" }));
const afterData = JSON.parse(fs.readFileSync(AFTER, { encoding: "utf-8" }));

const calcDiff = (before, after) => (1 / before) * after - 1 || 0;
const calcDiffAbs = (before, after) => after - before;
const toFixedWithoutPadding = (value) => parseFloat(value.toFixed(2));
const formatPercent = (value) => `${toFixedWithoutPadding(value * 100)}%`;
const formatMs = (value) => `${toFixedWithoutPadding(value).toLocaleString("en-US")} ms`;

const metricsAbsKeys = ["SCORE"];
const metricsMsKeys = ["TTFB", "FCP", "LCP", "TBT", "CLS", "SI"];
const metricsKeys = [...metricsAbsKeys, ...metricsMsKeys];

const getTableData = (before, after) => {
  const data = {};

  metricsAbsKeys.forEach(
    (key) =>
      (data[key] = {
        before: formatPercent(before[key]),
        after: formatPercent(after[key]),
        diff: formatPercent(calcDiffAbs(before[key], after[key])),
      })
  );

  metricsMsKeys.forEach(
    (key) =>
      (data[key] = {
        before: formatMs(before[key]),
        after: formatMs(after[key]),
        diff: formatPercent(calcDiff(before[key], after[key])),
      })
  );

  return data;
};

const getTableHead = (title) =>
  `| ${title} | Before | After | Diff |\n| ------ | ------ | ----- | ---- |`;

const getTableRow = (data, key) =>
  `| ${key} | ${data[key].before} | ${data[key].after} | ${data[key].diff} |`;

const mobileAverageTableData = getTableData(beforeData.mobile.average, afterData.mobile.average);
const mobileMedianTableData = getTableData(beforeData.mobile.median, afterData.mobile.median);
const desktopAverageTableData = getTableData(beforeData.desktop.average, afterData.desktop.average);
const desktopMedianTableData = getTableData(beforeData.desktop.median, afterData.desktop.median);

const tableAverage = `
${getTableHead("Mobile")}
${metricsKeys.map((key) => getTableRow(mobileAverageTableData, key)).join("\n")}

${getTableHead("Desktop")}
${metricsKeys.map((key) => getTableRow(desktopAverageTableData, key)).join("\n")}
`;

const tableMedian = `
${getTableHead("Mobile")}
${metricsKeys.map((key) => getTableRow(mobileMedianTableData, key)).join("\n")}

${getTableHead("Desktop")}
${metricsKeys.map((key) => getTableRow(desktopMedianTableData, key)).join("\n")}
`;

const output = `### Average results

${tableAverage}


### Median results

${tableMedian}
`;

fs.writeFileSync(OUTPUT_FILE, output);
