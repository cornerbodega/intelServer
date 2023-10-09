// @author Marvin-Rhone
import saveToSupabase from "../../../utils/saveToSupabase.js";
export default async function handler(req, res) {
  console.log("SAVE LINK ENDPOINT");
  console.log(req.body);
  // let parentReportId = req.body.parentReportId;
  // const researchLink = req.body.researchLink;
  // let highlightedText = req.body.highlightedText;
  // let elementId = req.body.elementId;
  // let childReportId = req.body.childReportId;
  // if (researchLink) {
  //   highlightedText = researchLink.highlightedText;
  //   elementId = researchLink.elementId;
  //   childReportId = researchLink.childReportId;
  //   parentReportId = req.body.researchLink.parentReportId;
  // }
  const { parentReportId, childReportId, researchLink } = req.body;
  const { highlightedText, elementId } = researchLink;
  // if (parentReportId) {
  // let childReportId = req.body.childReportId;

  // let elementId = req.body.elementId;

  const saveLinksObj = {
    body: {
      childReportId,
      parentReportId,
      highlightedText,
      // range,
      elementId,
    },
  };
  const saveLinksData = await saveToLinksTableFunction(saveLinksObj).catch(
    (error) => {
      console.log("SAVE LINKS DATA ERROR");
      console.log(error);
      return console.log({ error: error.message });
    }
  );
  console.log("saveLinksData");
  console.log(saveLinksData);
  return { saveLinksData };
  // await saveToLinksTableFunction();

  async function saveToLinksTableFunction(req) {
    console.log("saveToLinksTableFunction saveReportData");
    console.log("saveToLinksTableFunction req.body");
    console.log(req.body);
    // const reportId = req.body.reportId;
    const parentReportId = req.body.parentReportId;

    const childReportId = req.body.childReportId;
    const highlightedText = req.body.highlightedText;
    // const startIndex = req.body.startIndex;
    // const endIndex = req.body.endIndex;
    // const range = JSON.stringify({ startIndex, endIndex });
    // const range = req.body.range;
    const elementId = req.body.elementId;
    const newLinkModel = {
      childReportId,
      parentReportId,
      // range,
      highlightedText,
      elementId,
    };
    // if (parentReportId) {
    //   newLinkModel.parentReportId = parentReportId;
    // }
    console.log("newLinkModel");
    console.log(newLinkModel);
    return await saveToSupabase("links", newLinkModel);
  }
}
