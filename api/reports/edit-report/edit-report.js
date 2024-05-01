import saveToSupabase from "../../../utils/saveToSupabase.js";
import { getSupabase } from "../../../utils/supabase.js";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  const supabase = getSupabase();
  console.log("Edit Report Endpoint");
  console.log(req.body);
  const { reportId, newContent, reportContent } = req.body;
  // add to reportsHistory
  const resultContent = await formatNewContent(newContent, reportContent);
  console.log(`resultContent: ${resultContent}`);
  async function formatNewContent(newContent, reportContent) {
    try {
      const chat_completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Add the ids of the original report to the updated report. The structure should be as close as possible to the original report. The content should be 100% the new report.",
          },
          {
            role: "user",
            content: `the original: ${reportContent}. the updated: ${newContent}`,
          },
        ],
      });

      const resultContentResponse = chat_completion.choices[0].message.content;

      return resultContentResponse;
    } catch (error) {
      console.log(error);
      return console.log({ error });
    }
  }

  await saveToSupabase("reportHistory", {
    reportId,
    reportContent,
  }).catch((error) => console.log(error));

  try {
    const { data, error } = await supabase
      .from("reports")
      .update({
        reportContent: resultContent,
      })
      .eq("reportId", reportId);
    if (error) {
      console.log("error updating reportData");
      console.log(error);
    }
  } catch {
    console.log(`Error updating report with id ${reportId}`);
  }
  res.status(200).json({ status: 200, message: "Report edited successfully" });
}
