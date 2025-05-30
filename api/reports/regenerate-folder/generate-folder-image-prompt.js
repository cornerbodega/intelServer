import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  const { folderDescription } = req.body;

  try {
    const chat_completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You specialize in generating a vivid visual description of an image for a  topic. Your total response is always less than 300 characters. Your goal is to describe an image for Dall-E that gives an immediate understanding and context to the subject. Play to the strengths of Dall-E and away from its limitations. You don't need to explain your answer. Make sure to avoid any words that might be flagged by the chatgpt or dalle models.",
        },
        {
          role: "user",
          content: `Produce a visually engaging prompt that encapsulates the essence of the report titled: ${folderDescription}. 
            ", "
          )}`,
        },
      ],
    });

    const folderImageResponse = chat_completion.choices[0].message.content;

    return { folderImageResponse };
  } catch (error) {
    console.log(error);
    return console.log({ error });
  }
}
