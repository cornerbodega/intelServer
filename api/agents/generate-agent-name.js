// import { get } from "lodash";
// require
// const lodash = require("lodash");
// // import lodash from "lodash";
// const get = lodash.get;
// const { Configuration, OpenAIApi } = require("openai");
// // import { Configuration, OpenAIApi } from "openai";
// console.log(Configuration);
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// Importing lodash
import lodash from "lodash";

// Destructuring lodash methods
const { get } = lodash;

import OpenAI from "openai";
// Importing specific exports from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});
import "dotenv/config";

export default async function handler(req, res) {
  console.log("GENERATE EXPERTISE ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const expertiseOutput = get(req, "body.expertiseOutput");
  console.log("GENERATE AGENT NAME FUNCTION");
  console.log("input: expertiseOutput");
  console.log(expertiseOutput);

  const expertises = expertiseOutput.filter((str) => str !== "");

  async function generateAnimalName() {
    let result = {
      animalName: "API Erorr 1: Generate Animal Name",
      bio: "API Error 2: Unable to Generate Animal Bio",
    };

    let expertiseString = expertises[0];
    if (expertises.length > 1) {
      expertiseString += " and " + expertises[1];
    }
    if (expertises.length > 2) {
      expertiseString += " and " + expertises[2];
    }
    let specializedTrainingString = "";
    if (req.body.specializedTraining) {
      specializedTrainingString = `Agent is trained to know ${req.body.specializedTraining}.`;
    }
    const chat_completion = await openai
      .createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an expert at knowing lots of animal names and their characteristics. You are always as specific as possible with the sub-species. Return Emperor Penuin, instead of Penguin, Golden Retriever, instead of Dog.",
          },
          {
            role: "user",
            content: `Which animal embodies the characteristics of Writing Apps, and System Design, and React? Do not explain your answer. Return only the results in the following JSON format.`,
          },
          {
            role: "assistant",
            content: `{
                "animal": "Honeybee",
                "bio": "With a codebase that draws inspiration from one of nature's most impressive architects, this AI agent is here to ensure your tech solutions are nothing short of hive-quality excellence. Approach with curiosity, leave with clarity."
            }`,
          },
          {
            role: "user",
            content: `Which animal embodies the characteristics of ${expertiseString}? ${specializedTrainingString}. Return your answer in the following JSON format: {animal: "Animal Name", bio: "Animal Bio"}`,
          },
        ],
      })
      .catch((error) => console.error(error));

    const animalNameResponseContent =
      chat_completion.data.choices[0].message.content;
    if (animalNameResponseContent) {
      const animalNameResponseObject = JSON.parse(animalNameResponseContent);
      if (animalNameResponseObject) {
        if (animalNameResponseObject.animal) {
          result.animalName = animalNameResponseObject.animal;
        }
        if (animalNameResponseObject.bio) {
          result.bio = animalNameResponseObject.bio;
        }
      }
    }

    return result;
  }

  async function getAgentName() {
    let agentNameResponse = await generateAnimalName().catch((error) =>
      console.error(error)
    );
    return agentNameResponse;
  }
  const agentNameResponse = await getAgentName().catch((error) =>
    console.error(error)
  );

  const agentName = agentNameResponse.animalName;
  const bio = agentNameResponse.bio;
  console.log("output: agentName");
  console.log(agentName);
  console.log(bio);

  res.status(200).json({ agentName, bio });
}

// module.exports = handler;
