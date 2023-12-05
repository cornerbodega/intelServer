import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";

const storage = new Storage({
  keyFilename:
    "./api/reports/save-report/upload-image-to-gcs/missions-server-f90599a2c379.json",
});
const bucketName = "intelligence-images";
const bucket = storage.bucket(bucketName);

export default async function handler(req, res) {
  console.log("upload-image-to-gcs.js");
  console.log("req.body:");
  console.log(req.body);

  const { imageUrl, draftTitle, folderImageResponse, agentName } = req.body;
  let fileName = "";
  if (draftTitle) {
    fileName = draftTitle.split(" ").join("-"); // Replace spaces with dashes
  }
  if (folderImageResponse) {
    fileName = folderImageResponse.split(" ").join("-"); // Replace spaces with dashes
  }
  if (agentName) {
    fileName = agentName.split(" ").join("-"); // Replace spaces with dashes
  }
  fileName = slugify(fileName);
  function slugify(Text) {
    return Text.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  }
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer(); // Use arrayBuffer instead of buffer
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get("content-type");
  // const fileName = "your_desired_file_name"; // or dynamically generate based on the image
  const file = bucket.file(fileName);

  await file
    .save(buffer, {
      metadata: { contentType },
      // public: true, // if you want the file to be publicly accessible
    })
    .catch((err) => {
      console.error("ERROR IN GCS UPLOAD");
      console.error(err);
    });

  const picUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
  console.log("Report GCS Image Upload Result:", picUrl);
  // TODO: CREATE THUMBNAIL INTELLICARD VERSION AND REPORT VERSION
  const taskResponse = {};
  if (draftTitle) {
    taskResponse.reportPicUrl = picUrl;
  }
  if (folderImageResponse) {
    taskResponse.folderPicUrl = picUrl;
  }
  if (agentName) {
    taskResponse.profilePicUrl = picUrl;
  }

  return taskResponse;
}
