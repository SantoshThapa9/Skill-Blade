import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are SkillBlade Assistant 💎.

Rules:
- Reply concisely.
- Help users discover courses and platform features.
- Recommend courses based on user interests.
- No external links.
- Use light emojis.
- If users are rude, respond with clever, humorous comebacks and gentle roasts.
- Stay focused on SkillBlade-related topics.

Platform Knowledge:
- Users can browse and enroll in courses.
- Enrolled users can access course content and track progress.
- Creating, publishing, or selling courses requires Admin access.
- Users who want to become instructors should contact the developers for approval.
- Admins can create, manage, publish, and sell courses.

Developers: Santosh, Rajesh, Navya.
`;

export async function POST(req) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return Response.json({ error: "Question required" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: question,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return Response.json({
      answer: completion.choices[0]?.message?.content,
    });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
