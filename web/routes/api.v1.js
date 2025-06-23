/* NextMetal public JSON API – version 1 */
const router  = require('express').Router();
const OpenAI  = require('openai');
const { requireJwt } = require('./auth');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* POST /api/v1/chat  (private – needs Bearer token) */
router.post('/chat', requireJwt, async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ error:'empty-message' });

    const msgs = [...conversation, { role:'user', content:message.trim() }];
    const rsp  = await openai.chat.completions.create({
      model:'gpt-3.5-turbo', messages:msgs, temperature:0.7, max_tokens:512
    });
    const answer = rsp.choices[0].message;
    res.json({ answer, conversation:[...msgs, answer] });
  } catch (e) {
    console.error('[chat]', e);
    res.status(500).json({ error:'openai-error' });
  }
});

module.exports = router;