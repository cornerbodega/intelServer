// import saveToSupabase from "../../../utils/saveToSupabase";
import saveToSupabase from "../../../utils/saveToSupabase.js";
import { getSupabase } from "../../../utils/supabase.js";

import "dotenv/config";

export default async function chargeTokensHandler(req, res) {
  console.log("CHARGE TOKENS ENDPOINT");
  console.log(req.body);
  const supabase = getSupabase();
  let chargeSuccessful = false;
  const { userId, reportLength, draft } = req.body;
  if (!draft) {
    console.log("No draft provided. Not charging user.");
    return;
    // return res.status(400).json({ error: "No draft provided" });
  }
  await chargeUserForDraft({ userId, reportLength });
  async function chargeUserForDraft({ userId, reportLength }) {
    const reportLengthToTokens = {
      short: 1,
      standard: 2,
      super: 4,
    };
    const tokensToCharge = reportLengthToTokens[reportLength];
    const oldTokens = await getTokensFromSupabaseForUser({ userId });
    const newTokens = oldTokens - tokensToCharge;
    const change = -1 * tokensToCharge;
    await updateUserTokens({ userId, newTokens });
    await updateTokenHistory({ userId, oldTokens, newTokens, change });

    async function updateUserTokens({ userId, newTokens }) {
      console.log("updateUserTokens");
      console.log("newTokens");
      console.log(newTokens);
      try {
        const { savedTokens, error } = await supabase
          .from("tokens")
          .upsert({
            tokens: newTokens,
            userId,
          })
          .eq("userId", userId);

        if (error) {
          console.log("error updating userTokens");
          console.log(error);
          return (chargeSuccessful = false);
        }
        return (chargeSuccessful = true);
      } catch (error) {
        console.log(error);
        return (chargeSuccessful = false);
      }
    }
    async function updateTokenHistory({
      userId,
      oldTokens,
      newTokens,
      change,
    }) {
      return await saveToSupabase("tokenHistory", {
        userId,
        oldTokens,
        newTokens,
        change,
      });
    }

    async function getTokensFromSupabaseForUser({ userId }) {
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("userId", userId);
      if (error) {
        console.log(error);
      }

      const tokenResponse = data;
      console.log("data");
      console.log(tokenResponse);
      if (error) {
        console.log("error getting userTokens");
        console.log(error);
      }
      let tokens = 0;
      if (tokenResponse) {
        if (tokenResponse[0]) {
          tokens = tokenResponse[0].tokens;
        }
      }
      return tokens;
    }
  }
  return { chargeSuccessful };
}
