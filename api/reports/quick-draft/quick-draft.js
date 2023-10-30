import OpenAI from "openai";
// import { saveToFirebase } from "../../../utils/saveToFirebase.js";
import saveToFirebase from "../../../utils/saveToFirebase.js";
import saveToSupabase from "../../../utils/saveToSupabase.js";
import getReportLengthToWordCount from "../../../utils/constants/getReportLengthToWordCount.js";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function writeDraftFunction(req) {
  console.log("WRITE QUICK DRAFT FUNCTION INPUT:");
  console.log(req.body);

  let { briefingInput, reportLength } = req.body;
  const briefing = briefingInput;
  if (!briefing) {
    console.log("Write Quick Draft Error 544: Where is the researchquesiton");
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
  const reportLengthToWordCount = getReportLengthToWordCount();
  console.log("reportLengthToWordCount");
  console.log(reportLengthToWordCount);
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
      content: `In 80 words: what are the applications of Natural Language Processing in the modern digital landscape?`,
    },
    {
      role: "assistant",
      content: `<div id="report">
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
    content: `In ${reportWordCount} words: ${briefing}?`,
  });
  if (req.body.feedbacks && req.body.feedbacks.length > 0) {
    for (let i = 0; i < req.body.feedbacks.length; i++) {
      messages.push({
        role: "assistant",
        content: req.body.feedbacks[i].draft,
      });
      messages.push({
        role: "user",
        content: req.body.feedbacks[i].feedback,
      });
    }
  }
  // if (req.body.feedback && req.body.feedback.length > 0) {
  //   const feedback = { role: "user", content: `${req.body.feedback}` };
  //   const currentDraft = [
  //     { role: "assistant", content: req.body.previousDraft },
  //   ];
  //   messages = [...messages, ...currentDraft, feedback];
  // }
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
      `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
        process.env.serverUid
      }/${req.body.userId}/quickDraft/context/draft`,
      `${newAccumulatedContent}…`
    );
    // console.log("saveChunkToFirebase");
    // console.log(saveChunkToFirebase);
  }
  newAccumulatedContent += `${" ".repeat(3)}`;
  const saveDraftToFirebase = await saveToFirebase(
    `/${process.env.NEXT_PUBLIC_env ? "asyncTasks" : "localAsyncTasks"}/${
      process.env.serverUid
    }/${req.body.userId}/quickDraft/context/draft`,
    `${newAccumulatedContent}}`
  );
  console.log("savedDraftToFirebase");

  return newAccumulatedContent;
}
export default async function quickDraftReportHandler(req, res) {
  console.log("Quick Draft Report Endpoint");
  console.log(req.body);

  let draftRequestObj = { ...req };

  const draftResponseContent = await writeDraftFunction(draftRequestObj);
  if (draftResponseContent) {
    console.log(" draft report  endpoint");

    return { draft: draftResponseContent };
  }
}

function generateUniqueID() {
  return Math.random().toString(36).substr(2, 9);
}
