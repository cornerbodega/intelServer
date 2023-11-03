import saveToSupabase from "../../../utils/saveToSupabase.js";
import { getSupabase } from "../../../utils/supabase.js";
export default async function handler(req, res) {
  const supabase = getSupabase();
  console.log("UPLOAD AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  const { draft, agentId, childReportId } = req.body;
  // async function udpateReportFunction({ draft, agentId, folderId }) {
  console.log("update report function");
  // console.log(draft);
  const reportPicUrl = req.body.reportPicUrl;
  const draftTitle = req.body.draftTitle;
  const briefingInput = req.body.briefingInput;
  const reportSummary = req.body.reportSummary;
  const userId = req.body.userId;
  const imageDescriptionResponseContent =
    req.body.imageDescriptionResponseContent;

  // SAVE REPORT TO SUPABASE
  let newReportModel = {};
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
  console.log("UPDATE REPORT IN SUPABASE");
  console.log(newReportModel);
  newReportModel = removeEmptyStringKeys(newReportModel);
  function removeEmptyStringKeys(obj) {
    return Object.keys(obj).reduce((acc, key) => {
      if (obj[key] !== "") {
        acc[key] = obj[key];
      }
      return acc;
    }, {});
  }
  try {
    const { data, error } = await supabase
      .from("reports")
      .update({
        ...newReportModel,
      })
      .eq("reportId", childReportId);

    if (error) {
      console.log(error);
    }
    // const saveReportData = await saveToSupabase(
    //   "reports",
    //   newReportModel
    // ).catch((error) => console.log(error));
    // const childReportId = saveReportData[0].reportId;
    return { childReportId };
  } catch (error) {
    console.log(error);
  }
  // }

  // const childReportId = await updateReportFunction({ draft, agentId });
  // return { childReportId };
}
