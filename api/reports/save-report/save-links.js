// @author Marvin-Rhone
import saveToSupabase from "../../../utils/saveToSupabase.js";
export default async function handler(req, res) {
  let parentReportId = req.body.parentReportId;
  const researchLink1 = req.body.researchLink1;
  const researchLink2 = req.body.researchLink2;
  const researchLink3 = req.body.researchLink3;
  if (researchLink1) {
    highlightedText = researchLink1.highlightedText;
    elementId = researchLink1.elementId;
    childReportId = researchLink1.childReportId;
    parentReportId = req.body.researchLink1.parentReportId;
  }
  if (researchLink2) {
    highlightedText = researchLink2.highlightedText;
    elementId = researchLink2.elementId;
    childReportId = researchLink2.childReportId;
    parentReportId = req.body.researchLink2.parentReportId;
  }
  if (researchLink3) {
    highlightedText = researchLink3.highlightedText;
    elementId = researchLink3.elementId;
    childReportId = researchLink3.childReportId;
    parentReportId = req.body.researchLink3.parentReportId;
  }

  if (parentReportId) {
    let childReportId = req.body.childReportId;
    let highlightedText = req.body.highlightedText;
    // const startIndex = req.body.startIndex;
    // const endIndex = req.body.endIndex;
    // const range = JSON.stringify({ startIndex, endIndex });
    let elementId = req.body.elementId;

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
        console.log(error);
        return console.log({ error: error.message });
      }
    );
    return { saveLinksData };
    // await saveToLinksTableFunction();
  } else {
    return {};
  }
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
