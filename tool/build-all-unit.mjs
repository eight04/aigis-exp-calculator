import {writeFile} from "fs/promises";

import fetch from "node-fetch";
import cheerio from "cheerio";
import {markdownTable} from 'markdown-table';

const url = "https://wikiwiki.jp/aigiszuki/%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88/%E5%AE%9F%E8%A3%85%E9%A0%86";
const html = await (await fetch(url)).text();
const $ = cheerio.load(html);
const result = [];

for (const tr of $("#content table tr")) {
  const date = $("td, th", tr).first().text();
  const units = $("a", tr);
  if (!units.length) continue;
  const row = []
  for (const unit of units) {
    const name = $(unit).prop("title");
    if (!name) {
      // what is this...
      continue;
    }
    row.push({
      name,
      url: new URL($(unit).prop("href"), url).href,
      icon: getIcon(unit),
      gacha: null,
      // rarity: null,
      date
    });
  }
  row.reverse();
  result.push(...row);
}

for (const unit of result) {
  if (unit.name.startsWith("王子")) continue;
  console.log(unit.name);
  const html = await (await fetch(unit.url)).text();
  const $ = cheerio.load(html);
  if ($("#content ul li").first().text().includes("イベント")) {
    unit.gacha = "event";
  } else {
    unit.gacha = "gacha";
  }
}

result.reverse();

await writeFile("all-units.md", 
`All Units
==========

來源︰[https://wikiwiki.jp/aigiszuki/%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88/%E5%AE%9F%E8%A3%85%E9%A0%86](https://wikiwiki.jp/aigiszuki/%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88/%E5%AE%9F%E8%A3%85%E9%A0%86)

按實裝順序排序。原本是想作為台版的未來視，不過有活動被跳過了。

${markdownTable([...getTableRows()])}
`)

function* getTableRows() {
  yield ["圖示", "名稱", "入手", "日期"];
  for (const unit of result) {
    yield [
      `![${unit.name}](${unit.icon})`,
      `[${unit.name}](${unit.url})`,
      unit.gacha,
      unit.date
    ];
  }
}

function getIcon(unit) {
  let src = $("img", unit).prop("src");
  if (!src || src.startsWith("data:image/gif")) {
    const html = $("noscript", unit).text();
    src = $("img", html).prop("src");
  }
  const params = new URL(src, url).searchParams;
  return params.get("url") || src;
}
