// Midjourney API utility (via midapi.ai)
import "dotenv/config";

const MIDJOURNEY_API_KEY = process.env.MIDJOURNEY_API_KEY;
const MIDAPI_BASE_URL = "https://api.midapi.ai/api/v1/mj";

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/dcf11wsow/image/upload/v1697948290/c5ejkmxbucery6xnz2mg.png";

/**
 * Generate image with Midjourney via midapi.ai
 * @param {string} prompt - The image generation prompt
 * @param {string} aspectRatio - Aspect ratio (default: "16:9")
 * @returns {Promise<string>} - The generated image URL
 */
export async function generateWithMidjourney(prompt, aspectRatio = "16:9") {
  if (!MIDJOURNEY_API_KEY) {
    console.error("❌ MIDJOURNEY_API_KEY not found in environment");
    return FALLBACK_IMAGE;
  }

  console.log("📤 Sending request to Midjourney API...");
  console.log("Prompt:", prompt.substring(0, 100) + "...");

  try {
    // Step 1: Submit generation request
    const submitResponse = await fetch(`${MIDAPI_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MIDJOURNEY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskType: "mj_txt2img",
        prompt: prompt,
        speed: "fast",
        aspectRatio: aspectRatio,
        version: "7",
      }),
    });

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text();
      console.error(`Midjourney API error: ${submitResponse.status} ${errorText}`);
      return FALLBACK_IMAGE;
    }

    const submitData = await submitResponse.json();

    if (submitData.code !== 200) {
      console.error(`Midjourney API error: ${submitData.msg || "Unknown error"}`);
      return FALLBACK_IMAGE;
    }

    const taskId = submitData.data.taskId;
    console.log(`✓ Task submitted: ${taskId}`);

    // Step 2: Poll for result
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max (5s intervals)

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `${MIDAPI_BASE_URL}/record-info?taskId=${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${MIDJOURNEY_API_KEY}`,
          },
        }
      );

      if (!statusResponse.ok) {
        console.error(`Status check failed: ${statusResponse.status}`);
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();

      if (statusData.code !== 200) {
        console.error(`Status check error: ${statusData.msg || "Unknown error"}`);
        attempts++;
        continue;
      }

      const taskData = statusData.data;
      const successFlag = taskData.successFlag;

      switch (successFlag) {
        case 0:
          console.log(`  Status: Generating... (attempt ${attempts + 1}/${maxAttempts})`);
          break;

        case 1:
          console.log("  Status: Completed!");
          const resultUrls = taskData.resultInfoJson?.resultUrls;
          if (!resultUrls || resultUrls.length === 0) {
            console.error("No result URLs in completed task");
            return FALLBACK_IMAGE;
          }
          return resultUrls[0].resultUrl; // Return first generated image

        case 2:
          console.error(`Task generation failed: ${taskData.errorMessage || "Unknown error"}`);
          return FALLBACK_IMAGE;

        case 3:
          console.error(`Generation failed: ${taskData.errorMessage || "Task created but generation failed"}`);
          return FALLBACK_IMAGE;

        default:
          console.log(`  Unknown status: ${successFlag}`);
      }

      attempts++;
    }

    console.error("Timeout waiting for Midjourney generation (10 minutes)");
    return FALLBACK_IMAGE;
  } catch (error) {
    console.error("Midjourney generation error:", error.message);
    return FALLBACK_IMAGE;
  }
}

export default { generateWithMidjourney };
