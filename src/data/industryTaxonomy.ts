/**
 * VIGYL Industry Taxonomy
 * 
 * Comprehensive database of 150+ industry verticals across 25+ sectors,
 * with 1000+ real example companies. Used by the prospect expansion system
 * to discover untapped opportunities across the full breadth of the economy.
 */

export interface IndustryVertical {
  id: string;
  name: string;
  sector: string;
  keywords: string[];
  exampleCompanies: string[];
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
      { id: "fast-casual-qsr", name: "Fast Casual & QSR Dining", sector: "Food & Beverage", keywords: ["restaurant", "fast food", "quick service", "qsr", "fast casual", "dining", "drive-thru"], exampleCompanies: ["Chipotle", "Sweetgreen", "Panera Bread", "Wingstop", "Cava", "Shake Shack", "Raising Cane's", "Portillo's", "Zaxby's", "MOD Pizza"], aiOpportunityLevel: "high" },
      { id: "c-store", name: "Convenience Stores & C-Store", sector: "Food & Beverage", keywords: ["convenience", "c-store", "gas station", "fuel retail", "corner store"], exampleCompanies: ["7-Eleven", "Wawa", "Sheetz", "Casey's", "QuikTrip", "Buc-ee's", "Pilot Flying J", "Circle K", "RaceTrac", "Kum & Go"], aiOpportunityLevel: "medium" },
      { id: "cpg-food", name: "Consumer Packaged Goods — Food", sector: "Food & Beverage", keywords: ["cpg", "packaged food", "snacks", "consumer goods", "grocery brands", "consumer packaged goods"], exampleCompanies: ["General Mills", "Mondelez", "Conagra", "Kellogg's", "Hershey", "McCormick", "Campbell Soup", "Kraft Heinz", "Smucker's", "Hormel Foods"], aiOpportunityLevel: "high" },
      { id: "craft-brands", name: "Craft & Artisan Brands", sector: "Food & Beverage", keywords: ["craft", "artisan", "small batch", "specialty food", "craft beverage", "indie brand"], exampleCompanies: ["Olipop", "Athletic Brewing", "Siete Foods", "Hu Kitchen", "Liquid Death", "Poppi", "Spindrift", "RXBAR", "Chobani", "GT's Kombucha"], aiOpportunityLevel: "medium" },
      { id: "beverage", name: "Beverage Companies", sector: "Food & Beverage", keywords: ["beverage", "drink", "soda", "juice", "water", "spirits", "beer", "wine"], exampleCompanies: ["PepsiCo", "Coca-Cola", "Diageo", "Constellation Brands", "Molson Coors", "Monster Energy", "Red Bull", "Keurig Dr Pepper", "Boston Beer Company", "Brown-Forman"], aiOpportunityLevel: "high" },
      { id: "food-service", name: "Food Service & Distribution", sector: "Food & Beverage", keywords: ["food service", "distribution", "catering", "food supply", "broadline"], exampleCompanies: ["Sysco", "US Foods", "Performance Food Group", "Aramark", "Compass Group", "Gordon Food Service", "Sodexo", "Delaware North"], aiOpportunityLevel: "medium" },
      { id: "restaurant-chains", name: "Restaurant Chains & Franchises", sector: "Food & Beverage", keywords: ["restaurant chain", "franchise", "casual dining", "fine dining", "full service"], exampleCompanies: ["Darden Restaurants", "Yum! Brands", "McDonald's", "Inspire Brands", "Bloomin' Brands", "Brinker International", "Cracker Barrel", "Texas Roadhouse", "Chili's", "Jack in the Box"], aiOpportunityLevel: "high" },
      { id: "grocery-retail", name: "Grocery & Supermarkets", sector: "Food & Beverage", keywords: ["grocery", "supermarket", "food retail", "grocer"], exampleCompanies: ["Kroger", "Publix", "H-E-B", "Aldi", "Trader Joe's", "Wegmans", "Whole Foods", "Sprouts Farmers Market", "Food Lion", "Meijer"], aiOpportunityLevel: "medium" },
      { id: "food-tech", name: "Food Tech & Alternative Protein", sector: "Food & Beverage", keywords: ["food tech", "alternative protein", "plant-based", "lab-grown", "cultured meat"], exampleCompanies: ["Impossible Foods", "Beyond Meat", "Upside Foods", "NotCo", "Perfect Day", "Eat Just", "Oatly", "Meati Foods"], aiOpportunityLevel: "high" },
      { id: "coffee-tea", name: "Coffee & Tea", sector: "Food & Beverage", keywords: ["coffee", "tea", "café", "roaster", "barista"], exampleCompanies: ["Starbucks", "Dutch Bros", "Peet's Coffee", "Blue Bottle Coffee", "Intelligentsia", "La Colombe", "Counter Culture Coffee", "DAVIDsTEA"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "media-entertainment",
    name: "Media & Entertainment",
    icon: "🎬",
    verticals: [
      { id: "production-studios", name: "Production Studios & Film", sector: "Media & Entertainment", keywords: ["production", "studio", "film", "movie", "content production", "post-production", "vfx"], exampleCompanies: ["Lionsgate", "A24", "Blumhouse", "Village Roadshow", "Legendary Entertainment", "Anonymous Content", "Skydance Media", "Bad Robot", "Imagine Entertainment", "STX Entertainment"], aiOpportunityLevel: "high" },
      { id: "streaming", name: "Streaming & Digital Content", sector: "Media & Entertainment", keywords: ["streaming", "ott", "digital content", "subscription video", "svod"], exampleCompanies: ["Netflix", "Spotify", "Roku", "Crunchyroll", "Peacock", "Paramount+", "Tubi", "Pluto TV", "Max", "Disney+"], aiOpportunityLevel: "high" },
      { id: "gaming", name: "Gaming & Interactive", sector: "Media & Entertainment", keywords: ["gaming", "video game", "esports", "interactive", "game studio"], exampleCompanies: ["Epic Games", "Riot Games", "Roblox", "Unity", "Supercell", "Niantic", "Ubisoft", "Take-Two Interactive", "Bungie", "Valve"], aiOpportunityLevel: "high" },
      { id: "advertising-media", name: "Advertising & Media Buying", sector: "Media & Entertainment", keywords: ["advertising", "media buying", "ad tech", "programmatic", "media agency"], exampleCompanies: ["The Trade Desk", "Publicis", "WPP", "Omnicom", "IPG", "Dentsu", "GroupM", "Havas", "Horizon Media", "MediaMath"], aiOpportunityLevel: "high" },
      { id: "music-audio", name: "Music & Audio", sector: "Media & Entertainment", keywords: ["music", "audio", "podcast", "radio", "recording", "label"], exampleCompanies: ["Universal Music Group", "Warner Music", "Sony Music", "iHeartMedia", "Audacy", "SiriusXM", "BMG", "Kobalt Music", "Concord Music"], aiOpportunityLevel: "medium" },
      { id: "publishing-news", name: "Publishing & News Media", sector: "Media & Entertainment", keywords: ["publishing", "news", "media", "newspaper", "magazine", "digital media"], exampleCompanies: ["New York Times", "Condé Nast", "Hearst", "Gannett", "Vox Media", "The Athletic", "Substack", "Axios", "Insider"], aiOpportunityLevel: "medium" },
      { id: "sports-entertainment", name: "Sports & Live Entertainment", sector: "Media & Entertainment", keywords: ["sports", "live events", "entertainment venues", "ticketing", "arena"], exampleCompanies: ["Live Nation", "AEG", "MSG Sports", "Endeavor", "UFC", "Formula 1", "StubHub", "SeatGeek", "Oak View Group"], aiOpportunityLevel: "medium" },
      { id: "influencer-creator", name: "Creator Economy & Influencer", sector: "Media & Entertainment", keywords: ["creator", "influencer", "content creator", "creator economy", "youtube", "tiktok"], exampleCompanies: ["MrBeast (Feastables)", "Dude Perfect", "Jellysmack", "Spring (Teespring)", "Patreon", "Cameo", "Grin", "CreatorIQ", "LTK"], aiOpportunityLevel: "high" },
      { id: "ar-vr-immersive", name: "AR/VR & Immersive Media", sector: "Media & Entertainment", keywords: ["ar", "vr", "mixed reality", "immersive", "metaverse", "spatial computing"], exampleCompanies: ["Magic Leap", "Niantic", "ILMxLAB", "Within", "Matterport", "Spatial", "Rec Room", "Survios", "ENGAGE XR"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "tech-saas",
    name: "Technology & SaaS",
    icon: "💻",
    verticals: [
      { id: "enterprise-saas", name: "Enterprise SaaS", sector: "Technology & SaaS", keywords: ["enterprise software", "saas", "b2b software", "cloud platform"], exampleCompanies: ["Salesforce", "ServiceNow", "Workday", "HubSpot", "Atlassian", "Datadog", "Veeva Systems", "Zoom", "Twilio", "Monday.com"], aiOpportunityLevel: "high" },
      { id: "cybersecurity", name: "Cybersecurity", sector: "Technology & SaaS", keywords: ["cybersecurity", "infosec", "security", "threat detection", "zero trust"], exampleCompanies: ["CrowdStrike", "Palo Alto Networks", "Zscaler", "SentinelOne", "Fortinet", "Cloudflare", "Okta", "Wiz", "Snyk", "Arctic Wolf"], aiOpportunityLevel: "high" },
      { id: "ai-ml", name: "Artificial Intelligence & ML", sector: "Technology & SaaS", keywords: ["artificial intelligence", "machine learning", "ai", "ml", "deep learning", "llm", "generative ai"], exampleCompanies: ["OpenAI", "Anthropic", "Databricks", "Scale AI", "Hugging Face", "Cohere", "Mistral AI", "Perplexity", "Runway", "Jasper AI"], aiOpportunityLevel: "high" },
      { id: "cloud-infra", name: "Cloud & Infrastructure", sector: "Technology & SaaS", keywords: ["cloud", "infrastructure", "devops", "hosting", "iaas", "paas"], exampleCompanies: ["Snowflake", "Vercel", "HashiCorp", "DigitalOcean", "Supabase", "Cloudflare", "Akamai", "Fastly", "Linode", "Render"], aiOpportunityLevel: "high" },
      { id: "fintech", name: "FinTech", sector: "Technology & SaaS", keywords: ["fintech", "payments", "banking tech", "financial technology", "neobank"], exampleCompanies: ["Stripe", "Square", "Plaid", "Affirm", "Brex", "Ramp", "Mercury", "Melio", "Marqeta", "Checkout.com"], aiOpportunityLevel: "high" },
      { id: "martech", name: "MarTech & AdTech", sector: "Technology & SaaS", keywords: ["marketing technology", "martech", "adtech", "crm", "analytics", "customer data"], exampleCompanies: ["HubSpot", "Klaviyo", "Braze", "Amplitude", "Segment", "Iterable", "Customer.io", "Lob", "mParticle", "ActionIQ"], aiOpportunityLevel: "high" },
      { id: "hr-tech", name: "HR Tech & Workforce", sector: "Technology & SaaS", keywords: ["hr tech", "workforce", "recruiting", "payroll", "talent", "hris"], exampleCompanies: ["Gusto", "Rippling", "Deel", "Lattice", "Culture Amp", "BambooHR", "Greenhouse", "Lever", "Paylocity", "Paychex"], aiOpportunityLevel: "medium" },
      { id: "data-analytics", name: "Data & Analytics Platforms", sector: "Technology & SaaS", keywords: ["data", "analytics", "business intelligence", "bi", "data warehouse", "etl"], exampleCompanies: ["Databricks", "Snowflake", "dbt Labs", "Fivetran", "Looker", "ThoughtSpot", "Mixpanel", "Heap", "Census", "Monte Carlo"], aiOpportunityLevel: "high" },
      { id: "dev-tools", name: "Developer Tools & Platforms", sector: "Technology & SaaS", keywords: ["developer", "dev tools", "api", "sdk", "open source", "developer platform"], exampleCompanies: ["GitHub", "GitLab", "Postman", "Retool", "Linear", "Sentry", "LaunchDarkly", "Grafana Labs", "PlanetScale", "Neon"], aiOpportunityLevel: "high" },
      { id: "iot-edge", name: "IoT & Edge Computing", sector: "Technology & SaaS", keywords: ["iot", "internet of things", "edge computing", "connected devices", "sensor"], exampleCompanies: ["Samsara", "Particle", "Losant", "Hologram", "Blues Wireless", "Helium", "Tuya", "Sierra Wireless", "Digi International"], aiOpportunityLevel: "high" },
      { id: "ecommerce-tech", name: "E-Commerce Technology", sector: "Technology & SaaS", keywords: ["ecommerce", "commerce platform", "shopping", "checkout", "online store"], exampleCompanies: ["Shopify", "BigCommerce", "Commercetools", "Bold Commerce", "Recharge", "Yotpo", "Gorgias", "Stamped", "Loop Returns"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Industrial",
    icon: "🏭",
    verticals: [
      { id: "controls-automation", name: "Controls & Automation Companies", sector: "Manufacturing & Industrial", keywords: ["controls", "automation", "plc", "scada", "industrial automation", "process control", "dcs", "hmi"], exampleCompanies: ["Rockwell Automation", "Siemens Digital Industries", "Honeywell Process", "ABB", "Emerson Electric", "Schneider Electric", "Yokogawa", "Beckhoff", "B&R Industrial", "FANUC"], aiOpportunityLevel: "high" },
      { id: "heavy-manufacturing", name: "Heavy Manufacturing", sector: "Manufacturing & Industrial", keywords: ["manufacturing", "heavy industry", "steel", "metals", "industrial"], exampleCompanies: ["Caterpillar", "3M", "Nucor", "Parker Hannifin", "Illinois Tool Works", "Dover Corporation", "Eaton", "Roper Technologies", "Danaher", "Honeywell"], aiOpportunityLevel: "medium" },
      { id: "electronics-mfg", name: "Electronics Manufacturing", sector: "Manufacturing & Industrial", keywords: ["electronics", "pcb", "semiconductor", "chip", "circuit", "ems"], exampleCompanies: ["Flex", "Jabil", "Foxconn", "Texas Instruments", "Analog Devices", "ON Semiconductor", "Microchip Technology", "Broadcom", "NXP Semiconductors"], aiOpportunityLevel: "high" },
      { id: "aerospace-defense", name: "Aerospace & Defense", sector: "Manufacturing & Industrial", keywords: ["aerospace", "defense", "military", "aviation manufacturing", "space"], exampleCompanies: ["Lockheed Martin", "RTX", "Northrop Grumman", "General Dynamics", "L3Harris", "BAE Systems", "Boeing Defense", "Leidos", "SAIC", "Kratos Defense"], aiOpportunityLevel: "medium" },
      { id: "automotive", name: "Automotive & EV", sector: "Manufacturing & Industrial", keywords: ["automotive", "car", "ev", "electric vehicle", "auto parts", "oem"], exampleCompanies: ["Tesla", "Rivian", "Lucid", "BorgWarner", "Aptiv", "Magna International", "Lear Corporation", "Gentex", "Fisker", "Canoo"], aiOpportunityLevel: "high" },
      { id: "chemicals", name: "Chemicals & Materials", sector: "Manufacturing & Industrial", keywords: ["chemical", "materials", "polymer", "specialty chemicals", "coatings"], exampleCompanies: ["Dow", "DuPont", "BASF", "Linde", "Air Products", "PPG Industries", "Sherwin-Williams", "Eastman Chemical", "Celanese", "Ashland"], aiOpportunityLevel: "medium" },
      { id: "packaging", name: "Packaging & Containers", sector: "Manufacturing & Industrial", keywords: ["packaging", "containers", "corrugated", "sustainable packaging", "flexible packaging"], exampleCompanies: ["International Paper", "WestRock", "Ball Corporation", "Sealed Air", "Berry Global", "Graphic Packaging", "Amcor", "Sonoco", "Pactiv Evergreen"], aiOpportunityLevel: "medium" },
      { id: "3d-additive", name: "3D Printing & Additive Manufacturing", sector: "Manufacturing & Industrial", keywords: ["3d printing", "additive", "rapid prototyping", "additive manufacturing"], exampleCompanies: ["Stratasys", "3D Systems", "Desktop Metal", "Markforged", "Carbon", "Formlabs", "HP (MJF)", "EOS", "Velo3D", "Relativity Space"], aiOpportunityLevel: "high" },
      { id: "robotics", name: "Robotics & Cobots", sector: "Manufacturing & Industrial", keywords: ["robotics", "robot", "cobot", "collaborative robot", "warehouse automation"], exampleCompanies: ["Boston Dynamics", "Universal Robots", "FANUC", "KUKA", "ABB Robotics", "Locus Robotics", "6 River Systems", "Fetch Robotics", "Berkshire Grey"], aiOpportunityLevel: "high" },
      { id: "industrial-software", name: "Industrial Software & MES", sector: "Manufacturing & Industrial", keywords: ["mes", "manufacturing execution", "industrial software", "digital twin", "industry 4.0", "smart factory"], exampleCompanies: ["PTC", "Siemens Xcelerator", "AVEVA", "Tulip Interfaces", "Plex (Rockwell)", "Fictiv", "Sight Machine", "Augury", "MachineMetrics"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    icon: "🏥",
    verticals: [
      { id: "healthtech", name: "HealthTech & Digital Health", sector: "Healthcare & Life Sciences", keywords: ["healthtech", "digital health", "telehealth", "health platform", "remote patient monitoring"], exampleCompanies: ["Teladoc", "Hims & Hers", "Ro", "Color Health", "Noom", "Included Health", "Omada Health", "Ginger (Headspace Health)"], aiOpportunityLevel: "high" },
      { id: "pharma-biotech", name: "Pharmaceuticals & Biotech", sector: "Healthcare & Life Sciences", keywords: ["pharma", "biotech", "drug", "therapeutic", "clinical trial"], exampleCompanies: ["Moderna", "Regeneron", "Vertex", "BioNTech", "Gilead", "AbbVie", "Amgen", "Biogen", "Sarepta", "BridgeBio"], aiOpportunityLevel: "high" },
      { id: "medical-devices", name: "Medical Devices", sector: "Healthcare & Life Sciences", keywords: ["medical device", "medtech", "diagnostic", "surgical", "implant"], exampleCompanies: ["Medtronic", "Abbott", "Stryker", "Intuitive Surgical", "Edwards Lifesciences", "Dexcom", "Insulet", "Penumbra", "Shockwave Medical"], aiOpportunityLevel: "high" },
      { id: "healthcare-services", name: "Healthcare Services & Hospitals", sector: "Healthcare & Life Sciences", keywords: ["hospital", "healthcare system", "clinic", "health service", "health network"], exampleCompanies: ["HCA Healthcare", "Kaiser Permanente", "CommonSpirit", "Tenet Healthcare", "Ascension", "One Medical", "Oak Street Health", "VillageMD", "ChenMed"], aiOpportunityLevel: "medium" },
      { id: "mental-health", name: "Mental Health & Wellness", sector: "Healthcare & Life Sciences", keywords: ["mental health", "wellness", "therapy", "behavioral health", "counseling"], exampleCompanies: ["BetterHelp", "Talkspace", "Calm", "Headspace", "Lyra Health", "Spring Health", "Modern Health", "Ginger", "Brightside Health"], aiOpportunityLevel: "medium" },
      { id: "clinical-trials", name: "Clinical Trials & CRO", sector: "Healthcare & Life Sciences", keywords: ["clinical trial", "cro", "contract research", "trial management"], exampleCompanies: ["IQVIA", "Covance (LabCorp)", "Parexel", "Medable", "Science 37", "Huma", "Veristat", "Veeva (Clinical)"], aiOpportunityLevel: "high" },
      { id: "dental-vision", name: "Dental & Vision", sector: "Healthcare & Life Sciences", keywords: ["dental", "dentist", "orthodontics", "vision", "optometry", "dso"], exampleCompanies: ["Align Technology (Invisalign)", "Heartland Dental", "Aspen Dental", "Pacific Dental", "Henry Schein", "Warby Parker", "1-800 Contacts"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "financial-services",
    name: "Financial Services",
    icon: "🏦",
    verticals: [
      { id: "banking", name: "Banking & Credit Unions", sector: "Financial Services", keywords: ["bank", "credit union", "lending", "deposits", "neobank"], exampleCompanies: ["JPMorgan Chase", "Chime", "SoFi", "Ally Financial", "Capital One", "Marcus by Goldman", "Current", "Varo", "Dave", "MoneyLion"], aiOpportunityLevel: "high" },
      { id: "insurance", name: "Insurance", sector: "Financial Services", keywords: ["insurance", "insurtech", "underwriting", "claims", "p&c"], exampleCompanies: ["Lemonade", "Root Insurance", "Hippo", "Next Insurance", "Coalition", "Pie Insurance", "Kin Insurance", "Clearcover", "Branch Insurance"], aiOpportunityLevel: "high" },
      { id: "wealth-mgmt", name: "Wealth Management & Investing", sector: "Financial Services", keywords: ["wealth", "investment", "asset management", "portfolio", "advisory"], exampleCompanies: ["Wealthfront", "Betterment", "Robinhood", "Charles Schwab", "Fidelity", "Vanguard", "Acorns", "M1 Finance", "Public.com"], aiOpportunityLevel: "high" },
      { id: "payments", name: "Payments & Processing", sector: "Financial Services", keywords: ["payments", "processing", "merchant services", "pos", "point of sale"], exampleCompanies: ["Stripe", "Toast", "Adyen", "Marqeta", "Fiserv", "Global Payments", "Square", "Shift4", "Stax", "Helcim"], aiOpportunityLevel: "high" },
      { id: "pe-vc", name: "Private Equity & VC", sector: "Financial Services", keywords: ["private equity", "venture capital", "investment firm", "fund", "gp"], exampleCompanies: ["Andreessen Horowitz", "Sequoia", "KKR", "Blackstone", "Thoma Bravo", "Vista Equity", "General Atlantic", "Silver Lake", "TPG"], aiOpportunityLevel: "low" },
      { id: "mortgage-lending", name: "Mortgage & Lending", sector: "Financial Services", keywords: ["mortgage", "lending", "loan", "home loan", "refinance"], exampleCompanies: ["Rocket Mortgage", "Better.com", "LoanDepot", "Blend", "Divvy Homes", "Arrived", "Kiavi", "Figure"], aiOpportunityLevel: "high" },
      { id: "accounting-tax", name: "Accounting & Tax Tech", sector: "Financial Services", keywords: ["accounting", "tax", "bookkeeping", "audit", "cpa", "tax prep"], exampleCompanies: ["Intuit (QuickBooks)", "Xero", "FreshBooks", "Bench", "Pilot", "Avalara", "H&R Block", "TaxJar", "Taxbit"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "retail-ecommerce",
    name: "Retail & E-Commerce",
    icon: "🛍️",
    verticals: [
      { id: "dtc-brands", name: "Direct-to-Consumer Brands", sector: "Retail & E-Commerce", keywords: ["dtc", "d2c", "direct to consumer", "ecommerce brand"], exampleCompanies: ["Warby Parker", "Allbirds", "Glossier", "Casper", "Away", "Dollar Shave Club", "Bombas", "Rothy's", "Vuori", "Ridge Wallet"], aiOpportunityLevel: "high" },
      { id: "fashion-apparel", name: "Fashion & Apparel", sector: "Retail & E-Commerce", keywords: ["fashion", "apparel", "clothing", "luxury", "streetwear", "athleisure"], exampleCompanies: ["Nike", "Lululemon", "SHEIN", "Revolve", "Stitch Fix", "Poshmark", "ThredUp", "Skims", "Alo Yoga", "On Running"], aiOpportunityLevel: "medium" },
      { id: "beauty-personal", name: "Beauty & Personal Care", sector: "Retail & E-Commerce", keywords: ["beauty", "cosmetics", "skincare", "personal care", "fragrance"], exampleCompanies: ["Sephora", "Glossier", "The Ordinary", "Fenty Beauty", "Drunk Elephant", "Olaplex", "e.l.f. Beauty", "Function of Beauty", "Rare Beauty"], aiOpportunityLevel: "medium" },
      { id: "home-garden", name: "Home & Garden", sector: "Retail & E-Commerce", keywords: ["home", "furniture", "garden", "home improvement", "home goods"], exampleCompanies: ["Wayfair", "Restoration Hardware", "Williams-Sonoma", "Crate & Barrel", "Article", "Floyd", "Outer", "Burrow", "Havenly"], aiOpportunityLevel: "medium" },
      { id: "marketplace", name: "Marketplaces & Platforms", sector: "Retail & E-Commerce", keywords: ["marketplace", "platform", "ecommerce platform", "two-sided marketplace"], exampleCompanies: ["Shopify", "Etsy", "Faire", "Instacart", "DoorDash", "Mercari", "OfferUp", "Poshmark", "Vinted", "Depop"], aiOpportunityLevel: "high" },
      { id: "big-box-retail", name: "Big Box & Mass Retail", sector: "Retail & E-Commerce", keywords: ["big box", "mass retail", "department store", "chain retail", "discount"], exampleCompanies: ["Walmart", "Target", "Costco", "Home Depot", "Lowe's", "Best Buy", "TJ Maxx", "Dollar General", "Dollar Tree", "Five Below"], aiOpportunityLevel: "medium" },
      { id: "specialty-retail", name: "Specialty Retail", sector: "Retail & E-Commerce", keywords: ["specialty retail", "niche retail", "hobby", "sporting goods", "outdoor"], exampleCompanies: ["REI", "Dick's Sporting Goods", "Ulta Beauty", "Tractor Supply", "AutoZone", "O'Reilly Auto Parts", "Bath & Body Works", "GameStop"], aiOpportunityLevel: "medium" },
      { id: "subscription-box", name: "Subscription & Membership", sector: "Retail & E-Commerce", keywords: ["subscription box", "membership", "subscription commerce", "recurring"], exampleCompanies: ["FabFitFun", "Birchbox", "Blue Apron", "HelloFresh", "BarkBox", "Ipsy", "CrateJoy", "Butcher Box", "Thrive Market"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "energy-environment",
    name: "Energy & Environment",
    icon: "⚡",
    verticals: [
      { id: "clean-energy", name: "Clean Energy & Renewables", sector: "Energy & Environment", keywords: ["solar", "wind", "renewable", "clean energy", "green energy"], exampleCompanies: ["NextEra Energy", "Enphase", "SunPower", "Vestas", "First Solar", "SolarEdge", "Sunrun", "Array Technologies", "Canadian Solar"], aiOpportunityLevel: "high" },
      { id: "oil-gas", name: "Oil & Gas", sector: "Energy & Environment", keywords: ["oil", "gas", "petroleum", "upstream", "midstream", "downstream"], exampleCompanies: ["ExxonMobil", "Chevron", "ConocoPhillips", "Pioneer Natural Resources", "Devon Energy", "Diamondback Energy", "Coterra", "Marathon Oil"], aiOpportunityLevel: "medium" },
      { id: "utilities", name: "Utilities & Grid", sector: "Energy & Environment", keywords: ["utility", "electric", "water", "power", "grid", "transmission"], exampleCompanies: ["Duke Energy", "Southern Company", "Dominion", "AES", "Eversource", "Xcel Energy", "Entergy", "Sempra Energy", "CenterPoint"], aiOpportunityLevel: "medium" },
      { id: "ev-charging", name: "EV Charging & Battery", sector: "Energy & Environment", keywords: ["ev charging", "battery", "energy storage", "lithium", "charging network"], exampleCompanies: ["ChargePoint", "EVgo", "Blink Charging", "QuantumScape", "Solid Power", "CATL", "Volta", "Electrify America", "FreeWire"], aiOpportunityLevel: "high" },
      { id: "carbon-sustainability", name: "Carbon & Sustainability", sector: "Energy & Environment", keywords: ["carbon", "sustainability", "esg", "climate", "offset", "net zero"], exampleCompanies: ["Patch", "Persefoni", "Watershed", "Sylvera", "Climeworks", "Nori", "Pachama", "Sinai Technologies", "Sweep"], aiOpportunityLevel: "high" },
      { id: "energy-management", name: "Energy Management & Smart Grid", sector: "Energy & Environment", keywords: ["energy management", "smart grid", "demand response", "energy efficiency"], exampleCompanies: ["Schneider Electric (EMS)", "Enel X", "AutoGrid", "Stem Inc", "Arcadia", "OhmConnect", "Sense", "Span"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate & Construction",
    icon: "🏗️",
    verticals: [
      { id: "proptech", name: "PropTech", sector: "Real Estate & Construction", keywords: ["proptech", "real estate tech", "property management", "property technology"], exampleCompanies: ["Zillow", "Redfin", "Opendoor", "AppFolio", "Buildium", "Lessen", "Knock", "Homeward", "Side"], aiOpportunityLevel: "high" },
      { id: "commercial-re", name: "Commercial Real Estate", sector: "Real Estate & Construction", keywords: ["commercial real estate", "cre", "office", "industrial space", "reit"], exampleCompanies: ["CBRE", "JLL", "Prologis", "Boston Properties", "Vornado", "Hines", "Brookfield", "Cushman & Wakefield"], aiOpportunityLevel: "medium" },
      { id: "construction", name: "Construction & Building", sector: "Real Estate & Construction", keywords: ["construction", "building", "general contractor", "infrastructure", "civil"], exampleCompanies: ["Bechtel", "Turner Construction", "Skanska", "Procore", "Kiewit", "AECOM", "Fluor", "DPR Construction", "Brasfield & Gorrie"], aiOpportunityLevel: "medium" },
      { id: "coworking", name: "Coworking & Flexible Space", sector: "Real Estate & Construction", keywords: ["coworking", "flex space", "shared office", "flexible workspace"], exampleCompanies: ["WeWork", "Industrious", "Regus (IWG)", "Convene", "Breather", "Novel Coworking", "Common Desk"], aiOpportunityLevel: "low" },
      { id: "construction-tech", name: "Construction Tech & BIM", sector: "Real Estate & Construction", keywords: ["contech", "bim", "building information", "construction software"], exampleCompanies: ["Procore", "PlanGrid (Autodesk)", "Bluebeam", "OpenSpace", "Doxel", "Built Technologies", "Join", "Briq"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "transportation",
    name: "Transportation & Logistics",
    icon: "🚛",
    verticals: [
      { id: "logistics", name: "Logistics & Supply Chain", sector: "Transportation & Logistics", keywords: ["logistics", "supply chain", "warehousing", "fulfillment", "3pl"], exampleCompanies: ["Flexport", "ShipBob", "XPO Logistics", "C.H. Robinson", "Echo Global", "project44", "FourKites", "ShipStation", "Stord"], aiOpportunityLevel: "high" },
      { id: "freight-shipping", name: "Freight & Shipping", sector: "Transportation & Logistics", keywords: ["freight", "shipping", "trucking", "maritime", "cargo", "ltl"], exampleCompanies: ["FedEx", "UPS", "Maersk", "J.B. Hunt", "Werner", "Old Dominion", "Saia", "TFI International", "Knight-Swift"], aiOpportunityLevel: "medium" },
      { id: "airlines", name: "Airlines & Aviation", sector: "Transportation & Logistics", keywords: ["airline", "aviation", "airport", "flight", "air travel"], exampleCompanies: ["Delta Air Lines", "Southwest Airlines", "JetBlue", "United Airlines", "Spirit Airlines", "Frontier", "Alaska Airlines", "Breeze Airways"], aiOpportunityLevel: "medium" },
      { id: "last-mile", name: "Last-Mile & Delivery", sector: "Transportation & Logistics", keywords: ["last mile", "delivery", "courier", "same day", "gig delivery"], exampleCompanies: ["DoorDash", "Instacart", "Gopuff", "Uber Freight", "Veho", "Roadie", "Bringg", "Onfleet", "Lalamove"], aiOpportunityLevel: "high" },
      { id: "fleet-mobility", name: "Fleet Management & Mobility", sector: "Transportation & Logistics", keywords: ["fleet", "mobility", "rideshare", "autonomous", "telematics"], exampleCompanies: ["Samsara", "Motive", "Geotab", "Waymo", "Cruise", "Nuro", "Zoox", "Aurora", "Gatik"], aiOpportunityLevel: "high" },
      { id: "rail-transit", name: "Rail & Public Transit", sector: "Transportation & Logistics", keywords: ["rail", "railroad", "public transit", "metro", "commuter rail"], exampleCompanies: ["Union Pacific", "BNSF Railway", "CSX", "Norfolk Southern", "Amtrak", "Brightline", "Via", "Optibus"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "education",
    name: "Education & Training",
    icon: "🎓",
    verticals: [
      { id: "edtech", name: "EdTech & Online Learning", sector: "Education & Training", keywords: ["edtech", "online learning", "elearning", "education technology", "mooc"], exampleCompanies: ["Coursera", "Duolingo", "Khan Academy", "Udemy", "2U", "Chegg", "MasterClass", "Brilliant", "Outschool"], aiOpportunityLevel: "high" },
      { id: "higher-ed", name: "Higher Education", sector: "Education & Training", keywords: ["university", "college", "higher education", "academic", "campus"], exampleCompanies: ["Arizona State University", "Southern New Hampshire", "Purdue Global", "WGU", "Coursera for Campus", "Instructure (Canvas)"], aiOpportunityLevel: "medium" },
      { id: "corporate-training", name: "Corporate Training & L&D", sector: "Education & Training", keywords: ["corporate training", "l&d", "learning development", "upskilling", "reskilling"], exampleCompanies: ["LinkedIn Learning", "Skillsoft", "Cornerstone", "Degreed", "Guild Education", "BetterUp", "Pluralsight", "A Cloud Guru"], aiOpportunityLevel: "high" },
      { id: "k12", name: "K-12 Education", sector: "Education & Training", keywords: ["k-12", "school", "k12", "primary", "secondary", "school district"], exampleCompanies: ["Clever", "Instructure", "Renaissance Learning", "PowerSchool", "Kahoot!", "ClassDojo", "Newsela", "IXL Learning"], aiOpportunityLevel: "medium" },
      { id: "trade-schools", name: "Trade Schools & Vocational", sector: "Education & Training", keywords: ["trade school", "vocational", "technical training", "certification", "bootcamp"], exampleCompanies: ["General Assembly", "Flatiron School", "Galvanize", "Springboard", "Thinkful", "Lambda School (BloomTech)", "Hack Reactor"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "professional-services",
    name: "Professional Services",
    icon: "👔",
    verticals: [
      { id: "consulting", name: "Management Consulting", sector: "Professional Services", keywords: ["consulting", "management consulting", "strategy", "advisory"], exampleCompanies: ["McKinsey", "BCG", "Bain", "Deloitte", "Accenture", "Kearney", "Oliver Wyman", "L.E.K. Consulting", "West Monroe"], aiOpportunityLevel: "medium" },
      { id: "legal", name: "Legal Services & LegalTech", sector: "Professional Services", keywords: ["legal", "law firm", "legaltech", "compliance", "contract"], exampleCompanies: ["Clio", "LegalZoom", "Ironclad", "Harvey AI", "Thomson Reuters Legal", "Relativity", "Everlaw", "Disco (CS Disco)"], aiOpportunityLevel: "high" },
      { id: "staffing", name: "Staffing & Recruiting", sector: "Professional Services", keywords: ["staffing", "recruiting", "talent", "headhunting", "temp", "talent acquisition"], exampleCompanies: ["Robert Half", "Hays", "Adecco", "Randstad", "Kforce", "Insight Global", "TEKsystems", "Aerotek", "Heidrick & Struggles"], aiOpportunityLevel: "medium" },
      { id: "design-creative", name: "Design & Creative Agencies", sector: "Professional Services", keywords: ["design", "creative", "agency", "branding", "ux", "digital agency"], exampleCompanies: ["Pentagram", "IDEO", "Huge", "R/GA", "Instrument", "Work & Co", "Razorfish", "Sapient", "Fantasy"], aiOpportunityLevel: "medium" },
      { id: "it-services", name: "IT Services & Managed Services", sector: "Professional Services", keywords: ["it services", "managed services", "msp", "outsourcing", "system integrator"], exampleCompanies: ["Cognizant", "Infosys", "Wipro", "TCS", "HCLTech", "DXC Technology", "Atos", "NTT Data", "Capgemini"], aiOpportunityLevel: "medium" },
      { id: "pr-communications", name: "PR & Communications", sector: "Professional Services", keywords: ["pr", "public relations", "communications", "media relations"], exampleCompanies: ["Edelman", "Weber Shandwick", "FleishmanHillard", "Burson", "Ketchum", "MWWPR", "Finn Partners", "5W Public Relations"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "hospitality",
    name: "Hospitality & Tourism",
    icon: "🏨",
    verticals: [
      { id: "hotels-resorts", name: "Hotels & Resorts", sector: "Hospitality & Tourism", keywords: ["hotel", "resort", "lodging", "hospitality", "accommodation"], exampleCompanies: ["Marriott", "Hilton", "Hyatt", "Airbnb", "IHG", "Accor", "Wyndham", "Choice Hotels", "Selina"], aiOpportunityLevel: "medium" },
      { id: "travel-booking", name: "Travel & Online Booking", sector: "Hospitality & Tourism", keywords: ["travel", "booking", "ota", "travel tech", "travel agent"], exampleCompanies: ["Booking.com", "Expedia", "Tripadvisor", "Hopper", "Kayak", "GetYourGuide", "Klook", "Viator", "Skyscanner"], aiOpportunityLevel: "high" },
      { id: "cruise-tourism", name: "Cruise & Tourism", sector: "Hospitality & Tourism", keywords: ["cruise", "tourism", "tour operator", "attraction", "theme park"], exampleCompanies: ["Royal Caribbean", "Carnival", "Norwegian Cruise", "Disney Cruise", "TUI Group", "MSC Cruises", "Viking Cruises"], aiOpportunityLevel: "low" },
      { id: "hospitality-tech", name: "Hospitality Tech & PMS", sector: "Hospitality & Tourism", keywords: ["hospitality tech", "pms", "property management", "hotel software"], exampleCompanies: ["Oracle Hospitality", "Cloudbeds", "Mews", "Guesty", "Toast (hospitality)", "Lightspeed", "SevenRooms", "OpenTable"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture & Food Production",
    icon: "🌾",
    verticals: [
      { id: "agtech", name: "AgTech & Precision Agriculture", sector: "Agriculture & Food Production", keywords: ["agtech", "precision agriculture", "farming tech", "crop", "ag data"], exampleCompanies: ["John Deere (Precision Ag)", "Climate Corp", "Indigo Ag", "Farmers Business Network", "Gro Intelligence", "Pivot Bio", "Arable", "CropX"], aiOpportunityLevel: "high" },
      { id: "food-processing", name: "Food Processing & Manufacturing", sector: "Agriculture & Food Production", keywords: ["food processing", "food manufacturing", "meat", "dairy", "poultry"], exampleCompanies: ["Tyson Foods", "JBS", "Archer Daniels Midland", "Cargill", "Bunge", "Pilgrim's Pride", "Smithfield Foods", "Perdue Farms"], aiOpportunityLevel: "medium" },
      { id: "cannabis", name: "Cannabis & Hemp", sector: "Agriculture & Food Production", keywords: ["cannabis", "hemp", "marijuana", "cbd", "dispensary"], exampleCompanies: ["Curaleaf", "Trulieve", "Green Thumb Industries", "Cresco Labs", "Charlotte's Web", "Tilray", "Canopy Growth", "Columbia Care"], aiOpportunityLevel: "medium" },
      { id: "animal-health", name: "Animal Health & Vet Tech", sector: "Agriculture & Food Production", keywords: ["animal health", "veterinary", "livestock", "vet tech"], exampleCompanies: ["Zoetis", "Elanco", "Merck Animal Health", "Boehringer Ingelheim (AH)", "IDEXX", "Covetrus", "Phibro Animal Health"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "telecom",
    name: "Telecommunications",
    icon: "📡",
    verticals: [
      { id: "wireless-carriers", name: "Wireless Carriers & MVNO", sector: "Telecommunications", keywords: ["wireless", "carrier", "mobile", "5g", "mvno", "cell"], exampleCompanies: ["T-Mobile", "Verizon", "AT&T", "Mint Mobile", "Google Fi", "Visible", "US Cellular", "Consumer Cellular"], aiOpportunityLevel: "high" },
      { id: "network-infra", name: "Network Infrastructure", sector: "Telecommunications", keywords: ["network", "fiber", "broadband", "infrastructure", "tower", "isp"], exampleCompanies: ["Crown Castle", "American Tower", "Lumen Technologies", "Frontier Communications", "Corning", "Ciena", "Calix", "Comcast Business"], aiOpportunityLevel: "medium" },
      { id: "satellite-space", name: "Satellite & Space Tech", sector: "Telecommunications", keywords: ["satellite", "space", "orbital", "launch", "leo"], exampleCompanies: ["SpaceX (Starlink)", "OneWeb", "Planet Labs", "Rocket Lab", "Astra", "Iridium", "SES", "Viasat"], aiOpportunityLevel: "high" },
      { id: "ucaas-cpaas", name: "UCaaS & CPaaS", sector: "Telecommunications", keywords: ["ucaas", "cpaas", "unified communications", "voip", "contact center", "ccaas"], exampleCompanies: ["Twilio", "RingCentral", "Vonage", "Bandwidth", "Five9", "Genesys", "NICE inContact", "Talkdesk", "Dialpad"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "government",
    name: "Government & Public Sector",
    icon: "🏛️",
    verticals: [
      { id: "govtech", name: "GovTech & Civic Tech", sector: "Government & Public Sector", keywords: ["govtech", "civic tech", "government technology", "public sector", "smart city"], exampleCompanies: ["Palantir", "Anduril", "Mark43", "Socrata", "CivicPlus", "Granicus", "Tyler Technologies", "Accela", "Carahsoft"], aiOpportunityLevel: "high" },
      { id: "nonprofit", name: "Nonprofit & NGO", sector: "Government & Public Sector", keywords: ["nonprofit", "ngo", "charity", "foundation", "philanthropy"], exampleCompanies: ["United Way", "Feeding America", "American Red Cross", "Habitat for Humanity", "Boys & Girls Clubs", "Salvation Army", "World Wildlife Fund"], aiOpportunityLevel: "low" },
      { id: "defense-intel", name: "Defense & Intelligence Contractors", sector: "Government & Public Sector", keywords: ["defense contractor", "intelligence", "dod", "federal"], exampleCompanies: ["Booz Allen Hamilton", "SAIC", "Leidos", "ManTech", "CACI International", "ICF", "Peraton", "Maximus"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "pets-lifestyle",
    name: "Pet Care, Fitness & Lifestyle",
    icon: "🐾",
    verticals: [
      { id: "pet-care", name: "Pet Care & Animal Health", sector: "Pet Care, Fitness & Lifestyle", keywords: ["pet", "animal", "veterinary", "pet food", "pet tech"], exampleCompanies: ["Chewy", "Mars Petcare", "Banfield Pet Hospital", "Petco", "BarkBox", "Rover", "Wag!", "Ollie", "The Farmer's Dog"], aiOpportunityLevel: "medium" },
      { id: "fitness-wellness", name: "Fitness & Wellness", sector: "Pet Care, Fitness & Lifestyle", keywords: ["fitness", "gym", "wellness", "workout", "health club", "studio fitness"], exampleCompanies: ["Peloton", "Planet Fitness", "ClassPass", "Mindbody", "Whoop", "Orangetheory", "Equinox", "F45 Training", "Barry's"], aiOpportunityLevel: "medium" },
      { id: "outdoor-recreation", name: "Outdoor & Recreation", sector: "Pet Care, Fitness & Lifestyle", keywords: ["outdoor", "recreation", "camping", "hiking", "adventure"], exampleCompanies: ["Yeti", "Patagonia", "The North Face", "REI", "Bass Pro Shops", "Columbia Sportswear", "GoWild", "onX", "Hipcamp"], aiOpportunityLevel: "low" },
    ],
  },
  {
    id: "waste-environment",
    name: "Waste & Environmental Services",
    icon: "♻️",
    verticals: [
      { id: "waste-mgmt", name: "Waste Management & Recycling", sector: "Waste & Environmental Services", keywords: ["waste", "recycling", "disposal", "sanitation", "trash"], exampleCompanies: ["Waste Management", "Republic Services", "Clean Harbors", "Rubicon", "ACV Auctions", "Casella Waste", "GFL Environmental"], aiOpportunityLevel: "medium" },
      { id: "water", name: "Water & Wastewater", sector: "Waste & Environmental Services", keywords: ["water", "wastewater", "treatment", "desalination", "water tech"], exampleCompanies: ["Xylem", "Pentair", "Veolia", "Evoqua", "Mueller Water Products", "Itron", "Badger Meter", "SUEZ"], aiOpportunityLevel: "medium" },
      { id: "environmental-consulting", name: "Environmental Consulting", sector: "Waste & Environmental Services", keywords: ["environmental consulting", "remediation", "ehs", "compliance"], exampleCompanies: ["Tetra Tech", "Arcadis", "WSP", "Stantec", "AECOM (Env)", "Golder Associates", "ERM", "Ramboll"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "home-services",
    name: "Home Services & Trades",
    icon: "🏠",
    verticals: [
      { id: "hvac-plumbing", name: "HVAC, Plumbing & Electrical", sector: "Home Services & Trades", keywords: ["hvac", "plumbing", "electrical", "heating", "cooling", "home service"], exampleCompanies: ["Service Experts", "ARS/Rescue Rooter", "Roto-Rooter", "Mr. Rooter", "One Hour Heating & AC", "Lee Company", "Comfort Systems USA"], aiOpportunityLevel: "medium" },
      { id: "home-service-tech", name: "Home Services Technology", sector: "Home Services & Trades", keywords: ["home service tech", "field service", "dispatch", "scheduling"], exampleCompanies: ["ServiceTitan", "Housecall Pro", "Jobber", "GorillaDesk", "Successware", "FieldEdge", "Workwave", "ServiceMax"], aiOpportunityLevel: "high" },
      { id: "pest-lawn", name: "Pest Control & Lawn Care", sector: "Home Services & Trades", keywords: ["pest control", "lawn care", "landscaping", "turf", "exterminator"], exampleCompanies: ["Terminix", "Orkin", "Rentokil", "ABC Home & Commercial", "TruGreen", "Sunday Lawn Care", "Lawn Love", "TaskEasy"], aiOpportunityLevel: "medium" },
      { id: "cleaning-restoration", name: "Cleaning & Restoration", sector: "Home Services & Trades", keywords: ["cleaning", "restoration", "janitorial", "maid service"], exampleCompanies: ["Servpro", "Stanley Steemer", "Molly Maid", "ServiceMaster", "Jan-Pro", "ABM Industries", "Cintas (Facility)", "Vanguard Cleaning"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "security-safety",
    name: "Security & Safety",
    icon: "🔐",
    verticals: [
      { id: "physical-security", name: "Physical Security & Surveillance", sector: "Security & Safety", keywords: ["security", "surveillance", "cctv", "access control", "guard"], exampleCompanies: ["ADT", "Verkada", "Genetec", "Axis Communications", "Brivo", "Eagle Eye Networks", "Motorola Solutions (Video)", "Evolv Technology"], aiOpportunityLevel: "high" },
      { id: "fire-life-safety", name: "Fire & Life Safety", sector: "Security & Safety", keywords: ["fire", "life safety", "fire alarm", "sprinkler", "fire protection"], exampleCompanies: ["Johnson Controls (Tyco)", "Honeywell Fire", "Notifier", "SimpliSafe", "Kidde", "Siemens Fire Safety", "Bosch Security"], aiOpportunityLevel: "medium" },
      { id: "identity-fraud", name: "Identity & Fraud Prevention", sector: "Security & Safety", keywords: ["identity", "fraud", "kyc", "aml", "identity verification"], exampleCompanies: ["Socure", "Jumio", "Onfido", "Persona", "Alloy", "Prove", "ID.me", "Sardine", "Unit21"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "supply-chain",
    name: "Supply Chain & Procurement",
    icon: "📦",
    verticals: [
      { id: "procurement-sourcing", name: "Procurement & Sourcing", sector: "Supply Chain & Procurement", keywords: ["procurement", "sourcing", "purchasing", "spend management", "rfp"], exampleCompanies: ["Coupa", "Jaggaer", "SAP Ariba", "Zip", "Fairmarkit", "Globality", "Ivalua", "GEP"], aiOpportunityLevel: "high" },
      { id: "supply-chain-visibility", name: "Supply Chain Visibility", sector: "Supply Chain & Procurement", keywords: ["supply chain visibility", "track and trace", "supply chain risk"], exampleCompanies: ["project44", "FourKites", "Overhaul", "Resilinc", "Everstream", "Altana AI", "Craft.co", "Interos"], aiOpportunityLevel: "high" },
      { id: "warehouse-wms", name: "Warehouse Management", sector: "Supply Chain & Procurement", keywords: ["warehouse", "wms", "warehouse management", "distribution center", "inventory"], exampleCompanies: ["Manhattan Associates", "Blue Yonder", "Körber", "Locus Robotics", "6 River Systems", "Symbotic", "AutoStore", "Exotec"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "deep-tech",
    name: "Biotech & Deep Tech",
    icon: "🧬",
    verticals: [
      { id: "synthetic-bio", name: "Synthetic Biology", sector: "Biotech & Deep Tech", keywords: ["synthetic biology", "synbio", "bioengineering", "gene editing", "crispr"], exampleCompanies: ["Ginkgo Bioworks", "Zymergen", "Twist Bioscience", "Mammoth Biosciences", "Editas Medicine", "CRISPR Therapeutics", "Inscripta"], aiOpportunityLevel: "high" },
      { id: "quantum", name: "Quantum Computing", sector: "Biotech & Deep Tech", keywords: ["quantum", "quantum computing", "qbit", "quantum advantage"], exampleCompanies: ["IonQ", "Rigetti", "D-Wave", "Quantinuum", "PsiQuantum", "Xanadu", "QuEra Computing", "Atom Computing"], aiOpportunityLevel: "high" },
      { id: "advanced-materials", name: "Advanced Materials & Nanotech", sector: "Biotech & Deep Tech", keywords: ["nanotech", "advanced materials", "graphene", "metamaterials"], exampleCompanies: ["Applied Graphene Materials", "NanoViricides", "Eaton (Materials)", "Hexcel", "Toray Industries", "Solvay Advanced Materials"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "marketing-sales",
    name: "Marketing & Sales Services",
    icon: "🎯",
    verticals: [
      { id: "digital-marketing", name: "Digital Marketing Agencies", sector: "Marketing & Sales Services", keywords: ["digital marketing", "seo", "sem", "ppc", "social media marketing"], exampleCompanies: ["WebFX", "Wpromote", "Tinuiti", "Power Digital", "Ignite Visibility", "Thrive Internet Marketing", "LYFE Marketing", "Disruptive Advertising"], aiOpportunityLevel: "high" },
      { id: "sales-enablement", name: "Sales Enablement & RevOps", sector: "Marketing & Sales Services", keywords: ["sales enablement", "revenue operations", "revops", "sales tech"], exampleCompanies: ["Gong", "Outreach", "SalesLoft", "Apollo.io", "ZoomInfo", "Clari", "Highspot", "Seismic", "Chorus.ai"], aiOpportunityLevel: "high" },
      { id: "market-research", name: "Market Research & Insights", sector: "Marketing & Sales Services", keywords: ["market research", "insights", "survey", "consumer research"], exampleCompanies: ["Nielsen", "Kantar", "Ipsos", "Qualtrics", "SurveyMonkey (Momentive)", "Dynata", "Forsta", "Medallia"], aiOpportunityLevel: "high" },
      { id: "experiential-events", name: "Experiential Marketing & Events", sector: "Marketing & Sales Services", keywords: ["experiential", "events", "event marketing", "trade show", "conference"], exampleCompanies: ["Freeman", "George P. Johnson", "Cvent", "Bizzabo", "Hopin", "Splash", "Certain", "RainFocus"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "compliance-reg",
    name: "Compliance & Regulatory",
    icon: "🛡️",
    verticals: [
      { id: "regtech", name: "RegTech & Compliance Software", sector: "Compliance & Regulatory", keywords: ["regtech", "compliance", "regulatory", "risk management", "grc"], exampleCompanies: ["LogicGate", "Drata", "Vanta", "Anecdotes", "Thoropass (Laika)", "ComplyAdvantage", "OneTrust", "TrustArc", "Hyperproof"], aiOpportunityLevel: "high" },
      { id: "privacy-data-governance", name: "Privacy & Data Governance", sector: "Compliance & Regulatory", keywords: ["privacy", "gdpr", "ccpa", "data governance", "data protection"], exampleCompanies: ["OneTrust", "BigID", "Securiti", "Osano", "Transcend", "DataGrail", "WireWheel", "Privitar"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "consumer-services",
    name: "Family & Consumer Services",
    icon: "🧒",
    verticals: [
      { id: "childcare-family", name: "Childcare & Family Services", sector: "Family & Consumer Services", keywords: ["childcare", "daycare", "family", "parenting", "nanny"], exampleCompanies: ["Bright Horizons", "KinderCare", "Care.com", "Winnie", "Tootris", "Vivvi", "Wonderschool", "Brightwheel"], aiOpportunityLevel: "medium" },
      { id: "senior-care", name: "Senior Care & Aging Services", sector: "Family & Consumer Services", keywords: ["senior care", "aging", "elder care", "assisted living"], exampleCompanies: ["Brookdale Senior Living", "Sunrise Senior Living", "Home Instead", "BrightSpring Health", "Amedisys", "Honor", "Papa", "CarePredict"], aiOpportunityLevel: "medium" },
      { id: "personal-finance", name: "Personal Finance & Budgeting", sector: "Family & Consumer Services", keywords: ["personal finance", "budgeting", "savings", "financial wellness"], exampleCompanies: ["Mint (Credit Karma)", "YNAB", "NerdWallet", "Credit Karma", "Tally", "Albert", "Monarch Money", "Copilot Money"], aiOpportunityLevel: "medium" },
    ],
  },
  {
    id: "auto-aftermarket",
    name: "Automotive Aftermarket",
    icon: "🚗",
    verticals: [
      { id: "auto-parts", name: "Auto Parts & Accessories", sector: "Automotive Aftermarket", keywords: ["auto parts", "car parts", "aftermarket", "accessories"], exampleCompanies: ["AutoZone", "O'Reilly Auto Parts", "Advance Auto Parts", "LKQ Corporation", "Dorman Products", "Standard Motor Products", "CarParts.com"], aiOpportunityLevel: "medium" },
      { id: "auto-repair", name: "Auto Repair & Service Chains", sector: "Automotive Aftermarket", keywords: ["auto repair", "mechanic", "oil change", "tire", "brake", "collision"], exampleCompanies: ["Caliber Collision", "Maaco", "Meineke", "Jiffy Lube", "Valvoline Instant", "Pep Boys", "Safelite", "Les Schwab", "Discount Tire"], aiOpportunityLevel: "medium" },
      { id: "auto-dealer-tech", name: "Auto Dealer Tech & F&I", sector: "Automotive Aftermarket", keywords: ["dealer", "dealership", "f&i", "automotive software", "dms"], exampleCompanies: ["CDK Global", "Cox Automotive", "DealerSocket", "vAuto", "CarGurus", "TrueCar", "Tekion", "Vroom", "Carvana"], aiOpportunityLevel: "high" },
    ],
  },
  {
    id: "global-emerging",
    name: "Global & Emerging Markets",
    icon: "🌐",
    verticals: [
      { id: "cross-border", name: "Cross-Border Commerce & Payments", sector: "Global & Emerging Markets", keywords: ["cross-border", "international trade", "global payments", "remittance", "forex"], exampleCompanies: ["Wise (TransferWise)", "Payoneer", "WorldRemit", "Remitly", "Airwallex", "Thunes", "dLocal", "Nuvei"], aiOpportunityLevel: "high" },
      { id: "emerging-fintech", name: "Emerging Market FinTech", sector: "Global & Emerging Markets", keywords: ["emerging market", "africa fintech", "latam fintech", "india fintech", "mobile money"], exampleCompanies: ["M-Pesa", "Flutterwave", "Paystack", "Nubank", "Rappi", "PhonePe", "Grab Financial", "MercadoPago", "OPay"], aiOpportunityLevel: "high" },
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

// Get all unique companies across the taxonomy
export function getAllCompanies(): string[] {
  return [...new Set(ALL_VERTICALS.flatMap(v => v.exampleCompanies))].sort();
}

// Get verticals by AI opportunity level
export function getHighOpportunityVerticals(): IndustryVertical[] {
  return ALL_VERTICALS.filter(v => v.aiOpportunityLevel === "high");
}
