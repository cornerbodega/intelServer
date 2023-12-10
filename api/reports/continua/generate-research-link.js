// @author Marvin-Rhone
import { JSDOM } from "jsdom";
// import { getFromOpenAi } from "../../../../utils/getFromOpenAi.js";
// import getFromOpenAi from "../../../utils/getFromOpenAi.js";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  console.log("GENERATE RESEARCH LINK ENDPOINT");
  const { parentReportContent, existingHyperlinks } = req.body;
  console.log(req.body);
  // const generatedResearchLinks = await generateResearchLinks(draft);
  // async function generateResearchLinks(reportContent) {
  // ${parentReportContent}. Existing Hyperlinks: ${existingHyperlinks}

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

  // const linksExample = [
  //   {
  //     elementId: "nynf911g4",
  //     highlightedText: '"Data Ownership and Control"',
  //     researchQuestion:
  //       "Given the highlighted text 'Data Ownership and Control,' what are the potential shifts in traditional notions of data ownership and control when implementing blockchain and differential privacy in personalized healthcare recommendations?",
  //   },
  // ];
  // const existingHyperlinksExample = [
  //   {
  //     elementId: "qyld7glm7",
  //     highlightedText: '"Transparency and Accountability"',
  //     researchQuestion:
  //       "Considering the emphasis on 'Transparency and Accountability,' how can we ensure transparency in the algorithms used for personalized healthcare recommendations on blockchain and how can we hold them accountable to prevent biases?",
  //   },
  //   {
  //     createdAt: "2023-09-11T03:14:56.940684+00:00",
  //     elementId: "heg23wht7",
  //     highlightedText: '"Privacy-Preserving Techniques"',
  //     researchQuestion:
  //       "Regarding 'Privacy-Preserving Techniques,' what are the most effective privacy-preserving techniques based on differential privacy that can be employed to anonymize and aggregate healthcare data while still extracting valuable insights for personalized recommendations?",
  //   },
  // ];

  // this function will be called for each continuum iteration to generate the research questions and links
  // const linksCount = 1;
  console.log("generateResearchLinks existingHyperlinks");
  console.log(existingHyperlinks);

  let existingLinksList = "";

  if (existingHyperlinks) {
    if (existingHyperlinks.length > 0) {
      existingHyperlinks.forEach((link) => {
        existingLinksList += link.highlightedText + ", ";
      });
    }
  }
  console.log("existingLinksList");
  console.log(existingLinksList);
  const continuumPrompt = `Please read the following HTML report. Pretend you are highlighting up to one sentence with your cursor that you find most interesting. Write an interesting research question that deep dive into the highlighted text for the purpose of expanding and enhancing the current report. Return a JSON-only response containing JSON with the following format: [{ elementId, highlightedText, researchQuestion }]. `;
  console.log("continuumPrompt");
  console.log(continuumPrompt);
  const messages = [
    {
      role: "user",
      content: `${continuumPrompt} ${filteredReportContent}`,
    },
  ];
  const researchLinksResponse = await getFromOpenAi4(messages);
  async function getFromOpenAi4(messages) {
    const results = await openai.chat.completions
      .create({
        model: "gpt-4",
        messages: messages,
      })
      .catch((error) => {
        console.log("get from open ai error");
        console.log(error);
      });

    return results.choices[0].message.content;
  }
  console.log("generateResearchLinks researchLink");
  console.log(researchLinksResponse);
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
  console.log("save report researchLinksResponse researchLinks");
  console.log(researchLinks);
  // return researchLinks;
  // return researchLinksR
  // let researchLinksArray = researchLinks;
  // // if JSON.parse(researchLinks)
  // if (typeof researchLinks === "array") {
  //   researchLinksArray = researchLinks;
  // } else if (typeof suggestionResponseContent === "string") {
  //   researchLinksArray = JSON.parse(researchLinks);
  // }
  const researchLink = {
    ...researchLinks[0],
    briefingInput: researchLinks[0].researchQuestion,
  };
  // const researchLink2 = { ...researchLinks[1], ...parentAndChildReportIds };
  // const researchLink3 = { ...researchLinks[2], ...parentAndChildReportIds };
  const responseObj = {
    researchLink,
    // researchLink2,
    // researchLink3,
  };
  // console.log("generate research links responseObj");
  // console.log(responseObj);
  // return responseObj;
  // }
  console.log("READ CHILD REPORT ENDPOI researcLinks");
  console.log(responseObj);
  return responseObj;
}
