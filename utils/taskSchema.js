import generateAgentNameHandler from "../api/agents/add-agent/generate-agent-name.js";
import generateExpertiseHandler from "../api/agents/add-agent/generate-expertise.js";
import generateAgentProfilePicHandler from "../api/agents/add-agent/generate-agent-profile-pic.js";
import uploadAgentProfilePicHandler from "../api/agents/add-agent/upload-agent-profile-pic.js";
import saveAgentToSupabaseHandler from "../api/agents/add-agent/save-agent-to-supabase.js";
import generateImagePromptForReportHandler from "../api/reports/save-report/generate-image-prompt-for-report.js";
import generateReportImageHandler from "../api/reports/save-report/generate-report-image.js";
import uploadReportImageToCloudinaryHandler from "../api/reports/save-report/upload-report-image-to-cloudinary.js";
import generateReportSummaryHandler from "../api/reports/save-report/generate-report-summary.js";
import saveReportToSupabaseHandler from "../api/reports/save-report/save-report-to-supabase.js";
import updateReportInSupabaseHandler from "../api/reports/save-report/update-report-in-supabase.js";
import streamContinuumDraftHandler from "../api/reports/draft-report/stream-continuum-draft-handler.js";
import getResearchLinkFromUserHandler from "../api/reports/save-linked-report/get-research-link-from-user.js";
import saveLinkHandler from "../api/reports/save-report/save-link.js";
import handleReportFolderingHandler from "../api/reports/save-report/handle-report-foldering.js";
import regenerateFolderNameHandler from "../api/reports/regenerate-folder/regenerate-folder-name.js";
import generateFolderImagePromptHandler from "../api/reports/regenerate-folder/generate-folder-image-prompt.js";
import generateFolderImageHandler from "../api/reports/regenerate-folder/generate-folder-image.js";
import uploadFolderImageToCloudinaryHandler from "../api/reports/regenerate-folder/upload-folder-image-to-cloudinary.js";
import saveFolderNameAndImageHandler from "../api/reports/regenerate-folder/save-folder-name-and-image.js";
import generateResearchLinkHandler from "../api/reports/continua/generate-research-link.js";
import queueRegenerateFolderTaskHandler from "../api/reports/regenerate-folder/queue-regenerate-folder-task.js";
import writeQuickDraftHandler from "../api/reports/quick-draft/quick-draft.js";
import saveFolderIdToFirebaseHandler from "../api/reports/save-report/save-folder-id-to-firebase.js";
import chargeTokensHandler from "../api/reports/charge-tokens/charge-tokens.js";
export default function taskSchema() {
  return {
    addAgent: {
      inputs: ["userId"],
      outputs: [],
      subtasks: [
        {
          taskName: "generateExpertise",
          function: generateExpertiseHandler,
          // endpoint: "/api/agents/add-agent/generate-expertise",
          inputs: ["expertiseInput", "specializedTraining", "userId"],
          outputs: ["expertiseOutput"],
        },
        {
          taskName: "generateAgentName",
          function: generateAgentNameHandler,
          // endpoint: "/api/agents/add-agent/generate-agent-name",
          inputs: ["expertiseOutput", "specializedTraining", "userId"],
          outputs: ["agentName", "bio"],
        },
        {
          taskName: "generateAgentProfilePic",
          function: generateAgentProfilePicHandler,
          // endpoint: "/api/agents/add-agent/generate-agent-profile-pic",
          inputs: ["agentName", "userId"],
          outputs: ["imageUrl"],
        },
        {
          taskName: "uploadAgentProfilePic",
          function: uploadAgentProfilePicHandler,
          // endpoint: "/api/agents/add-agent/upload-agent-profile-pic",
          inputs: ["imageUrl", "userId"],
          outputs: ["profilePicUrl"],
        },
        {
          taskName: "saveAgent",
          function: saveAgentToSupabaseHandler,
          // endpoint: "/api/agents/add-agent/save-agent-to-supabase",
          inputs: [
            "profilePicUrl",
            "agentName",
            "bio",
            "expertiseOutput",
            "userId",
          ],
          outputs: ["agentId"],
        },
        // replace calling this client-side routing task function with listening to firebase and changing the route as part of the UX routing early painting system
        // {
        //   taskName: "goToAgentProfile",
        //   function: goToAgentProfile,
        //   inputs: ["agentId", "userId"],
        //   outputs: [],
        // },
      ],
    },
    // writeDraftReport: {
    //   // // 3. This one charges
    //   // function: draftReportStreamHandler,
    //   // inputs: [
    //   //   "reportLength",
    //   //   "briefingInput",
    //   //   "expertises",
    //   //   "feedback",
    //   // ],
    //   // outputs: ["draftResponseContent", "currentGeneration"],
    //   taskName: "writeQuickDraft",
    //   function: writeQuickDraftHandler,
    //   inputs: [
    //     "expertiseOutput",
    //     "briefingInput",
    //     "feedbacks",
    //     "userId",
    //     // "previousDraft", // the previous draft to feebdack on
    //     "reportLength",
    //   ],
    //   outputs: ["draft"],
    // },
    quickDraft: {
      // function: quickDraftHandler,
      // endpoint: "/api/reports/draft-report/draft-report",
      inputs: [
        "reportLength",
        "briefingInput",
        "userId",
        "existingExpertise",
        // "previousDraft",
        // "expertises",
        // "specializedTraining",
        "feedbacks",
        // "maxGenerations",
        // "currentGeneration",
      ],
      outputs: ["draft"],
      subtasks: [
        {
          taskName: "generateExpertise",
          function: generateExpertiseHandler,
          inputs: [
            "existingExpertise",
            "briefingInput",
            "specializedTraining",
            "userId",
          ],
          outputs: ["expertiseOutput"],
        },
        {
          // 1. This one charges
          taskName: "writeQuickDraft",
          function: writeQuickDraftHandler,
          inputs: [
            "expertiseOutput",
            "briefingInput",
            "feedbacks",
            "userId",
            "previousDraft", // the previous draft to feebdack on
            "reportLength",
          ],
          outputs: ["draft"],
        },
        {
          taskName: "chargeTokens",
          function: chargeTokensHandler,
          inputs: ["userId", "reportLength", "draft"],
          outputs: ["chargeSuccessful"],
        },
      ],
    },
    continuum: {
      inputs: [
        "reportLength",
        "parentReportId",
        "userId",
        "parentReportContent",
        "agentId",
        "expertises",
        "specializedTraining",
        "existingHyperlinks",
      ],
      outputs: [],
      subtasks: [
        {
          taskName: "generateResearchLink",
          function: generateResearchLinkHandler,
          inputs: [
            "parentReportId",
            "userId",
            "parentReportContent",
            "existingHyperlinks",
          ],
          outputs: ["researchLink"],
        },
        {
          // 2. This one charges
          taskSchema: "steamContinuumDraft",
          function: streamContinuumDraftHandler,
          inputs: ["researchLink", "expertises", "userId", "reportLength"],
          outputs: ["draft"],
        },
        {
          taskName: "chargeTokens",
          function: chargeTokensHandler,
          inputs: ["userId", "reportLength", "draft"],
          outputs: ["chargeSuccessful"],
        },
        {
          taskName: "saveReportWithoutImage",
          function: saveReportToSupabaseHandler,
          inputs: ["draft", "userId"],
          outputs: ["childReportId"],
        },
        {
          taskName: "handleReportFoldering",
          function: handleReportFolderingHandler,
          inputs: ["childReportId", "parentReportId", "userId"],
          outputs: ["folderId"],
        },
        {
          taskName: "saveFolderIdToFirebase",
          function: saveFolderIdToFirebaseHandler,
          inputs: ["folderId", "userId"],
          outputs: [],
        },

        {
          taskName: "getImagePromptForReport",
          function: generateImagePromptForReportHandler,
          inputs: ["draft"],
          outputs: ["imageDescriptionResponseContent"],
        },
        {
          taskName: "generateReportImage",
          function: generateReportImageHandler,
          inputs: ["imageDescriptionResponseContent", "userId"],
          outputs: ["imageUrl, draftTitle"],
        },
        {
          taskName: "uploadReportImageToCloudinary",
          function: uploadReportImageToCloudinaryHandler,
          endpoint:
            "/api/reports/save-report/upload-report-image-to-cloudinary",
          inputs: ["imageUrl"],
          outputs: ["reportPicUrl"],
        },
        {
          taskName: "getReportSummary",
          function: generateReportSummaryHandler,
          endpoint: "/api/reports/save-report/generate-report-summary",
          inputs: ["draft"],
          outputs: ["reportSummary"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefing",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },

        {
          taskName: "saveLink",
          function: saveLinkHandler,
          inputs: ["parentReportId", "childReportId", "userId", "researchLink"],
          outputs: ["saveLinksData"],
        },
      ],
    },
    finalizeAndVisualizeReport: {
      inputs: [
        "draft",
        "briefing",
        "userId",
        "parentReportId",
        "expertiseOutput",
        "specializedTraining",
      ],
      outputs: [],
      subtasks: [
        {
          taskName: "saveReportWithoutImage",
          function: saveReportToSupabaseHandler,
          inputs: ["draft", "userId", "briefing"],
          outputs: ["childReportId"],
        },
        {
          taskName: "handleReportFoldering",
          function: handleReportFolderingHandler,
          inputs: ["childReportId", "parentReportId", "userId"],
          outputs: ["folderId"],
        },
        {
          taskName: "saveFolderIdToFirebase",
          function: saveFolderIdToFirebaseHandler,
          inputs: ["folderId", "userId"],
          outputs: [],
        },

        {
          taskName: "getImagePromptForReport",
          // endpoint: "/api/reports/save-report/generate-image-prompt-for-report",
          function: generateImagePromptForReportHandler,
          inputs: ["draft"],
          outputs: ["imageDescriptionResponseContent"],
        },
        {
          taskName: "generateReportImage",
          // endpoint: "/api/reports/save-report/generate-report-image",
          function: generateReportImageHandler,
          inputs: ["imageDescriptionResponseContent", "userId"],
          outputs: ["imageUrl, draftTitle"],
        },
        {
          taskName: "uploadReportImageToCloudinary",
          function: uploadReportImageToCloudinaryHandler,
          endpoint:
            "/api/reports/save-report/upload-report-image-to-cloudinary",
          inputs: ["imageUrl"],
          outputs: ["reportPicUrl"],
        },
        {
          taskName: "getReportSummary",
          function: generateReportSummaryHandler,
          endpoint: "/api/reports/save-report/generate-report-summary",
          inputs: ["draft"],
          outputs: ["reportSummary"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefing",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },

        // {
        //   taskName: "saveLinks",
        //   function: saveLinksHandler,
        //   // endpoint: "/api/reports/save-report/save-links",
        //   inputs: [
        //     "parentReportId",
        //     "childReportId",
        //     "highlightedText",
        //     "elementId",
        //     "userId",
        //   ],
        //   outputs: ["saveLinksData"],
        // },
        {
          taskName: "queueRegenerateFolderTask",
          function: queueRegenerateFolderTaskHandler,
          // endpoint: "/api/reports/save-report/start-generate-continua-tasks",
          inputs: ["folderId", "userId"],
          outputs: [],
        },
        {
          taskName: "generateAgentName",
          function: generateAgentNameHandler,
          // endpoint: "/api/agents/add-agent/generate-agent-name",
          inputs: ["expertiseOutput", "specializedTraining", "userId"],
          outputs: ["agentName", "bio"],
        },
        {
          taskName: "generateAgentProfilePic",
          function: generateAgentProfilePicHandler,
          // endpoint: "/api/agents/add-agent/generate-agent-profile-pic",
          inputs: ["agentName", "userId"],
          outputs: ["imageUrl"],
        },
        {
          taskName: "uploadAgentProfilePic",
          function: uploadAgentProfilePicHandler,
          // endpoint: "/api/agents/add-agent/upload-agent-profile-pic",
          inputs: ["imageUrl", "userId"],
          outputs: ["profilePicUrl"],
        },
        {
          taskName: "saveAgent",
          function: saveAgentToSupabaseHandler,
          // endpoint: "/api/agents/add-agent/save-agent-to-supabase",
          inputs: [
            "profilePicUrl",
            "agentName",
            "bio",
            "expertiseOutput",
            "userId",
          ],
          outputs: ["agentId"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefing",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },
      ],
    },
    saveLinkedReport: {
      inputs: [
        "userId",
        "agentId",
        "parentReportContent",
        "parentReportId",
        "hightlightedText",
        "elementId",
        "draft",
      ],
      outputs: [],
      subtasks: [
        {
          taskName: "saveReportWithoutImage",
          function: saveReportToSupabaseHandler,
          inputs: ["draft", "userId"],
          outputs: ["childReportId"],
        },
        {
          taskName: "handleReportFoldering",
          function: handleReportFolderingHandler,
          inputs: ["childReportId", "parentReportId", "userId"],
          outputs: ["folderId"],
        },
        {
          taskName: "saveFolderIdToFirebase",
          function: saveFolderIdToFirebaseHandler,
          inputs: ["folderId", "userId"],
          outputs: [],
        },

        {
          taskName: "getImagePromptForReport",
          function: generateImagePromptForReportHandler,
          inputs: ["draft"],
          outputs: ["imageDescriptionResponseContent"],
        },
        {
          taskName: "generateReportImage",
          function: generateReportImageHandler,
          inputs: ["imageDescriptionResponseContent", "userId"],
          outputs: ["imageUrl, draftTitle"],
        },
        {
          taskName: "uploadReportImageToCloudinary",
          function: uploadReportImageToCloudinaryHandler,
          endpoint:
            "/api/reports/save-report/upload-report-image-to-cloudinary",
          inputs: ["imageUrl"],
          outputs: ["reportPicUrl"],
        },
        {
          taskName: "getReportSummary",
          function: generateReportSummaryHandler,
          endpoint: "/api/reports/save-report/generate-report-summary",
          inputs: ["draft"],
          outputs: ["reportSummary"],
        },
        {
          taskName: "updateReportInSupabase",
          function: updateReportInSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
            "childReportId",
            "draft",
            "agentId",
            "userId",
            "reportPicUrl",
            "reportSummary",
            "briefing",
            "draftTitle",
            "imageDescriptionResponseContent",
          ],
          outputs: ["childReportId"],
        },
        {
          taskName: "getResearchLinkFromUser",
          function: getResearchLinkFromUserHandler,
          inputs: ["userId", "highlightedText", "elementId"],
          outputs: ["researchLink"],
        },
        {
          taskName: "saveLink",
          function: saveLinkHandler,
          inputs: ["parentReportId", "childReportId", "userId", "researchLink"],
          outputs: ["saveLinksData"],
        },
      ],
    },
    // saveReport: {
    //   inputs: [
    //     "draft",
    //     "agentId",
    //     "expertises",
    //     "specializedTraining",
    //     "parentReportId",
    //     "userId",
    //     "maxGenerations",
    //     "currentGeneration",
    //     "draft1",
    //     "draft2",
    //     "draft3",
    //     "researchLink1",
    //     "researchLink2",
    //     "researchLink3",
    //   ],
    //   outputs: [],
    //   subtasks: [
    //     {
    //       taskName: "getImagePromptForReport",
    //       // endpoint: "/api/reports/save-report/generate-image-prompt-for-report",
    //       function: generateImagePromptForReportHandler,
    //       inputs: ["draft"],
    //       outputs: ["imageDescriptionResponseContent"],
    //     },
    //     {
    //       taskName: "generateReportImage",
    //       // endpoint: "/api/reports/save-report/generate-report-image",
    //       function: generateReportImageHandler,
    //       inputs: ["imageDescriptionResponseContent", "userId"],
    //       outputs: ["imageUrl, draftTitle"],
    //     },
    //     {
    //       taskName: "uploadReportImageToCloudinary",
    //       function: uploadReportImageToCloudinaryHandler,
    //       endpoint:
    //         "/api/reports/save-report/upload-report-image-to-cloudinary",
    //       inputs: ["imageUrl"],
    //       outputs: ["reportPicUrl"],
    //     },
    //     {
    //       taskName: "getReportSummary",
    //       function: generateReportSummaryHandler,
    //       endpoint: "/api/reports/save-report/generate-report-summary",
    //       inputs: ["draft"],
    //       outputs: ["reportSummary"],
    //     },
    //     {
    //       taskName: "saveReportToSupabase",
    //       function: saveReportToSupabaseHandler,
    //       endpoint: "/api/reports/save-report/save-report-to-supabase",
    //       inputs: [
    //         "draft",
    //         "agentId",
    //         "userId",
    //         "reportPicUrl",
    //         "reportSummary",
    //         "briefing",
    //         "draftTitle",
    //         "imageDescriptionResponseContent",
    //       ],
    //       outputs: ["childReportId"],
    //     },

    //     // {
    //     //   taskName: "saveLinks",
    //     //   function: saveLinksHandler,
    //     //   // endpoint: "/api/reports/save-report/save-links",
    //     //   inputs: [
    //     //     "parentReportId",
    //     //     "childReportId",
    //     //     "highlightedText",
    //     //     "elementId",
    //     //     "userId",
    //     //   ],
    //     //   outputs: ["saveLinksData"],
    //     // },
    //     {
    //       taskName: "handleReportFoldering",
    //       function: handleReportFolderingHandler,
    //       // endpoint: "/api/reports/save-report/handle-report-foldering",
    //       inputs: ["childReportId", "parentReportId", "userId"],
    //       outputs: ["folderId"],
    //     },
    //     {
    //       taskName: "saveFolderIdToFirebase",
    //       function: saveFolderIdToFirebaseHandler,
    //       inputs: ["folderId", "userId"],
    //       outputs: [],
    //     },
    //     // {
    //     //   taskName: "startGenerateContinuumTasks",
    //     //   function: startGenerateContinuumTasksHandler,
    //     //   // endpoint: "/api/reports/save-report/start-generate-continua-tasks",
    //     //   inputs: [
    //     //     "childReportId",
    //     //     "parentReportId",
    //     //     "draft",
    //     //     "userId",
    //     //     "maxGenerations",
    //     //     "currentGeneration",
    //     //     "reportSummary",
    //     //     "expertises",
    //     //     "specializedTraining",
    //     //     "agentId",
    //     //   ],
    //     //   outputs: ["currentGeneration"],
    //     // },
    //     {
    //       taskName: "queueRegenerateFolderTask",
    //       function: queueRegenerateFolderTaskHandler,
    //       // endpoint: "/api/reports/save-report/start-generate-continua-tasks",
    //       inputs: ["folderId", "userId", "maxGenerations", "currentGeneration"],
    //       outputs: [],
    //     },

    //     // subtask to generate links for continua!
    //   ],
    // },
    regenerateFolder: {
      inputs: ["folderId", "userId"],
      outputs: [],
      subtasks: [
        {
          taskName: "regenerateFolderName",
          function: regenerateFolderNameHandler,
          // endpoint: "/api/reports/save-report/regenerate-folder-name",
          inputs: ["folderId"],
          outputs: ["folderName, folderDescription"],
        },
        {
          taskName: "generateFolderImagePrompt",
          function: generateFolderImagePromptHandler,
          // endpoint: "/api/reports/save-report/generate-folder-image-prompt",
          inputs: ["folderDescription", "userId"],
          outputs: ["folderImageResponse"],
        },
        {
          taskName: "generateFolderImage",
          function: generateFolderImageHandler,
          // endpoint: "/api/reports/save-report/generate-folder-image",
          inputs: ["folderImageResponse", "userId"],
          outputs: ["imageUrl"],
        },
        {
          taskName: "uploadFolderImageToCloudinary",
          function: uploadFolderImageToCloudinaryHandler,
          // endpoint: "/api/reports/save-report/upload-folder-image-to-cloudinary",
          inputs: ["imageUrl"],
          outputs: ["folderPicUrl"],
        },
        {
          taskName: "saveFolderNameAndImage",
          function: saveFolderNameAndImageHandler,
          // endpoint: "/api/reports/save-report/save-folder-name-and-image",
          inputs: [
            "folderPicUrl",
            "folderImageResponse",
            "folderId",
            "folderName",
            "folderDescription",
          ],
          outputs: [],
        },
      ],
    },
  };
}
