import saveToSupabase from "../../../utils/saveToSupabase.js";
export default async function handler(req, res) {
  console.log("UPLOAD AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const { draft, agentId, briefingInput } = req.body;
  async function saveReportFunction({ draft, agentId, briefingInput }) {
    console.log("save draft function");
    // console.log(draft);
    const reportPicUrl = req.body.reportPicUrl;
    const draftTitle = req.body.draftTitle;
    // const briefingInput = req.body.briefingInput;
    const reportSummary = req.body.reportSummary;
    const userId = req.body.userId;
    const imageDescriptionResponseContent =
      req.body.imageDescriptionResponseContent;
    // SAVE REPORT TO SUPABASE
    const newReportModel = {};
    newReportModel.reportPicUrl = reportPicUrl;
    newReportModel.reportTitle = draftTitle;
    newReportModel.reportContent = draft;
    newReportModel.briefingInput = briefingInput;
    newReportModel.agentId = agentId;
    newReportModel.reportSummary = reportSummary;
    newReportModel.userId = userId;
    newReportModel.reportPicDescription = imageDescriptionResponseContent;
    console.log(newReportModel);
    console.log("newReportModel");
    // Generate Report Summary and Sanitize Briefing
    // Tried to Batch calls to the API to save requests/min. Did not work well. The answers were mixed together.

    // Save to Supabase missions table
    // Go to report detail page and see image :D
    console.log("SAVE REPORT TO SUPABASE");
    console.log(newReportModel);

    const saveReportData = await saveToSupabase(
      "reports",
      newReportModel
    ).catch((error) => console.log(error));
    const childReportId = saveReportData[0].reportId;
    return childReportId;
  }
  const childReportId = await saveReportFunction({
    draft,
    agentId,
    briefingInput,
  });
  return { childReportId };
}
