// @author Marvin-Rhone
import { JSDOM } from "jsdom";

import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("GENERATE RESEARCH LINK ENDPOINT");
  console.log(req.body);
  const { parentReportContent, existingHyperlinks } = req.body;

  const filteredReportContent = removeHighlightedText(
    parentReportContent,
    existingHyperlinks
  );

  function removeHighlightedText(html, links) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    if (!links) return document.body.innerHTML;
    links.forEach((link) => {
      const element = document.querySelector(`[id="${link.elementId}"]`);
      if (element) {
        // Removing the quotes from the highlighted text before replacing it
        const unquotedHighlightedText = link.highlightedText.replace(/"/g, "");
        // element.innerHTML = "";
        element.innerHTML = element.innerHTML.replace(
          unquotedHighlightedText,
          ``
        );
      }
    });
    console.log("removeHighlightedText document.body.innerHTML");
    console.log(document.body.innerHTML);
    return document.body.innerHTML;
  }

  let existingLinksList = "";

  if (existingHyperlinks) {
    if (existingHyperlinks.length > 0) {
      existingHyperlinks.forEach((link) => {
        existingLinksList += link.highlightedText + ", ";
      });
    }
  }

  const messages = [
    {
      role: "system",
      content: `Please read the following HTML report. Pretend you are highlighting up to one sentence with your cursor that you find most interesting. Write an interesting research question that deep dive into the highlighted text for the purpose of expanding and enhancing the current report. Return a JSON-only response containing JSON with the following format: [{ elementId, highlightedText, researchQuestion }].`,
    },
    {
      role: "user",
      content: `<div id="report">
  <h2 id="reportTitle">
    Exploring the Applications of Natural Language Processing
  </h2>

  <h3>Introduction:</h3>
  <p>
    Natural Language Processing (NLP) is a key technology in enabling computers to understand and respond to human language in a meaningful way. Its applications are diverse and span numerous industries.
  </p>

  <h3 id="applicationOverview">Application Overview:</h3>
  <ul id="applicationList">
    <li>
      <strong id="application1">Customer Support:</strong>
      <div id="application1Details">
        Automated systems such as chatbots and virtual assistants use NLP to handle customer inquiries, provide information, and resolve issues efficiently.
      </div>
    </li>
    <li>
      <strong id="application2">Content Generation:</strong>
      <div id="application2Details">
        NLP tools can automatically generate written content, ranging from news articles to product descriptions, based on data inputs and templates.
      </div>
    </li>
    <li>
      <strong id="application3">Voice Recognition:</strong>
      <div id="application3Details">
        Voice-activated systems like Apple's Siri and Amazon's Alexa use NLP to interpret spoken commands, enabling hands-free operation of devices and services.
      </div>
    </li>
    <li>
      <strong id="application4">Language Translation:</strong>
      <div id="application4Details">
        Tools such as Google Translate utilize NLP to facilitate real-time translation of text and speech across different languages.
      </div>
    </li>
    <li>
      <strong id="application5">Market Research:</strong>
      <div id="application5Details">
        Companies use sentiment analysis powered by NLP to assess public opinion about products and brands by analyzing social media and reviews.
      </div>
    </li>
  </ul>

  <h3>Conclusion:</h3>
  <p>
    The vast array of NLP applications enhances various sectors, facilitating better communication, improved customer experiences, and data-driven insights, thereby highlighting its significance in today's digital landscape.
  </p>
</div>
`,
    },
    {
      role: "assistant",
      content: `${JSON.stringify([
        {
          elementId: "application5Details",
          highlightedText:
            "Companies leverage advanced sentiment analysis techniques powered by NLP to extract nuanced public sentiment from diverse sources such as multilingual social media streams, product reviews, and customer forums.",
          researchQuestion:
            "What role can transformer-based NLP models (e.g., BERT, RoBERTa, XLM-R) play in enhancing the detection of sarcasm, irony, and cultural context in multilingual sentiment analysis for global market research?",
        },
      ])}}`,
    },
    {
      role: "user",
      content: `${filteredReportContent}`,
    },
  ];
  const researchLinksResponse = await getFromOpenAi4(messages);
  console.log("researchLinksResponse");
  console.log(researchLinksResponse);
  async function getFromOpenAi4(messages) {
    const results = await openai.chat.completions
      .create({
        model: "gpt-4o-mini",
        messages: messages,
      })
      .catch((error) => {
        console.log("get from open ai error");
        console.log(error);
      });
    function extractJsonString(input) {
      const match = input.match(/^```json\s*([\s\S]*?)\s*```$/);
      return match ? match[1].trim() : input;
    }
    return extractJsonString(results.choices[0].message.content);
  }

  let researchLinks = researchLinksResponse;
  if (typeof researchLinksResponse === "string") {
    researchLinks = (() => {
      try {
        return JSON.parse(researchLinksResponse);
      } catch {
        return researchLinksResponse;
      }
    })();
  }
  const researchLink = {
    ...researchLinks[0],
    briefingInput: researchLinks[0].researchQuestion,
  };

  const responseObj = {
    researchLink,
  };

  return responseObj;
}
