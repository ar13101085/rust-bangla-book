# Deploying via Wrangler CLI

If the Cloudflare dashboard doesn't expose the classic **Pages** flow anymore (some users report it's hidden behind the unified Workers/Pages UI), you can still create a Pages project — and get a `*.pages.dev` URL — from the command line. Wrangler CLI bypasses the dashboard's framework auto-detection entirely.

```bash
# Install Wrangler globally
npm install -g wrangler

# Log in (opens your browser to authorize)
wrangler login

# Build the static site locally
npm run build

# Deploy to Cloudflare Pages — creates a Pages project, not a Worker
wrangler pages deploy dist --project-name=rust-bangla-book
```

The first run creates the project; subsequent runs publish a new deployment to it.

After the first successful deploy, your site is live at:

**<https://rust-bangla-book.pages.dev>**

## Connecting to GitHub for auto-deploy

The CLI flow doesn't auto-deploy on push by default. Once the project exists in your Cloudflare account (after the first `wrangler pages deploy`), you can wire it up:

1. Cloudflare dashboard → **Workers & Pages** → click your `rust-bangla-book` project.
2. **Settings → Builds & deployments → Connect to Git**.
3. Authorize GitHub, pick your repo, set the production branch to **`master`**.
4. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variables:** `NODE_VERSION=22`, `ORIGIN=https://rust-bangla-book.pages.dev`

From now on, every push to `master` triggers a rebuild and deploy automatically.
