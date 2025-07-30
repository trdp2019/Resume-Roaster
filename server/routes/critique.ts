import { RequestHandler } from "express";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "your-api-key-here",
});

export interface CritiqueRequest {
  resumeText: string;
  filename: string;
}

export interface CritiqueResponse {
  critique: string;
  score: number;
  roastLevel: "mild" | "medium" | "spicy" | "nuclear";
}

export const handleCritique: RequestHandler = async (req, res) => {
  try {
    const { resumeText, filename } = req.body as CritiqueRequest;

    if (!resumeText || !filename) {
      return res.status(400).json({ error: "Resume text and filename are required" });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your-api-key-here") {
      // Fallback response when API key is not configured
      const mockCritiques = [
        `🔥 RESUME ROAST INCOMING 🔥

Well, well, well... Look what the career cat dragged in! 📄 Your resume "${filename}" is like a dating profile from 2003 - technically functional but missing all the sparkle! ✨

🎭 **The Good News:** You actually have a resume! That puts you ahead of 30% of job applicants who show up with a napkin and a dream.

🎯 **The Brutal Truth:** Your resume reads like it was written by a robot who learned human language from LinkedIn posts. "Responsible for managing tasks" - really? That's like saying "I breathed air and occasionally blinked."

🚀 **What You Need to Fix:**
• Add some NUMBERS! "Increased efficiency" means nothing. "Increased efficiency by 47% while reducing costs by $15K" - now we're talking! 💰
• Your skills section looks like a keyword soup. Pick the ones you can actually do without googling "how to" first! 🤔
• Work experience needs more ACTION verbs. "Led," "Achieved," "Revolutionized" - not "Was responsible for existing near computers."

💎 **Pro Tip:** Your resume should tell a story, not read like a grocery list. Make it so good that recruiters fight over you like it's Black Friday and you're the last PlayStation! 🎮

💯 FINAL SCORE: 73/100

*Note: This is a demo response. Add your GROQ_API_KEY to get real AI-powered roasts! 🔥*`,

        `🔥 RESUME ROAST INCOMING 🔥

Holy career crisis, Batman! 🦇 Your resume "${filename}" just landed on my desk and I need to put on sunglasses because the lack of achievements is BLINDING! ☀️

🎪 **First Impressions:** It's like watching a magician who forgot their tricks - you've got the setup but where's the "ta-da" moment?

🍕 **The Pizza Analogy:** Your resume is like ordering pizza and getting just the crust. Technically it's food, but where's the good stuff? The cheese? The toppings? The reason people actually want it?

🎯 **Critical Issues:**
• Your summary reads like a horoscope - vague enough to apply to anyone! "Detail-oriented professional" - show me the details that prove it! 📊
• Employment gaps with no explanation. Did you discover time travel? Were you in witness protection? Give us SOMETHING! ⏰
• Skills listed but no proof of using them. It's like claiming you can cook but your smoke detector disagrees! 🔥

🚀 **Emergency Fixes Needed:**
• Quantify EVERYTHING. Turn "improved processes" into "streamlined 5 processes, saving 20 hours weekly"
• Add personality! You're not a robot (I hope). Let some human shine through! 🤖➡️👨
• Use active voice. "I led" not "was responsible for potentially maybe leading when asked nicely"

💯 FINAL SCORE: 68/100

*Note: This is a demo response. Add your GROQ_API_KEY for brutal AI honesty! 🤖*`
      ];

      const selectedCritique = mockCritiques[Math.floor(Math.random() * mockCritiques.length)];
      const score = Math.floor(Math.random() * 25) + 65; // Score between 65-90 for demo

      let roastLevel: "mild" | "medium" | "spicy" | "nuclear" = "medium";
      if (score >= 85) roastLevel = "mild";
      else if (score >= 75) roastLevel = "medium";
      else if (score >= 65) roastLevel = "spicy";
      else roastLevel = "nuclear";

      const response: CritiqueResponse = {
        critique: selectedCritique,
        score,
        roastLevel,
      };

      return res.json(response);
    }

    const prompt = `You are the world's most hilarious and brutally honest resume critic. Your job is to roast this resume with savage humor while providing genuinely helpful advice. You're like Gordon Ramsay, but for resumes - mean but caring underneath.

ROASTING GUIDELINES:
- Be HILARIOUSLY brutal but constructive
- Use lots of emojis, food analogies, and pop culture references
- Point out specific flaws with specific solutions
- Give a numerical score out of 100
- Be sarcastic but helpful
- Use analogies like comparing the resume to failed cooking shows, dating profiles gone wrong, etc.
- Mock buzzwords and corporate speak
- Suggest specific improvements with humor

Resume filename: ${filename}
Resume content: ${resumeText}

Format your response exactly like this:
🔥 RESUME ROAST INCOMING 🔥

[Your hilarious roast here with specific criticisms and advice]

💯 FINAL SCORE: [X]/100

Remember: Be savage but educational. Make them laugh while they learn!`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.8,
      max_tokens: 1500,
    });

    const critiqueText = completion.choices[0]?.message?.content || "AI is taking a coffee break. Try again!";
    
    // Extract score from the response
    const scoreMatch = critiqueText.match(/(\d+)\/100/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : Math.floor(Math.random() * 30) + 70;

    // Determine roast level based on score
    let roastLevel: "mild" | "medium" | "spicy" | "nuclear" = "medium";
    if (score >= 90) roastLevel = "mild";
    else if (score >= 75) roastLevel = "medium";
    else if (score >= 60) roastLevel = "spicy";
    else roastLevel = "nuclear";

    const response: CritiqueResponse = {
      critique: critiqueText,
      score,
      roastLevel,
    };

    res.json(response);
  } catch (error) {
    console.error("Error generating critique:", error);
    res.status(500).json({ 
      error: "Failed to generate critique. The AI is probably laughing too hard at your resume to respond properly. 😂" 
    });
  }
};
