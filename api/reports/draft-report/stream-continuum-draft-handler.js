import OpenAI from "openai";
// import { saveToFirebase } from "../../../utils/saveToFirebase.js";
// import saveToFirebase from "../../../utils/saveToFirebase.js";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { onValue, set } from "firebase/database";
import getExampleReportContent from "../../../utils/getExampleReportContent.js";
// import firebase from "./firebase.js";
import firebase from "../../../utils/firebase.js";
import saveToFirebase from "../../../utils/saveToFirebase.js";
import getReportLengthToWordCount from "../../../utils/constants/getReportLengthToWordCount.js";
// import { isActiveTab } from "./activeTab";
const db = firebase.db;
const ref = firebase.ref;
export default async function draftReportHandler(req, res) {
  console.log("STREAM draft Report Endpoint");
  console.log(req.body);
  console.log("STREAM CONTINUUM DRAFT FUNCTION INPUT:");
  console.log(req.body);
  const userId = req.body.userId;
  let reportLength = req.body.reportLength;
  if (!reportLength) {
    reportLength = "short";
  }
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

  const briefingInput = researchLink.researchQuestion;

  if (!briefingInput) {
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

  const reportLengthToWordCount = getReportLengthToWordCount();
  if (!reportLength) {
    reportLength = "short";
  }
  const reportWordCount = reportLengthToWordCount[reportLength];
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
      content: getExampleReportContent(),
    },
  ];

  messages.push({
    role: "user",
    content: `${briefingInput}?`,
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
