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
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You will take v1 and v2 of a report and assign the IDs from v1 to v2. It is important to only include v2 content in your response. For example: v1: <div id="1234">Dog</div><div id="5678">Cat</div> and v2: <div>Dogs</div>, you return <div id="1234>Dogs</div>`,
          },
          {
            role: "user",
            content: `v1: ${reportContent}. v2: ${newContent}`,
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
        reportTitle: resultContent
          .split(`<h2 id="reportTitle">`)[1]
          .split(`</h2>`)[0],
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
