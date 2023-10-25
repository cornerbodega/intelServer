// import { getFromOpenAi } from "../../utils/getFromOpenAi.js";
import getFromOpenAi from "../../../utils/getFromOpenAi.js";

export default async function handler(req, res) {
  const { draft } = req.body;
  console.log("GET IMAGE PROMPT FOR REPORT ENDPOINT1");
  //   console.log(req.body);
  //   console.log(draft);

  let draftTitle = "";
  try {
    draftTitle = draft.split(`<h2 id="reportTitle">`)[1].split(`</h2>`)[0];
  } catch {
    return console.log("Errror Generating Image: Could not get draft title");
  }

  // describe this article as a photograph of place on earth in less than 300 characters: Research Report: Impact of Persistence and Goal-Setting on Project Success and Performance in Different Industries
  const imageTypes = [
    "photograph",
    "realist painting",
    "impressionist painting",
    "macro photograph",
    "cartoon",
    "3d rendering",
  ];
  // const imageType = imageTypes[getRandomInt(0, imageTypes.length - 1)];
  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  // const imageType = "macro photograph";
  const getDraftImageMessages = [
    {
      role: "system",
      content:
        "You are an expert at designing images of places and describing them in less than 300 characters. You choose from a library of famous artists and styles to combine them in order to best capture the spirit of the subject. You always return answers with no explanation.",
    },
    {
      role: "user",
      content: `Describe an exciting, inspirational painting that captures the spirit of the following report: ${draftTitle}. The description will be used by dall-e to create an image for immersive context for the report. Return only the description and do not explain your answer. Choose 2-3 of the following artists to blend styles and collaborate to best describe the report. ${getArtKnowledge()}`,
    },
  ];

  const imageDescriptionResponseContent = await getFromOpenAi(
    getDraftImageMessages
  );
  console.log("imageDescriptionResponseContent1");
  console.log(imageDescriptionResponseContent);
  // imageDescriptionResponseContent = `${imageDescriptionResponseContent}, photograph`;
  return { imageDescriptionResponseContent, draftTitle };
}

function getArtKnowledge() {
  return `
 
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
