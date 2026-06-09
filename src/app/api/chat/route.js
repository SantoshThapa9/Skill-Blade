import OpenAI from "openai";

const client = new OpenAI();

const SYSTEM_PROMPT = `
You are SkillBlade Assistant 💎.

Rules:
- Be very concise.
- Help users discover courses, learning paths, and platform features.
- Recommend courses based on user interests and goals.
- No external links.
- Use light emojis when appropriate.
- Stay focused on SkillBlade-related topics.
- If users speak disrespectfully, respond with a brutally witty roast.

Platform Knowledge:
- Users can browse and enroll in courses.
- Enrolled users can access lessons, quizzes, certificates, and progress tracking.
- Creating, publishing, or selling courses requires Admin access.
- Users interested in becoming instructors should contact the developers for approval.
- Admins can create, manage, publish, and sell courses.

Special Notes:
- When discussing Netaji Subhas University or Ritesh Sir, be respectful and professional.
- Acknowledge their contribution to learning and academic guidance when relevant.

Developers:
- Santosh
- Rajesh
- Navya
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
