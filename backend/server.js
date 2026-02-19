import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vc-intelligence')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// =======================
// SCHEMAS
// =======================

const signalSchema = new mongoose.Schema({
  date: Date,
  title: String,
  type: String
}, { _id: false });

const companySchema = new mongoose.Schema({
  id: String,
  name: String,
  industry: String,
  stage: String,
  founded: Number,
  founders: [String],
  description: String,
  website: String,
  location: String,
  tags: [String],
  signals: [signalSchema],
  createdAt: { type: Date, default: Date.now }
});

const enrichmentSchema = new mongoose.Schema({
  companyId: String,
  summary: String,
  whatTheyDo: [String],
  keywords: [String],
  signals: [String],
  sources: [{ url: String, timestamp: Date }],
  cachedAt: { type: Date, default: Date.now }
});

const noteSchema = new mongoose.Schema({
  id: String,
  companyId: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const Company = mongoose.model('Company', companySchema);
const Enrichment = mongoose.model('Enrichment', enrichmentSchema);
const Note = mongoose.model('Note', noteSchema);

// =======================
// SEED DATA
// =======================

const seedCompanies = async () => {
  const companies = [
    {
      id: '1',
      name: 'Anthropic',
      industry: 'AI/ML',
      stage: 'Growth',
      founded: 2021,
      founders: ['Dario Amodei', 'Daniela Amodei'],
      description: 'AI research company building safe, beneficial AI systems',
      website: 'https://anthropic.com',
      location: 'San Francisco',
      tags: ['AI', 'Research', 'LLM'],
      signals: [
        { date: new Date('2025-11-12'), title: 'Published safety research update', type: 'research' },
        { date: new Date('2025-09-05'), title: 'Expanded enterprise offerings', type: 'product' },
        { date: new Date('2025-06-18'), title: 'Opened new hiring hub', type: 'hiring' }
      ]
    },
    {
      id: '2',
      name: 'Figma',
      industry: 'Design Tools',
      stage: 'Growth',
      founded: 2012,
      founders: ['Dylan Field', 'Evan Wallace'],
      description: 'Collaborative design platform',
      website: 'https://figma.com',
      location: 'San Francisco',
      tags: ['Design', 'B2B', 'SaaS'],
      signals: [
        { date: new Date('2025-12-03'), title: 'Launched new enterprise admin tools', type: 'product' },
        { date: new Date('2025-08-21'), title: 'Hosted global design conference', type: 'community' },
        { date: new Date('2025-04-09'), title: 'Expanded EU data residency', type: 'product' }
      ]
    },
    {
      id: '3',
      name: 'Stripe',
      industry: 'Fintech',
      stage: 'Growth',
      founded: 2010,
      founders: ['Patrick Collison', 'John Collison'],
      description: 'Payments infrastructure for the internet',
      website: 'https://stripe.com',
      location: 'San Francisco',
      tags: ['Fintech', 'Payments', 'API'],
      signals: [
        { date: new Date('2025-10-14'), title: 'Rolled out fraud prevention upgrades', type: 'product' },
        { date: new Date('2025-07-01'), title: 'Announced new treasury features', type: 'product' },
        { date: new Date('2025-03-12'), title: 'Expanded LATAM coverage', type: 'growth' }
      ]
    },
    {
      id: '4',
      name: 'OpenAI',
      industry: 'AI/ML',
      stage: 'Growth',
      founded: 2015,
      founders: ['Sam Altman'],
      description: 'AI research organization pushing the boundaries of AI capabilities',
      website: 'https://openai.com',
      location: 'San Francisco',
      tags: ['AI', 'LLM', 'Research'],
      signals: [
        { date: new Date('2025-11-28'), title: 'Released new model update', type: 'product' },
        { date: new Date('2025-08-06'), title: 'Published alignment research', type: 'research' },
        { date: new Date('2025-05-20'), title: 'Expanded developer platform', type: 'platform' }
      ]
    },
    {
      id: '5',
      name: 'Notion',
      industry: 'Productivity',
      stage: 'Growth',
      founded: 2016,
      founders: ['Ivan Zhao'],
      description: 'All-in-one workspace for work, notes, and databases',
      website: 'https://notion.so',
      location: 'San Francisco',
      tags: ['Productivity', 'B2B', 'SaaS'],
      signals: [
        { date: new Date('2025-09-17'), title: 'Shipped AI writing assistants', type: 'product' },
        { date: new Date('2025-06-02'), title: 'Launched enterprise compliance suite', type: 'product' },
        { date: new Date('2025-02-14'), title: 'Opened APAC sales office', type: 'growth' }
      ]
    },
    {
      id: '6',
      name: 'Canva',
      industry: 'Design',
      stage: 'Growth',
      founded: 2013,
      founders: ['Melanie Perkins'],
      description: 'Design and visual content creation platform',
      website: 'https://canva.com',
      location: 'Sydney',
      tags: ['Design', 'Creator', 'SaaS'],
      signals: [
        { date: new Date('2025-10-02'), title: 'Introduced video editing suite', type: 'product' },
        { date: new Date('2025-07-19'), title: 'Expanded creator marketplace', type: 'platform' },
        { date: new Date('2025-03-25'), title: 'Launched education partnerships', type: 'growth' }
      ]
    },
    {
      id: '7',
      name: 'Linear',
      industry: 'Developer Tools',
      stage: 'Growth',
      founded: 2019,
      founders: ['Karri Saarinen'],
      description: 'Issue tracking and project management for software teams',
      website: 'https://linear.app',
      location: 'San Francisco',
      tags: ['DevTools', 'B2B', 'SaaS'],
      signals: [
        { date: new Date('2025-11-04'), title: 'Released analytics dashboards', type: 'product' },
        { date: new Date('2025-08-15'), title: 'Integrated with major CI providers', type: 'product' },
        { date: new Date('2025-05-07'), title: 'Expanded enterprise security controls', type: 'security' }
      ]
    },
    {
      id: '8',
      name: 'Cal.com',
      industry: 'Scheduling',
      stage: 'Growth',
      founded: 2020,
      founders: ['Peer Richelsen'],
      description: 'Open source calendar and scheduling infrastructure',
      website: 'https://cal.com',
      location: 'San Francisco',
      tags: ['Scheduling', 'Open Source', 'B2B'],
      signals: [
        { date: new Date('2025-09-09'), title: 'Shipped enterprise scheduling APIs', type: 'product' },
        { date: new Date('2025-06-26'), title: 'Launched developer marketplace', type: 'platform' },
        { date: new Date('2025-04-01'), title: 'Expanded open source contributors', type: 'community' }
      ]
    },
    {
      id: '9',
      name: 'Vanta',
      industry: 'Security',
      stage: 'Series B',
      founded: 2018,
      founders: ['Founding Team'],
      description: 'Automated security and compliance platform for modern teams',
      website: 'https://vanta.com',
      location: 'San Francisco',
      tags: ['Security', 'Compliance', 'B2B'],
      signals: [
        { date: new Date('2025-10-22'), title: 'Expanded compliance automation suite', type: 'product' },
        { date: new Date('2025-07-30'), title: 'Launched partner ecosystem', type: 'growth' },
        { date: new Date('2025-03-18'), title: 'Published security benchmarks report', type: 'research' }
      ]
    },
    {
      id: '10',
      name: 'Mercury',
      industry: 'Fintech',
      stage: 'Series B',
      founded: 2017,
      founders: ['Founding Team'],
      description: 'Banking platform designed for startups and growth-stage companies',
      website: 'https://mercury.com',
      location: 'San Francisco',
      tags: ['Fintech', 'Banking', 'SMB'],
      signals: [
        { date: new Date('2025-11-08'), title: 'Released treasury management tools', type: 'product' },
        { date: new Date('2025-08-12'), title: 'Expanded international transfers', type: 'product' },
        { date: new Date('2025-04-22'), title: 'Opened new customer success hub', type: 'growth' }
      ]
    },
    {
      id: '11',
      name: 'Hightouch',
      industry: 'Data Infrastructure',
      stage: 'Series A',
      founded: 2019,
      founders: ['Founding Team'],
      description: 'Data activation platform syncing warehouse data to business tools',
      website: 'https://hightouch.com',
      location: 'San Francisco',
      tags: ['Data', 'RevOps', 'B2B'],
      signals: [
        { date: new Date('2025-09-26'), title: 'Shipped audience activation tools', type: 'product' },
        { date: new Date('2025-06-10'), title: 'Launched marketplace integrations', type: 'platform' },
        { date: new Date('2025-02-28'), title: 'Published customer data maturity report', type: 'research' }
      ]
    },
    {
      id: '12',
      name: 'Arcadia',
      industry: 'Climate',
      stage: 'Series B',
      founded: 2014,
      founders: ['Founding Team'],
      description: 'Climate platform accelerating clean energy adoption',
      website: 'https://arcadia.com',
      location: 'Washington, DC',
      tags: ['Climate', 'Energy', 'SaaS'],
      signals: [
        { date: new Date('2025-10-05'), title: 'Expanded community solar network', type: 'growth' },
        { date: new Date('2025-07-14'), title: 'Launched carbon accounting tools', type: 'product' },
        { date: new Date('2025-04-11'), title: 'Announced utility partnerships', type: 'partnership' }
      ]
    },
    {
      id: '13',
      name: 'Langfuse',
      industry: 'Developer Tools',
      stage: 'Seed',
      founded: 2022,
      founders: ['Founding Team'],
      description: 'Open source LLM observability and prompt management platform',
      website: 'https://langfuse.com',
      location: 'Berlin',
      tags: ['LLM', 'Open Source', 'Observability'],
      signals: [
        { date: new Date('2025-09-02'), title: 'Released hosted cloud offering', type: 'product' },
        { date: new Date('2025-06-23'), title: 'Expanded open source contributors', type: 'community' },
        { date: new Date('2025-03-04'), title: 'Published LLM evaluation guide', type: 'research' }
      ]
    },
    {
      id: '14',
      name: 'Abridge',
      industry: 'HealthTech',
      stage: 'Series B',
      founded: 2018,
      founders: ['Founding Team'],
      description: 'AI-powered clinical documentation platform for healthcare',
      website: 'https://abridge.com',
      location: 'Pittsburgh',
      tags: ['HealthTech', 'AI', 'SaaS'],
      signals: [
        { date: new Date('2025-11-18'), title: 'Expanded hospital partnerships', type: 'growth' },
        { date: new Date('2025-08-02'), title: 'Launched multilingual documentation', type: 'product' },
        { date: new Date('2025-05-09'), title: 'Published clinical outcomes study', type: 'research' }
      ]
    }
  ];

  const existingCompanies = await Company.find(
    { id: { $in: companies.map(company => company.id) } },
    { id: 1, signals: 1 }
  );

  const existingMap = new Map(existingCompanies.map(company => [company.id, company]));
  const bulkOps = [];

  for (const company of companies) {
    const existing = existingMap.get(company.id);
    if (!existing) {
      bulkOps.push({ insertOne: { document: company } });
      continue;
    }

    if (!existing.signals || existing.signals.length === 0) {
      bulkOps.push({
        updateOne: {
          filter: { id: company.id },
          update: { $set: { signals: company.signals } }
        }
      });
    }
  }

  if (bulkOps.length > 0) {
    await Company.bulkWrite(bulkOps);
    console.log('Companies seeded/updated');
  }
};

seedCompanies();

// =======================
// ROUTES
// =======================

// Get all companies with search and pagination
app.get('/api/companies', async (req, res) => {
  try {
    const { search, industry, stage, page = 1, limit = 10, sortBy = 'name' } = req.query;
    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
        { founders: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
        { industry: { $regex: searchRegex } },
        { stage: { $regex: searchRegex } },
        { website: { $regex: searchRegex } }
      ];
    }

    if (industry) filter.industry = industry;
    if (stage) filter.stage = stage;

    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.min(50, parseInt(limit) || 10);
    const skip = (pageNumber - 1) * limitNumber;
    const sortMap = {
      name: { name: 1 },
      founded: { founded: -1 },
      stage: { stage: 1 }
    };

    const companies = await Company.find(filter)
      .sort(sortMap[sortBy] || sortMap.name)
      .skip(skip)
      .limit(limitNumber);

    const total = await Company.countDocuments(filter);

    res.json({
      companies,
      total,
      pages: Math.ceil(total / limitNumber),
      currentPage: pageNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a company
app.post('/api/companies', async (req, res) => {
  try {
    const {
      name,
      industry,
      stage,
      founded,
      founders,
      description,
      website,
      location,
      tags,
      signals
    } = req.body;

    if (!name || !industry || !stage) {
      return res.status(400).json({ error: 'name, industry, and stage are required' });
    }

    const normalizedWebsite = website ? normalizeUrl(website) : '';
    const company = new Company({
      id: String(Date.now()),
      name: String(name).trim(),
      industry: String(industry).trim(),
      stage: String(stage).trim(),
      founded: founded ? Number(founded) : undefined,
      founders: normalizeArray(founders),
      description: description ? String(description).trim() : '',
      website: normalizedWebsite || (website ? String(website).trim() : ''),
      location: location ? String(location).trim() : '',
      tags: normalizeArray(tags),
      signals: normalizeSignals(signals)
    });

    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single company
app.get('/api/companies/:id', async (req, res) => {
  try {
    const company = await Company.findOne({ id: req.params.id });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cached enrichment
app.get('/api/enrichment/:companyId', async (req, res) => {
  try {
    const enrichment = await Enrichment.findOne({ companyId: req.params.companyId });
    if (!enrichment) return res.status(404).json({ error: 'No enrichment found' });

    // Check if cached data is fresh (less than 24 hours)
    const cacheAge = Date.now() - new Date(enrichment.cachedAt).getTime();
    const isFresh = cacheAge < 24 * 60 * 60 * 1000;

    res.json({ enrichment, isFresh });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enrich company with live data
app.post('/api/enrich', async (req, res) => {
  try {
    const { companyId, website, force } = req.body;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const company = await Company.findOne({ id: companyId });
    const targetWebsite = website || company?.website;
    const normalizedWebsite = normalizeUrl(targetWebsite);

    if (!normalizedWebsite) {
      return res.status(400).json({ error: 'Valid website URL is required for enrichment' });
    }

    if (!force) {
      const cached = await Enrichment.findOne({ companyId });
      if (cached) {
        return res.json({ enrichment: cached, cached: true });
      }
    }

    // Use Firecrawl to scrape website
    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      return res.status(400).json({
        error: 'Firecrawl API key not configured. Add FIRECRAWL_API_KEY to .env'
      });
    }

    const firecrawlResponse = await axios.post(
      'https://api.firecrawl.dev/v2/scrape',
      {
        url: normalizedWebsite,
        formats: [
          'summary',
          'links',
          {
            type: 'json',
            prompt: 'Extract JSON with keys: whatTheyDo (3-6 bullets), keywords (5-10 short keywords), signals (2-4 signals inferred from public pages). Return arrays of concise strings.'
          }
        ],
        onlyMainContent: true,
        blockAds: true,
        removeBase64Images: true
      },
      {
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!firecrawlResponse.data?.success) {
      return res.status(502).json({
        error: firecrawlResponse.data?.error || 'Firecrawl scrape failed'
      });
    }

    const scraped = firecrawlResponse.data.data || {};
    const extracted = scraped.json || {};

    const summary = trimSummary(
      scraped.summary ||
      extracted.summary ||
      scraped.metadata?.description ||
      ''
    );

    const whatTheyDo = trimList(
      fillMinimum(
        normalizeList(extracted.whatTheyDo),
        3,
        buildFallbackWhatTheyDo(company)
      ),
      6
    );

    const keywordSeed = [
      ...normalizeList(extracted.keywords),
      ...(company?.tags || []),
      company?.industry,
      company?.stage
    ];

    const keywords = trimList(
      fillMinimum(
        dedupeList(keywordSeed),
        5,
        buildFallbackKeywords(company)
      ),
      10
    );

    const signalSeed = [
      ...normalizeList(extracted.signals),
      ...deriveSignalsFromLinks(scraped.links || [])
    ];

    const signals = trimList(
      fillMinimum(
        dedupeList(signalSeed),
        2,
        buildFallbackSignals(company)
      ),
      4
    );

    // Save to database
    const enrichment = await Enrichment.findOneAndUpdate(
      { companyId },
      {
        $set: {
          companyId,
          summary,
          whatTheyDo,
          keywords,
          signals,
          sources: [{ url: normalizedWebsite, timestamp: new Date() }],
          cachedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    res.json({ enrichment, cached: false });
  } catch (error) {
    console.error('Enrichment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save note
app.post('/api/notes', async (req, res) => {
  try {
    const { companyId, content } = req.body;
    const id = require('crypto').randomUUID();

    const note = new Note({ id, companyId, content });
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notes for company
app.get('/api/notes/:companyId', async (req, res) => {
  try {
    const notes = await Note.find({ companyId: req.params.companyId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =======================
// HELPER FUNCTIONS
// =======================

function normalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.toString().replace(/\/$/, '');
  } catch (error) {
    return null;
  }
}

function trimSummary(text, maxSentences = 2) {
  if (!text) return '';
  const normalized = text.replace(/\s+/g, ' ').trim();
  const sentences = normalized.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, maxSentences).join(' ').trim();
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeArray(value) {
  return normalizeList(value);
}

function normalizeSignals(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(signal => ({
      date: signal?.date ? new Date(signal.date) : undefined,
      title: signal?.title ? String(signal.title).trim() : '',
      type: signal?.type ? String(signal.type).trim() : ''
    }))
    .filter(signal => signal.title);
}

function dedupeList(list) {
  const seen = new Set();
  const output = [];
  for (const item of list) {
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function fillMinimum(list, min, fallback) {
  const output = [...list];
  for (const item of fallback) {
    if (output.length >= min) break;
    if (!output.some(existing => existing.toLowerCase() === item.toLowerCase())) {
      output.push(item);
    }
  }
  return output;
}

function trimList(list, max) {
  return list.slice(0, max);
}

function buildFallbackWhatTheyDo(company) {
  const industry = company?.industry || 'core';
  return [
    `Builds ${industry} software products`,
    'Serves enterprise and mid-market customers',
    'Invests in platform and developer experience'
  ];
}

function buildFallbackKeywords(company) {
  return [
    company?.industry || 'SaaS',
    company?.stage || 'Growth',
    'B2B',
    'Platform',
    'Cloud'
  ].filter(Boolean);
}

function buildFallbackSignals(company) {
  const signals = ['Public website with clear positioning', 'Recent product activity'];
  if (company?.stage) signals.push(`${company.stage} stage momentum`);
  return signals;
}

function deriveSignalsFromLinks(links) {
  const linkUrls = links
    .map(link => (typeof link === 'string' ? link : link?.url))
    .filter(Boolean)
    .map(link => link.toLowerCase());

  const signals = [];
  if (linkUrls.some(link => link.includes('/careers') || link.includes('/jobs'))) {
    signals.push('Active careers page (hiring)');
  }
  if (linkUrls.some(link => link.includes('/blog') || link.includes('/news'))) {
    signals.push('Publishes company updates or blog posts');
  }
  if (linkUrls.some(link => link.includes('/changelog') || link.includes('/updates'))) {
    signals.push('Maintains a product changelog or updates page');
  }
  if (linkUrls.some(link => link.includes('/docs') || link.includes('/developers'))) {
    signals.push('Public developer documentation available');
  }
  return signals;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
