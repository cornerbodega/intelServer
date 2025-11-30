// @author Marvin-Rhone
import saveToSupabase from "../../../utils/saveToSupabase.js";
import { getSupabase } from "../../../utils/supabase.js";

export default async function handler(req, res) {
  console.log("SAVE LINK ENDPOINT");
  console.log(req.body);

  const { parentReportId, childReportId, researchLink } = req.body;
  const { highlightedText, elementId } = researchLink;

  if (!parentReportId) {
    return console.log(`[Save Link] This is not a linked report`);
  }

  if (!elementId || !highlightedText) {
    console.log(`[Save Link] Missing elementId or highlightedText`);
    console.log(`elementId: ${elementId}, highlightedText: ${highlightedText}`);
    return { saveLinksData: null };
  }

  // If elementId was dynamically generated, update parent report content
  if (elementId.startsWith("highlight-")) {
    await updateParentReportWithElementId(parentReportId, elementId, highlightedText);
  }

  const saveLinksObj = {
    body: {
      childReportId,
      parentReportId,
      highlightedText,
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

  return { saveLinksData };

  async function saveToLinksTableFunction(req) {
    const parentReportId = req.body.parentReportId;
    const childReportId = req.body.childReportId;
    const highlightedText = req.body.highlightedText;
    const elementId = req.body.elementId;
    const newLinkModel = {
      childReportId,
      parentReportId,
      highlightedText,
      elementId,
    };
    return await saveToSupabase("links", newLinkModel);
  }

  async function updateParentReportWithElementId(reportId, elementId, highlightedText) {
    const supabase = getSupabase();

    // Fetch the parent report
    const { data: report, error: fetchError } = await supabase
      .from("reports")
      .select("reportContent")
      .eq("reportId", reportId)
      .single();

    if (fetchError || !report) {
      console.log(`[Save Link] Error fetching parent report: ${fetchError?.message}`);
      return;
    }

    let content = report.reportContent;

    // Escape special regex characters in highlighted text
    const escapedText = highlightedText
      .replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
      .replace(/\s+/g, "\\s+");

    // Find and wrap the highlighted text in a span with the elementId
    // Look for the text within paragraph or other block elements
    const patterns = [
      // Match text inside <p> tags
      new RegExp(`(<p[^>]*>)([^<]*?)(${escapedText})([^<]*?)(</p>)`, "i"),
      // Match text inside any tag
      new RegExp(`(>)([^<]*?)(${escapedText})([^<]*?)(<)`, "i"),
    ];

    let updated = false;
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, (match, before, preText, text, postText, after) => {
          updated = true;
          return `${before}${preText}<span id="${elementId}">${text}</span>${postText}${after}`;
        });
        break;
      }
    }

    if (updated) {
      const { error: updateError } = await supabase
        .from("reports")
        .update({ reportContent: content })
        .eq("reportId", reportId);

      if (updateError) {
        console.log(`[Save Link] Error updating parent report: ${updateError.message}`);
      } else {
        console.log(`[Save Link] Successfully added elementId ${elementId} to parent report ${reportId}`);
      }
    } else {
      console.log(`[Save Link] Could not find highlighted text in parent report content`);
    }
  }
}
