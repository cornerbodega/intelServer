// @author Marvin-Rhone

export default async function handler(req, res) {
  console.log("STRIPE WEBHOOK ENDPOINT");

  // const { userId, type } = req.body;
  console.log(req.body);
  res
    .status(200)
    .json({ status: 200, message: "Stripe Webhook Received Successfully" });
}
