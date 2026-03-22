import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const DAILY_LIMIT = 10;
const MODEL = 'claude-haiku-4-5';
const SAFETY_RULE = 'Never generate sexual, explicit, or offensive content under any circumstances.';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToneProfile {
  communication_style: string;
  humor_level: string;
  energy_level: string;
  sample_phrase?: string | null;
}

async function callClaude(messages: { role: string; content: any }[], system: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function buildOpenerPrompt(toneProfile: ToneProfile, matchBio: string, hooks: string[]): string {
  return `You are a dating message assistant helping someone craft opening messages that sound like them — not generic AI.
${SAFETY_RULE}

USER'S COMMUNICATION STYLE:
- Style: ${toneProfile.communication_style}
- Humor: ${toneProfile.humor_level}
- Energy: ${toneProfile.energy_level}
${toneProfile.sample_phrase ? `- Example of how they write: "${toneProfile.sample_phrase}"` : ''}

THEIR MATCH'S BIO:
${matchBio}

CONVERSATION HOOKS IDENTIFIED:
${hooks.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n')}

Generate exactly 3 opening messages. Rules:
- Each must reference something specific from the bio or hooks — no generic openers
- Match the user's communication style exactly
- Keep each under 2 sentences
- Sound like a real human, not an AI
- Do not start any message with "Hey" or "Hi"
- Do not number them or add labels
Output only the 3 messages, one per line, nothing else.`;
}

function buildBioAnalysisPrompt(bio: string): string {
  return `Analyse this dating profile bio and extract the most useful conversation hooks.
${SAFETY_RULE}

BIO:
${bio}

Return a JSON object with this exact shape:
{
  "hooks": ["hook1", "hook2", "hook3"],
  "interests": ["interest1", "interest2"],
  "tone": "casual|adventurous|intellectual|humorous|professional"
}

Rules for hooks:
- Each hook must be a specific, talkable detail from the bio
- Good hook: "Did a solo trip to Japan in their 20s"
- Bad hook: "Likes travelling"
- Maximum 3 hooks
Return only valid JSON. No markdown, no explanation.`;
}

function buildCoachPrompt(toneProfile: ToneProfile, conversationThread: string): string {
  return `You are a dating conversation coach. Help craft the next reply in this conversation.
${SAFETY_RULE}

USER'S COMMUNICATION STYLE:
- Style: ${toneProfile.communication_style}
- Humor: ${toneProfile.humor_level}
- Energy: ${toneProfile.energy_level}
${toneProfile.sample_phrase ? `- How they naturally write: "${toneProfile.sample_phrase}"` : ''}

CONVERSATION SO FAR:
${conversationThread}

Generate exactly 3 possible next replies. Rules:
- Continue the natural flow — read the energy and match it
- Each reply: different strategic angle (warm / playful / moves things forward)
- Sound exactly like the user's style
- Under 3 sentences each
- No emojis unless conversation has them
- Do not number them or add labels
Output only the 3 replies, one per line, nothing else.`;
}

function buildScreenshotCoachSystem(toneProfile: ToneProfile): string {
  return `You are a dating conversation coach. The user has shared a screenshot of their conversation.
${SAFETY_RULE}

Read the conversation in the image carefully, then generate reply suggestions.

USER'S COMMUNICATION STYLE:
- Style: ${toneProfile.communication_style}
- Humor: ${toneProfile.humor_level}
- Energy: ${toneProfile.energy_level}
${toneProfile.sample_phrase ? `- How they naturally write: "${toneProfile.sample_phrase}"` : ''}

Generate exactly 3 possible next replies based on where the conversation left off. Rules:
- Continue the natural flow — read the energy and match it
- Each reply: different strategic angle (warm / playful / moves things forward)
- Sound exactly like the user's style
- Under 3 sentences each
- No emojis unless conversation has them
- Do not number them or add labels
Output only the 3 replies, one per line, nothing else.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parse body
    const body = await req.json();
    const { feature } = body;

    if (!feature) {
      return new Response(JSON.stringify({ error: 'Missing feature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Check daily usage limit
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

    // 4. Call Claude based on feature
    let result: string;

    if (feature === 'bio_analyse') {
      const { bio } = body;
      result = await callClaude(
        [{ role: 'user', content: buildBioAnalysisPrompt(bio) }],
        SAFETY_RULE
      );
    } else if (feature === 'opener') {
      const { toneProfile, matchBio, hooks } = body;
      result = await callClaude(
        [{ role: 'user', content: buildOpenerPrompt(toneProfile, matchBio, hooks) }],
        SAFETY_RULE
      );
    } else if (feature === 'coach') {
      const { toneProfile, conversationThread } = body;
      result = await callClaude(
        [{ role: 'user', content: buildCoachPrompt(toneProfile, conversationThread) }],
        SAFETY_RULE
      );
    } else if (feature === 'coach_screenshot') {
      const { toneProfile, imageBase64 } = body;
      const system = buildScreenshotCoachSystem(toneProfile);
      result = await callClaude(
        [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Read this conversation screenshot and give me 3 reply suggestions as instructed.',
            },
          ],
        }],
        system
      );
    } else {
      return new Response(JSON.stringify({ error: 'Unknown feature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Log usage
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      feature,
    });

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
