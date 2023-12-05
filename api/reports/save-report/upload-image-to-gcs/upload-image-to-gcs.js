import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";
import Jimp from "jimp";

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
  const {
    imageUrl,
    draftTitle,
    folderImageResponse,
    agentName,
    imageDescriptionResponseContent,
  } = req.body;
  let baseFileName = slugify(draftTitle || folderImageResponse || agentName);
  if (imageDescriptionResponseContent && draftTitle) {
    baseFileName = slugify(`${draftTitle}-${imageDescriptionResponseContent}`);
  }
  if (agentName) {
    baseFileName = slugify(`${agentName}-${Math.floor(Math.random() * 100)}`);
  }
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const image = await Jimp.read(buffer);
  const originalFileName = `${baseFileName}-original.png`;
  const smallFileName = `${baseFileName}-small.png`;
  const mediumFileName = `${baseFileName}-medium.png`;

  // Save original image
  await saveImageToGCS(baseFileName, originalFileName, buffer);

  // Resize and save smaller versions
  await saveResizedImageToGCS(baseFileName, smallFileName, image, 342);
  await saveResizedImageToGCS(baseFileName, mediumFileName, image, 547);

  const picUrls = {
    originalPicUrl: constructGCSUrl(originalFileName, baseFileName),
    smallPicUrl: constructGCSUrl(smallFileName, baseFileName),
    mediumPicUrl: constructGCSUrl(mediumFileName, baseFileName),
  };
  const taskResponse = {};
  if (draftTitle) {
    taskResponse.reportPicUrl = picUrls.mediumPicUrl;
  }
  if (folderImageResponse) {
    taskResponse.folderPicUrl = picUrls.mediumPicUrl;
  }
  if (agentName) {
    taskResponse.profilePicUrl = picUrls.mediumPicUrl;
  }
  return taskResponse;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

function constructGCSUrl(fileName, baseFileName) {
  return `https://storage.googleapis.com/${bucketName}/${baseFileName}/${fileName}`;
}

async function saveImageToGCS(baseFileName, fileName, buffer) {
  const file = bucket.file(`${baseFileName}/${fileName}`);
  await file.save(buffer);
}

async function saveResizedImageToGCS(baseFileName, fileName, image, height) {
  const resizedBuffer = await image
    .clone()
    .resize(Jimp.AUTO, height)
    .getBufferAsync(Jimp.MIME_PNG);
  await saveImageToGCS(baseFileName, fileName, resizedBuffer);
}
