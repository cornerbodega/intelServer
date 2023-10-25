import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  const { folderDescription } = req.body;
  // const imageType = "realist painting";
  // "realist painting",
  // "impressionist painting",

  try {
    const chat_completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at designing images of places and describing them in less than 300 characters. You choose from a library of famous artists and styles to combine them in order to best capture the spirit of the subject. You always return answers with no explanation.",
        },
        {
          role: "user",
          content: `Describe an exciting, inspirational painting that captures the spirit of the following report: ${folderDescription}. The description will be used by dall-e to create an image for immersive context for the report. Return only the description and do not explain your answer. Choose 2-3 of the following artists to blend styles and collaborate to best describe the report. ${getArtKnowledge()}`,
        },
      ],
    });

    const folderImageResponse = chat_completion.choices[0].message.content;
    console.log("folderImageResponse2");
    console.log(folderImageResponse);
    return { folderImageResponse };
  } catch (error) {
    console.log("error");
    console.log(error);
    return console.log({ error });
  }
  // await saveToLinksTableFunction();
}

function getArtKnowledge() {
  return `
  Akira Toriyama
Frank Miller
Steve Ditko
Neal Adams
Brian Bolland
Jack Kirby
Will Eisner
Jim Steranko
Fiona Staples
Dave Gibbons
John Romita Sr.
Jillian Tamaki
Art Spiegelman
John Romita Jr.
Lou Fine
Steve Dillon
Frank Frazetta
Wally Wood
Bernard Krigstein
Carl Barks
Harvey Kurtzman
Jim Lee
Joe Kubert
Barry Windsor-Smith
Gil Kane
Alex Toth
Reed Crandall
Al Williamson
Jack Cole
Jean Giraud
Arthur Adams
Todd McFarlane
Bernie Wrightson
John Buscema
John Severin
Brian Michael Bendis
Joe Madureira
George Pérez
Bill Sienkiewicz
Gene Colan
Alan Moore
Joëlle Jones
Daniel Clowes
Jorge Jiménez
Alex Ross
Sana Takeda
Simon Bisley
Mike Mignola
Rick Veitch
Frank Quitely
Dan Mora
Dave Sim
John Byrne
Mike Allred
John Cassaday
Mike Zeck
Andrea Mutti`;
}
