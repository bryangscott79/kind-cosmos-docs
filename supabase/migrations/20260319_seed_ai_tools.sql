-- Seed AI Tools from aiToolsSeed.ts
-- Idempotent: uses ON CONFLICT (slug) DO NOTHING

-- 1. ChatGPT (GPT-4o)
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'ChatGPT (GPT-4o)',
  'chatgpt',
  'OpenAI',
  'https://chat.openai.com',
  'foundation_models',
  NULL,
  'OpenAI''s flagship conversational AI powered by GPT-4o, offering multimodal reasoning across text, vision, and audio with broad consumer and enterprise adoption.',
  ARRAY['Multimodal text, image, and audio understanding', 'Advanced reasoning and code generation', 'Web browsing and plugin ecosystem', 'Custom GPTs and assistants', 'Canvas collaborative editing'],
  'freemium',
  'GPT-4o',
  '2025-03-05'::date,
  '[{"version":"GPT-3.5","date":"2022-11-30","highlights":["Initial ChatGPT launch","Conversational interface for GPT-3.5-turbo"]},{"version":"GPT-4","date":"2023-03-14","highlights":["Multimodal input support","Improved reasoning and factuality","Longer context window (8K/32K)"]},{"version":"GPT-4 Turbo","date":"2023-11-06","highlights":["128K context window","Lower pricing","Knowledge cutoff updated to April 2023"]},{"version":"GPT-4o","date":"2024-05-13","highlights":["Native multimodal model (text, vision, audio)","Twice as fast as GPT-4 Turbo","50% cheaper API pricing"]},{"version":"GPT-4o mini","date":"2024-07-18","highlights":["Small efficient model replacing GPT-3.5","Cost-effective for high-volume tasks","128K context"]},{"version":"o1","date":"2024-12-05","highlights":["Advanced reasoning model","Chain-of-thought reasoning","Strong math and science performance"]},{"version":"o3-mini","date":"2025-01-31","highlights":["Efficient reasoning model","Adjustable reasoning effort","Strong coding performance"]},{"version":"GPT-4o (March 2025)","date":"2025-03-05","highlights":["Improved creative writing","Better instruction following","Enhanced tool use"]}]'::jsonb,
  95,
  'dominant',
  ARRAY['Microsoft 365', 'Zapier', 'Slack', 'Bing Search', 'Salesforce', 'Shopify'],
  true,
  ARRAY['llm', 'chatbot', 'multimodal', 'reasoning', 'openai', 'gpt']
) ON CONFLICT (slug) DO NOTHING;

-- 2. Claude
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Claude',
  'claude',
  'Anthropic',
  'https://claude.ai',
  'foundation_models',
  NULL,
  'Anthropic''s AI assistant known for long-context understanding, nuanced analysis, and strong safety alignment, with a 200K token context window.',
  ARRAY['Extended 200K token context window', 'Strong analytical and writing capabilities', 'Vision understanding for images and documents', 'Computer use and tool calling', 'Artifacts for rich content creation'],
  'freemium',
  'Claude 3.5 Sonnet (v2)',
  '2025-02-24'::date,
  '[{"version":"Claude 1.0","date":"2023-03-14","highlights":["Initial public release","100K context window","Constitutional AI alignment"]},{"version":"Claude 2","date":"2023-07-11","highlights":["Improved coding and math","200K context window","Reduced hallucinations"]},{"version":"Claude 3 Opus","date":"2024-03-04","highlights":["Top-tier intelligence and analysis","Vision capabilities","Near-human comprehension"]},{"version":"Claude 3 Sonnet","date":"2024-03-04","highlights":["Balanced speed and intelligence","Strong coding performance","Cost-effective"]},{"version":"Claude 3.5 Sonnet","date":"2024-06-20","highlights":["Surpassed Opus on most benchmarks","Artifacts feature","2x faster than Claude 3 Opus"]},{"version":"Claude 3.5 Sonnet (v2)","date":"2024-10-22","highlights":["Computer use capability","Improved coding and tool use","Enhanced agentic behaviors"]},{"version":"Claude 3.5 Haiku","date":"2024-11-04","highlights":["Fast and cost-effective","Matches Claude 3 Opus performance","Vision support"]},{"version":"Claude 3.7 Sonnet","date":"2025-02-24","highlights":["Extended thinking mode","Hybrid reasoning architecture","Improved agentic coding"]}]'::jsonb,
  88,
  'mature',
  ARRAY['Amazon Bedrock', 'Google Cloud Vertex AI', 'Notion', 'Zapier', 'Slack'],
  true,
  ARRAY['llm', 'chatbot', 'long-context', 'reasoning', 'anthropic', 'safety']
) ON CONFLICT (slug) DO NOTHING;

-- 3. Gemini
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Gemini',
  'gemini',
  'Google DeepMind',
  'https://gemini.google.com',
  'foundation_models',
  NULL,
  'Google DeepMind''s natively multimodal AI model family, deeply integrated across Google products with strong reasoning and a 1M+ token context window.',
  ARRAY['Natively multimodal (text, image, audio, video, code)', '1M+ token context window (Gemini 1.5 Pro)', 'Deep Google Workspace integration', 'Grounding with Google Search', 'Advanced code generation'],
  'freemium',
  'Gemini 2.0 Flash',
  '2025-02-05'::date,
  '[{"version":"Gemini 1.0 Ultra","date":"2023-12-06","highlights":["First model to outperform humans on MMLU","Multimodal reasoning","Available via Bard"]},{"version":"Gemini 1.0 Pro","date":"2023-12-13","highlights":["Balanced performance model","API availability","Google AI Studio support"]},{"version":"Gemini 1.5 Pro","date":"2024-02-15","highlights":["1M token context window","Mixture-of-experts architecture","Near-perfect retrieval"]},{"version":"Gemini 1.5 Flash","date":"2024-05-14","highlights":["Lightweight and fast","Optimized for high-volume tasks","Strong multimodal understanding"]},{"version":"Gemini 2.0 Flash","date":"2025-02-05","highlights":["Improved speed and quality","Native tool use","Multimodal generation capabilities"]}]'::jsonb,
  85,
  'mature',
  ARRAY['Google Workspace', 'Google Cloud', 'Android', 'Google Search', 'Chrome'],
  true,
  ARRAY['llm', 'multimodal', 'google', 'long-context', 'search-grounded']
) ON CONFLICT (slug) DO NOTHING;

-- 4. Llama
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Llama',
  'llama',
  'Meta',
  'https://llama.meta.com',
  'foundation_models',
  NULL,
  'Meta''s open-source large language model family, widely adopted for research, fine-tuning, and self-hosted deployments across the AI ecosystem.',
  ARRAY['Open-weight model for local and cloud deployment', 'Fine-tunable for domain-specific tasks', 'Strong multilingual support', 'Efficient inference on consumer hardware', 'Broad ecosystem of community fine-tunes'],
  'free',
  'Llama 3.3',
  '2024-12-06'::date,
  '[{"version":"Llama 1","date":"2023-02-24","highlights":["Open research release","7B to 65B parameter models","Strong academic benchmarks"]},{"version":"Llama 2","date":"2023-07-18","highlights":["Commercial license","Chat-optimized variants","7B, 13B, 70B parameters"]},{"version":"Llama 3","date":"2024-04-18","highlights":["8B and 70B models","Significantly improved performance","8K context window"]},{"version":"Llama 3.1","date":"2024-07-23","highlights":["405B flagship model","128K context window","Multilingual support in 8 languages"]},{"version":"Llama 3.2","date":"2024-09-25","highlights":["Vision models (11B, 90B)","Lightweight text models (1B, 3B)","Edge deployment support"]},{"version":"Llama 3.3","date":"2024-12-06","highlights":["70B model with near-405B performance","Improved efficiency","Better instruction following"]}]'::jsonb,
  78,
  'mature',
  ARRAY['Hugging Face', 'AWS Bedrock', 'Azure AI', 'Ollama', 'vLLM'],
  true,
  ARRAY['llm', 'open-source', 'self-hosted', 'fine-tunable', 'meta']
) ON CONFLICT (slug) DO NOTHING;

-- 5. Mistral
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Mistral',
  'mistral',
  'Mistral AI',
  'https://mistral.ai',
  'foundation_models',
  NULL,
  'European AI lab producing efficient, high-performance open and commercial language models with strong multilingual capabilities and function calling.',
  ARRAY['Efficient mixture-of-experts architecture', 'Strong multilingual and European language support', 'Function calling and JSON mode', 'Open-weight and commercial models', 'Fine-tuning API'],
  'freemium',
  'Mistral Large 2',
  '2025-01-29'::date,
  '[{"version":"Mistral 7B","date":"2023-09-27","highlights":["Open-weight 7B model","Outperformed Llama 2 13B","Sliding window attention"]},{"version":"Mixtral 8x7B","date":"2023-12-11","highlights":["Mixture-of-experts architecture","Open-weight release","Strong reasoning per parameter"]},{"version":"Mistral Large","date":"2024-02-26","highlights":["Top-tier commercial model","Multi-language support","Function calling"]},{"version":"Mistral Nemo","date":"2024-07-18","highlights":["12B parameter open model","Built with NVIDIA","128K context window"]},{"version":"Mistral Large 2","date":"2024-07-24","highlights":["123B parameters","128K context","Competitive with GPT-4o and Llama 3.1 405B"]},{"version":"Mistral Small","date":"2025-01-29","highlights":["Efficient enterprise model","Low-latency inference","Strong code and reasoning"]}]'::jsonb,
  72,
  'growing',
  ARRAY['Azure AI', 'AWS Bedrock', 'Google Cloud', 'Hugging Face', 'La Plateforme'],
  true,
  ARRAY['llm', 'open-source', 'european', 'efficient', 'multilingual']
) ON CONFLICT (slug) DO NOTHING;

-- 6. Grok
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Grok',
  'grok',
  'xAI',
  'https://x.ai',
  'foundation_models',
  NULL,
  'xAI''s conversational AI model with real-time access to X (Twitter) data and a witty, unfiltered personality, trained on the Colossus supercluster.',
  ARRAY['Real-time X/Twitter data access', 'Image understanding and generation', 'Unfiltered conversational style', 'DeepSearch research capability', 'Think mode for complex reasoning'],
  'paid',
  'Grok 3',
  '2025-02-17'::date,
  '[{"version":"Grok 1","date":"2023-11-04","highlights":["Initial release on X Premium+","Real-time information access","Witty conversational tone"]},{"version":"Grok 1.5","date":"2024-03-28","highlights":["Improved reasoning","128K context window","Enhanced coding ability"]},{"version":"Grok 2","date":"2024-08-13","highlights":["Image understanding","Competitive with GPT-4o","FLUX image generation"]},{"version":"Grok 2 mini","date":"2024-08-13","highlights":["Lightweight variant","Faster responses","Efficient for simple tasks"]},{"version":"Grok 3","date":"2025-02-17","highlights":["Trained on 200K Colossus GPUs","DeepSearch and Think modes","Top benchmark performance"]}]'::jsonb,
  65,
  'growing',
  ARRAY['X (Twitter)', 'X Premium', 'xAI API'],
  true,
  ARRAY['llm', 'chatbot', 'real-time', 'xai', 'social-media']
) ON CONFLICT (slug) DO NOTHING;

-- 7. DeepSeek
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'DeepSeek',
  'deepseek',
  'DeepSeek',
  'https://www.deepseek.com',
  'foundation_models',
  NULL,
  'Chinese AI lab producing highly efficient open-source models with breakthrough reasoning capabilities at a fraction of typical training costs.',
  ARRAY['Open-source with MIT license', 'Advanced reasoning (DeepSeek-R1)', 'Extremely cost-efficient training', 'Multi-head latent attention architecture', 'Strong math and coding performance'],
  'freemium',
  'DeepSeek-R1',
  '2025-01-20'::date,
  '[{"version":"DeepSeek-V1","date":"2024-01-05","highlights":["Initial open-source release","67B MoE model","Competitive coding performance"]},{"version":"DeepSeek-Coder","date":"2024-01-25","highlights":["Code-specialized model","Strong HumanEval scores","Multiple size variants"]},{"version":"DeepSeek-V2","date":"2024-05-06","highlights":["Multi-head latent attention","236B MoE (21B active)","Dramatically lower inference cost"]},{"version":"DeepSeek-V2.5","date":"2024-09-05","highlights":["Merged chat and coder capabilities","Improved writing quality","Better function calling"]},{"version":"DeepSeek-V3","date":"2024-12-26","highlights":["671B MoE model","Trained for $5.6M","Competitive with GPT-4o and Claude 3.5"]},{"version":"DeepSeek-R1","date":"2025-01-20","highlights":["Reasoning model rivaling o1","Open-source with MIT license","Distilled smaller variants available"]}]'::jsonb,
  70,
  'growing',
  ARRAY['Hugging Face', 'Ollama', 'vLLM', 'OpenRouter'],
  true,
  ARRAY['llm', 'open-source', 'reasoning', 'efficient', 'chinese-ai']
) ON CONFLICT (slug) DO NOTHING;

-- 8. Perplexity
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Perplexity',
  'perplexity',
  'Perplexity AI',
  'https://www.perplexity.ai',
  'foundation_models',
  NULL,
  'AI-powered answer engine that combines large language models with real-time web search to provide cited, up-to-date answers to complex questions.',
  ARRAY['Real-time web search with citations', 'Multi-step research with Pro Search', 'Academic and scholarly search', 'Image and file understanding', 'Collections for organizing research'],
  'freemium',
  'Perplexity Pro (Sonar Large)',
  '2025-02-19'::date,
  '[{"version":"Perplexity Ask","date":"2023-01-01","highlights":["Initial AI search engine launch","Basic cited answers","Clean minimal interface"]},{"version":"Perplexity Pro","date":"2023-12-01","highlights":["Pro Search with multi-step reasoning","File upload support","GPT-4 and Claude integration"]},{"version":"Perplexity Pages","date":"2024-05-30","highlights":["AI-generated shareable articles","Visual content integration","Research publishing"]},{"version":"Sonar API","date":"2024-07-01","highlights":["Developer API launch","Grounded search answers via API","Custom integration support"]},{"version":"Perplexity Assistant","date":"2024-11-12","highlights":["Action-taking capabilities","Restaurant booking integration","Shopping and travel help"]},{"version":"Sonar Large (R1 Update)","date":"2025-02-19","highlights":["DeepSeek R1 reasoning integration","Improved citation accuracy","Enhanced research depth"]}]'::jsonb,
  75,
  'growing',
  ARRAY['Chrome Extension', 'iOS/Android', 'Arc Browser', 'Raycast', 'Slack'],
  true,
  ARRAY['search', 'research', 'citations', 'real-time', 'answer-engine']
) ON CONFLICT (slug) DO NOTHING;

-- 9. Midjourney
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Midjourney',
  'midjourney',
  'Midjourney Inc',
  'https://www.midjourney.com',
  'image_generation',
  NULL,
  'Leading AI image generation platform known for its distinctive artistic quality and photorealistic output, accessible via Discord and a dedicated web app.',
  ARRAY['High-quality artistic image generation', 'Photorealistic rendering', 'Style and aspect ratio controls', 'Image variation and upscaling', 'Inpainting and editing'],
  'paid',
  'v6.1',
  '2024-08-01'::date,
  '[{"version":"v3","date":"2022-07-25","highlights":["Improved artistic style","Better text prompt understanding","Community showcase"]},{"version":"v4","date":"2022-11-05","highlights":["Major quality improvement","New model architecture","Better detail rendering"]},{"version":"v5","date":"2023-03-15","highlights":["Photorealistic capabilities","Improved hands and faces","Wider stylistic range"]},{"version":"v5.2","date":"2023-06-22","highlights":["Zoom out feature","Improved aesthetic quality","Stronger stylization controls"]},{"version":"v6","date":"2023-12-21","highlights":["Improved text rendering","Better prompt understanding","Enhanced coherence"]},{"version":"v6.1","date":"2024-08-01","highlights":["Improved image quality","Better personalization","Web editor beta"]}]'::jsonb,
  90,
  'dominant',
  ARRAY['Discord', 'Midjourney Web App', 'Zapier'],
  false,
  ARRAY['image-generation', 'art', 'photorealistic', 'creative', 'discord']
) ON CONFLICT (slug) DO NOTHING;

-- 10. DALL-E 3
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'DALL-E 3',
  'dall-e-3',
  'OpenAI',
  'https://openai.com/dall-e-3',
  'image_generation',
  NULL,
  'OpenAI''s text-to-image model integrated directly into ChatGPT, notable for precise prompt following and text rendering within images.',
  ARRAY['Accurate text rendering in images', 'Precise prompt adherence', 'Integrated into ChatGPT interface', 'Safety mitigations and content policy', 'High-resolution output'],
  'freemium',
  'DALL-E 3',
  '2024-04-03'::date,
  '[{"version":"DALL-E","date":"2021-01-05","highlights":["Initial text-to-image model","256x256 resolution","Zero-shot generation"]},{"version":"DALL-E 2","date":"2022-04-06","highlights":["4x resolution improvement","Inpainting and outpainting","Variations feature"]},{"version":"DALL-E 3","date":"2023-10-03","highlights":["ChatGPT integration","Much better prompt following","Improved text rendering in images"]},{"version":"DALL-E 3 (HD)","date":"2024-01-15","highlights":["Higher resolution options","Wider aspect ratios","Improved consistency"]},{"version":"DALL-E 3 (API Update)","date":"2024-04-03","highlights":["Quality improvements","Better style diversity","Enhanced safety filters"]}]'::jsonb,
  82,
  'mature',
  ARRAY['ChatGPT', 'Microsoft Copilot', 'Bing Image Creator', 'OpenAI API', 'Zapier'],
  true,
  ARRAY['image-generation', 'text-in-images', 'openai', 'chatgpt-integrated']
) ON CONFLICT (slug) DO NOTHING;

-- 11. Stable Diffusion / FLUX
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Stable Diffusion / FLUX',
  'stable-diffusion-flux',
  'Stability AI / Black Forest Labs',
  'https://stability.ai',
  'image_generation',
  NULL,
  'Open-source image generation ecosystem spanning Stable Diffusion and FLUX models, enabling self-hosted, customizable AI image creation with LoRA and ControlNet.',
  ARRAY['Open-source and self-hostable', 'LoRA fine-tuning for custom styles', 'ControlNet for precise composition', 'Large community model ecosystem', 'Inpainting, outpainting, and img2img'],
  'free',
  'FLUX.1 Pro',
  '2024-08-01'::date,
  '[{"version":"Stable Diffusion 1.5","date":"2022-10-20","highlights":["Widely adopted open model","Extensive community ecosystem","LoRA and textual inversion support"]},{"version":"Stable Diffusion 2.0","date":"2022-11-24","highlights":["New text encoder","768px generation","Depth-to-image model"]},{"version":"Stable Diffusion XL","date":"2023-07-26","highlights":["1024px native resolution","Two-stage architecture","Improved aesthetics"]},{"version":"SDXL Turbo","date":"2023-11-28","highlights":["Real-time generation","Adversarial diffusion distillation","Single-step inference"]},{"version":"Stable Diffusion 3","date":"2024-06-12","highlights":["Multimodal Diffusion Transformer","Improved text rendering","Flow matching training"]},{"version":"FLUX.1 Pro","date":"2024-08-01","highlights":["By ex-Stability AI team","State-of-the-art quality","Strong prompt adherence"]}]'::jsonb,
  80,
  'mature',
  ARRAY['ComfyUI', 'Automatic1111', 'Hugging Face', 'Replicate', 'RunPod'],
  true,
  ARRAY['image-generation', 'open-source', 'self-hosted', 'lora', 'community']
) ON CONFLICT (slug) DO NOTHING;

-- 12. Adobe Firefly
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Adobe Firefly',
  'adobe-firefly',
  'Adobe',
  'https://www.adobe.com/products/firefly.html',
  'image_generation',
  NULL,
  'Adobe''s commercially safe generative AI model trained on licensed content, integrated across Creative Cloud apps for professional creative workflows.',
  ARRAY['Commercially safe (trained on licensed data)', 'Generative Fill in Photoshop', 'Text effects and vector generation', 'Style reference matching', 'Deep Creative Cloud integration'],
  'freemium',
  'Firefly Image 3',
  '2024-09-11'::date,
  '[{"version":"Firefly Image 1","date":"2023-03-21","highlights":["Initial beta launch","Trained on Adobe Stock licensed content","Text-to-image generation"]},{"version":"Firefly Image 1 (GA)","date":"2023-09-13","highlights":["General availability","Photoshop Generative Fill integration","Content Credentials"]},{"version":"Firefly Image 2","date":"2023-10-10","highlights":["Higher quality output","Better people rendering","Improved photorealism"]},{"version":"Firefly Vector","date":"2024-04-01","highlights":["Generate editable SVG vectors","Illustrator integration","Pattern generation"]},{"version":"Firefly Image 3","date":"2024-09-11","highlights":["Photorealistic lighting","Structure reference","Style reference improvements"]}]'::jsonb,
  78,
  'mature',
  ARRAY['Photoshop', 'Illustrator', 'Adobe Express', 'Premiere Pro', 'InDesign'],
  true,
  ARRAY['image-generation', 'commercial-safe', 'adobe', 'creative-cloud', 'professional']
) ON CONFLICT (slug) DO NOTHING;

-- 13. Ideogram
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Ideogram',
  'ideogram',
  'Ideogram',
  'https://ideogram.ai',
  'image_generation',
  NULL,
  'AI image generator notable for exceptional text rendering in images and strong graphic design capabilities, popular for logos, posters, and typography-heavy art.',
  ARRAY['Industry-leading text rendering in images', 'Logo and graphic design generation', 'Style consistency controls', 'Magic Prompt enhancement', 'Multiple aspect ratios and resolutions'],
  'freemium',
  'Ideogram 2.0',
  '2024-11-19'::date,
  '[{"version":"Ideogram 1.0","date":"2023-08-22","highlights":["Launch with superior text rendering","Free tier availability","Multiple style presets"]},{"version":"Ideogram 1.1","date":"2024-02-28","highlights":["Improved image quality","Better prompt understanding","Enhanced Magic Prompt"]},{"version":"Ideogram 1.2","date":"2024-06-01","highlights":["More coherent compositions","Reduced artifacts","Faster generation"]},{"version":"Ideogram 2.0","date":"2024-11-19","highlights":["Major quality leap","Better photorealism","Improved typography accuracy"]}]'::jsonb,
  68,
  'growing',
  ARRAY['Web App', 'iOS App', 'API Access'],
  true,
  ARRAY['image-generation', 'typography', 'text-in-images', 'logos', 'design']
) ON CONFLICT (slug) DO NOTHING;

-- 14. Leonardo AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Leonardo AI',
  'leonardo-ai',
  'Leonardo Interactive',
  'https://leonardo.ai',
  'image_generation',
  NULL,
  'AI creative platform for generating production-quality visual assets including game art, concept designs, and marketing materials with fine-grained control.',
  ARRAY['Production-quality asset generation', 'Fine-tuned model training', 'Alchemy pipeline for enhanced quality', 'Real-time canvas editing', 'Motion generation for animations'],
  'freemium',
  'Phoenix 1.0',
  '2024-10-15'::date,
  '[{"version":"Leonardo Beta","date":"2023-01-15","highlights":["Public beta launch","Community fine-tuned models","Game asset generation"]},{"version":"Leonardo v1","date":"2023-07-01","highlights":["General availability","Alchemy v1 upscaler","Image guidance tools"]},{"version":"Leonardo Motion","date":"2024-02-20","highlights":["Image-to-video generation","Animated asset creation","Motion strength controls"]},{"version":"Leonardo Realtime","date":"2024-06-01","highlights":["Real-time generation canvas","Interactive editing","Style transfer"]},{"version":"Phoenix 1.0","date":"2024-10-15","highlights":["New foundation model","Superior prompt adherence","Better text rendering"]}]'::jsonb,
  65,
  'growing',
  ARRAY['Web App', 'API', 'Zapier', 'Discord'],
  true,
  ARRAY['image-generation', 'game-assets', 'creative', 'fine-tuning', 'production']
) ON CONFLICT (slug) DO NOTHING;

-- 15. Runway
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Runway',
  'runway',
  'Runway ML',
  'https://runwayml.com',
  'video_generation',
  NULL,
  'Pioneering AI video generation platform offering text-to-video, image-to-video, and comprehensive editing tools trusted by professional filmmakers and studios.',
  ARRAY['Text-to-video and image-to-video generation', 'Gen-3 Alpha with cinematic quality', 'Video inpainting and green screen removal', 'Motion brush for precise animation control', 'Multi-modal AI editing tools'],
  'freemium',
  'Gen-3 Alpha Turbo',
  '2024-12-10'::date,
  '[{"version":"Gen-1","date":"2023-02-06","highlights":["Video-to-video generation","Style transfer for video","First commercial text-driven video editing"]},{"version":"Gen-2","date":"2023-06-07","highlights":["Text-to-video generation","4-second clip generation","Motion controls"]},{"version":"Gen-2 (Extended)","date":"2023-11-01","highlights":["16-second generation","Motion brush tool","Improved temporal consistency"]},{"version":"Gen-3 Alpha","date":"2024-06-17","highlights":["Major quality leap","Better temporal coherence","Cinematic-quality output"]},{"version":"Gen-3 Alpha Turbo","date":"2024-08-05","highlights":["7x faster generation","Lower cost per generation","Camera control support"]},{"version":"Frames (Gen-3)","date":"2024-12-10","highlights":["Image generation model","Style-consistent frames","Enhanced cinematic looks"]}]'::jsonb,
  85,
  'mature',
  ARRAY['Web Editor', 'API', 'Premiere Pro Plugin', 'Zapier'],
  true,
  ARRAY['video-generation', 'filmmaking', 'vfx', 'editing', 'professional']
) ON CONFLICT (slug) DO NOTHING;

-- 16. Kling
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Kling',
  'kling',
  'Kuaishou',
  'https://klingai.com',
  'video_generation',
  NULL,
  'Chinese AI video generation model producing high-quality, long-duration videos with realistic physics simulation and strong motion understanding.',
  ARRAY['Up to 2-minute video generation', 'Realistic physics simulation', 'Strong human motion generation', 'Image-to-video and text-to-video', 'Multiple aspect ratios and resolutions'],
  'freemium',
  'Kling 1.6',
  '2025-01-15'::date,
  '[{"version":"Kling 1.0","date":"2024-06-06","highlights":["Initial release in China","120-second video generation","1080p resolution support"]},{"version":"Kling 1.0 (Global)","date":"2024-07-26","highlights":["International availability","Web-based interface","English prompt support"]},{"version":"Kling 1.5","date":"2024-10-24","highlights":["Improved motion quality","Better text-to-video coherence","Camera motion controls"]},{"version":"Kling 1.6","date":"2025-01-15","highlights":["Enhanced resolution","Improved face generation","Better prompt adherence"]}]'::jsonb,
  72,
  'growing',
  ARRAY['Web App', 'API', 'Mobile App'],
  true,
  ARRAY['video-generation', 'long-form', 'physics', 'chinese-ai']
) ON CONFLICT (slug) DO NOTHING;

-- 17. Pika
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Pika',
  'pika',
  'Pika Labs',
  'https://pika.art',
  'video_generation',
  NULL,
  'AI video creation platform focused on creative video effects, lip-sync, and accessible short-form video generation from text and images.',
  ARRAY['Creative video effects and scene modification', 'Lip-sync video generation', 'Text-to-video and image-to-video', 'Video extension and looping', 'Sound effects generation'],
  'freemium',
  'Pika 2.0',
  '2025-01-09'::date,
  '[{"version":"Pika Beta","date":"2023-06-29","highlights":["Discord-based beta launch","Text-to-video generation","Community-driven development"]},{"version":"Pika 1.0","date":"2023-11-28","highlights":["Web app launch","Improved video quality","Canvas editing tools"]},{"version":"Pika 1.5","date":"2024-08-06","highlights":["Lip-sync feature","Sound effects generation","Pikaffects creative tools"]},{"version":"Pika 2.0","date":"2025-01-09","highlights":["Scene Ingredients for precise control","Upgraded video quality","Improved motion coherence"]}]'::jsonb,
  68,
  'growing',
  ARRAY['Web App', 'Discord', 'iOS App'],
  false,
  ARRAY['video-generation', 'creative-effects', 'lip-sync', 'short-form']
) ON CONFLICT (slug) DO NOTHING;

-- 18. Sora
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Sora',
  'sora',
  'OpenAI',
  'https://sora.com',
  'video_generation',
  NULL,
  'OpenAI''s video generation model capable of producing realistic and imaginative scenes from text instructions with strong temporal coherence and world simulation.',
  ARRAY['Text-to-video up to 20 seconds', 'High temporal coherence and consistency', 'World simulation and physics understanding', 'Storyboard and remix tools', 'Multiple resolution and aspect ratio support'],
  'paid',
  'Sora',
  '2024-12-09'::date,
  '[{"version":"Sora (Preview)","date":"2024-02-15","highlights":["Research preview announcement","60-second realistic video demos","World model simulation approach"]},{"version":"Sora (Limited Launch)","date":"2024-12-09","highlights":["ChatGPT Plus/Pro integration","Up to 20-second generation","Storyboard and Remix features"]},{"version":"Sora (Expanded Access)","date":"2025-01-15","highlights":["Broader availability","Improved generation quality","Enhanced editing controls"]}]'::jsonb,
  78,
  'growing',
  ARRAY['ChatGPT', 'OpenAI API'],
  true,
  ARRAY['video-generation', 'world-simulation', 'openai', 'cinematic']
) ON CONFLICT (slug) DO NOTHING;

-- 19. Luma Dream Machine
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Luma Dream Machine',
  'luma-dream-machine',
  'Luma AI',
  'https://lumalabs.ai/dream-machine',
  'video_generation',
  NULL,
  'AI video generation model from Luma AI specializing in realistic motion, camera movements, and 3D-consistent video generation from text and image prompts.',
  ARRAY['Realistic motion generation', 'Camera movement controls', '3D-consistent output', 'Image-to-video animation', 'Fast generation times'],
  'freemium',
  'Dream Machine 1.6',
  '2024-12-16'::date,
  '[{"version":"Dream Machine 1.0","date":"2024-06-12","highlights":["Public launch","120-frame video generation","Free tier availability"]},{"version":"Dream Machine 1.5","date":"2024-09-17","highlights":["Enhanced resolution and quality","Camera motion controls","Keyframe support"]},{"version":"Ray2","date":"2024-11-13","highlights":["New architecture for improved quality","Better physics understanding","Longer generations"]},{"version":"Dream Machine 1.6","date":"2024-12-16","highlights":["Improved realism","Better character consistency","Extended duration support"]}]'::jsonb,
  65,
  'growing',
  ARRAY['Web App', 'API', 'iOS App'],
  true,
  ARRAY['video-generation', '3d-consistent', 'camera-control', 'motion']
) ON CONFLICT (slug) DO NOTHING;

-- 20. Veo
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Veo',
  'veo',
  'Google DeepMind',
  'https://deepmind.google/technologies/veo',
  'video_generation',
  NULL,
  'Google DeepMind''s high-fidelity video generation model producing 1080p+ cinematic video with accurate physics and support for various styles.',
  ARRAY['High-fidelity 1080p+ video generation', 'Cinematic camera controls', 'Accurate physics and lighting', 'Diverse creative styles', 'Integration with Google AI ecosystem'],
  'paid',
  'Veo 2',
  '2024-12-16'::date,
  '[{"version":"Veo 1","date":"2024-05-14","highlights":["Announced at Google I/O","1080p resolution output","Text-to-video with cinematic quality"]},{"version":"Veo 2","date":"2024-12-16","highlights":["Significant quality improvement","Better physics simulation","Available in VideoFX"]}]'::jsonb,
  60,
  'emerging',
  ARRAY['VideoFX', 'Google AI Studio', 'YouTube Shorts'],
  true,
  ARRAY['video-generation', 'google', 'cinematic', 'high-fidelity']
) ON CONFLICT (slug) DO NOTHING;

-- 21. HeyGen
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'HeyGen',
  'heygen',
  'HeyGen',
  'https://www.heygen.com',
  'video_generation',
  NULL,
  'AI video platform specializing in talking avatar videos for business communication, enabling scalable personalized video creation with AI-generated presenters.',
  ARRAY['Realistic AI avatar presenters', 'Text-to-speech in 175+ languages', 'Video translation with lip-sync', 'Custom avatar creation', 'Template-based video creation'],
  'freemium',
  'Avatar 4.0',
  '2025-01-20'::date,
  '[{"version":"HeyGen 1.0","date":"2023-01-01","highlights":["AI avatar video platform launch","80+ AI avatars","Text-to-video creation"]},{"version":"Instant Avatar","date":"2023-06-15","highlights":["Custom avatar from 2-minute video","Personal avatar creation","Brand consistency"]},{"version":"Video Translate","date":"2024-01-22","highlights":["AI video translation","Lip-sync in target language","175+ language support"]},{"version":"Streaming Avatar","date":"2024-06-01","highlights":["Real-time interactive avatars","API for developers","Low-latency responses"]},{"version":"Avatar 4.0","date":"2025-01-20","highlights":["Ultra-realistic expressions","Full-body movement","Improved lip synchronization"]}]'::jsonb,
  70,
  'growing',
  ARRAY['Zapier', 'HubSpot', 'Salesforce', 'Canva', 'API'],
  true,
  ARRAY['video-generation', 'avatars', 'business-video', 'localization', 'marketing']
) ON CONFLICT (slug) DO NOTHING;

-- 22. ElevenLabs
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'ElevenLabs',
  'elevenlabs',
  'ElevenLabs',
  'https://elevenlabs.io',
  'audio_voice',
  NULL,
  'Industry-leading AI voice platform offering hyper-realistic text-to-speech, voice cloning, and dubbing in 32 languages for content creators and enterprises.',
  ARRAY['Hyper-realistic text-to-speech', 'Voice cloning from short samples', 'Real-time voice conversion', 'AI dubbing in 32 languages', 'Voice library marketplace'],
  'freemium',
  'Turbo v2.5',
  '2024-12-01'::date,
  '[{"version":"v1","date":"2023-01-23","highlights":["Launch with speech synthesis","Voice cloning capability","English language support"]},{"version":"Multilingual v1","date":"2023-06-01","highlights":["28 language support","Cross-language voice cloning","Improved naturalness"]},{"version":"Turbo v2","date":"2024-01-05","highlights":["3x faster generation","Lower latency streaming","Improved emotional range"]},{"version":"Multilingual v2","date":"2024-03-20","highlights":["32 languages","Better accent handling","Improved prosody"]},{"version":"Voice Isolator","date":"2024-06-15","highlights":["Audio separation tool","Background noise removal","Studio-quality isolation"]},{"version":"Turbo v2.5","date":"2024-12-01","highlights":["Even lower latency","Improved naturalness","Better long-form narration"]}]'::jsonb,
  85,
  'mature',
  ARRAY['API', 'Zapier', 'Unity', 'Unreal Engine', 'Speechify'],
  true,
  ARRAY['tts', 'voice-cloning', 'dubbing', 'multilingual', 'narration']
) ON CONFLICT (slug) DO NOTHING;

-- 23. Suno
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Suno',
  'suno',
  'Suno AI',
  'https://suno.com',
  'audio_voice',
  NULL,
  'AI music generation platform that creates full songs with vocals, instruments, and lyrics from text prompts, making music creation accessible to everyone.',
  ARRAY['Full song generation with vocals', 'Custom lyrics and style control', 'Multiple genre support', 'Instrumental track generation', 'Song extension and variation'],
  'freemium',
  'Suno v4',
  '2024-11-22'::date,
  '[{"version":"Suno v1","date":"2023-09-20","highlights":["Initial music generation","Text-to-song capability","Discord-based interface"]},{"version":"Suno v2","date":"2023-12-20","highlights":["Improved vocal quality","Better instrument separation","Longer generation"]},{"version":"Suno v3","date":"2024-03-22","highlights":["Full-length songs up to 2 minutes","Radio-quality output","Custom lyrics support"]},{"version":"Suno v3.5","date":"2024-07-10","highlights":["4-minute song generation","Improved vocal expression","Better genre control"]},{"version":"Suno v4","date":"2024-11-22","highlights":["Higher audio fidelity","More realistic vocals","Improved lyric adherence"]}]'::jsonb,
  75,
  'growing',
  ARRAY['Web App', 'Microsoft Copilot', 'iOS/Android App'],
  true,
  ARRAY['music-generation', 'vocals', 'songwriting', 'creative']
) ON CONFLICT (slug) DO NOTHING;

-- 24. Udio
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Udio',
  'udio',
  'Udio',
  'https://www.udio.com',
  'audio_voice',
  NULL,
  'AI music creation platform producing studio-quality songs with nuanced vocal performance, diverse genre support, and remix capabilities.',
  ARRAY['Studio-quality music generation', 'Nuanced vocal performances', 'Genre-specific style control', 'Track remixing and extension', 'Audio-to-audio transformation'],
  'freemium',
  'Udio v1.5',
  '2024-12-10'::date,
  '[{"version":"Udio Beta","date":"2024-04-10","highlights":["Public beta launch","High-quality music generation","Diverse genre support"]},{"version":"Udio v1","date":"2024-06-12","highlights":["Audio inpainting","Song extension tools","Improved vocal clarity"]},{"version":"Udio v1.5","date":"2024-12-10","highlights":["Enhanced audio quality","Remix feature","Better long-form generation"]}]'::jsonb,
  65,
  'growing',
  ARRAY['Web App', 'API'],
  true,
  ARRAY['music-generation', 'studio-quality', 'remix', 'creative']
) ON CONFLICT (slug) DO NOTHING;

-- 25. Descript
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Descript',
  'descript',
  'Descript',
  'https://www.descript.com',
  'audio_voice',
  NULL,
  'AI-powered audio and video editor that treats media like a document, offering text-based editing, voice cloning, and automatic transcription for podcasters and creators.',
  ARRAY['Text-based audio/video editing', 'AI voice cloning (Overdub)', 'Automatic transcription', 'Filler word and silence removal', 'Screen recording and publishing'],
  'freemium',
  'Descript 80',
  '2025-01-10'::date,
  '[{"version":"Descript 1.0","date":"2019-10-01","highlights":["Text-based audio editing launch","Automatic transcription","Word-level editing"]},{"version":"Overdub","date":"2021-01-15","highlights":["AI voice cloning feature","Text-to-speech in your voice","Script correction"]},{"version":"Descript (Video)","date":"2022-06-01","highlights":["Full video editing support","Screen recording","Remote recording"]},{"version":"Underlord AI","date":"2023-09-20","highlights":["AI editing assistant","Auto-cut silences and filler words","AI summaries and show notes"]},{"version":"Descript 80","date":"2025-01-10","highlights":["Improved AI editing workflows","Enhanced transcription accuracy","Better collaboration tools"]}]'::jsonb,
  78,
  'mature',
  ARRAY['YouTube', 'Spotify', 'Apple Podcasts', 'Zapier', 'Slack'],
  false,
  ARRAY['audio-editing', 'video-editing', 'podcasting', 'transcription', 'voice-cloning']
) ON CONFLICT (slug) DO NOTHING;

-- 26. Murf AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Murf AI',
  'murf-ai',
  'Murf',
  'https://murf.ai',
  'audio_voice',
  NULL,
  'Enterprise-grade AI voice generator for creating lifelike voiceovers for e-learning, marketing, and product content with 120+ voices across 20 languages.',
  ARRAY['120+ lifelike AI voices', '20+ language support', 'Voice cloning for brands', 'Pitch, speed, and emphasis control', 'Integration with video editors'],
  'freemium',
  'Murf 2.0',
  '2024-09-01'::date,
  '[{"version":"Murf 1.0","date":"2022-06-01","highlights":["AI voiceover platform launch","50+ AI voices","Studio editing interface"]},{"version":"Murf Enterprise","date":"2023-03-15","highlights":["Enterprise features","Custom voice cloning","Team collaboration"]},{"version":"Murf 1.5","date":"2023-10-01","highlights":["100+ voices","Improved naturalness","API access"]},{"version":"Murf 2.0","date":"2024-09-01","highlights":["Next-gen voice quality","120+ voices","Enhanced emotion controls"]}]'::jsonb,
  62,
  'growing',
  ARRAY['Canva', 'Google Slides', 'API', 'Zapier'],
  true,
  ARRAY['tts', 'voiceover', 'e-learning', 'enterprise', 'multilingual']
) ON CONFLICT (slug) DO NOTHING;

-- 27. PlayHT
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'PlayHT',
  'playht',
  'PlayHT',
  'https://play.ht',
  'audio_voice',
  NULL,
  'AI voice generator and text-to-speech platform offering ultra-realistic voices with emotional range, voice cloning, and real-time streaming for developers.',
  ARRAY['Ultra-realistic voice generation', 'Instant voice cloning', 'Real-time streaming TTS', 'Emotional speech synthesis', 'Developer-friendly API'],
  'freemium',
  'PlayHT 3.0',
  '2024-11-15'::date,
  '[{"version":"PlayHT 1.0","date":"2022-01-01","highlights":["Text-to-speech platform launch","Multiple voice options","Basic customization"]},{"version":"PlayHT 2.0","date":"2023-05-15","highlights":["Next-gen voice quality","Voice cloning","Real-time streaming"]},{"version":"PlayHT 2.5","date":"2024-03-01","highlights":["Emotional speech controls","Improved latency","Multi-language expansion"]},{"version":"PlayHT 3.0","date":"2024-11-15","highlights":["Ultra-low latency","Enhanced naturalness","Conversational AI voice support"]}]'::jsonb,
  60,
  'growing',
  ARRAY['API', 'Zapier', 'WordPress', 'Medium'],
  true,
  ARRAY['tts', 'voice-cloning', 'streaming', 'developer', 'conversational']
) ON CONFLICT (slug) DO NOTHING;

-- 28. GitHub Copilot
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'GitHub Copilot',
  'github-copilot',
  'GitHub / Microsoft',
  'https://github.com/features/copilot',
  'code_developer',
  NULL,
  'AI pair programmer integrated into popular IDEs, providing real-time code suggestions, chat-based assistance, and workspace-aware code generation powered by OpenAI models.',
  ARRAY['Real-time inline code completions', 'Chat-based code assistance', 'Workspace-aware context understanding', 'Multi-file editing suggestions', 'CLI and terminal integration'],
  'paid',
  'Copilot (GPT-4o + o1)',
  '2025-02-04'::date,
  '[{"version":"Copilot (Codex)","date":"2022-06-21","highlights":["General availability","VS Code integration","Real-time code suggestions"]},{"version":"Copilot Chat","date":"2023-07-20","highlights":["Conversational coding assistant","Explain and fix code","Inline chat in editor"]},{"version":"Copilot Enterprise","date":"2024-02-27","highlights":["Organization knowledge base","Pull request summaries","Docset indexing"]},{"version":"Copilot Workspace","date":"2024-04-29","highlights":["Task-driven development environment","Spec to implementation flow","Multi-file code generation"]},{"version":"Copilot (Multi-model)","date":"2024-10-29","highlights":["Claude 3.5 Sonnet support","Model selection in chat","Gemini integration"]},{"version":"Copilot (Agent Mode)","date":"2025-02-04","highlights":["Agentic coding in VS Code","Auto terminal commands","Self-healing code fixes"]}]'::jsonb,
  92,
  'dominant',
  ARRAY['VS Code', 'JetBrains', 'Neovim', 'Visual Studio', 'GitHub', 'CLI'],
  true,
  ARRAY['code-assistant', 'ide-integration', 'pair-programming', 'microsoft', 'github']
) ON CONFLICT (slug) DO NOTHING;

-- 29. Cursor
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Cursor',
  'cursor',
  'Anysphere',
  'https://cursor.com',
  'code_developer',
  NULL,
  'AI-first code editor built on VS Code, offering deep codebase understanding, multi-file editing, and conversational coding with frontier model integration.',
  ARRAY['Codebase-aware AI assistance', 'Multi-file editing (Composer)', 'Inline and chat-based generation', 'Tab-based code predictions', 'Custom model selection (GPT-4o, Claude, etc.)'],
  'freemium',
  'Cursor 0.45',
  '2025-02-20'::date,
  '[{"version":"Cursor 0.1","date":"2023-03-14","highlights":["Initial launch as AI code editor","GPT-4 integration","Chat and inline editing"]},{"version":"Cursor 0.20","date":"2023-10-01","highlights":["Codebase indexing","Multi-file context","Improved completions"]},{"version":"Cursor 0.30","date":"2024-05-01","highlights":["Composer multi-file editing","Claude integration","Tab predictions"]},{"version":"Cursor 0.40","date":"2024-09-10","highlights":["Background agent","Improved codebase understanding","Bug finder"]},{"version":"Cursor 0.45","date":"2025-02-20","highlights":["Enhanced Composer","Max mode with o1/o3-mini","Better context retrieval"]}]'::jsonb,
  82,
  'growing',
  ARRAY['VS Code Extensions', 'GitHub', 'GitLab', 'Terminal'],
  false,
  ARRAY['code-editor', 'ai-native', 'multi-file', 'vs-code-fork']
) ON CONFLICT (slug) DO NOTHING;

-- 30. Claude Code
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Claude Code',
  'claude-code',
  'Anthropic',
  'https://docs.anthropic.com/en/docs/claude-code',
  'code_developer',
  NULL,
  'Anthropic''s agentic CLI coding tool that understands entire codebases, executes multi-step development tasks, and integrates directly into terminal workflows.',
  ARRAY['Agentic multi-step coding tasks', 'Full codebase understanding', 'Terminal-native CLI interface', 'Git-aware operations', 'Tool use and file editing'],
  'paid',
  'Claude Code (GA)',
  '2025-02-24'::date,
  '[{"version":"Claude Code (Research Preview)","date":"2025-02-24","highlights":["Initial launch with Claude 3.7 Sonnet","Agentic CLI tool","Codebase-wide understanding"]},{"version":"Claude Code (GA)","date":"2025-02-24","highlights":["General availability","Extended thinking for complex tasks","Git integration"]}]'::jsonb,
  78,
  'growing',
  ARRAY['Terminal/CLI', 'Git', 'GitHub', 'VS Code (via extension)'],
  false,
  ARRAY['code-assistant', 'cli', 'agentic', 'anthropic', 'terminal']
) ON CONFLICT (slug) DO NOTHING;

-- 31. Replit
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Replit',
  'replit',
  'Replit',
  'https://replit.com',
  'code_developer',
  NULL,
  'Cloud-based IDE with built-in AI coding assistant, enabling rapid application development, deployment, and collaboration with natural language programming.',
  ARRAY['Browser-based IDE with AI coding', 'Natural language app generation', 'One-click deployment and hosting', 'Real-time collaboration', 'AI code completion and debugging'],
  'freemium',
  'Replit Agent',
  '2024-09-10'::date,
  '[{"version":"Replit (Classic)","date":"2018-01-01","highlights":["Browser-based IDE","Multi-language support","Multiplayer editing"]},{"version":"Ghostwriter","date":"2022-10-03","highlights":["AI code completion","Explain code feature","Generate functions"]},{"version":"Replit AI","date":"2023-09-19","highlights":["Chat-based coding assistant","AI debugging","Code transformation"]},{"version":"Replit Agent","date":"2024-09-10","highlights":["Autonomous app building from prompts","Environment setup and deployment","Multi-step task execution"]}]'::jsonb,
  72,
  'growing',
  ARRAY['GitHub', 'Google Cloud', 'Nix', 'Custom Domains'],
  true,
  ARRAY['cloud-ide', 'deployment', 'collaboration', 'no-setup', 'ai-agent']
) ON CONFLICT (slug) DO NOTHING;

-- 32. v0
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'v0',
  'v0',
  'Vercel',
  'https://v0.dev',
  'code_developer',
  NULL,
  'Vercel''s AI-powered UI generation tool that creates React components and full-page layouts from text prompts and screenshots using shadcn/ui and Tailwind CSS.',
  ARRAY['Text-to-UI component generation', 'Screenshot-to-code conversion', 'shadcn/ui and Tailwind CSS output', 'Interactive preview and iteration', 'One-click deployment to Vercel'],
  'freemium',
  'v0 (2025)',
  '2025-01-15'::date,
  '[{"version":"v0 Alpha","date":"2023-10-12","highlights":["Initial alpha launch","Text-to-UI generation","React + Tailwind output"]},{"version":"v0 Beta","date":"2024-03-01","highlights":["Public beta","Improved code quality","Image input support"]},{"version":"v0 (GA)","date":"2024-10-08","highlights":["General availability","Full-page generation","Vercel deployment integration"]},{"version":"v0 (2025)","date":"2025-01-15","highlights":["Enhanced multi-page apps","Better iteration workflows","Improved component quality"]}]'::jsonb,
  70,
  'growing',
  ARRAY['Vercel', 'Next.js', 'shadcn/ui', 'Tailwind CSS', 'GitHub'],
  false,
  ARRAY['ui-generation', 'react', 'tailwind', 'frontend', 'vercel']
) ON CONFLICT (slug) DO NOTHING;

-- 33. Bolt
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Bolt',
  'bolt',
  'StackBlitz',
  'https://bolt.new',
  'code_developer',
  NULL,
  'StackBlitz''s AI-powered full-stack web development tool that builds, runs, and deploys applications entirely in the browser using WebContainers.',
  ARRAY['Full-stack app generation from prompts', 'In-browser WebContainer execution', 'Real-time preview and editing', 'NPM package installation in browser', 'One-click deployment'],
  'freemium',
  'Bolt.new',
  '2024-10-02'::date,
  '[{"version":"Bolt.new (Launch)","date":"2024-10-02","highlights":["Full-stack AI development in browser","WebContainer-powered execution","Claude integration"]},{"version":"Bolt.new (Multi-model)","date":"2024-12-01","highlights":["GPT-4o and Gemini support","Improved error recovery","Better file management"]},{"version":"Bolt.new (2025)","date":"2025-01-20","highlights":["Enhanced debugging","Git integration","Improved multi-file handling"]}]'::jsonb,
  65,
  'growing',
  ARRAY['Netlify', 'WebContainers', 'NPM', 'GitHub'],
  false,
  ARRAY['full-stack', 'browser-ide', 'webcontainers', 'deployment', 'ai-coding']
) ON CONFLICT (slug) DO NOTHING;

-- 34. Windsurf
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Windsurf',
  'windsurf',
  'Codeium',
  'https://codeium.com/windsurf',
  'code_developer',
  NULL,
  'Codeium''s AI-native IDE combining copilot and agentic coding capabilities with deep codebase awareness and Cascade multi-step reasoning.',
  ARRAY['Cascade multi-step agentic coding', 'Deep codebase awareness', 'Inline completions and chat', 'Multi-file editing and refactoring', 'Terminal command suggestions'],
  'freemium',
  'Windsurf (GA)',
  '2024-11-12'::date,
  '[{"version":"Codeium (Extension)","date":"2022-12-01","highlights":["Free AI code completion","Multi-IDE support","70+ language support"]},{"version":"Codeium Enterprise","date":"2023-11-01","highlights":["Self-hosted deployment","Custom model fine-tuning","Code search"]},{"version":"Windsurf (Launch)","date":"2024-11-12","highlights":["AI-native IDE launch","Cascade agentic flows","Deep codebase understanding"]},{"version":"Windsurf (GA)","date":"2024-11-12","highlights":["General availability","VS Code extension ecosystem","Multi-model support"]}]'::jsonb,
  68,
  'growing',
  ARRAY['VS Code Extensions', 'Git', 'GitHub', 'Terminal'],
  false,
  ARRAY['code-editor', 'ai-native', 'agentic', 'cascade', 'codeium']
) ON CONFLICT (slug) DO NOTHING;

-- 35. Zapier AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Zapier AI',
  'zapier-ai',
  'Zapier',
  'https://zapier.com',
  'business_automation',
  NULL,
  'Zapier''s AI-enhanced automation platform connecting 7,000+ apps with natural language workflow creation, AI-powered actions, and intelligent data transformation.',
  ARRAY['Natural language workflow creation', '7,000+ app integrations', 'AI-powered data transformation', 'Chatbots and AI interfaces', 'Canvas visual workflow builder'],
  'freemium',
  'Zapier AI (2025)',
  '2025-01-15'::date,
  '[{"version":"Zapier (Classic)","date":"2012-01-01","highlights":["Workflow automation launch","App-to-app connections","Trigger-action model"]},{"version":"Zapier AI Actions","date":"2023-03-16","highlights":["AI-powered actions in workflows","Natural language automation","ChatGPT plugin"]},{"version":"Zapier Chatbots","date":"2023-11-01","highlights":["Custom AI chatbot builder","Knowledge base integration","Lead capture bots"]},{"version":"Zapier Canvas","date":"2024-10-09","highlights":["Visual automation diagramming","AI-assisted workflow design","Process mapping"]},{"version":"Zapier AI (2025)","date":"2025-01-15","highlights":["Enhanced AI data handling","Improved natural language controls","Agent-based workflows"]}]'::jsonb,
  85,
  'mature',
  ARRAY['Gmail', 'Slack', 'Salesforce', 'Google Sheets', 'HubSpot', 'Notion'],
  true,
  ARRAY['automation', 'no-code', 'integration', 'workflows', 'ai-actions']
) ON CONFLICT (slug) DO NOTHING;

-- 36. Make (Integromat)
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Make (Integromat)',
  'make',
  'Make / Celonis',
  'https://www.make.com',
  'business_automation',
  NULL,
  'Visual workflow automation platform with powerful data manipulation, conditional logic, and AI integrations for building complex business processes without code.',
  ARRAY['Visual scenario builder', 'Advanced data manipulation and routing', 'AI module integrations (OpenAI, Claude)', 'Error handling and iteration', 'Real-time and scheduled execution'],
  'freemium',
  'Make (2025)',
  '2025-02-01'::date,
  '[{"version":"Integromat","date":"2016-01-01","highlights":["Visual automation platform launch","Complex scenario builder","Data manipulation tools"]},{"version":"Make (Rebrand)","date":"2022-02-08","highlights":["Rebrand from Integromat","Updated interface","Enhanced marketplace"]},{"version":"Make AI","date":"2023-06-01","highlights":["OpenAI and AI module integrations","AI-powered data processing","Natural language filters"]},{"version":"Make (Celonis)","date":"2024-06-01","highlights":["Acquired by Celonis","Process mining integration","Enterprise features"]},{"version":"Make (2025)","date":"2025-02-01","highlights":["Expanded AI capabilities","Improved performance","New connector library"]}]'::jsonb,
  78,
  'mature',
  ARRAY['Google Workspace', 'Slack', 'Shopify', 'Airtable', 'HubSpot'],
  true,
  ARRAY['automation', 'visual-builder', 'integration', 'no-code', 'data-routing']
) ON CONFLICT (slug) DO NOTHING;

-- 37. Bardeen
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Bardeen',
  'bardeen',
  'Bardeen AI',
  'https://www.bardeen.ai',
  'business_automation',
  NULL,
  'AI-powered browser automation tool that scrapes, automates, and connects web apps to streamline repetitive tasks with natural language commands.',
  ARRAY['Browser-based automation', 'Web scraping without code', 'Natural language workflow creation', 'Cross-app data sync', 'Chrome extension interface'],
  'freemium',
  'Bardeen 2.0',
  '2024-10-01'::date,
  '[{"version":"Bardeen 1.0","date":"2022-05-01","highlights":["Chrome extension launch","Workflow automation","Web scraping tools"]},{"version":"Bardeen AI","date":"2023-05-15","highlights":["AI-powered workflow generation","Natural language commands","Smart data extraction"]},{"version":"Bardeen 1.5","date":"2024-03-01","highlights":["Improved scraping reliability","More integrations","Magic Box AI assistant"]},{"version":"Bardeen 2.0","date":"2024-10-01","highlights":["Enhanced AI capabilities","Cross-tab automation","Better error handling"]}]'::jsonb,
  62,
  'growing',
  ARRAY['Google Sheets', 'Notion', 'Salesforce', 'HubSpot', 'Slack'],
  false,
  ARRAY['browser-automation', 'scraping', 'chrome-extension', 'no-code']
) ON CONFLICT (slug) DO NOTHING;

-- 38. Clay
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Clay',
  'clay',
  'Clay',
  'https://www.clay.com',
  'business_automation',
  NULL,
  'AI-powered data enrichment and outbound automation platform that helps sales and marketing teams find, enrich, and act on prospect data at scale.',
  ARRAY['AI-powered data enrichment', '100+ data provider waterfall', 'Automated outbound sequences', 'AI message personalization', 'CRM integration and sync'],
  'paid',
  'Clay (2025)',
  '2025-01-10'::date,
  '[{"version":"Clay 1.0","date":"2022-01-01","highlights":["Data enrichment spreadsheet","Multi-source data lookup","API integrations"]},{"version":"Clay AI","date":"2023-06-01","highlights":["AI-powered research agent","Natural language data queries","Automated personalization"]},{"version":"Clay (Waterfall)","date":"2024-03-01","highlights":["100+ enrichment sources","Waterfall data lookup","Credit-based pricing"]},{"version":"Clay (2025)","date":"2025-01-10","highlights":["Enhanced AI agents","Better CRM sync","Improved enrichment accuracy"]}]'::jsonb,
  72,
  'growing',
  ARRAY['Salesforce', 'HubSpot', 'Outreach', 'Apollo', 'Slack'],
  true,
  ARRAY['sales-automation', 'data-enrichment', 'outbound', 'prospecting']
) ON CONFLICT (slug) DO NOTHING;

-- 39. Relevance AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Relevance AI',
  'relevance-ai',
  'Relevance AI',
  'https://relevanceai.com',
  'business_automation',
  NULL,
  'AI workforce platform for building and deploying AI agents that automate business tasks, from sales outreach to customer support, without coding.',
  ARRAY['No-code AI agent builder', 'Multi-step task automation', 'Knowledge base integration', 'Tool and API orchestration', 'Team of agents collaboration'],
  'freemium',
  'Relevance AI (2025)',
  '2025-01-20'::date,
  '[{"version":"Relevance AI 1.0","date":"2022-06-01","highlights":["Vector database and search","Data clustering tools","API-first platform"]},{"version":"Relevance AI (Agents)","date":"2023-09-01","highlights":["AI agent builder launch","Tool creation interface","Multi-step workflows"]},{"version":"Relevance AI (Teams)","date":"2024-06-01","highlights":["Multi-agent collaboration","Agent marketplace","Enhanced tool library"]},{"version":"Relevance AI (2025)","date":"2025-01-20","highlights":["Improved agent reliability","Better knowledge integration","Enterprise features"]}]'::jsonb,
  58,
  'growing',
  ARRAY['Slack', 'HubSpot', 'Gmail', 'Google Sheets', 'Zapier'],
  true,
  ARRAY['ai-agents', 'no-code', 'automation', 'business-tasks']
) ON CONFLICT (slug) DO NOTHING;

-- 40. Canva AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Canva AI',
  'canva-ai',
  'Canva',
  'https://www.canva.com',
  'design_creative',
  NULL,
  'Canva''s AI-powered design platform enabling anyone to create professional graphics, presentations, and videos with Magic Studio AI tools and brand consistency features.',
  ARRAY['Magic Studio AI design generation', 'Text-to-image and background removal', 'AI-powered resize and formatting', 'Brand Kit consistency enforcement', 'AI presentation and document builder'],
  'freemium',
  'Canva AI (2025)',
  '2025-01-15'::date,
  '[{"version":"Canva (Classic)","date":"2013-01-01","highlights":["Drag-and-drop design tool","Template library","Collaborative editing"]},{"version":"Magic Design","date":"2023-03-22","highlights":["AI-powered design generation","Prompt-to-design","Layout suggestions"]},{"version":"Magic Studio","date":"2023-10-04","highlights":["Suite of AI tools","Magic Write and Edit","Background removal and resize"]},{"version":"Canva (Dream Lab)","date":"2024-05-23","highlights":["AI image generation","Style-consistent brand imagery","Magic Expand"]},{"version":"Canva AI (2025)","date":"2025-01-15","highlights":["Enhanced AI design tools","Better brand consistency","Improved Magic Write"]}]'::jsonb,
  88,
  'dominant',
  ARRAY['Google Drive', 'Dropbox', 'Slack', 'Mailchimp', 'HubSpot', 'Shopify'],
  true,
  ARRAY['design', 'graphics', 'presentations', 'marketing', 'no-design-skills']
) ON CONFLICT (slug) DO NOTHING;

-- 41. Figma AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Figma AI',
  'figma-ai',
  'Figma',
  'https://www.figma.com',
  'design_creative',
  NULL,
  'Figma''s integrated AI features for UI/UX design, offering AI-powered prototyping, layer renaming, asset search, and design generation within the collaborative design platform.',
  ARRAY['AI-powered UI design generation', 'Smart layer and component renaming', 'Visual search for design assets', 'AI prototyping assistance', 'Make (design-to-code) workflows'],
  'freemium',
  'Figma AI (2025)',
  '2025-02-01'::date,
  '[{"version":"Figma (Classic)","date":"2016-09-01","highlights":["Browser-based design tool","Real-time collaboration","Component system"]},{"version":"Figma AI (Beta)","date":"2024-06-26","highlights":["AI features announced at Config","First design AI generation","Visual search"]},{"version":"Figma AI (Launch)","date":"2024-09-17","highlights":["AI layer renaming","Asset search with AI","Make design-to-code prototype"]},{"version":"Figma AI (2025)","date":"2025-02-01","highlights":["Enhanced AI generation","Improved prototyping AI","Better component suggestions"]}]'::jsonb,
  75,
  'growing',
  ARRAY['Slack', 'Jira', 'GitHub', 'VS Code', 'Storybook'],
  true,
  ARRAY['ui-design', 'prototyping', 'collaboration', 'design-system', 'figma']
) ON CONFLICT (slug) DO NOTHING;

-- 42. Framer AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Framer AI',
  'framer-ai',
  'Framer',
  'https://www.framer.com',
  'design_creative',
  NULL,
  'Framer''s AI-powered website builder that generates responsive, publication-ready websites from text prompts with professional design, animations, and CMS integration.',
  ARRAY['AI website generation from prompts', 'Responsive design with animations', 'Built-in CMS and SEO tools', 'Custom domain publishing', 'AI copywriting and translation'],
  'freemium',
  'Framer AI (2025)',
  '2025-01-20'::date,
  '[{"version":"Framer (Classic)","date":"2015-01-01","highlights":["Prototyping tool launch","Code-based design","Interactive components"]},{"version":"Framer Sites","date":"2022-06-15","highlights":["No-code website builder","Visual CMS","Custom domains"]},{"version":"Framer AI","date":"2023-06-20","highlights":["AI-powered website generation","Text-to-website","AI copywriting"]},{"version":"Framer AI (Enhanced)","date":"2024-06-01","highlights":["Improved generation quality","Better responsive output","Localization features"]},{"version":"Framer AI (2025)","date":"2025-01-20","highlights":["Multi-page AI generation","Enhanced animations","Better CMS integration"]}]'::jsonb,
  68,
  'growing',
  ARRAY['Custom Domains', 'Google Analytics', 'Zapier', 'Mailchimp'],
  false,
  ARRAY['website-builder', 'ai-design', 'no-code', 'responsive', 'cms']
) ON CONFLICT (slug) DO NOTHING;

-- 43. Galileo AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Galileo AI',
  'galileo-ai',
  'Galileo Labs',
  'https://www.usegalileo.ai',
  'design_creative',
  NULL,
  'AI UI design tool that generates editable, high-fidelity interface designs from text descriptions, aiming to accelerate the early-stage product design process.',
  ARRAY['Text-to-UI design generation', 'Editable Figma-compatible output', 'High-fidelity component rendering', 'Style and brand customization', 'Rapid design iteration'],
  'paid',
  'Galileo AI (2024)',
  '2024-09-01'::date,
  '[{"version":"Galileo AI (Beta)","date":"2023-03-01","highlights":["Waitlist launch","Text-to-UI generation","Early design demos"]},{"version":"Galileo AI (Launch)","date":"2023-10-01","highlights":["Public access","Figma export","Multiple design styles"]},{"version":"Galileo AI (2024)","date":"2024-09-01","highlights":["Improved generation quality","Better component fidelity","Brand customization"]}]'::jsonb,
  55,
  'emerging',
  ARRAY['Figma', 'Web App'],
  false,
  ARRAY['ui-design', 'generative-design', 'figma', 'prototyping']
) ON CONFLICT (slug) DO NOTHING;

-- 44. Tableau AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Tableau AI',
  'tableau-ai',
  'Salesforce / Tableau',
  'https://www.tableau.com',
  'data_analytics',
  NULL,
  'Salesforce''s enterprise analytics platform enhanced with AI-driven insights, natural language querying, and automated data preparation for business intelligence.',
  ARRAY['Natural language data querying (Ask Data)', 'AI-powered insight discovery', 'Automated data preparation', 'Predictive analytics and forecasting', 'Einstein AI integration via Salesforce'],
  'enterprise',
  'Tableau (Pulse + AI)',
  '2025-01-15'::date,
  '[{"version":"Tableau Desktop","date":"2003-01-01","highlights":["Visual analytics platform","Drag-and-drop interface","Data connection library"]},{"version":"Ask Data","date":"2019-02-01","highlights":["Natural language querying","Auto-generated visualizations","Plain English data exploration"]},{"version":"Tableau AI","date":"2023-09-12","highlights":["Einstein AI integration","Predictive modeling","Automated insights"]},{"version":"Tableau Pulse","date":"2024-02-20","highlights":["AI-powered metrics monitoring","Personalized data digests","Natural language summaries"]},{"version":"Tableau (Pulse + AI)","date":"2025-01-15","highlights":["Enhanced AI analytics","Agentforce integration","Deeper natural language support"]}]'::jsonb,
  80,
  'mature',
  ARRAY['Salesforce', 'Snowflake', 'Google BigQuery', 'AWS', 'Slack'],
  true,
  ARRAY['business-intelligence', 'data-visualization', 'analytics', 'enterprise', 'salesforce']
) ON CONFLICT (slug) DO NOTHING;

-- 45. ThoughtSpot
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'ThoughtSpot',
  'thoughtspot',
  'ThoughtSpot',
  'https://www.thoughtspot.com',
  'data_analytics',
  NULL,
  'AI-powered analytics platform enabling business users to explore data through natural language search and AI-generated insights without SQL knowledge.',
  ARRAY['Search-driven analytics', 'AI-generated insights (SpotIQ)', 'Natural language to SQL', 'Embedded analytics SDK', 'Live data connection to cloud warehouses'],
  'enterprise',
  'ThoughtSpot (Spotter)',
  '2025-01-10'::date,
  '[{"version":"ThoughtSpot (Search)","date":"2014-01-01","highlights":["Search-based analytics","Instant data exploration","Enterprise-grade security"]},{"version":"SpotIQ","date":"2017-09-01","highlights":["AI-powered insight detection","Automated anomaly detection","Trend analysis"]},{"version":"ThoughtSpot Sage","date":"2023-03-08","highlights":["Generative AI search","Natural language analytics","LLM-powered queries"]},{"version":"ThoughtSpot (Spotter)","date":"2025-01-10","highlights":["AI analyst agent","Conversational analytics","Autonomous insight generation"]}]'::jsonb,
  70,
  'growing',
  ARRAY['Snowflake', 'Databricks', 'Google BigQuery', 'AWS Redshift', 'Salesforce'],
  true,
  ARRAY['analytics', 'search-driven', 'business-intelligence', 'natural-language', 'enterprise']
) ON CONFLICT (slug) DO NOTHING;

-- 46. Julius AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Julius AI',
  'julius-ai',
  'Julius',
  'https://julius.ai',
  'data_analytics',
  NULL,
  'Conversational AI data analyst that lets users upload datasets and ask questions in natural language to generate analyses, visualizations, and statistical insights.',
  ARRAY['Natural language data analysis', 'Automatic chart and visualization generation', 'Statistical modeling and forecasting', 'CSV, Excel, and database connections', 'Shareable analysis reports'],
  'freemium',
  'Julius AI (2025)',
  '2025-01-15'::date,
  '[{"version":"Julius AI (Beta)","date":"2023-06-01","highlights":["ChatGPT for data analysis","File upload and analysis","Basic visualization"]},{"version":"Julius AI 1.0","date":"2023-12-01","highlights":["Improved chart generation","Multiple data source support","Statistical testing"]},{"version":"Julius AI (Advanced)","date":"2024-06-01","highlights":["Predictive analytics","Custom visualization styles","Team collaboration"]},{"version":"Julius AI (2025)","date":"2025-01-15","highlights":["Enhanced forecasting","Better large dataset handling","Improved visualization quality"]}]'::jsonb,
  62,
  'growing',
  ARRAY['Google Sheets', 'PostgreSQL', 'MySQL', 'Snowflake'],
  true,
  ARRAY['data-analysis', 'visualization', 'natural-language', 'statistics', 'accessible']
) ON CONFLICT (slug) DO NOTHING;

-- 47. Hex
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Hex',
  'hex',
  'Hex Technologies',
  'https://hex.tech',
  'data_analytics',
  NULL,
  'Collaborative data workspace combining SQL, Python, and AI to enable teams to analyze data, build models, and share interactive data apps.',
  ARRAY['Combined SQL and Python notebook', 'AI-powered Magic feature for code generation', 'Interactive data app publishing', 'Version control and collaboration', 'Direct warehouse connections'],
  'freemium',
  'Hex (Magic AI)',
  '2025-01-20'::date,
  '[{"version":"Hex 1.0","date":"2021-06-01","highlights":["Collaborative data workspace","SQL + Python notebooks","Data app publishing"]},{"version":"Hex (Components)","date":"2022-09-01","highlights":["Interactive app components","Charts and filters","Drag-and-drop layout"]},{"version":"Hex Magic","date":"2023-03-15","highlights":["AI code generation","Natural language to SQL/Python","Contextual suggestions"]},{"version":"Hex (Magic AI)","date":"2025-01-20","highlights":["Enhanced AI data exploration","Improved code generation","Better visualization suggestions"]}]'::jsonb,
  68,
  'growing',
  ARRAY['Snowflake', 'BigQuery', 'Databricks', 'Redshift', 'dbt'],
  true,
  ARRAY['data-notebook', 'sql', 'python', 'collaboration', 'data-apps']
) ON CONFLICT (slug) DO NOTHING;

-- 48. Jasper
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Jasper',
  'jasper',
  'Jasper AI',
  'https://www.jasper.ai',
  'writing_content',
  NULL,
  'Enterprise AI content platform for marketing teams, providing brand-consistent copy generation, campaign creation, and content repurposing at scale.',
  ARRAY['Brand voice and style enforcement', 'Marketing campaign content generation', 'Content repurposing across channels', 'Template library for common formats', 'Team collaboration and approval workflows'],
  'paid',
  'Jasper (2025)',
  '2025-01-15'::date,
  '[{"version":"Jasper (Jarvis)","date":"2021-01-01","highlights":["AI copywriting tool launch","Blog and ad copy generation","Template-based writing"]},{"version":"Jasper (Rebrand)","date":"2022-09-01","highlights":["Rebrand from Jarvis","Chat-based interface","Brand voice feature"]},{"version":"Jasper Art","date":"2022-10-01","highlights":["AI image generation","Brand-consistent visuals","Integrated creative suite"]},{"version":"Jasper Campaigns","date":"2023-06-06","highlights":["End-to-end campaign creation","Multi-channel output","Brand guidelines integration"]},{"version":"Jasper (2025)","date":"2025-01-15","highlights":["Enhanced brand intelligence","Improved content quality","Better analytics"]}]'::jsonb,
  75,
  'mature',
  ARRAY['Google Docs', 'Zapier', 'Chrome Extension', 'Webflow', 'HubSpot'],
  true,
  ARRAY['copywriting', 'marketing', 'brand-voice', 'content-generation', 'enterprise']
) ON CONFLICT (slug) DO NOTHING;

-- 49. Copy.ai
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Copy.ai',
  'copy-ai',
  'Copy.ai',
  'https://www.copy.ai',
  'writing_content',
  NULL,
  'AI-powered GTM (go-to-market) platform that automates content creation, sales outreach, and marketing workflows with pre-built templates and AI workflows.',
  ARRAY['AI content and copy generation', 'Sales outreach automation', 'Pre-built workflow templates', 'Brand voice training', 'Infobase knowledge management'],
  'freemium',
  'Copy.ai (GTM AI)',
  '2025-01-10'::date,
  '[{"version":"Copy.ai 1.0","date":"2021-01-01","highlights":["AI copywriting launch","Short-form content generation","90+ templates"]},{"version":"Copy.ai Chat","date":"2023-03-01","highlights":["Conversational AI interface","Long-form content","Multi-language support"]},{"version":"Copy.ai Workflows","date":"2023-10-01","highlights":["Automated content workflows","Sales prospecting","Lead enrichment"]},{"version":"Copy.ai (GTM AI)","date":"2025-01-10","highlights":["Go-to-market platform","Integrated sales and marketing","Enhanced workflow automation"]}]'::jsonb,
  68,
  'growing',
  ARRAY['Salesforce', 'HubSpot', 'Zapier', 'Google Docs', 'LinkedIn'],
  true,
  ARRAY['copywriting', 'sales', 'marketing', 'gtm', 'content-automation']
) ON CONFLICT (slug) DO NOTHING;

-- 50. Grammarly AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Grammarly AI',
  'grammarly',
  'Grammarly',
  'https://www.grammarly.com',
  'writing_content',
  NULL,
  'AI-powered writing assistant providing grammar, clarity, tone, and style suggestions across all writing platforms, with generative AI features for drafting and rewriting.',
  ARRAY['Grammar and spelling correction', 'Tone and clarity analysis', 'Generative AI writing and rewriting', 'Brand tone enforcement', 'Works across all text inputs'],
  'freemium',
  'Grammarly (2025)',
  '2025-02-01'::date,
  '[{"version":"Grammarly (Classic)","date":"2009-01-01","highlights":["Grammar checking tool","Browser extension","Spelling and punctuation"]},{"version":"Grammarly Premium","date":"2015-01-01","highlights":["Advanced grammar checks","Tone detection","Plagiarism checker"]},{"version":"GrammarlyGO","date":"2023-04-25","highlights":["Generative AI writing assistant","Text generation and rewriting","Personalized suggestions"]},{"version":"Grammarly Business","date":"2024-01-15","highlights":["Brand tone profiles","Team analytics","Knowledge base integration"]},{"version":"Grammarly (2025)","date":"2025-02-01","highlights":["Enhanced generative AI","Improved context awareness","Better enterprise controls"]}]'::jsonb,
  88,
  'dominant',
  ARRAY['Chrome', 'Microsoft Office', 'Google Docs', 'Slack', 'Gmail', 'VS Code'],
  true,
  ARRAY['writing-assistant', 'grammar', 'tone', 'editing', 'universal']
) ON CONFLICT (slug) DO NOTHING;

-- 51. Notion AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Notion AI',
  'notion-ai',
  'Notion',
  'https://www.notion.so',
  'writing_content',
  NULL,
  'AI writing and knowledge assistant built into Notion''s workspace, offering document drafting, summarization, Q&A over workspace content, and automated data filling.',
  ARRAY['AI writing and editing in documents', 'Q&A across workspace knowledge', 'Automated page summarization', 'Database autofill with AI', 'Meeting notes and action items'],
  'freemium',
  'Notion AI (2025)',
  '2025-02-10'::date,
  '[{"version":"Notion (Classic)","date":"2016-06-01","highlights":["All-in-one workspace","Docs, databases, and wikis","Team collaboration"]},{"version":"Notion AI (Launch)","date":"2023-02-22","highlights":["AI writing assistant","Summarize and translate","Action item extraction"]},{"version":"Notion AI Q&A","date":"2023-11-15","highlights":["Ask questions about workspace","Cross-page knowledge retrieval","Source citations"]},{"version":"Notion AI (Connected)","date":"2024-06-20","highlights":["Slack and Google Drive connections","Cross-app Q&A","AI autofill in databases"]},{"version":"Notion AI (2025)","date":"2025-02-10","highlights":["Improved knowledge search","Better summarization","Enhanced database AI"]}]'::jsonb,
  80,
  'mature',
  ARRAY['Slack', 'Google Drive', 'GitHub', 'Jira', 'Figma'],
  true,
  ARRAY['workspace', 'writing', 'knowledge-management', 'collaboration', 'notion']
) ON CONFLICT (slug) DO NOTHING;

-- 52. Writer
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Writer',
  'writer',
  'Writer',
  'https://writer.com',
  'writing_content',
  NULL,
  'Enterprise generative AI platform purpose-built for business writing, offering custom-trained models, brand governance, and AI-powered content generation at scale.',
  ARRAY['Custom enterprise LLM (Palmyra)', 'Brand governance and style guides', 'AI content generation workflows', 'Knowledge Graph for company context', 'Application layer for custom AI apps'],
  'enterprise',
  'Writer (Palmyra X4)',
  '2025-01-20'::date,
  '[{"version":"Writer 1.0","date":"2020-06-01","highlights":["Enterprise writing assistant","Style guide enforcement","Team content governance"]},{"version":"Writer (Palmyra)","date":"2023-03-01","highlights":["Custom LLM launch","Enterprise-trained model","Privacy-first architecture"]},{"version":"Writer (AI Studio)","date":"2024-01-15","highlights":["No-code AI app builder","Knowledge Graph","Custom workflow creation"]},{"version":"Writer (Palmyra X4)","date":"2025-01-20","highlights":["Latest model generation","Improved accuracy","Better enterprise governance"]}]'::jsonb,
  65,
  'growing',
  ARRAY['Google Docs', 'Microsoft Word', 'Figma', 'Chrome', 'Contentful'],
  true,
  ARRAY['enterprise-writing', 'brand-governance', 'custom-llm', 'content-platform']
) ON CONFLICT (slug) DO NOTHING;

-- 53. Harvey AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Harvey AI',
  'harvey-ai',
  'Harvey',
  'https://www.harvey.ai',
  'specialized',
  'Legal',
  'AI platform built for legal professionals, offering contract analysis, legal research, due diligence, and document drafting trained on legal-specific data.',
  ARRAY['Legal research and case analysis', 'Contract review and redlining', 'Due diligence automation', 'Legal document drafting', 'Regulatory compliance analysis'],
  'enterprise',
  'Harvey (2025)',
  '2025-01-15'::date,
  '[{"version":"Harvey (Beta)","date":"2023-02-01","highlights":["Legal AI assistant launch","GPT-4 powered legal research","Law firm partnerships"]},{"version":"Harvey (GA)","date":"2023-09-01","highlights":["General availability","Contract analysis tools","Custom fine-tuning for firms"]},{"version":"Harvey (Enterprise)","date":"2024-03-01","highlights":["Enterprise security features","Multi-jurisdiction support","Compliance tools"]},{"version":"Harvey (2025)","date":"2025-01-15","highlights":["Enhanced reasoning for complex cases","Better citation accuracy","Expanded practice area support"]}]'::jsonb,
  72,
  'growing',
  ARRAY['Microsoft Word', 'iManage', 'NetDocuments', 'Outlook'],
  false,
  ARRAY['legal', 'contract-review', 'legal-research', 'enterprise', 'vertical-ai']
) ON CONFLICT (slug) DO NOTHING;

-- 54. Hippocratic AI
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Hippocratic AI',
  'hippocratic-ai',
  'Hippocratic',
  'https://www.hippocratic.ai',
  'specialized',
  'Healthcare',
  'Safety-focused AI for healthcare, developing a large language model specialized for non-diagnostic clinical tasks like patient communication and care coordination.',
  ARRAY['Patient communication and outreach', 'Pre-visit and post-visit follow-up', 'Care gap closure automation', 'Medication adherence support', 'Clinical documentation assistance'],
  'enterprise',
  'Hippocratic AI (2025)',
  '2025-01-10'::date,
  '[{"version":"Hippocratic AI (Research)","date":"2023-05-16","highlights":["Healthcare LLM announcement","Safety-first approach","Outperformed GPT-4 on medical exams"]},{"version":"Hippocratic AI (Pilot)","date":"2023-11-01","highlights":["Health system partnerships","Patient communication pilots","Nurse staffing augmentation"]},{"version":"Hippocratic AI (Voice)","date":"2024-07-01","highlights":["Voice-based patient interaction","Low-latency health conversations","NVIDIA partnership"]},{"version":"Hippocratic AI (2025)","date":"2025-01-10","highlights":["Expanded clinical workflows","Better safety guardrails","Multi-language patient support"]}]'::jsonb,
  55,
  'emerging',
  ARRAY['Epic EHR', 'Cerner', 'Health system APIs'],
  false,
  ARRAY['healthcare', 'patient-communication', 'clinical', 'safety', 'vertical-ai']
) ON CONFLICT (slug) DO NOTHING;

-- 55. Glean
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Glean',
  'glean',
  'Glean',
  'https://www.glean.com',
  'specialized',
  'Enterprise Search',
  'Enterprise AI search and knowledge management platform that connects to all company apps to provide AI-powered search, answers, and knowledge discovery.',
  ARRAY['Unified enterprise search across all apps', 'AI-powered answers from company knowledge', 'Personalized results based on role and context', 'Knowledge graph of company information', 'Custom AI assistant builder'],
  'enterprise',
  'Glean (AI Agents)',
  '2025-02-01'::date,
  '[{"version":"Glean 1.0","date":"2021-06-01","highlights":["Enterprise search platform","100+ app connectors","Personalized results"]},{"version":"Glean AI","date":"2023-05-01","highlights":["Generative AI answers","Knowledge assistant","Source-cited responses"]},{"version":"Glean (Apps)","date":"2024-03-01","highlights":["Custom AI app builder","Workflow automation","Enterprise knowledge graph"]},{"version":"Glean (AI Agents)","date":"2025-02-01","highlights":["Autonomous AI agents","Task-based automation","Cross-app workflows"]}]'::jsonb,
  70,
  'growing',
  ARRAY['Google Workspace', 'Microsoft 365', 'Slack', 'Salesforce', 'Confluence', 'Jira'],
  true,
  ARRAY['enterprise-search', 'knowledge-management', 'ai-answers', 'workplace', 'vertical-ai']
) ON CONFLICT (slug) DO NOTHING;

-- 56. Moveworks
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Moveworks',
  'moveworks',
  'ServiceNow / Moveworks',
  'https://www.moveworks.com',
  'specialized',
  'IT Service Management',
  'AI platform for IT service management that automates employee support tickets, resolves IT issues, and provides self-service through conversational AI.',
  ARRAY['Automated IT ticket resolution', 'Conversational AI for employee support', 'Software provisioning and access management', 'Knowledge article surfacing', 'Multi-language employee support'],
  'enterprise',
  'Moveworks (Copilot)',
  '2025-01-15'::date,
  '[{"version":"Moveworks 1.0","date":"2019-06-01","highlights":["AI IT support bot","Automated ticket resolution","Slack and Teams integration"]},{"version":"Moveworks (Platform)","date":"2022-06-01","highlights":["Creator Studio for custom bots","Multi-department support","Employee experience platform"]},{"version":"Moveworks (LLM)","date":"2023-06-01","highlights":["Enterprise LLM integration","Improved natural language understanding","Cross-system automation"]},{"version":"Moveworks (ServiceNow)","date":"2024-11-01","highlights":["Acquired by ServiceNow","Deeper ITSM integration","Now Assist enhancement"]},{"version":"Moveworks (Copilot)","date":"2025-01-15","highlights":["Employee copilot experience","Proactive issue resolution","Enhanced analytics"]}]'::jsonb,
  68,
  'growing',
  ARRAY['ServiceNow', 'Slack', 'Microsoft Teams', 'Jira', 'Okta'],
  true,
  ARRAY['itsm', 'employee-support', 'automation', 'helpdesk', 'vertical-ai']
) ON CONFLICT (slug) DO NOTHING;

-- 57. Synthesia
INSERT INTO ai_tools (name, slug, maker, website_url, category, subcategory, description, key_capabilities, pricing_model, latest_version, latest_release_date, release_history, adoption_score, maturity, integrations, api_available, tags)
VALUES (
  'Synthesia',
  'synthesia',
  'Synthesia',
  'https://www.synthesia.io',
  'specialized',
  'Video Avatars',
  'AI video creation platform with photorealistic digital avatars, enabling scalable video production for training, marketing, and communication without cameras or studios.',
  ARRAY['230+ photorealistic AI avatars', '140+ language support with lip-sync', 'Custom avatar creation from recordings', 'Screen recording and interactive elements', 'Template-based video production'],
  'paid',
  'Synthesia 2.0',
  '2024-12-04'::date,
  '[{"version":"Synthesia 1.0","date":"2020-01-01","highlights":["AI avatar video platform","Text-to-video creation","40+ avatars"]},{"version":"Synthesia (Enterprise)","date":"2022-06-01","highlights":["Custom avatar creation","Brand kit integration","Team collaboration"]},{"version":"Synthesia (Expressive)","date":"2023-06-01","highlights":["Expressive avatars with gestures","120+ languages","Improved lip-sync"]},{"version":"Synthesia 2.0","date":"2024-12-04","highlights":["Full-body expressive avatars","Interactive video elements","230+ avatars and 140+ languages"]}]'::jsonb,
  72,
  'growing',
  ARRAY['PowerPoint', 'LMS platforms', 'Zapier', 'API', 'Salesforce'],
  true,
  ARRAY['video-avatars', 'training', 'localization', 'corporate-video', 'vertical-ai']
) ON CONFLICT (slug) DO NOTHING;
