/**
 * VIGYL Industry Taxonomy
 * 
 * Comprehensive database of industries, verticals, and sub-verticals
 * organized by sector. Used by the prospect expansion system to discover
 * untapped opportunities across the full breadth of the economy.
 */

export interface IndustryVertical {
  id: string;
  name: string;
  sector: string;
  keywords: string[];           // For matching user businesses
  exampleCompanies: string[];   // Real companies in this vertical
  aiOpportunityLevel: "high" | "medium" | "low";
}

export interface IndustrySector {
  id: string;
  name: string;
  icon: string;
  verticals: IndustryVertical[];
}

export const INDUSTRY_TAXONOMY: IndustrySector[] = [
  {
    id: "food-bev",
    name: "Food & Beverage",
    icon: "🍔",
    verticals: [
      { id: "fast-casual-qsr", name: "Fast Casual & QSR Dining", sector: "Food & Beverage", keywords: ["restaurant", "fast food", "quick service", "qsr", "fast casual", "dining"], exampleCompanies: ["Chipotle", "Sweetgreen", "Panera Bread", "Wingstop", "Cava", "Shake Shack"], aiOpportunityLevel: "high" },
      { id: "c-store", name: "Convenience Stores & C-Store", sector: "Food & Beverage", keywords: ["convenience", "c-store", "gas station", "fuel retail"], exampleCompanies: ["7-Eleven", "Wawa", "Sheetz", "Casey's", "QuikTrip", "Buc-ee's"], aiOpportunityLevel: "medium" },
      { id: "cpg-food", name: "Consumer Packaged Goods — Food", sector: "Food & Beverage", keywords: ["cpg", "packaged food", "snacks", "consumer goods", "grocery brands"], exampleCompanies: ["General Mills", "Mondelez", "Conagra", "Kellogg's", "Hershey", "McCormick"], aiOpportunityLevel: "high" },
      { id: "craft-brands", name: "Craft & Artisan Brands", sector: "Food & Beverage", keywords: ["craft", "artisan", "small batch", "specialty food", "craft beverage"], exampleCompanies: ["Olipop", "Athletic Brewing", "Siete Foods", "Hu Kitchen", "Liquid Death", "Poppi"], aiOpportunityLevel: "medium" },
      { id: "beverage", name: "Beverage Companies", sector: "Food & Beverage", keywords: ["beverage", "drink", "soda", "juice", "water", "spirits", "beer", "wine"], exampleCompanies: ["PepsiCo", "Coca-Cola", "Diageo", "Constellation Brands", "Molson Coors", "Monster Energy"], aiOpportunityLevel: "high" },
      { id: "food-service", name: "Food Service & Distribution", sector: "Food & Beverage", keywords: ["food service", "distribution", "catering", "food supply"], exampleCompanies: ["Sysco", "US Foods", "Performance Food Group", "Aramark", "Compass Group"], aiOpportunityLevel: "medium" },
      { id: "restaurant-chains", name: "Restaurant Chains & Franchises", sector: "Food & Beverage", keywords: ["restaurant chain", "franchise", "casual dining", "fine dining"], exampleCompanies: ["Darden Restaurants", "Yum! Brands", "McDonald's", "Inspire Brands", "Bloomin' Brands", "Brinker International"], aiOpportunityLevel: "high" },
      { id: "grocery-retail", name: "Grocery & Supermarkets", sector: "Food & Beverage", keywords: ["grocery", "supermarket", "food retail"], exampleCompanies: ["Kroger", "Publix", "H-E-B", "Aldi", "Trader Joe's", "Wegmans"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "media-entertainment",
    name: "Media & Entertainment",
    icon: "🎬",
    verticals: [
      { id: "production-studios", name: "Production Studios & Film", sector: "Media & Entertainment", keywords: ["production", "studio", "film", "movie", "content production"], exampleCompanies: ["Lionsgate", "A24", "Blumhouse", "Village Roadshow", "Legendary Entertainment", "Anonymous Content"], aiOpportunityLevel: "high" },
      { id: "streaming", name: "Streaming & Digital Content", sector: "Media & Entertainment", keywords: ["streaming", "ott", "digital content", "subscription video"], exampleCompanies: ["Netflix", "Spotify", "Roku", "Crunchyroll", "Peacock", "Paramount+"], aiOpportunityLevel: "high" },
      { id: "gaming", name: "Gaming & Interactive", sector: "Media & Entertainment", keywords: ["gaming", "video game", "esports", "interactive"], exampleCompanies: ["Epic Games", "Riot Games", "Roblox", "Unity", "Supercell", "Niantic"], aiOpportunityLevel: "high" },
      { id: "advertising-media", name: "Advertising & Media Buying", sector: "Media & Entertainment", keywords: ["advertising", "media buying", "ad tech", "programmatic"], exampleCompanies: ["The Trade Desk", "Publicis", "WPP", "Omnicom", "IPG", "Dentsu"], aiOpportunityLevel: "high" },
      { id: "music-audio", name: "Music & Audio", sector: "Media & Entertainment", keywords: ["music", "audio", "podcast", "radio", "recording"], exampleCompanies: ["Universal Music Group", "Warner Music", "Sony Music", "iHeartMedia", "Audacy", "SiriusXM"], aiOpportunityLevel: "medium" },
      { id: "publishing-news", name: "Publishing & News Media", sector: "Media & Entertainment", keywords: ["publishing", "news", "media", "newspaper", "magazine", "digital media"], exampleCompanies: ["New York Times", "Condé Nast", "Hearst", "Gannett", "BuzzFeed", "Vox Media"], aiOpportunityLevel: "medium" },
      { id: "sports-entertainment", name: "Sports & Live Entertainment", sector: "Media & Entertainment", keywords: ["sports", "live events", "entertainment venues", "ticketing"], exampleCompanies: ["Live Nation", "AEG", "MSG Sports", "Endeavor", "UFC", "Formula 1"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "tech-saas",
    name: "Technology & SaaS",
    icon: "💻",
    verticals: [
      { id: "enterprise-saas", name: "Enterprise SaaS", sector: "Technology & SaaS", keywords: ["enterprise software", "saas", "b2b software", "cloud platform"], exampleCompanies: ["Salesforce", "ServiceNow", "Workday", "HubSpot", "Atlassian", "Datadog"], aiOpportunityLevel: "high" },
      { id: "cybersecurity", name: "Cybersecurity", sector: "Technology & SaaS", keywords: ["cybersecurity", "infosec", "security", "threat detection"], exampleCompanies: ["CrowdStrike", "Palo Alto Networks", "Zscaler", "SentinelOne", "Fortinet", "Cloudflare"], aiOpportunityLevel: "high" },
      { id: "ai-ml", name: "Artificial Intelligence & ML", sector: "Technology & SaaS", keywords: ["artificial intelligence", "machine learning", "ai", "ml", "deep learning"], exampleCompanies: ["OpenAI", "Anthropic", "Databricks", "Scale AI", "Hugging Face", "Cohere"], aiOpportunityLevel: "high" },
      { id: "cloud-infra", name: "Cloud & Infrastructure", sector: "Technology & SaaS", keywords: ["cloud", "infrastructure", "devops", "hosting", "iaas"], exampleCompanies: ["AWS", "Snowflake", "Vercel", "HashiCorp", "DigitalOcean", "Supabase"], aiOpportunityLevel: "high" },
      { id: "fintech", name: "FinTech", sector: "Technology & SaaS", keywords: ["fintech", "payments", "banking tech", "financial technology"], exampleCompanies: ["Stripe", "Square", "Plaid", "Affirm", "Brex", "Ramp"], aiOpportunityLevel: "high" },
      { id: "martech", name: "MarTech & AdTech", sector: "Technology & SaaS", keywords: ["marketing technology", "martech", "adtech", "crm", "analytics"], exampleCompanies: ["HubSpot", "Klaviyo", "Braze", "Amplitude", "Segment", "Iterable"], aiOpportunityLevel: "high" },
      { id: "hr-tech", name: "HR Tech & Workforce", sector: "Technology & SaaS", keywords: ["hr tech", "workforce", "recruiting", "payroll", "talent"], exampleCompanies: ["Gusto", "Rippling", "Deel", "Lattice", "Culture Amp", "BambooHR"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrial",
    icon: "🏭",
    verticals: [
      { id: "controls-automation", name: "Controls & Automation Companies", sector: "Manufacturing & Industrial", keywords: ["controls", "automation", "plc", "scada", "industrial automation", "process control"], exampleCompanies: ["Rockwell Automation", "Siemens Digital Industries", "Honeywell Process", "ABB", "Emerson Electric", "Schneider Electric"], aiOpportunityLevel: "high" },
      { id: "heavy-manufacturing", name: "Heavy Manufacturing", sector: "Manufacturing & Industrial", keywords: ["manufacturing", "heavy industry", "steel", "metals", "industrial"], exampleCompanies: ["Caterpillar", "3M", "Nucor", "Parker Hannifin", "Illinois Tool Works", "Dover Corporation"], aiOpportunityLevel: "medium" },
      { id: "electronics-mfg", name: "Electronics Manufacturing", sector: "Manufacturing & Industrial", keywords: ["electronics", "pcb", "semiconductor", "chip", "circuit"], exampleCompanies: ["Flex", "Jabil", "Foxconn", "Texas Instruments", "Analog Devices", "ON Semiconductor"], aiOpportunityLevel: "high" },
      { id: "aerospace-defense", name: "Aerospace & Defense", sector: "Manufacturing & Industrial", keywords: ["aerospace", "defense", "military", "aviation manufacturing"], exampleCompanies: ["Lockheed Martin", "RTX", "Northrop Grumman", "General Dynamics", "L3Harris", "BAE Systems"], aiOpportunityLevel: "medium" },
      { id: "automotive", name: "Automotive & EV", sector: "Manufacturing & Industrial", keywords: ["automotive", "car", "ev", "electric vehicle", "auto parts"], exampleCompanies: ["Tesla", "Rivian", "Lucid", "BorgWarner", "Aptiv", "Magna International"], aiOpportunityLevel: "high" },
      { id: "chemicals", name: "Chemicals & Materials", sector: "Manufacturing & Industrial", keywords: ["chemical", "materials", "polymer", "specialty chemicals"], exampleCompanies: ["Dow", "DuPont", "BASF", "Linde", "Air Products", "PPG Industries"], aiOpportunityLevel: "medium" },
      { id: "packaging", name: "Packaging & Containers", sector: "Manufacturing & Industrial", keywords: ["packaging", "containers", "corrugated", "sustainable packaging"], exampleCompanies: ["International Paper", "WestRock", "Ball Corporation", "Sealed Air", "Berry Global", "Graphic Packaging"], aiOpportunityLevel: "medium" },
      { id: "3d-additive", name: "3D Printing & Additive Manufacturing", sector: "Manufacturing & Industrial", keywords: ["3d printing", "additive", "rapid prototyping"], exampleCompanies: ["Stratasys", "3D Systems", "Desktop Metal", "Markforged", "Carbon", "Formlabs"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    icon: "🏥",
    verticals: [
      { id: "healthtech", name: "HealthTech & Digital Health", sector: "Healthcare & Life Sciences", keywords: ["healthtech", "digital health", "telehealth", "health platform"], exampleCompanies: ["Teladoc", "Hims & Hers", "Ro", "Color Health", "Cerebral", "Noom"], aiOpportunityLevel: "high" },
      { id: "pharma-biotech", name: "Pharmaceuticals & Biotech", sector: "Healthcare & Life Sciences", keywords: ["pharma", "biotech", "drug", "therapeutic"], exampleCompanies: ["Moderna", "Regeneron", "Vertex", "BioNTech", "Gilead", "AbbVie"], aiOpportunityLevel: "high" },
      { id: "medical-devices", name: "Medical Devices", sector: "Healthcare & Life Sciences", keywords: ["medical device", "medtech", "diagnostic", "surgical"], exampleCompanies: ["Medtronic", "Abbott", "Stryker", "Intuitive Surgical", "Edwards Lifesciences", "Dexcom"], aiOpportunityLevel: "high" },
      { id: "healthcare-services", name: "Healthcare Services & Hospitals", sector: "Healthcare & Life Sciences", keywords: ["hospital", "healthcare system", "clinic", "health service"], exampleCompanies: ["HCA Healthcare", "Kaiser Permanente", "CommonSpirit", "Tenet Healthcare", "Ascension", "One Medical"], aiOpportunityLevel: "medium" },
      { id: "mental-health", name: "Mental Health & Wellness", sector: "Healthcare & Life Sciences", keywords: ["mental health", "wellness", "therapy", "behavioral health"], exampleCompanies: ["BetterHelp", "Talkspace", "Calm", "Headspace", "Lyra Health", "Spring Health"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "financial-services",
    name: "Financial Services",
    icon: "🏦",
    verticals: [
      { id: "banking", name: "Banking & Credit Unions", sector: "Financial Services", keywords: ["bank", "credit union", "lending", "deposits"], exampleCompanies: ["JPMorgan Chase", "Chime", "SoFi", "Ally Financial", "Capital One", "Marcus by Goldman"], aiOpportunityLevel: "high" },
      { id: "insurance", name: "Insurance", sector: "Financial Services", keywords: ["insurance", "insurtech", "underwriting", "claims"], exampleCompanies: ["Lemonade", "Root Insurance", "Hippo", "Next Insurance", "Coalition", "Pie Insurance"], aiOpportunityLevel: "high" },
      { id: "wealth-mgmt", name: "Wealth Management & Investing", sector: "Financial Services", keywords: ["wealth", "investment", "asset management", "portfolio"], exampleCompanies: ["Wealthfront", "Betterment", "Robinhood", "Charles Schwab", "Fidelity", "Vanguard"], aiOpportunityLevel: "high" },
      { id: "payments", name: "Payments & Processing", sector: "Financial Services", keywords: ["payments", "processing", "merchant services", "pos"], exampleCompanies: ["Stripe", "Toast", "Adyen", "Marqeta", "Fiserv", "Global Payments"], aiOpportunityLevel: "high" },
      { id: "pe-vc", name: "Private Equity & VC", sector: "Financial Services", keywords: ["private equity", "venture capital", "investment firm"], exampleCompanies: ["Andreessen Horowitz", "Sequoia", "KKR", "Blackstone", "Thoma Bravo", "Vista Equity"], aiOpportunityLevel: "low" },
    ],
  },
  {
    id: "retail-ecommerce",
    name: "Retail & E-Commerce",
    icon: "🛍️",
    verticals: [
      { id: "dtc-brands", name: "Direct-to-Consumer Brands", sector: "Retail & E-Commerce", keywords: ["dtc", "d2c", "direct to consumer", "ecommerce brand"], exampleCompanies: ["Warby Parker", "Allbirds", "Glossier", "Casper", "Away", "Dollar Shave Club"], aiOpportunityLevel: "high" },
      { id: "fashion-apparel", name: "Fashion & Apparel", sector: "Retail & E-Commerce", keywords: ["fashion", "apparel", "clothing", "luxury", "streetwear"], exampleCompanies: ["Nike", "Lululemon", "SHEIN", "Revolve", "Stitch Fix", "Poshmark"], aiOpportunityLevel: "medium" },
      { id: "beauty-personal", name: "Beauty & Personal Care", sector: "Retail & E-Commerce", keywords: ["beauty", "cosmetics", "skincare", "personal care"], exampleCompanies: ["Sephora", "Glossier", "The Ordinary", "Fenty Beauty", "Drunk Elephant", "Olaplex"], aiOpportunityLevel: "medium" },
      { id: "home-garden", name: "Home & Garden", sector: "Retail & E-Commerce", keywords: ["home", "furniture", "garden", "home improvement"], exampleCompanies: ["Wayfair", "Restoration Hardware", "Williams-Sonoma", "Crate & Barrel", "Article", "Floyd"], aiOpportunityLevel: "medium" },
      { id: "marketplace", name: "Marketplaces & Platforms", sector: "Retail & E-Commerce", keywords: ["marketplace", "platform", "ecommerce platform"], exampleCompanies: ["Shopify", "Etsy", "Faire", "Instacart", "DoorDash", "Mercari"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "energy-environment",
    name: "Energy & Environment",
    icon: "⚡",
    verticals: [
      { id: "clean-energy", name: "Clean Energy & Renewables", sector: "Energy & Environment", keywords: ["solar", "wind", "renewable", "clean energy", "green"], exampleCompanies: ["NextEra Energy", "Enphase", "SunPower", "Vestas", "First Solar", "SolarEdge"], aiOpportunityLevel: "high" },
      { id: "oil-gas", name: "Oil & Gas", sector: "Energy & Environment", keywords: ["oil", "gas", "petroleum", "upstream", "midstream", "downstream"], exampleCompanies: ["ExxonMobil", "Chevron", "ConocoPhillips", "Pioneer Natural Resources", "Devon Energy"], aiOpportunityLevel: "medium" },
      { id: "utilities", name: "Utilities & Grid", sector: "Energy & Environment", keywords: ["utility", "electric", "water", "power", "grid"], exampleCompanies: ["Duke Energy", "Southern Company", "Dominion", "AES", "Eversource"], aiOpportunityLevel: "medium" },
      { id: "ev-charging", name: "EV Charging & Battery", sector: "Energy & Environment", keywords: ["ev charging", "battery", "energy storage", "lithium"], exampleCompanies: ["ChargePoint", "EVgo", "Blink Charging", "QuantumScape", "Solid Power", "CATL"], aiOpportunityLevel: "high" },
      { id: "carbon-sustainability", name: "Carbon & Sustainability", sector: "Energy & Environment", keywords: ["carbon", "sustainability", "esg", "climate", "offset"], exampleCompanies: ["Patch", "Persefoni", "Watershed", "Sylvera", "Climeworks", "Nori"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate & Construction",
    icon: "🏗️",
    verticals: [
      { id: "proptech", name: "PropTech", sector: "Real Estate & Construction", keywords: ["proptech", "real estate tech", "property management"], exampleCompanies: ["Zillow", "Redfin", "Opendoor", "AppFolio", "Buildium", "Lessen"], aiOpportunityLevel: "high" },
      { id: "commercial-re", name: "Commercial Real Estate", sector: "Real Estate & Construction", keywords: ["commercial real estate", "cre", "office", "industrial space"], exampleCompanies: ["CBRE", "JLL", "Prologis", "Boston Properties", "Vornado", "Hines"], aiOpportunityLevel: "medium" },
      { id: "construction", name: "Construction & Building", sector: "Real Estate & Construction", keywords: ["construction", "building", "general contractor", "infrastructure"], exampleCompanies: ["Bechtel", "Turner Construction", "Skanska", "Procore", "PlanGrid", "Kiewit"], aiOpportunityLevel: "medium" },
      { id: "coworking", name: "Coworking & Flexible Space", sector: "Real Estate & Construction", keywords: ["coworking", "flex space", "shared office"], exampleCompanies: ["WeWork", "Industrious", "Regus", "Convene", "Knotel"], aiOpportunityLevel: "low" },
    ],
  },
  {
    id: "transportation",
    name: "Transportation & Logistics",
    icon: "🚛",
    verticals: [
      { id: "logistics", name: "Logistics & Supply Chain", sector: "Transportation & Logistics", keywords: ["logistics", "supply chain", "warehousing", "fulfillment"], exampleCompanies: ["Flexport", "ShipBob", "XPO Logistics", "C.H. Robinson", "Echo Global", "project44"], aiOpportunityLevel: "high" },
      { id: "freight-shipping", name: "Freight & Shipping", sector: "Transportation & Logistics", keywords: ["freight", "shipping", "trucking", "maritime", "cargo"], exampleCompanies: ["FedEx", "UPS", "Maersk", "J.B. Hunt", "Werner", "Old Dominion"], aiOpportunityLevel: "medium" },
      { id: "airlines", name: "Airlines & Aviation", sector: "Transportation & Logistics", keywords: ["airline", "aviation", "airport", "flight"], exampleCompanies: ["Delta Air Lines", "Southwest Airlines", "JetBlue", "United Airlines", "Spirit Airlines", "Frontier"], aiOpportunityLevel: "medium" },
      { id: "last-mile", name: "Last-Mile & Delivery", sector: "Transportation & Logistics", keywords: ["last mile", "delivery", "courier", "same day"], exampleCompanies: ["DoorDash", "Instacart", "Gopuff", "Uber Freight", "Veho", "Roadie"], aiOpportunityLevel: "high" },
      { id: "fleet-mobility", name: "Fleet Management & Mobility", sector: "Transportation & Logistics", keywords: ["fleet", "mobility", "rideshare", "autonomous"], exampleCompanies: ["Samsara", "Motive", "Geotab", "Waymo", "Cruise", "Nuro"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "education",
    name: "Education & Training",
    icon: "🎓",
    verticals: [
      { id: "edtech", name: "EdTech & Online Learning", sector: "Education & Training", keywords: ["edtech", "online learning", "elearning", "education technology"], exampleCompanies: ["Coursera", "Duolingo", "Khan Academy", "Udemy", "2U", "Chegg"], aiOpportunityLevel: "high" },
      { id: "higher-ed", name: "Higher Education", sector: "Education & Training", keywords: ["university", "college", "higher education", "academic"], exampleCompanies: ["Arizona State University", "Southern New Hampshire", "Purdue Global", "WGU"], aiOpportunityLevel: "medium" },
      { id: "corporate-training", name: "Corporate Training & L&D", sector: "Education & Training", keywords: ["corporate training", "l&d", "learning development", "upskilling"], exampleCompanies: ["LinkedIn Learning", "Skillsoft", "Cornerstone", "Degreed", "Guild Education", "BetterUp"], aiOpportunityLevel: "high" },
      { id: "k12", name: "K-12 Education", sector: "Education & Training", keywords: ["k-12", "school", "k12", "primary", "secondary"], exampleCompanies: ["Clever", "Instructure", "Renaissance Learning", "PowerSchool", "Kahoot!", "ClassDojo"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "professional-services",
    name: "Professional Services",
    icon: "👔",
    verticals: [
      { id: "consulting", name: "Management Consulting", sector: "Professional Services", keywords: ["consulting", "management consulting", "strategy", "advisory"], exampleCompanies: ["McKinsey", "BCG", "Bain", "Deloitte", "Accenture", "Kearney"], aiOpportunityLevel: "medium" },
      { id: "legal", name: "Legal Services & LegalTech", sector: "Professional Services", keywords: ["legal", "law firm", "legaltech", "compliance"], exampleCompanies: ["Clio", "LegalZoom", "Ironclad", "Harvey AI", "Thomson Reuters Legal", "Relativity"], aiOpportunityLevel: "high" },
      { id: "accounting", name: "Accounting & Tax", sector: "Professional Services", keywords: ["accounting", "tax", "audit", "bookkeeping", "cpa"], exampleCompanies: ["Intuit", "Xero", "Bench", "Pilot", "Avalara", "H&R Block"], aiOpportunityLevel: "high" },
      { id: "staffing", name: "Staffing & Recruiting", sector: "Professional Services", keywords: ["staffing", "recruiting", "talent", "headhunting", "temp"], exampleCompanies: ["Robert Half", "Hays", "Adecco", "Randstad", "Kforce", "Insight Global"], aiOpportunityLevel: "medium" },
      { id: "design-creative", name: "Design & Creative Agencies", sector: "Professional Services", keywords: ["design", "creative", "agency", "branding", "ux"], exampleCompanies: ["Pentagram", "IDEO", "Huge", "R/GA", "Instrument", "Figma"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "hospitality",
    name: "Hospitality & Tourism",
    icon: "🏨",
    verticals: [
      { id: "hotels-resorts", name: "Hotels & Resorts", sector: "Hospitality & Tourism", keywords: ["hotel", "resort", "lodging", "hospitality"], exampleCompanies: ["Marriott", "Hilton", "Hyatt", "Airbnb", "IHG", "Accor"], aiOpportunityLevel: "medium" },
      { id: "travel-booking", name: "Travel & Online Booking", sector: "Hospitality & Tourism", keywords: ["travel", "booking", "ota", "travel tech"], exampleCompanies: ["Booking.com", "Expedia", "Tripadvisor", "Hopper", "Kayak", "GetYourGuide"], aiOpportunityLevel: "high" },
      { id: "cruise-tourism", name: "Cruise & Tourism", sector: "Hospitality & Tourism", keywords: ["cruise", "tourism", "tour operator", "attraction"], exampleCompanies: ["Royal Caribbean", "Carnival", "Norwegian Cruise", "Disney Cruise", "TUI Group"], aiOpportunityLevel: "low" },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture & Food Production",
    icon: "🌾",
    verticals: [
      { id: "agtech", name: "AgTech & Precision Agriculture", sector: "Agriculture & Food Production", keywords: ["agtech", "precision agriculture", "farming tech", "crop"], exampleCompanies: ["John Deere (Precision Ag)", "Climate Corp", "Indigo Ag", "Farmers Business Network", "Gro Intelligence", "Pivot Bio"], aiOpportunityLevel: "high" },
      { id: "food-processing", name: "Food Processing & Manufacturing", sector: "Agriculture & Food Production", keywords: ["food processing", "food manufacturing", "meat", "dairy"], exampleCompanies: ["Tyson Foods", "JBS", "Archer Daniels Midland", "Cargill", "Bunge", "Pilgrim's Pride"], aiOpportunityLevel: "medium" },
      { id: "cannabis", name: "Cannabis & Hemp", sector: "Agriculture & Food Production", keywords: ["cannabis", "hemp", "marijuana", "cbd", "dispensary"], exampleCompanies: ["Curaleaf", "Trulieve", "Green Thumb Industries", "Cresco Labs", "Charlotte's Web"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "telecom",
    name: "Telecommunications",
    icon: "📡",
    verticals: [
      { id: "wireless-carriers", name: "Wireless Carriers & MVNO", sector: "Telecommunications", keywords: ["wireless", "carrier", "mobile", "5g", "mvno"], exampleCompanies: ["T-Mobile", "Verizon", "AT&T", "Mint Mobile", "Google Fi", "Visible"], aiOpportunityLevel: "high" },
      { id: "network-infra", name: "Network Infrastructure", sector: "Telecommunications", keywords: ["network", "fiber", "broadband", "infrastructure", "tower"], exampleCompanies: ["Crown Castle", "American Tower", "Lumen Technologies", "Frontier Communications", "Corning"], aiOpportunityLevel: "medium" },
      { id: "satellite-space", name: "Satellite & Space Tech", sector: "Telecommunications", keywords: ["satellite", "space", "orbital", "launch"], exampleCompanies: ["SpaceX (Starlink)", "OneWeb", "Planet Labs", "Rocket Lab", "Astra"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "government",
    name: "Government & Public Sector",
    icon: "🏛️",
    verticals: [
      { id: "govtech", name: "GovTech & Civic Tech", sector: "Government & Public Sector", keywords: ["govtech", "civic tech", "government technology", "public sector"], exampleCompanies: ["Palantir", "Anduril", "Mark43", "Socrata", "CivicPlus", "Granicus"], aiOpportunityLevel: "high" },
      { id: "nonprofit", name: "Nonprofit & NGO", sector: "Government & Public Sector", keywords: ["nonprofit", "ngo", "charity", "foundation"], exampleCompanies: ["United Way", "Feeding America", "American Red Cross", "Habitat for Humanity"], aiOpportunityLevel: "low" },
    ],
  },
  {
    id: "pets-lifestyle",
    name: "Pet Care & Lifestyle",
    icon: "🐾",
    verticals: [
      { id: "pet-care", name: "Pet Care & Animal Health", sector: "Pet Care & Lifestyle", keywords: ["pet", "animal", "veterinary", "pet food", "pet tech"], exampleCompanies: ["Chewy", "Mars Petcare", "Banfield Pet Hospital", "Petco", "BarkBox", "Rover"], aiOpportunityLevel: "medium" },
      { id: "fitness-wellness", name: "Fitness & Wellness", sector: "Pet Care & Lifestyle", keywords: ["fitness", "gym", "wellness", "workout", "health club"], exampleCompanies: ["Peloton", "Planet Fitness", "ClassPass", "Mindbody", "Whoop", "Orangetheory"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "waste-environment",
    name: "Waste & Environmental Services",
    icon: "♻️",
    verticals: [
      { id: "waste-mgmt", name: "Waste Management & Recycling", sector: "Waste & Environmental Services", keywords: ["waste", "recycling", "disposal", "sanitation"], exampleCompanies: ["Waste Management", "Republic Services", "Clean Harbors", "Rubicon", "ACV Auctions"], aiOpportunityLevel: "medium" },
      { id: "water", name: "Water & Wastewater", sector: "Waste & Environmental Services", keywords: ["water", "wastewater", "treatment", "desalination"], exampleCompanies: ["Xylem", "Pentair", "Veolia", "Evoqua", "Mueller Water Products"], aiOpportunityLevel: "medium" },
    ],
  },
];

// Flattened list for quick lookup
export const ALL_VERTICALS: IndustryVertical[] = INDUSTRY_TAXONOMY.flatMap(s => s.verticals);

// Quick lookup map
export const VERTICAL_MAP: Record<string, IndustryVertical> = Object.fromEntries(
  ALL_VERTICALS.map(v => [v.id, v])
);

// Get verticals not already tracked by user
export function getUntappedVerticals(trackedIndustryNames: string[]): IndustryVertical[] {
  const trackedLower = new Set(trackedIndustryNames.map(n => n.toLowerCase()));
  return ALL_VERTICALS.filter(v => {
    const nameLower = v.name.toLowerCase();
    // Check if any tracked industry overlaps with this vertical
    return !trackedLower.has(nameLower) && 
           !Array.from(trackedLower).some(t => nameLower.includes(t) || t.includes(nameLower));
  });
}

// Find verticals matching a search query
export function searchVerticals(query: string): IndustryVertical[] {
  const q = query.toLowerCase();
  return ALL_VERTICALS.filter(v =>
    v.name.toLowerCase().includes(q) ||
    v.sector.toLowerCase().includes(q) ||
    v.keywords.some(k => k.includes(q)) ||
    v.exampleCompanies.some(c => c.toLowerCase().includes(q))
  );
}

// Get sectors with counts
export function getSectorSummary(): { id: string; name: string; icon: string; verticalCount: number; companyCount: number }[] {
  return INDUSTRY_TAXONOMY.map(s => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    verticalCount: s.verticals.length,
    companyCount: s.verticals.reduce((sum, v) => sum + v.exampleCompanies.length, 0),
  }));
}
