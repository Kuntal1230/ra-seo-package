# ra-seo-package 📊

A powerful SEO management and analysis tool for **React Admin**, inspired by the functionality of popular WordPress SEO plugins like **Yoast SEO** and **Rank Math**.  
This package helps you analyze page content, meta information, and performance metrics (PageSpeed + Lighthouse) directly inside your React Admin dashboard.

[![npm version](https://img.shields.io/npm/v/ra-seo-package.svg?color=blue)](https://www.npmjs.com/package/ra-seo-package)
[![npm downloads](https://img.shields.io/npm/dm/ra-seo-package.svg)](https://www.npmjs.com/package/ra-seo-package)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

- 🔍 **On-page SEO Analysis** (title, description, keyword density, readability, headings, images)
- ⚡ **Google PageSpeed Insights API integration**
- 💡 **Lighthouse Core Web Vitals (LCP, CLS, FCP)**
- 🧠 **AI-style SEO tips** for better optimization
- 🧾 **React Admin Resource Components**: `SeoList`, `SeoEdit`, `SeoCreate`, `SeoShow`
- 🧱 **Server + Client ready** — includes Express backend and React frontend

---

## 📦 Installation

```bash
npm install ra-seo-package
# or
yarn add ra-seo-package
```

## ⚙️ Requirements

```
| Dependency    | Version Range    |
| ------------- | ---------------- |
| react         | >=17.0.0 <20.0.0 |
| react-dom     | >=17.0.0 <20.0.0 |
| react-admin   | >=4.0.0 <6.0.0   |
| @mui/material | >=5.0.0 <8.0.0   |
```

## ⚡ Quick Setup

Here’s how to set up **ra-seo-package** in your React Admin project in less than a minute:

### 1️⃣ Import Components

```jsx
import { Admin, Resource } from "react-admin";
import { SeoList, SeoEdit, SeoCreate } from "ra-seo-package";
import dataProvider from "./dataProvider";

<Admin dataProvider={dataProvider}>
  {/* 👇 Your normal resources */}
  ....
  {/* 👇 Your media management system */}
  <Resource name="seo" list={SeoList} edit={SeoEdit} create={SeoCreate} />
</Admin>;
```

### 🛠️ Optional Backend Example (Express + Multer)

Create a .env file with your Google PageSpeed Insights API key:

```bash
PSI_API_KEY=your_api_key_here
```

```js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/pagespeed", async (req, res) => {
  try {
    const { url, strategy = "mobile" } = req.body;
    if (!url) return res.status(400).json({ error: "Missing url" });
    const key = process.env.PSI_API_KEY;
    if (!key)
      return res.status(500).json({ error: "PSI_API_KEY not configured" });

    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      url
    )}&strategy=${strategy}&key=${key}`;
    const r = await fetch(psiUrl);
    const data = await r.json();

    // parse essential metrics
    const lighthouse = data.lighthouseResult || {};
    const audits = lighthouse.audits || {};
    const metrics = {
      lighthouseScore: lighthouse.categories
        ? Math.round((lighthouse.categories.performance?.score || 0) * 100)
        : null,
      fcp: audits["first-contentful-paint"]?.displayValue || null,
      lcp: audits["largest-contentful-paint"]?.displayValue || null,
      cls: audits["cumulative-layout-shift"]?.displayValue || null,
      ttfb: audits["server-response-time"]?.displayValue || null,
      diagnostics: audits["diagnostics"] ? audits["diagnostics"].details : null,
      raw: data, // include raw for debugging
    };

    res.json(metrics);
  } catch (err) {
    console.error("PSI error", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
```

### 🪪 License

```
MIT © Kuntal Gupta
```
