// @author Marvin-Rhone
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: "dcf11wsow",
  api_key: "525679258926845",
  api_secret: "GfxhZesKW1PXljRLIh5Dz6-3XgM",
  secure: true,
});
export default async function handler(req, res) {
  const { imageUrl } = req.body;
  const cloudinaryImageUploadResult = await cloudinary.uploader
    .upload(imageUrl)
    .catch((error) => console.log(error));
  //   .then((result) => console.log(result))
  console.log("Report cloudinaryImageUploadResult");
  const reportPicUrl = cloudinaryImageUploadResult.url;

  return { reportPicUrl };
}
