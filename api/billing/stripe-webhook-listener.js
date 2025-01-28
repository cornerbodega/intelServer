// import saveToSupabase from "../../utils/saveToSupabase.js";
// import { getSupabase } from "../../utils/supabase.js";
// import Stripe from "stripe";

// const stripe = new Stripe(process.env.PROD_STRIPE_KEY);
// const stripe = new Stripe(process.env.DEV_STRIPE_KEY);
export default async function handler(req, res) {
  // const supabase = getSupabase();
  console.log("ONE TIME PAYMENT ENDPOINT REACHED");
  console.log(req.body);
  res.sendStatus(200);
  // "whsec_7e18c95695b159ec59e73a837473cb8bce70b7b74f533da68a78791b25895817"
}
