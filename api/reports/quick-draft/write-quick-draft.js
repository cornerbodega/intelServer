import OpenAI from "openai";
// import { saveToFirebase } from "../../../utils/saveToFirebase.js";
import saveToFirebase from "../../../utils/saveToFirebase.js";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function writeDraftFunction(req) {
  console.log("WRITE QUICK DRAFT FUNCTION INPUT:");
  console.log(req.body);
  // let researchLink = {};
  // if (req.body.researchLink1) {
  //   researchLink = req.body.researchLink1;
  // }
  // if (req.body.researchLink2) {
  //   researchLink = req.body.researchLink2;
  // }
  // if (req.body.researchLink3) {
  //   researchLink = req.body.researchLink3;
  // }
  let briefing = req.body.briefingInput;
  // if (researchLink.researchQuestion) {
  //   briefing = researchLink.researchQuestion;
  // }
  if (!briefing) {
    console.log("error 544: where is the researchquesiton");
    return;
  }
  const expertises = req.body.expertiseOutput;
  let expertiseString = expertises[0];

  if (expertises.length > 1) {
    expertiseString += " and " + expertises[1];
  }
  if (expertises.length > 2) {
    expertiseString += " and " + expertises[2];
  }
  let specializedTrainingString = "";
  if (req.body.specializedTraining) {
    specializedTrainingString += `${req.body.specializedTraining}.`;
  }
  if (specializedTrainingString.length > 0) {
    console.log("specializedTrainingString");
    console.log(specializedTrainingString);
  }
  // agents' areas of expertise
  // agents' specialized training
  // parent report summary aka "context"
  // parent report sanitized briefing
  // highlighted text
  // previous reports titles
  let reportSummary = "";
  if (req.body.reportSummary) {
    reportSummary = `Given the context of this report: ${req.body.reportSummary}, please generate a report on the following topic:`;
  }
  let messages = [
    {
      role: "system",
      content: `You are an expert at generating an interesting research report for given prompt in the areas of ${expertiseString}. You always return answers with no explanation. You always return responses in html format inside a <div id="report"></div>. The report title is always in an <h2 id="reportTitle"> within the <div id="report">. Each tag within the <div id="report"> has a unique 12-digit id attribute. ${specializedTrainingString}`,
    },
    {
      role: "user",
      content: `what are the applications of Natural Language Processing in the modern digital landscape?`,
    },
    {
      role: "assistant",
      content: `<div>
          <h2 id="reportTitle">Natural Language Processing (NLP) in the Modern Digital Landscape</h2>
          
          <h3 id="${generateUniqueID()}">Applications:</h3>
          <ul id="${generateUniqueID()}">
              <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Search Engines:</strong> Major search engines like Google leverage NLP to provide more accurate and context-aware search results.</li>
              <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Chatbots and Virtual Assistants:</strong> Siri, Alexa, and Google Assistant, among others, use NLP to understand user queries and provide relevant responses.</li>
              <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Sentiment Analysis:</strong> Businesses analyze customer reviews and feedback using NLP to gain insights into consumer sentiments.</li>
              <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Content Recommendations:</strong> Platforms like Netflix and Spotify utilize NLP to analyze user preferences and deliver tailored content.</li>
              <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Translation Services:</strong> Real-time translation and transcription services, such as Google Translate, use NLP for accurate translations.</li>
          </ul>
          
      </div>`,
    },
  ];

  messages.push({
    role: "user",
    content: `${reportSummary} ${briefing}?`,
  });
  if (req.body.feedback && req.body.feedback.length > 0) {
    const feedback = { role: "user", content: `${req.body.feedback}` };
    const currentDraft = [{ role: "assistant", content: req.body.draft }];
    messages = [...messages, ...currentDraft, feedback];
  }
  console.log("write quick draft messages");
  console.log(messages);
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    // model: "gpt-3.5-turbo",
    messages,
    stream: true,
  });
  // const draftResponseContent = chat_completion.choices[0].message.content;
  // return draftResponseContent;

  let newAccumulatedContent = "";
  for await (const part of stream) {
    // process.stdout.write(part.choices[0]?.delta?.content || "");
    newAccumulatedContent += part.choices[0]?.delta?.content || "";
    const saveChunkToFirebase = await saveToFirebase(
      `/${
        process.env.NEXT_PUBLIC_env
          ? process.env.NEXT_PUBLIC_env
          : "localAsyncTasks"
      }/${process.env.serverUid}/${req.body.userId}/quickDraft/context/draft`,
      `${newAccumulatedContent}…`
    );
    // console.log("saveChunkToFirebase");
    // console.log(saveChunkToFirebase);
  }
  newAccumulatedContent += `${" ".repeat(3)}`;
  const saveDraftToFirebase = await saveToFirebase(
    `/${
      process.env.NEXT_PUBLIC_env
        ? process.env.NEXT_PUBLIC_env
        : "localAsyncTasks"
    }/${process.env.serverUid}/${req.body.userId}/quickDraft/context/draft`,
    `${newAccumulatedContent}}`
  );
  console.log("savedDraftToFirebase");
  return newAccumulatedContent;
}
export default async function draftReportHandler(req, res) {
  console.log("Quick Draft Report Endpoint");
  console.log(req.body);
  let draftVariable = "draft";
  let draftRequestObj = { ...req };

  if (req.body.researchLink1) {
    draftVariable = "draft1";
  }
  if (req.body.researchLink2) {
    draftVariable = "draft2";
  }
  if (req.body.researchLink3) {
    draftVariable = "draft3";
  }
  // if (req.method === "POST") {
  const draftResponseContent = await writeDraftFunction(draftRequestObj);
  if (draftResponseContent) {
    console.log(" draft report  endpoint");
    console.log(draftVariable);
    const responseObj = {
      message: "Success",
      // currentGeneration: +req.body.currentGeneration + 1,
    };
    responseObj[draftVariable] = draftResponseContent;
    return responseObj;
  } // Process a POST request
}
// else {
//   return res.send(500);
//   // Handle any other HTTP method
// }
// }
function generateUniqueID() {
  return Math.random().toString(36).substr(2, 9);
}
