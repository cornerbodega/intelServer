import OpenAI from "openai";
// import { saveToFirebase } from "../../../utils/saveToFirebase.js";
// import saveToFirebase from "../../../utils/saveToFirebase.js";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { onValue, set } from "firebase/database";

// import firebase from "./firebase.js";
import firebase from "../../../utils/firebase.js";
import saveToFirebase from "../../../utils/saveToFirebase.js";
// import { isActiveTab } from "./activeTab";
const db = firebase.db;
const ref = firebase.ref;
export default async function draftReportHandler(req, res) {
  console.log("STREAM draft Report Endpoint");
  console.log(req.body);
  console.log("STREAM CONTINUUM DRAFT FUNCTION INPUT:");
  console.log(req.body);
  const userId = req.body.userId;
  let researchLink = {};
  if (req.body.researchLink) {
    researchLink = req.body.researchLink;
  }
  console.log("researchLink");
  console.log(researchLink);
  // if (req.body.researchLink2) {
  //   researchLink = req.body.researchLink2;
  // }
  // if (req.body.researchLink3) {
  //   researchLink = req.body.researchLink3;
  // }

  const briefing = researchLink.researchQuestion;

  if (!briefing) {
    console.log("error 544: where is the researchquesiton");
    return;
  }

  let expertiseString = req.body.expertises[0];

  if (req.body.expertises.length > 1) {
    expertiseString += " and " + req.body.expertises[1];
  }
  if (req.body.expertises.length > 2) {
    expertiseString += " and " + req.body.expertises[2];
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
      content: `You are an expert at generating an interesting research report for given prompt in the areas of ${expertiseString}. You always return answers with no explanation. You always return responses in html format inside a <div id="report"></div>. The first child tag is an <h2 id="reportTitle">...</h2> within the <div id="report">. After the <div id="reportTitle">...</h2>, each subsequent tag within the <div id="report"> has a unique 12-digit id attribute.`,
    },
    {
      role: "user",
      content: `what are the applications of Natural Language Processing in the modern digital landscape?`,
    },
    {
      role: "assistant",
      content: `<div id="report">
            <h2 id="reportTitle">Natural Language Processing (NLP) in the Modern Digital Landscape</h2>
            
            <h3 id="${generateUniqueID()}">Introduction:</h3>
            <p id="${generateUniqueID()}">Natural Language Processing, a subfield of AI, focuses on enabling machines to understand and interpret human language. Its applications in the digital landscape are vast and transformative.</p>
            
            <h3 id="${generateUniqueID()}">Applications:</h3>
            <ul id="${generateUniqueID()}">
                <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Search Engines:</strong> Major search engines like Google leverage NLP to provide more accurate and context-aware search results.</li>
                <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Chatbots and Virtual Assistants:</strong> Siri, Alexa, and Google Assistant, among others, use NLP to understand user queries and provide relevant responses.</li>
                <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Sentiment Analysis:</strong> Businesses analyze customer reviews and feedback using NLP to gain insights into consumer sentiments.</li>
                <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Content Recommendations:</strong> Platforms like Netflix and Spotify utilize NLP to analyze user preferences and deliver tailored content.</li>
                <li id="${generateUniqueID()}"><strong id="${generateUniqueID()}">Translation Services:</strong> Real-time translation and transcription services, such as Google Translate, use NLP for accurate translations.</li>
            </ul>
            
            <h3 id="${generateUniqueID()}">Conclusion:</h3>
            <p id="${generateUniqueID()}">NLP's applications are vast and integral to many services in the modern digital age. Its capabilities have transformed how businesses interact with consumers and how users access and interpret information.</p>
        </div>`,
    },
  ];

  messages.push({
    role: "user",
    content: `${reportSummary} ${briefing}?`,
  });
  const feedback = req.body.feedback;
  if (feedback && feedback.length > 0) {
    messages = [...messages, ...feedback];
  }
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
    await saveToFirebase(
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.serverUid
      }/${req.body.userId}/continuum/context/draft`,
      `${newAccumulatedContent}`
    );
    // const saveChunkToFirebase = await set(
    //   ref(
    //     db,
    //     `/${process.env.NEXT_PUBLIC_env ? process.env.NEXT_PUBLIC_env : "localAsyncTasks"}/${process.env.serverUid}/${userId}/continuum/context/draft`
    //   ),
    //   `${newAccumulatedContent}…`
    // );
    // const saveChunkToFirebase = await saveToFirebase(
    //   `/${process.env.NEXT_PUBLIC_env ? process.env.NEXT_PUBLIC_env : "localAsyncTasks"}/${process.env.serverUid}/${req.body.userId}/continuum/context/draft`,
    //   `${newAccumulatedContent}…`
    // );
    // console.log("saveChunkToFirebase");
    // console.log(saveChunkToFirebase);
    // console.log("newAccumulatedContent");
    // console.log(newAccumulatedContent);
    // console.log("saveChunkToFirebase");
    // console.log(saveChunkToFirebase);
  }
  newAccumulatedContent = `${newAccumulatedContent}${" ".repeat(3)}`;
  const saveDraftToFirebase = await saveToFirebase(
    `/${
      process.env.NEXT_PUBLIC_env
        ? process.env.NEXT_PUBLIC_env
        : "localAsyncTasks"
    }/${process.env.serverUid}/${req.body.userId}/continuum/context/draft`,
    `${newAccumulatedContent}`
  );

  // const saveDraftToFirebase = await set(
  //   ref(
  //     db,
  //     `/${process.env.NEXT_PUBLIC_env ? process.env.NEXT_PUBLIC_env : "localAsyncTasks"}/${process.env.serverUid}/${userId}/continuum/context/draft`
  //   ),
  //   `${newAccumulatedContent}`
  // );
  // const saveDraftToFirebase = await saveToFirebase(
  //   `/${process.env.NEXT_PUBLIC_env ? process.env.NEXT_PUBLIC_env : "localAsyncTasks"}/${process.env.serverUid}/${req.body.userId}/continuum/context/draft`,
  //   `${newAccumulatedContent}${" ".repeat(3)}`
  // );
  return { draft: newAccumulatedContent };
}
function generateUniqueID() {
  return Math.random().toString(36).substr(2, 9);
}
