# Adobe Edge Delivery Services: Universal Guide to Query Indexing

> **A comprehensive, project-agnostic guide** for developers on how to extract properties from **any component, block, or page element** into `/query-index.json` using `helix-query.yaml`.

---

## 1. Overview & Architecture

### What is Query Indexing?
In Adobe Edge Delivery Services (AEM Live / Helix), **Query Indexing** automatically compiles data from published pages across your website into a high-performance, structured JSON feed (typically `/query-index.json`).

This feed powers:
- Dynamic search and filter interfaces.
- Category listings, carousels, cards, and grids.
- Related articles, recent posts, and recommendation engines.
- Sitemaps and RSS/Atom feeds.

### The Pipeline Architecture

```
┌────────────────────────────────────────────────────────┐
│ 1. CONTENT AUTHORING (da.live / Word / Google Docs)     │
│    Authors create pages, blocks, tables, and metadata. │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. SERVER-SIDE RENDERING (AEM Live Backend)            │
│    Converts document tables into raw HTML <div> tags.  │
│    (Inspectable at /<path>.plain.html)                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. THE CLOUD INDEXER (helix-query.yaml)                │
│    Crawls published raw HTML. Matches CSS selectors.   │
│    NO client-side JavaScript executes here.            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 4. DYNAMIC JSON ENDPOINT (/query-index.json)           │
│    Published to CDN cache; consumed via client fetch().│
└────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **The Golden Rule:** The indexing crawler inspects the **server-rendered raw HTML** *before* client-side JavaScript (`block.js`) runs. It cannot see elements created dynamically by JS (like slider wrappers, buttons, or custom DOM nodes). Selectors must target the raw HTML produced from the document.

---

## 2. How Authored Content Translates to HTML

Understanding how tables in documents turn into HTML is the key to writing correct selectors:

### Document Table (in Word / Google Docs / da.live):
| My Block (variant) | |
|---|---|
| Key 1 | Value 1 |
| Key 2 | [Link text](https://example.com) |
| Image | ![Alt](https://example.com/image.png) |

### Resulting Raw HTML (before `block.js` runs):
```html
<div class="my-block variant">
  <div>
    <div>Key 1</div>
    <div>Value 1</div>
  </div>
  <div>
    <div>Key 2</div>
    <div><a href="https://example.com">Link text</a></div>
  </div>
  <div>
    <div>Image</div>
    <div><picture><img src="https://example.com/image.png" alt="Alt"></picture></div>
  </div>
</div>
```

---

## 3. `helix-query.yaml` Schema Structure

The configuration file must be placed at the root of your GitHub repository: `helix-query.yaml`.

```yaml
version: 1

indices:
  <index-name>:            # Usually 'default'
    include:               # Glob patterns of paths to index
      - '/**'
    exclude:               # Glob patterns of paths to ignore
      - '/**.json'
      - '/nav'
      - '/footer'
      - '/tools/**'
    target: /query-index.json   # Output JSON endpoint path
    properties:                 # Fields to extract
      <property-name>:
        select: <css-selector>
        value: <expression>     # Or 'values:' for arrays
```

---

## 4. Extraction Expressions & Functions Reference

`helix-query.yaml` provides built-in helper functions to transform matched DOM elements:

| Function | Description | Example |
|---|---|---|
| `textContent(el)` | Returns inner plain text (stripped of tags) | `value: textContent(el)` |
| `attribute(el, 'name')` | Reads any HTML attribute (`src`, `href`, `content`, `alt`) | `value: attribute(el, 'src')` |
| `innerHTML(el)` | Returns raw inner HTML including child tags | `value: innerHTML(el)` |
| `match(el, 'regex')` | Extracts matched regular expression group | `value: match(attribute(el, 'content'), 'https?://.+')` |
| `parseTimestamp(el, 'fmt')` | Converts date string to Unix timestamp (seconds) | `value: parseTimestamp(headers["last-modified"], "ddd, DD MMM YYYY hh:mm:ss GMT")` |
| `dateValue(el, 'fmt')` | Converts date to Excel serial number | `value: dateValue(textContent(el), "YYYY-MM-DD")` |
| `replace(s, 'find', 'rep')` | Replaces first occurrence in string | `value: replace(textContent(el), '$', '')` |
| `replaceAll(s, 'find', 'rep')` | Replaces all occurrences in string | `value: replaceAll(textContent(el), ' ', '-')` |

### Single Value (`value`) vs Array (`values`)

- **`value:`** Captures the **first** matched element as a scalar string/number:
  ```yaml
  author:
    select: .author-bio h3
    value: textContent(el)
  # Outputs in JSON: "author": "John Doe"
  ```
- **`values:`** (plural) Captures **all** matched elements as an array:
  ```yaml
  categories:
    select: .tags a, .tags li
    values: textContent(el)
  # Outputs in JSON: "categories": ["Tech", "Cloud", "Architecture"]
  ```

---

## 5. Universal Block Extraction Patterns

Here are ready-to-use patterns for common website blocks:

### Pattern A: Extracting from a Key-Value Block
Used for product specifications, event details, recipe info, metadata sidebars, etc.

```yaml
# Raw HTML:
# <div class="details">
#   <div><div>Price</div><div>$49.99</div></div>
#   <div><div>SKU</div><div>PRD-1234</div></div>
# </div>

price:
  select: .details > div:nth-child(1) > div:last-child
  value: textContent(el)

sku:
  select: .details > div:nth-child(2) > div:last-child
  value: textContent(el)
```

### Pattern B: Extracting Images and Links from a Hero/Banner Block
Used for featured banners, teasers, and hero components.

```yaml
# Raw HTML:
# <div class="hero">
#   <div><picture><img src="/media/banner.jpg"></picture></div>
#   <div><h1>Welcome</h1><a href="/get-started">Learn More</a></div>
# </div>

bannerImage:
  select: .hero img, .banner img
  value: attribute(el, 'src')

callToActionUrl:
  select: .hero a, .banner a
  value: attribute(el, 'href')

callToActionText:
  select: .hero a, .banner a
  value: textContent(el)
```

### Pattern C: Extracting Headings and Excerpts from Page Body
Extract the main headline and first intro paragraph regardless of block wrapper.

```yaml
heading:
  select: main h1, main h2
  value: textContent(el)

introSnippet:
  select: main > div:first-child p:first-of-type
  value: textContent(el)
```

### Pattern D: Multi-Value Lists (Tags, Badges, Features)
Extract list items as a JSON array.

```yaml
# Raw HTML:
# <div class="features">
#   <ul>
#     <li>Feature 1</li>
#     <li>Feature 2</li>
#   </ul>
# </div>

featuresList:
  select: .features li
  values: textContent(el)
  # Outputs: ["Feature 1", "Feature 2"]
```

### Pattern E: Safe Fallback Chaining (Block Cell ➡️ Page Metadata)
If the author specified a value inside a block, use it; otherwise, fall back to the `<head>` metadata:

```yaml
featuredImage:
  select: .hero img, .teaser img, head > meta[property="og:image"]
  value: attribute(el, 'src') || attribute(el, 'content')
```

---

## 6. End-to-End Implementation Workflow

Follow these 7 steps whenever you want to add or modify properties in your query index:

### Step 1: Author the Content
In your document (`da.live`, Word, or Google Docs), create the block or metadata.

### Step 2: Inspect Server-Rendered HTML
Run in your terminal to see the exact HTML structure:
```bash
curl http://localhost:3000/<your-page-path>.plain.html
```

### Step 3: Write CSS Selectors in `helix-query.yaml`
Open `helix-query.yaml` and define the property mappings using the patterns from Section 5.

### Step 4: Validate and Test Locally
Start the AEM CLI with the `--print-index` flag:
```bash
npx aem up --print-index
```
Navigate to your page (`http://localhost:3000/<your-page-path>`).  
The terminal will automatically print the extracted index record:
```text
Index information for /blog/my-post
Index: default
  title: "My Post Title"
  bannerImage: "https://..."
  callToActionUrl: "/get-started"
```

### Step 5: Commit and Push to GitHub `main`
The cloud indexer only reads configuration from your GitHub repository branch:
```bash
git add helix-query.yaml
git commit -m "update index configuration"
git push origin main
```

### Step 6: Publish Content or Trigger Indexing
- **Using Sidekick:** Click **Publish** on any updated document.
- **Using Admin API (Batch/Instant testing):**
  ```bash
  curl -X POST https://admin.hlx.page/index/<owner>/<repo>/main/<path>
  ```

### Step 7: Consume the JSON in Frontend JavaScript
In any block or script, fetch `/query-index.json`:
```javascript
async function loadIndexData() {
  const response = await fetch('/query-index.json');
  if (!response.ok) return [];
  
  const json = await response.json();
  const records = json.data || json;
  
  return records; // Array of objects with all configured properties!
}
```

---

## 7. Best Practices & Critical Gotchas

1. **Never commit a static `query-index.json` to GitHub:**  
   If a physical file named `query-index.json` exists in Git, the server serves that static file instead of generating the dynamic index. Delete it from Git so the cloud indexer can serve live data.

2. **Always select `img` inside `<picture>`:**  
   EDS wraps images in responsive `<picture>` tags. Selecting `attribute(.hero picture, 'src')` will fail because `<picture>` has no `src`. Always select `.hero img`.

3. **Avoid brittle `:nth-child` where table rows may be reordered:**  
   If content authors might swap row 1 and row 2 in a table, selecting `:nth-child(1)` can extract the wrong property. For critical attributes, prefer using the **Metadata table** or unique class wrappers.

4. **Multiple Indexes:**  
   You can define multiple independent indexes in the same `helix-query.yaml` by targeting different output paths:
   ```yaml
   indices:
     blogIndex:
       include:
         - '/blog/**'
       target: /blog-index.json
       properties: ...
     productIndex:
       include:
         - '/products/**'
       target: /product-index.json
       properties: ...
   ```
