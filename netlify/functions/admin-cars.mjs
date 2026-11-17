import { createHmac, timingSafeEqual } from "node:crypto";

const OWNER = process.env.GITHUB_OWNER || "Dstense";
const REPO = process.env.GITHUB_REPO || "new-max-motors";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const CATALOGUE_URL = "https://wa.me/c/919257862121";
const ALLOWED_FUEL = new Set(["petrol", "diesel", "cng", "electric", "hybrid", "other"]);

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}

function safeEqual(value, expected) {
  const a = Buffer.from(String(value || ""));
  const b = Buffer.from(String(expected || ""));
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

function sign(payload) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(payload).digest("base64url");
}

function createSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return payload + "." + sign(payload);
}

function isAuthenticated(request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+([A-Za-z0-9_.-]+)$/i);
  if (!match || !process.env.ADMIN_SESSION_SECRET) return false;
  const parts = match[1].split(".");
  if (parts.length !== 2) return false;
  const expected = sign(parts[0]);
  if (!safeEqual(parts[1], expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return Number(payload.exp) > Date.now();
  } catch {
    return false;
  }
}

function cleanText(value, max = 250) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function safeWebUrl(value, fallback = "") {
  const url = cleanText(value, 1200);
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.href : fallback;
  } catch {
    return fallback;
  }
}

function slug(value) {
  return cleanText(value, 100).toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

function sanitizeCar(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Every car must be an object.");
  const name = cleanText(raw.name, 140);
  const brandName = cleanText(raw.brandName || raw.brand, 80);
  if (!name || !brandName) throw new Error("Every car needs a car name and brand.");
  const id = slug(raw.id || name);
  if (!id) throw new Error("A car is missing a valid ID.");
  const yearText = cleanText(raw.year, 4);
  const year = yearText ? Number(yearText) : "";
  if (year !== "" && (!Number.isInteger(year) || year < 1980 || year > 2100)) throw new Error("Use a valid model year between 1980 and 2100.");
  let price = raw.price;
  if (price === "" || price === undefined || price === null) price = null;
  else {
    price = Number(price);
    if (!Number.isSafeInteger(price) || price < 0 || price > 500000000) throw new Error("Car price must be an amount in rupees.");
  }
  const fuel = ALLOWED_FUEL.has(String(raw.fuel || "").toLowerCase()) ? String(raw.fuel).toLowerCase() : "other";
  const specs = Array.isArray(raw.specs) ? raw.specs.slice(0, 16).map((v) => cleanText(v, 100)).filter(Boolean) :
    String(raw.specs || "").split(/\r?\n/).slice(0, 16).map((v) => cleanText(v, 100)).filter(Boolean);
  return {
    id,
    name,
    brand: slug(raw.brand || brandName),
    brandName,
    fuel,
    category: cleanText(raw.category, 80) || "PRE-OWNED CAR",
    year,
    price,
    priceNote: price === null ? (cleanText(raw.priceNote, 100) || "Price on request") : "",
    imageUrl: safeWebUrl(raw.imageUrl, ""),
    imageLabel: raw.imageLabel === "VEHICLE PHOTO" ? "VEHICLE PHOTO" : "MODEL PHOTO",
    specs,
    description: cleanText(raw.description, 1600),
    sourceUrl: safeWebUrl(raw.sourceUrl, CATALOGUE_URL)
  };
}

function githubHeaders() {
  return {
    "authorization": "Bearer " + process.env.GITHUB_TOKEN,
    "accept": "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
    "content-type": "application/json"
  };
}

async function readCarsFile() {
  const url = "https://api.github.com/repos/" + encodeURIComponent(OWNER) + "/" + encodeURIComponent(REPO) +
    "/contents/cars.json?ref=" + encodeURIComponent(BRANCH);
  const response = await fetch(url, { headers: githubHeaders() });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error("Could not read cars.json from GitHub (" + response.status + "): " + detail.slice(0, 350));
  }
  const file = await response.json();
  const content = Buffer.from(String(file.content || "").replace(/\n/g, ""), "base64").toString("utf8");
  const data = JSON.parse(content);
  if (!Array.isArray(data.cars)) throw new Error("The inventory file format is invalid.");
  return { file, data };
}

export default async function handler(request) {
  if (request.method !== "POST") return reply({ error: "Use POST for this endpoint." }, 405);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 900000) return reply({ error: "The inventory payload is too large." }, 413);

  let input;
  try {
    input = await request.json();
  } catch {
    return reply({ error: "Request body must be valid JSON." }, 400);
  }

  const action = cleanText(input && input.action, 20);
  const missing = ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "GITHUB_TOKEN"].filter((key) => !process.env[key]);
  if (missing.length) {
    return reply({
      error: "Admin setup is not complete. Add the required environment variables in Netlify: " + missing.join(", ") + "."
    }, 503);
  }

  if (action === "login") {
    if (!safeEqual(input.password, process.env.ADMIN_PASSWORD)) return reply({ error: "That password did not match." }, 401);
    return reply({ ok: true, token: createSession(), expiresIn: 28800 });
  }

  if (!isAuthenticated(request)) return reply({ error: "Your admin session expired. Sign in again." }, 401);
  if (action === "check") return reply({ ok: true });
  if (action === "load") {
    try {
      const { data } = await readCarsFile();
      return reply({ ok: true, cars: data.cars });
    } catch (error) {
      return reply({ error: error.message || "Could not load the inventory." }, 502);
    }
  }
  if (action !== "save") return reply({ error: "Unsupported action." }, 400);
  if (!Array.isArray(input.cars)) return reply({ error: "The cars field must be an array." }, 400);
  if (input.cars.length > 250) return reply({ error: "A maximum of 250 car listings is supported." }, 400);

  let cars;
  try {
    cars = input.cars.map(sanitizeCar);
    const ids = new Set();
    for (const car of cars) {
      if (ids.has(car.id)) throw new Error("Each car needs a unique ID. Edit the duplicate listing name or delete the duplicate.");
      ids.add(car.id);
    }
  } catch (error) {
    return reply({ error: error.message || "One or more car entries are invalid." }, 400);
  }

  try {
    const { file } = await readCarsFile();
    const data = {
      updatedAt: new Date().toISOString(),
      cars
    };
    const url = "https://api.github.com/repos/" + encodeURIComponent(OWNER) + "/" + encodeURIComponent(REPO) + "/contents/cars.json";
    const updateBody = {
      message: "Manage car inventory from admin panel",
      content: Buffer.from(JSON.stringify(data, null, 2), "utf8").toString("base64"),
      branch: BRANCH,
      sha: file.sha
    };
    const response = await fetch(url, {
      method: "PUT",
      headers: githubHeaders(),
      body: JSON.stringify(updateBody)
    });
    if (!response.ok) {
      const detail = await response.text();
      const explanation = response.status === 409 || response.status === 422
        ? "GitHub reported a write conflict. Reload inventory and try again."
        : "GitHub could not save the inventory (" + response.status + "): " + detail.slice(0, 350);
      return reply({ error: explanation }, 502);
    }
    const result = await response.json();
    return reply({ ok: true, cars, commit: result.commit && result.commit.sha, message: "Inventory saved to GitHub. Netlify will deploy the changes." });
  } catch (error) {
    return reply({ error: error.message || "Could not save your inventory." }, 502);
  }
}
