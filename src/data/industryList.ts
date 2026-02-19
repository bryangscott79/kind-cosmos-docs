// Top 100 U.S. Industries with sector grouping and representative companies
export interface IndustryDef {
  name: string;
  slug: string;
  sector: string;
  companies: string[];
  opportunities: string[];
}

export const US_INDUSTRIES: IndustryDef[] = [
  // 🏭 Primary & Resource Industries
  { name: "Oil & Gas Extraction", slug: "oil-gas-extraction", sector: "Primary & Resources", companies: ["ExxonMobil", "Chevron", "ConocoPhillips"], opportunities: ["AI-driven reservoir optimization", "Methane leak detection", "Digital twin drilling"] },
  { name: "Coal Mining", slug: "coal-mining", sector: "Primary & Resources", companies: ["Peabody Energy", "Arch Resources", "CONSOL Energy"], opportunities: ["Mine safety automation", "Reclamation tech", "Carbon capture"] },
  { name: "Metal Ore Mining", slug: "metal-ore-mining", sector: "Primary & Resources", companies: ["Freeport-McMoRan", "Newmont", "Southern Copper"], opportunities: ["Autonomous hauling", "Ore grade prediction", "Water management"] },
  { name: "Nonmetallic Mineral Mining", slug: "nonmetallic-mineral-mining", sector: "Primary & Resources", companies: ["Vulcan Materials", "Martin Marietta", "U.S. Silica"], opportunities: ["Dust monitoring IoT", "Demand forecasting", "Fleet telematics"] },
  { name: "Logging", slug: "logging", sector: "Primary & Resources", companies: ["Weyerhaeuser", "Rayonier", "PotlatchDeltic"], opportunities: ["Satellite forest monitoring", "Sustainable yield modeling", "Supply chain traceability"] },
  { name: "Commercial Fishing", slug: "commercial-fishing", sector: "Primary & Resources", companies: ["Trident Seafoods", "Bumble Bee Foods", "American Seafoods"], opportunities: ["Smart fleet management", "Bycatch reduction AI", "Cold chain IoT"] },
  { name: "Crop Production", slug: "crop-production", sector: "Primary & Resources", companies: ["Cargill", "Archer Daniels Midland", "Corteva"], opportunities: ["Precision agriculture", "Drone crop monitoring", "Soil analytics"] },
  { name: "Cattle & Animal Production", slug: "cattle-animal-production", sector: "Primary & Resources", companies: ["Tyson Foods", "JBS USA", "Cargill Protein"], opportunities: ["Livestock health monitoring", "Feed optimization AI", "Traceability blockchain"] },

  // 🏗️ Construction & Infrastructure
  { name: "Residential Construction", slug: "residential-construction", sector: "Construction & Infrastructure", companies: ["D.R. Horton", "Lennar", "PulteGroup"], opportunities: ["Modular/prefab tech", "BIM adoption", "Labor scheduling AI"] },
  { name: "Commercial Construction", slug: "commercial-construction", sector: "Construction & Infrastructure", companies: ["Turner Construction", "Bechtel", "Skanska USA"], opportunities: ["Project management platforms", "Safety wearables", "Digital twins"] },
  { name: "Heavy & Civil Engineering", slug: "heavy-civil-engineering", sector: "Construction & Infrastructure", companies: ["Fluor", "Granite Construction", "Kiewit"], opportunities: ["Infrastructure monitoring IoT", "Autonomous equipment", "Predictive maintenance"] },
  { name: "Specialty Trade Contractors", slug: "specialty-trade-contractors", sector: "Construction & Infrastructure", companies: ["EMCOR Group", "Quanta Services", "MasTec"], opportunities: ["Workforce management", "AR-guided installations", "Estimating software"] },
  { name: "Infrastructure & Utilities Construction", slug: "infrastructure-utilities-construction", sector: "Construction & Infrastructure", companies: ["MasTec", "Primoris Services", "AECOM"], opportunities: ["Grid modernization", "Fiber deployment", "Smart city integration"] },
  { name: "Industrial Construction", slug: "industrial-construction", sector: "Construction & Infrastructure", companies: ["Jacobs Solutions", "McDermott", "KBR"], opportunities: ["Modular fabrication", "Commissioning automation", "EPC software"] },

  // ⚡ Energy & Utilities
  { name: "Electric Power Generation", slug: "electric-power-generation", sector: "Energy & Utilities", companies: ["Duke Energy", "Southern Company", "NextEra Energy"], opportunities: ["Grid AI optimization", "Demand response", "Asset health monitoring"] },
  { name: "Renewable Energy Production", slug: "renewable-energy-production", sector: "Energy & Utilities", companies: ["NextEra Energy", "First Solar", "Enphase Energy"], opportunities: ["Solar forecasting AI", "Battery management systems", "Microgrid controls"] },
  { name: "Natural Gas Distribution", slug: "natural-gas-distribution", sector: "Energy & Utilities", companies: ["Atmos Energy", "Spire", "National Fuel Gas"], opportunities: ["Leak detection AI", "Predictive maintenance", "Smart metering"] },
  { name: "Water & Sewage Utilities", slug: "water-sewage-utilities", sector: "Energy & Utilities", companies: ["American Water Works", "Essential Utilities", "California Water"], opportunities: ["Water quality monitoring", "Smart infrastructure", "Consumption analytics"] },
  { name: "Waste Management Services", slug: "waste-management-services", sector: "Energy & Utilities", companies: ["Waste Management", "Republic Services", "Clean Harbors"], opportunities: ["Route optimization AI", "Recycling sorting robots", "Landfill monitoring"] },
  { name: "Environmental Remediation", slug: "environmental-remediation", sector: "Energy & Utilities", companies: ["Clean Earth", "US Ecology", "Enviri Group"], opportunities: ["Contamination modeling", "Drone site surveys", "Regulatory compliance automation"] },

  // 🏭 Manufacturing — Durable Goods
  { name: "Aerospace & Defense Manufacturing", slug: "aerospace-defense-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Lockheed Martin", "Boeing", "Raytheon Technologies"], opportunities: ["Autonomous systems", "Additive manufacturing", "Digital thread"] },
  { name: "Automotive Manufacturing", slug: "automotive-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["General Motors", "Ford", "Tesla"], opportunities: ["EV battery tech", "Autonomous driving", "Connected vehicle platforms"] },
  { name: "Ship & Boat Building", slug: "ship-boat-building", sector: "Manufacturing — Durable Goods", companies: ["Huntington Ingalls", "General Dynamics NASSCO", "Austal USA"], opportunities: ["Digital shipyard", "Autonomous vessels", "Predictive maintenance"] },
  { name: "Railroad Equipment Manufacturing", slug: "railroad-equipment-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Wabtec", "Trinity Industries", "Greenbrier"], opportunities: ["Predictive analytics", "IoT fleet monitoring", "Hydrogen locomotives"] },
  { name: "Machinery Manufacturing", slug: "machinery-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Caterpillar", "Deere & Company", "Illinois Tool Works"], opportunities: ["Smart factory", "Predictive maintenance", "Robotics integration"] },
  { name: "Construction Equipment Manufacturing", slug: "construction-equipment-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Caterpillar", "CASE Construction", "Bobcat"], opportunities: ["Autonomous equipment", "Telematics", "Electric machinery"] },
  { name: "Agricultural Equipment Manufacturing", slug: "agricultural-equipment-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Deere & Company", "AGCO", "CNH Industrial"], opportunities: ["Precision agriculture", "Autonomous tractors", "Data-driven farming"] },
  { name: "Computer Hardware Manufacturing", slug: "computer-hardware-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Apple", "Dell Technologies", "HP Inc."], opportunities: ["AI chip design", "Sustainable manufacturing", "Edge computing devices"] },
  { name: "Semiconductor Manufacturing", slug: "semiconductor-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Intel", "TSMC Arizona", "GlobalFoundries"], opportunities: ["Fab automation", "Yield optimization AI", "EUV lithography"] },
  { name: "Communications Equipment Manufacturing", slug: "communications-equipment-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Cisco Systems", "Motorola Solutions", "Juniper Networks"], opportunities: ["5G infrastructure", "Network AI", "Software-defined networking"] },
  { name: "Medical Device Manufacturing", slug: "medical-device-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Medtronic", "Abbott Laboratories", "Boston Scientific"], opportunities: ["AI-powered diagnostics", "Robotic surgery", "Connected devices"] },
  { name: "Industrial Equipment Manufacturing", slug: "industrial-equipment-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Honeywell", "Emerson Electric", "Parker Hannifin"], opportunities: ["IIoT platforms", "Digital twin", "Energy efficiency"] },
  { name: "Metal Fabrication", slug: "metal-fabrication", sector: "Manufacturing — Durable Goods", companies: ["Precision Castparts", "Worthington Industries", "Mueller Industries"], opportunities: ["CNC automation", "Quality vision AI", "ERP modernization"] },
  { name: "Steel Production", slug: "steel-production", sector: "Manufacturing — Durable Goods", companies: ["Nucor", "United States Steel", "Steel Dynamics"], opportunities: ["Green steel tech", "Process optimization AI", "Carbon accounting"] },
  { name: "Aluminum Production", slug: "aluminum-production", sector: "Manufacturing — Durable Goods", companies: ["Alcoa", "Century Aluminum", "Kaiser Aluminum"], opportunities: ["Smelting efficiency AI", "Recycling tech", "Lightweight alloys"] },
  { name: "Furniture Manufacturing", slug: "furniture-manufacturing", sector: "Manufacturing — Durable Goods", companies: ["Steelcase", "Herman Miller", "La-Z-Boy"], opportunities: ["Mass customization", "3D visualization", "D2C platforms"] },

  // 🧪 Manufacturing — Nondurable Goods
  { name: "Petroleum Refining", slug: "petroleum-refining", sector: "Manufacturing — Nondurable Goods", companies: ["Valero Energy", "Marathon Petroleum", "Phillips 66"], opportunities: ["Process optimization AI", "Emissions monitoring", "Predictive maintenance"] },
  { name: "Chemical Manufacturing", slug: "chemical-manufacturing", sector: "Manufacturing — Nondurable Goods", companies: ["Dow", "DuPont", "LyondellBasell"], opportunities: ["Catalyst optimization", "Safety automation", "Green chemistry"] },
  { name: "Pharmaceutical Manufacturing", slug: "pharmaceutical-manufacturing", sector: "Manufacturing — Nondurable Goods", companies: ["Pfizer", "Johnson & Johnson", "Merck"], opportunities: ["AI drug discovery", "Continuous manufacturing", "Supply chain resilience"] },
  { name: "Plastics & Rubber Products", slug: "plastics-rubber-products", sector: "Manufacturing — Nondurable Goods", companies: ["Berry Global", "Sealed Air", "AptarGroup"], opportunities: ["Recycled materials", "Lightweighting", "Circular economy platforms"] },
  { name: "Paper Manufacturing", slug: "paper-manufacturing", sector: "Manufacturing — Nondurable Goods", companies: ["International Paper", "Packaging Corp", "Domtar"], opportunities: ["Sustainable packaging", "Process automation", "Demand forecasting"] },
  { name: "Printing & Packaging", slug: "printing-packaging", sector: "Manufacturing — Nondurable Goods", companies: ["WestRock", "Graphic Packaging", "Sonoco"], opportunities: ["Smart packaging", "Digital printing", "Supply chain optimization"] },
  { name: "Textile Mills", slug: "textile-mills", sector: "Manufacturing — Nondurable Goods", companies: ["Milliken & Company", "Unifi", "Albany International"], opportunities: ["Smart textiles", "Automation", "Sustainable fibers"] },
  { name: "Apparel Manufacturing", slug: "apparel-manufacturing", sector: "Manufacturing — Nondurable Goods", companies: ["Hanesbrands", "PVH Corp", "VF Corporation"], opportunities: ["On-demand manufacturing", "AI trend forecasting", "Supply chain traceability"] },
  { name: "Food Processing", slug: "food-processing", sector: "Manufacturing — Nondurable Goods", companies: ["Tyson Foods", "General Mills", "Conagra Brands"], opportunities: ["Food safety AI", "Robotic processing", "Shelf-life prediction"] },
  { name: "Beverage Manufacturing", slug: "beverage-manufacturing", sector: "Manufacturing — Nondurable Goods", companies: ["Coca-Cola", "PepsiCo", "Anheuser-Busch"], opportunities: ["Predictive quality", "Smart vending", "Sustainable packaging"] },
  { name: "Tobacco Manufacturing", slug: "tobacco-manufacturing", sector: "Manufacturing — Nondurable Goods", companies: ["Altria Group", "Philip Morris USA", "Reynolds American"], opportunities: ["Alternative products", "Regulatory compliance", "Consumer analytics"] },
  { name: "Personal Care Products", slug: "personal-care-products", sector: "Manufacturing — Nondurable Goods", companies: ["Procter & Gamble", "Estée Lauder", "Colgate-Palmolive"], opportunities: ["AI personalization", "Clean beauty analytics", "D2C platforms"] },

  // 🚚 Transportation & Logistics
  { name: "Air Transportation", slug: "air-transportation", sector: "Transportation & Logistics", companies: ["Delta Air Lines", "United Airlines", "American Airlines"], opportunities: ["Revenue management AI", "Predictive maintenance", "Fuel optimization"] },
  { name: "Rail Transportation", slug: "rail-transportation", sector: "Transportation & Logistics", companies: ["Union Pacific", "BNSF Railway", "CSX"], opportunities: ["Autonomous trains", "Predictive scheduling", "Track monitoring IoT"] },
  { name: "Trucking & Freight", slug: "trucking-freight", sector: "Transportation & Logistics", companies: ["J.B. Hunt", "Werner Enterprises", "XPO Logistics"], opportunities: ["Autonomous trucking", "Route optimization AI", "Fleet electrification"] },
  { name: "Maritime Shipping", slug: "maritime-shipping", sector: "Transportation & Logistics", companies: ["Matson", "Crowley Maritime", "Kirby Corporation"], opportunities: ["Smart port operations", "Emissions reduction", "Container tracking IoT"] },
  { name: "Pipeline Transportation", slug: "pipeline-transportation", sector: "Transportation & Logistics", companies: ["Kinder Morgan", "Enterprise Products", "Williams Companies"], opportunities: ["Leak detection AI", "Integrity monitoring", "SCADA modernization"] },
  { name: "Warehousing & Storage", slug: "warehousing-storage", sector: "Transportation & Logistics", companies: ["Prologis", "GLP", "CubeSmart"], opportunities: ["Warehouse robotics", "Inventory AI", "Smart building systems"] },
  { name: "Third-Party Logistics", slug: "third-party-logistics", sector: "Transportation & Logistics", companies: ["C.H. Robinson", "XPO Logistics", "Echo Global Logistics"], opportunities: ["AI load matching", "Visibility platforms", "Dynamic pricing"] },
  { name: "Last-Mile Delivery", slug: "last-mile-delivery", sector: "Transportation & Logistics", companies: ["FedEx", "UPS", "Amazon Logistics"], opportunities: ["Drone delivery", "Autonomous delivery bots", "Route optimization"] },

  // 🏬 Wholesale Trade
  { name: "Durable Goods Wholesalers", slug: "durable-goods-wholesalers", sector: "Wholesale Trade", companies: ["W.W. Grainger", "Fastenal", "HD Supply"], opportunities: ["E-commerce platforms", "Inventory AI", "Predictive ordering"] },
  { name: "Nondurable Goods Wholesalers", slug: "nondurable-goods-wholesalers", sector: "Wholesale Trade", companies: ["Sysco", "US Foods", "Performance Food Group"], opportunities: ["Cold chain monitoring", "Demand forecasting", "Route optimization"] },
  { name: "Industrial Equipment Wholesalers", slug: "industrial-equipment-wholesalers", sector: "Wholesale Trade", companies: ["MSC Industrial", "Motion Industries", "Applied Industrial"], opportunities: ["Predictive parts ordering", "Digital catalogs", "IoT-enabled inventory"] },
  { name: "Food & Beverage Wholesalers", slug: "food-beverage-wholesalers", sector: "Wholesale Trade", companies: ["McLane Company", "Core-Mark", "UNFI"], opportunities: ["Freshness tracking", "AI demand planning", "Last-mile cold chain"] },
  { name: "Pharmaceutical Wholesalers", slug: "pharmaceutical-wholesalers", sector: "Wholesale Trade", companies: ["McKesson", "AmerisourceBergen", "Cardinal Health"], opportunities: ["Drug traceability", "Cold chain compliance", "AI inventory management"] },

  // 🛍️ Retail Trade
  { name: "Automobile Dealers", slug: "automobile-dealers", sector: "Retail Trade", companies: ["AutoNation", "Penske Automotive", "Lithia Motors"], opportunities: ["Digital retailing", "AI pricing", "EV service training"] },
  { name: "Gasoline Stations", slug: "gasoline-stations", sector: "Retail Trade", companies: ["Pilot Flying J", "Casey's General Stores", "Wawa"], opportunities: ["EV charging integration", "Convenience store analytics", "Loyalty platforms"] },
  { name: "Grocery Stores", slug: "grocery-stores", sector: "Retail Trade", companies: ["Kroger", "Albertsons", "Publix"], opportunities: ["Self-checkout AI", "Inventory robotics", "Personalized promotions"] },
  { name: "Big Box Retailers", slug: "big-box-retailers", sector: "Retail Trade", companies: ["Walmart", "Target", "Costco"], opportunities: ["Omnichannel AI", "Supply chain optimization", "Automated fulfillment"] },
  { name: "Department Stores", slug: "department-stores", sector: "Retail Trade", companies: ["Macy's", "Nordstrom", "Kohl's"], opportunities: ["Store digitization", "AI merchandising", "Customer experience tech"] },
  { name: "Specialty Retail", slug: "specialty-retail", sector: "Retail Trade", companies: ["Best Buy", "Dick's Sporting Goods", "Bath & Body Works"], opportunities: ["Clienteling AI", "Inventory optimization", "Experiential retail"] },
  { name: "E-commerce Retail", slug: "ecommerce-retail", sector: "Retail Trade", companies: ["Amazon", "Shopify merchants", "Chewy"], opportunities: ["Personalization engines", "Return reduction AI", "Conversational commerce"] },
  { name: "Warehouse Clubs", slug: "warehouse-clubs", sector: "Retail Trade", companies: ["Costco", "Sam's Club", "BJ's Wholesale"], opportunities: ["Membership analytics", "Automated replenishment", "Private label AI"] },
  { name: "Convenience Stores", slug: "convenience-stores", sector: "Retail Trade", companies: ["7-Eleven", "Circle K", "Wawa"], opportunities: ["Cashierless technology", "Micro-fulfillment", "Dynamic pricing"] },
  { name: "Home Improvement Retail", slug: "home-improvement-retail", sector: "Retail Trade", companies: ["Home Depot", "Lowe's", "Menards"], opportunities: ["AR visualization", "Pro contractor platforms", "Inventory AI"] },
  { name: "Electronics Retail", slug: "electronics-retail", sector: "Retail Trade", companies: ["Best Buy", "Micro Center", "B&H Photo"], opportunities: ["Trade-in automation", "Expert AI assistants", "Subscription services"] },

  // 💻 Technology & Digital Economy
  { name: "Software Publishing", slug: "software-publishing", sector: "Technology & Digital Economy", companies: ["Microsoft", "Oracle", "Adobe"], opportunities: ["AI copilots", "Low-code platforms", "Usage-based pricing"] },
  { name: "SaaS Providers", slug: "saas-providers", sector: "Technology & Digital Economy", companies: ["Salesforce", "ServiceNow", "Workday"], opportunities: ["AI-native features", "Vertical SaaS", "PLG optimization"] },
  { name: "IT Consulting Services", slug: "it-consulting-services", sector: "Technology & Digital Economy", companies: ["Accenture", "Deloitte Digital", "Infosys"], opportunities: ["AI transformation", "Cloud migration", "Cybersecurity consulting"] },
  { name: "Cybersecurity Services", slug: "cybersecurity-services", sector: "Technology & Digital Economy", companies: ["CrowdStrike", "Palo Alto Networks", "Fortinet"], opportunities: ["Zero-trust adoption", "AI threat detection", "Compliance automation"] },
  { name: "Cloud Infrastructure Providers", slug: "cloud-infrastructure", sector: "Technology & Digital Economy", companies: ["AWS", "Microsoft Azure", "Google Cloud"], opportunities: ["AI/ML services", "Edge computing", "Sovereign cloud"] },
  { name: "Data Centers", slug: "data-centers", sector: "Technology & Digital Economy", companies: ["Equinix", "Digital Realty", "CoreSite"], opportunities: ["Liquid cooling", "AI workload optimization", "Renewable energy"] },
  { name: "AI Platforms", slug: "ai-platforms", sector: "Technology & Digital Economy", companies: ["OpenAI", "Anthropic", "Google DeepMind"], opportunities: ["Enterprise AI agents", "Model fine-tuning", "AI safety tooling"] },
  { name: "Gaming & Interactive Media", slug: "gaming-interactive-media", sector: "Technology & Digital Economy", companies: ["Activision Blizzard", "Electronic Arts", "Epic Games"], opportunities: ["AI NPCs", "Cloud gaming", "UGC platforms"] },
  { name: "Social Media Platforms", slug: "social-media-platforms", sector: "Technology & Digital Economy", companies: ["Meta", "Snap", "Pinterest"], opportunities: ["Creator economy tools", "AI content moderation", "Commerce integration"] },
  { name: "Digital Advertising", slug: "digital-advertising", sector: "Technology & Digital Economy", companies: ["Google", "Meta", "The Trade Desk"], opportunities: ["Privacy-first targeting", "AI creative optimization", "Retail media networks"] },

  // 📡 Telecommunications & Media
  { name: "Wireless Telecommunications", slug: "wireless-telecom", sector: "Telecommunications & Media", companies: ["T-Mobile", "Verizon", "AT&T"], opportunities: ["5G monetization", "Network AI", "Private 5G"] },
  { name: "Wired Telecommunications", slug: "wired-telecom", sector: "Telecommunications & Media", companies: ["Comcast", "Charter Communications", "Lumen Technologies"], opportunities: ["Fiber expansion", "SD-WAN", "Converged services"] },
  { name: "Cable & Streaming Media", slug: "cable-streaming-media", sector: "Telecommunications & Media", companies: ["Netflix", "Disney+", "Paramount+"], opportunities: ["Content AI", "Ad-tier optimization", "Churn prediction"] },
  { name: "Broadcasting", slug: "broadcasting", sector: "Telecommunications & Media", companies: ["iHeartMedia", "Sinclair Broadcast", "Nexstar Media"], opportunities: ["ATSC 3.0", "Programmatic ads", "AI content tools"] },
  { name: "Film & Video Production", slug: "film-video-production", sector: "Telecommunications & Media", companies: ["Warner Bros Discovery", "Universal Pictures", "Lionsgate"], opportunities: ["Virtual production", "AI VFX", "Streaming distribution"] },
  { name: "Music Production & Publishing", slug: "music-production", sector: "Telecommunications & Media", companies: ["Universal Music Group", "Sony Music", "Warner Music"], opportunities: ["AI music tools", "Streaming analytics", "NFT/digital collectibles"] },
  { name: "Podcasting & Digital Audio", slug: "podcasting-digital-audio", sector: "Telecommunications & Media", companies: ["Spotify", "Apple Podcasts", "SiriusXM"], opportunities: ["AI transcription", "Dynamic ad insertion", "Audience analytics"] },

  // 🏦 Financial Services
  { name: "Commercial Banking", slug: "commercial-banking", sector: "Financial Services", companies: ["JPMorgan Chase", "Bank of America", "Wells Fargo"], opportunities: ["AI risk assessment", "Digital banking", "Fraud detection AI"] },
  { name: "Investment Banking", slug: "investment-banking", sector: "Financial Services", companies: ["Goldman Sachs", "Morgan Stanley", "Jefferies"], opportunities: ["AI deal sourcing", "Automated research", "Compliance automation"] },
  { name: "Asset Management", slug: "asset-management", sector: "Financial Services", companies: ["BlackRock", "Vanguard", "State Street"], opportunities: ["AI portfolio optimization", "ESG analytics", "Alternative data"] },
  { name: "Insurance Carriers", slug: "insurance-carriers", sector: "Financial Services", companies: ["UnitedHealth Group", "Berkshire Hathaway", "Progressive"], opportunities: ["Claims AI automation", "IoT-based underwriting", "Personalized pricing"] },
  { name: "Fintech Services", slug: "fintech-services", sector: "Financial Services", companies: ["Stripe", "Square", "Plaid"], opportunities: ["Embedded finance", "Open banking", "AI compliance"] },
  { name: "Payment Processing", slug: "payment-processing", sector: "Financial Services", companies: ["Visa", "Mastercard", "PayPal"], opportunities: ["Real-time payments", "Crypto integration", "Fraud AI"] },
  { name: "Mortgage & Consumer Lending", slug: "mortgage-consumer-lending", sector: "Financial Services", companies: ["Rocket Mortgage", "LoanDepot", "SoFi"], opportunities: ["Automated underwriting", "AI document processing", "Personalized rates"] },

  // 🏥 Healthcare & Life Sciences
  { name: "Hospitals", slug: "hospitals", sector: "Healthcare & Life Sciences", companies: ["HCA Healthcare", "CommonSpirit Health", "Ascension"], opportunities: ["Clinical decision AI", "Capacity optimization", "Revenue cycle AI"] },
  { name: "Physician Practices", slug: "physician-practices", sector: "Healthcare & Life Sciences", companies: ["Optum", "DaVita", "Amedisys"], opportunities: ["AI scheduling", "Clinical documentation AI", "Telehealth integration"] },
  { name: "Outpatient & Urgent Care", slug: "outpatient-urgent-care", sector: "Healthcare & Life Sciences", companies: ["CVS MinuteClinic", "CityMD", "MedExpress"], opportunities: ["AI triage", "Patient flow optimization", "Remote monitoring"] },
  { name: "Nursing & Residential Care", slug: "nursing-residential-care", sector: "Healthcare & Life Sciences", companies: ["Brookdale Senior Living", "Kindred Healthcare", "Sabra Health Care"], opportunities: ["Fall detection AI", "Staffing optimization", "Family engagement platforms"] },
];
