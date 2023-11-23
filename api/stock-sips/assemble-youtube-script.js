import fs from "fs";
import cheerio from "cheerio";
import iconv from "iconv-lite";
import OpenAI from "openai";
import { parse } from "path";
import getLccs from "../../utils/getLccs.js";
const OPENAI_API_KEY = "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";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Your OpenAI API key goes here

// The function to summarize a chu nk of text

export default async function assembleYoutubeScriptHandler(req, res) {
  console.log("ASSEMBLE YOUTUBE SCRIPT ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const {
    snackName,
    companyName,
    teaName,
    stockScript,
    teaScript,
    snackScript,
    nextStock,
    nextTea,
    nextSnack,
    showName,
    channelName,
  } = req.body;
  const lccs = getLccs();
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Marvin is a stock market expert who loves to drink tea and eat snacks and analyze stocks. 
        The current episode of Stock Sips with Marvin comes in three parts with three distinct scripts and segments. At the end, there is a very brief DragonballZ-type call to action to watch the next video where we will talk about the next stock, snack, and tea. The CTA uses cliffhanger psychology to encourage viewers to watch the next episode. Details and especially numbers are very important in each script and should always be preserved. Your job is to write the intro and the outro for the episode. The intro should introduce the show and the host and the outro should tease the next episode. The script should be optimized for LCCS. ${lccs}. You return your response as valid JSON { "intro": "your intro script", "outro": "your outro script" }
        `,
      },
      {
        role: "user",
        content: `Create intro and outro scripts for the sole host of a youtube channel for the current episode of show: ${showName} on channel: ${channelName}. The show reviews a tea, a stock, and snack each episode.   { "currentStockForIntro": "${companyName}", "currentTeaForIntro": "${teaName}", "currentSnackForIntro": "${snackName}", "nextStockForOutro": "${nextStock}", "nextTeaForOutro": "${nextTea}", "nextStockForOutro": "${nextSnack}" }`,
      },
    ],
  });
  const introAndOutro = JSON.parse(response.choices[0].message.content);
  console.log("introAndOutro");
  console.log(introAndOutro);
  const intro = introAndOutro.intro;
  const outro = introAndOutro.outro;

  const episodeScript = `[Intro] ${intro} [Tea] ${teaScript} [Stock] ${stockScript} [Snack] ${snackScript} [Outro] ${outro}`;
  return {
    episodeScript,
  };
}
