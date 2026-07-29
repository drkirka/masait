import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
  return readFile(new URL(path, import.meta.url), "utf8");
}

test("package uses a standard Vite build", async () => {
  const packageJson = JSON.parse(await read("../package.json"));

  assert.equal(packageJson.scripts.dev, "vite");
  assert.equal(packageJson.scripts.build, "tsc -b && vite build");
  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), [
    "ogl",
    "react",
    "react-dom",
  ]);
});

test("project metadata names the portfolio correctly", async () => {
  const packageJson = JSON.parse(await read("../package.json"));
  const html = await read("../index.html");

  assert.equal(packageJson.name, "irina-desktop-portfolio");
  assert.match(html, /Irina Bilinskaia — Robotics &amp; AI/);
});

test("production build contains the portfolio entry page", async () => {
  const html = await read("../dist/index.html");

  assert.match(html, /Irina Bilinskaia/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /assets\/.*\.js/);
});
