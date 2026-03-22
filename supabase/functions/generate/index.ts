import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const DAILY_LIMIT = 10;
const CLAUDE_MODEL = 'claude-haiku-4-5';
const GPT_VISION_MODEL = 'gpt-4o';
const SAFETY_RULE = 'Never generate sexual, explicit, offensive, or hateful content under any circumstances.';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToneProfile {
  communication_style: string;
  humor_level: string;
  energy_level: string;
  intent?: string;
  sample_phrase?: string | null;
}

function toneBlock(tp: ToneProfile): string {
  return `- Style: ${tp.communication_style}
- Humour: ${tp.humor_level}
- Energy: ${tp.energy_level}
${tp.intent ? `- Looking for: ${tp.intent}` : ''}
${tp.sample_phrase ? `- How they naturally write: "${tp.sample_phrase}"` : ''}`;
}

// ── Claude (text only) ───────────────────────────────────────────────────────

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: SAFETY_RULE,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Claude error: ${await response.text()}`);
  const data = await response.json();
  return data.content[0].text;
}

// ── GPT-4o Vision (screenshot OCR) ──────────────────────────────────────────

async function extractConversationFromScreenshot(imageBase64: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: GPT_VISION_MODEL,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
          {
            type: 'text',
            text: `Extract the conversation from this chat screenshot. Format it as:
Them: [their message]
Me: [my message]
Them: [their message]
...and so on.
Output ONLY the conversation transcript. No explanation, no labels, no commentary.`,
          },
        ],
      }],
    }),
  });
  if (!response.ok) throw new Error(`GPT Vision error: ${await response.text()}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

// ── Prompts ──────────────────────────────────────────────────────────────────

function buildChatReplyPrompt(tp: ToneProfile, conversation: string, note?: string): string {
  return `You are a dating conversation assistant. Suggest 3 reply options that sound exactly like the user — not like AI.
${SAFETY_RULE}

User tone profile:
${toneBlock(tp)}

Conversation transcript:
${conversation}
${note ? `\nAdditional note from user: ${note}` : ''}

Generate exactly 3 reply options. Rules:
- Each must continue the natural flow of the conversation
- Match the user's tone profile exactly
- One reply should be Warm, one Playful, one forward-moving (Bold)
- Keep each under 2 sentences
- Sound like a real human, not AI
- Do not use emojis unless the existing chat uses them
- Do not number or label the replies
Output only the 3 replies, one per line. Nothing else.`;
}

function buildBioAnalysisPrompt(bio: string): string {
  return `Analyse this dating profile bio and extract the best conversation hooks.
${SAFETY_RULE}

BIO:
${bio}

Return only valid JSON:
{ "hooks": ["hook1", "hook2", "hook3"], "interests": ["interest1", "interest2"], "tone": "casual|adventurous|intellectual|humorous" }

Hook rules: specific and talkable (not 'likes travel' but 'did a solo motorbike trip through Vietnam').
Maximum 3 hooks. If bio is too short, return fewer. Return only JSON. No markdown.`;
}

function buildOpenerPrompt(tp: ToneProfile, bio: string, hooks: string[]): string {
  return `You are a dating message assistant.
${SAFETY_RULE}

User tone:
${toneBlock(tp)}

Match's bio: ${bio}

Conversation hooks: ${hooks.map((h, i) => `${i + 1}. ${h}`).join('\n')}

Generate exactly 3 opening messages. Each must reference a specific hook.
Match user's tone exactly. Under 2 sentences each. No 'Hey' or 'Hi' openers. Sound human.
Output 3 messages, one per line, nothing else.`;
}

function buildProfileOptimisePrompt(tp: ToneProfile, currentBio: string, platform: string, intentNote?: string): string {
  const platformGuide: Record<string, string> = {
    Hinge: 'conversational and prompt-answer format',
    Tinder: 'short and punchy (under 150 chars)',
    Bumble: 'detailed and personality-forward',
    Feeld: 'honest, open, values-forward',
    Other: 'general dating app style',
  };
  return `You are an expert dating profile writer.
${SAFETY_RULE}

User tone:
${toneBlock(tp)}

Platform: ${platform} (style: ${platformGuide[platform] ?? 'general'})
Current bio: ${currentBio}
${intentNote ? `What they're looking for: ${intentNote}` : ''}

Return a JSON object with this exact shape:
{
  "rewrittenBio": "...",
  "alternativeHooks": ["hook1", "hook2", "hook3"],
  "whyItWorks": "..."
}

Rules:
- Reflect the user's actual tone — do not make a laid-back user sound polished
- Do not use clichés: 'loves to laugh', 'adventurous', 'passionate about life'
- rewrittenBio must respect platform character limits
- alternativeHooks are 3 strong alternative first lines only
- whyItWorks is 2–3 sentences explaining the choices
Return only valid JSON. No markdown.`;
}

function buildPickupPrompt(tp: ToneProfile, toneMode: string, context?: string): string {
  return `You are a witty, personalised pickup line generator.
${SAFETY_RULE}

User tone:
${toneBlock(tp)}

Tone mode: ${toneMode}
${context ? `Context (match's bio or topic): ${context}` : 'No specific context provided — generate universally applicable lines.'}

Generate exactly 5 pickup lines. Rules:
- Each must be unique and original — no templates, no clichés
- Do not start with 'Hey', 'Hi', 'Are you', or 'Did it hurt'
- Do not reference height, the gym, or being nervous
- Match the selected tone mode
${context ? '- At least 3 lines must reference the provided context specifically' : ''}
- Keep each line under 2 sentences
Output 5 lines, one per line. Nothing else.`;
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse body
    const body = await req.json();
    const { feature } = body;
    if (!feature) {
      return new Response(JSON.stringify({ error: 'Missing feature' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Enforce daily limit
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', `${today}T00:00:00Z`);

    if ((count ?? 0) >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: `Daily limit of ${DAILY_LIMIT} requests reached` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Route to feature
    let result: string;

    switch (feature) {
      case 'bio_analyse': {
        result = await callClaude(buildBioAnalysisPrompt(body.bio));
        break;
      }
      case 'opener': {
        result = await callClaude(buildOpenerPrompt(body.toneProfile, body.matchBio, body.hooks));
        break;
      }
      case 'coach': {
        result = await callClaude(buildChatReplyPrompt(body.toneProfile, body.conversationThread));
        break;
      }
      case 'coach_screenshot': {
        // Step 1: GPT-4o Vision extracts conversation from screenshot
        const extractedConvo = await extractConversationFromScreenshot(body.imageBase64);
        // Step 2: Claude generates replies
        result = await callClaude(buildChatReplyPrompt(body.toneProfile, extractedConvo, body.optionalNote));
        break;
      }
      case 'profile_optimise': {
        result = await callClaude(buildProfileOptimisePrompt(body.toneProfile, body.currentBio, body.platform, body.intentNote));
        break;
      }
      case 'pickup': {
        result = await callClaude(buildPickupPrompt(body.toneProfile, body.toneMode, body.context));
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Unknown feature' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 5. Log usage (coach_screenshot counts as 1, even though it uses 2 AI calls)
    await supabase.from('usage_logs').insert({ user_id: user.id, feature });

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
