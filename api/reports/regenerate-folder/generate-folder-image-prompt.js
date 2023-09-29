import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  const { folderDescription } = req.body;
  const imageType = "realist painting";
  // "realist painting",
  // "impressionist painting",

  try {
    const chat_completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at describing visually captivating artworks based on a report title. The artwork will performed by a realist painter.You never explain your answer. All your answers are less than 300 characters.",
        },
        {
          role: "user",
          content: `reportTitle: ${folderDescription}, imageType: ${imageType}`,
        },
      ],
    });

    const folderImageResponse = chat_completion.choices[0].message.content;
    console.log("folderImageResponse");
    console.log(folderImageResponse);
    return { folderImageResponse };
  } catch (error) {
    console.log("error");
    console.log(error);
    return console.log({ error });
  }
  // await saveToLinksTableFunction();
}
