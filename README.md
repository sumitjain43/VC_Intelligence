# VC Intelligence Interface

An AI-powered company discovery platform for venture capital firms. Combines modern search and filtering capabilities with live web enrichment to surface high-signal startup opportunities while maintaining thesis alignment and explaining every recommendation.

**Features:**
- Fast company search with faceted filtering (industry, stage, sorting)
- Global search bar plus saved searches for repeatability
- Company profiles with founder info and a signals timeline
- Live web enrichment via Firecrawl (summary, what they do, keywords, signals, sources)
- Rich note-taking and research tracking
- Dynamic list management with CSV and JSON export
- Premium UI with dark theme and smooth interactions

## Tech Stack

- **Backend:** Node.js + Express.js + MongoDB
- **Frontend:** React + Vite + Tailwind CSS + Lucide Icons
- **Enrichment:** Firecrawl API (for web scraping and LLM extraction)
- **Deployment:** Vercel (frontend) + Render/Railway (backend)

## Project Structure

```
vc-intelligence/
|-- backend/                  # Express API server
|   |-- server.js             # Main server with all routes
|   |-- package.json
|   `-- .env.example          # Environment variables template
|-- frontend/                 # React Vite app
|   |-- src/
|   |   |-- App.jsx           # Main app with routing
|   |   |-- pages/
|   |   |   |-- CompaniesPage.jsx      # Search and filter
|   |   |   |-- CompanyProfile.jsx     # Detail view and enrichment
|   |   |   |-- ListsPage.jsx          # List management
|   |   |   `-- SavedSearchesPage.jsx  # Saved search history
|   |   |-- main.jsx
|   |   `-- index.css         # Tailwind imports
|   |-- vite.config.js
|   |-- tailwind.config.js
|   `-- package.json
|-- package.json              # Root monorepo config
`-- README.md                 # This file
```

## Setup & Installation

### Prerequisites

- Node.js 16+ and npm
- MongoDB (local or cloud atlas)
- Firecrawl API key (free tier available at https://firecrawl.dev)

### 1. Clone & Install

```bash
git clone <repo-url> vc-intelligence
cd vc-intelligence
npm install

# Install backend and frontend dependencies
npm run install-all
```

### 2. Configure Environment Variables

**Backend Setup (.env)**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# MongoDB connection string (local or Atlas)
MONGODB_URI=mongodb://localhost:27017/vc-intelligence
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vc-intelligence

# Server port
PORT=5000

# Firecrawl API key (get free at https://firecrawl.dev)
FIRECRAWL_API_KEY=your_api_key_here
```

For **MongoDB**, either:
- Install locally: https://docs.mongodb.com/manual/installation/
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

For **Firecrawl API key**:
- Sign up at https://firecrawl.dev
- Get your API key from the dashboard
- Add it to `.env`

### 3. Run Locally

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# App opens at http://localhost:5173
```

The frontend proxies API calls to `localhost:5000`, so both must be running.

## API Routes

### Companies
- `GET /api/companies` - List companies with search, filters, pagination, and sorting
  - Query params: `search`, `industry`, `stage`, `sortBy`, `page`, `limit`
- `GET /api/companies/:id` - Get single company

### Enrichment
- `GET /api/enrichment/:companyId` - Get cached enrichment (if exists)
- `POST /api/enrich` - Trigger live enrichment
  - Body: `{ companyId, website, force }`

### Notes
- `POST /api/notes` - Add note to company
- `GET /api/notes/:companyId` - Get all notes for company
- `DELETE /api/notes/:id` - Delete note

## Features in Detail

### 1. Company Discovery (/companies)
- **Search:** Full-text search across company names, descriptions, tags
- **Filters:** Industry, stage dropdowns
- **Sorting:** By name, founding date, stage (server-side)
- **Pagination:** 10 results per page
- **Save Search:** Create named searches for later (stored in localStorage)

### 2. Company Profile (/companies/:id)
- **Overview:** Name, location, website, tags, founders
- **Live Enrichment:** One-click "Enrich Company" button
  - Fetches real public page content via Firecrawl
  - Extracts: summary, what they do, keywords, signals, sources
  - Shows sources with timestamps (transparency)
- **Signals Timeline:** Seeded company signals shown chronologically
- **Notes:** Add/delete research notes linked to company
- **Save to List:** Add company to custom lists

### 3. Lists Management (/lists)
- **Create Lists:** Name custom lists (e.g., "AI Unicorns", "Series A Targets")
- **Manage:** Add/remove companies, view list size
- **Export CSV/JSON:** Download list as CSV or JSON with company data
- **Persistence:** Stored in localStorage

### 4. Saved Searches (/saved)
- **Auto-save:** Click "Save Search" from /companies
- **Re-run:** Click "Run Search" to apply same filters
- **View History:** See all saved searches with metadata

## Enrichment Format

When you click "Enrich Company", the API returns:

```json
{
  "summary": "1-2 sentence overview",
  "whatTheyDo": ["bullet 1", "bullet 2", "..."],
  "keywords": ["tag1", "tag2", "..."],
  "signals": [
    "Active careers page (hiring)",
    "Recent blog posts",
    "GitHub activity",
    "Regular product updates"
  ],
  "sources": [
    {
      "url": "https://company.com",
      "timestamp": "2025-02-19T12:00:00Z"
    }
  ]
}
```

## Deployment

### Frontend - Vercel (Recommended)

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo to Vercel dashboard for auto-deploy
# https://vercel.com/new
```

**Important:** In Vercel project settings, add environment variable:

```
VITE_API_URL=https://your-backend-url.com
```

Update `frontend/vite.config.js` to use it:

```js
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

### Backend - Render.com or Railway

**Option A: Render.com**

1. Push code to GitHub
2. Go to https://render.com and sign up
3. Create new "Web Service", connect GitHub repo
4. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `FIRECRAWL_API_KEY`: Your Firecrawl API key
   - `PORT`: 3000
5. Deploy!

**Option B: Railway.app**

1. Push to GitHub
2. Go to https://railway.app
3. Create new project from GitHub repo
4. Add variables in Railway dashboard
5. Deploy!

## Development Workflow

### Adding a new API route

1. Edit `backend/server.js`
2. Add your route handler (e.g., `app.post('/api/new')`)
3. Frontend can call it with `axios.post('/api/new', data)`

### Adding a new page

1. Create file in `frontend/src/pages/NewPage.jsx`
2. Import in `frontend/src/App.jsx`
3. Add route: `<Route path="/new" element={<NewPage />} />`
4. Add navigation link in sidebar (App.jsx)

### Styling

All styling uses **Tailwind CSS**. Classes are utility-first:

```jsx
<div className="p-6 bg-gray-900 rounded-lg hover:bg-gray-800 transition">
  <h2 className="text-xl font-bold text-white mb-4">Title</h2>
</div>
```

Key colors:
- `bg-gray-950`: Darkest background
- `bg-gray-900`: Dark card/panel
- `bg-blue-600`: Primary action button
- `text-white`: Primary text
- `text-gray-400`: Secondary text

## Troubleshooting

### "Cannot GET /api/companies"
- Backend not running? Run `npm run dev` in `backend/` folder
- MongoDB not running? Start MongoDB service
- Wrong port? Check that backend is on 5000 and frontend proxy is configured

### "Enrichment not working"
- Missing API key? Add `FIRECRAWL_API_KEY` to `.env`
- Firecrawl API down? Check https://status.firecrawl.dev
- Website cannot be scraped? Some sites block automated access

### "MongoDB connection error"
- Not installed locally? Install or switch to MongoDB Atlas
- Atlas connection string wrong? Double-check username, password, cluster name
- IP whitelist? If using Atlas, add your IP to IP whitelist

### "localhost:5173 cannot reach API"
- Both servers running? Check both terminals
- Proxy misconfigured? Check `frontend/vite.config.js` points to port 5000
- CORS error? Backend should have `cors()` middleware (it does by default)

## Performance & Production Notes

1. **Caching:** Enrichment results are cached in MongoDB. Same company will not be re-scraped unless forced.
2. **Rate Limiting:** When deploying, consider adding rate limiting to `/api/enrich` to avoid quota overages.
3. **Search Index:** For large datasets (1000+ companies), add MongoDB indexes on `name`, `industry`, `stage`.
4. **Storage:** localStorage is ~5-10MB max. For thousands of items, consider moving lists/searches to backend.

## Future Enhancements (Post-MVP)

- LLM-powered scoring aligned with fund thesis
- Vector search for semantic company matching
- Slack/email alerts for new matching companies
- Multi-user support with team workspaces
- Bulk actions (tag, list, export)
- Advanced filtering and saved filter templates
- Integration with Crunchbase/PitchBook APIs

## License

This is an intern project for learning purposes.

---

**Questions?** Check the code comments or refer to the Tech Stack docs.

**Stuck?** Debug with browser DevTools (frontend) and server logs (backend). Check MongoDB that data is there: `db.companies.find()`.
