# Sunfeast YiPPee Edge Worker (Cloudflare Workers)

This Edge Worker sits in front of Adobe Edge Delivery Services (EDS) at `main--sunfeast-yippee--ankitraj4899.aem.live`. It automatically injects server-side JSON-LD structured schema (`Product`, `CollectionPage`, `ItemList`, `Organization`, `WebSite`) into HTML responses.

---

## Prerequisites

1. A [Cloudflare](https://dash.cloudflare.com/) account.
2. [Node.js](https://nodejs.org/) installed.

---

## Local Development & Testing

From the `edge-worker` directory:

```bash
# Start local development server
npm run dev
# or
npx wrangler dev
```

Visit the local URL shown by Wrangler (e.g., `http://localhost:8787/product-listing`) to test the worker injecting schemas into live EDS pages.

---

## Deployment Steps

### 1. Authenticate with Cloudflare
Run the login command (this will open a browser to authenticate your Cloudflare account):
```bash
npx wrangler login
```

### 2. Verify Dry Run (Optional)
```bash
npm run build
# or
npx wrangler deploy --dry-run
```

### 3. Deploy to Cloudflare
```bash
npm run deploy
# or
npx wrangler deploy
```

Once published, Wrangler will provide a live `*.workers.dev` URL (e.g. `https://sunfeast-yippee-edge-worker.<your-subdomain>.workers.dev`).

---

## Attaching a Custom Domain / Route

To route live website traffic through this worker:

1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** > **`sunfeast-yippee-edge-worker`**.
2. Go to **Settings** > **Triggers** (or **Domains & Routes**).
3. Choose either:
   - **Custom Domain**: Click **Add Custom Domain** and enter your domain (e.g. `www.yippee.in`). Cloudflare will handle DNS and SSL automatically.
   - **Route**: If your domain DNS is already managed on Cloudflare, click **Add Route** (e.g. `www.yippee.in/*`) and select your Zone.
