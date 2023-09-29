import lodash from "lodash";

const { get } = lodash;

import OpenAI from "openai";

import "dotenv/config";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("GENERATE AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
}
