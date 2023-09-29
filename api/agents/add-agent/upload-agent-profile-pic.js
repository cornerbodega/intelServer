import lodash from "lodash";

// const { get } = lodash;

// import OpenAI from "openai";

import "dotenv/config";
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: "dcf11wsow",
  api_key: "525679258926845",
  api_secret: "GfxhZesKW1PXljRLIh5Dz6-3XgM",
  secure: true,
});

export default async function uploadAgentProfilePicHandler(req, res) {
  console.log("UPLOAD AGENT PROFILE PIC ENDPOINT");
  console.log("Input:");
  console.log(req.body);
  if (!req.body.imageUrl) {
    return { error: "No image url provided" };
  }
  const imageUrl = req.body.imageUrl;
  // const imageUrl = get(req, "body.imageUrl");
  const cloudinaryImageUploadResult = await cloudinary.uploader
    .upload(imageUrl)
    .catch((error) => console.log(error));
  // console.log("cloudinaryImageUploadResult");
  const profilePicUrl = cloudinaryImageUploadResult.url;
  // newAgentModel.profilePicUrl = profilePicUrl;
  return { profilePicUrl };
}
