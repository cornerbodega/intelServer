import fs from "fs";
import cheerio from "cheerio";
import iconv from "iconv-lite";
import OpenAI from "openai";
const OPENAI_API_KEY = "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";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Your OpenAI API key goes here

// The function to summarize a chu nk of text

// Now you have cleaner tokens to work with

// console.log("tokens");
// console.log(JSON.stringify(tokens));

export default async function generateStockScriptHandler(req, res) {
  console.log("GENERATE STOCK SCRIPT ENDPOINT");
  console.log("Input:");
  console.log(req.body);

  const {
    financialStatements,
    price,
    shares,
    yahooRatios,
    companyName,
    companyTicker,
    russel100History,
    stockHistory,
  } = req.body;
  const profile = financialStatements.profile;
  const response = await openai.chat.completions
    .create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an expert on Benjamin Grahamian Financial Analysis for long-only US equity investing. ",
        },

        {
          role: "user",
          content: `Please analyze the following data for ${companyName} ($${companyTicker} ) and provide an equity BUY or PASS rating with a detailed justification.
          ${JSON.stringify({
            financialStatements,
            price,
            shares,
            yahooRatios,
            companyName,
            companyTicker,
            russel100History,
            stockHistory,
            profile,
          })}
          
          `,
        },
      ],
    })
    .catch((error) => {
      console.log("error in generate stock script");
      console.log(error);
    });
  console.log("Genereate stock script response");
  console.log(response);
  const stockScript = response.choices[0].message.content;
  return { stockScript };
}
