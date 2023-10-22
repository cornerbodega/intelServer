import generateAgentNameHandler from "../api/agents/add-agent/generate-agent-name.js";
import generateExpertiseHandler from "../api/agents/add-agent/generate-expertise.js";
import generateAgentProfilePicHandler from "../api/agents/add-agent/generate-agent-profile-pic.js";
import uploadAgentProfilePicHandler from "../api/agents/add-agent/upload-agent-profile-pic.js";
import saveAgentToSupabaseHandler from "../api/agents/add-agent/save-agent-to-supabase.js";
import draftReportHandler from "../api/reports/draft-report/draft-report.js";
import draftReportStreamHandler from "../api/reports/draft-report/draft-report-stream.js";
import generateImagePromptForReportHandler from "../api/reports/save-report/generate-image-prompt-for-report.js";
import generateReportImageHandler from "../api/reports/save-report/generate-report-image.js";
import uploadReportImageToCloudinaryHandler from "../api/reports/save-report/upload-report-image-to-cloudinary.js";
import generateReportSummaryHandler from "../api/reports/save-report/generate-report-summary.js";
import saveReportToSupabaseHandler from "../api/reports/save-report/save-report-to-supabase.js";
import updateReportInSupabaseHandler from "../api/reports/save-report/update-report-in-supabase.js";
import streamContinuumDraftHandler from "../api/reports/draft-report/stream-continuum-draft-handler.js";
import saveLinksHandler from "../api/reports/save-report/save-links.js";
import saveLinkHandler from "../api/reports/save-report/save-link.js";
import handleReportFolderingHandler from "../api/reports/save-report/handle-report-foldering.js";
import regenerateFolderNameHandler from "../api/reports/regenerate-folder/regenerate-folder-name.js";
import generateFolderImagePromptHandler from "../api/reports/regenerate-folder/generate-folder-image-prompt.js";
import generateFolderImageHandler from "../api/reports/regenerate-folder/generate-folder-image.js";
import uploadFolderImageToCloudinaryHandler from "../api/reports/regenerate-folder/upload-folder-image-to-cloudinary.js";
import saveFolderNameAndImageHandler from "../api/reports/regenerate-folder/save-folder-name-and-image.js";
import startGenerateContinuumTasksHandler from "../api/reports/save-report/start-generate-continua-tasks.js";
import generateResearchLinksHandler from "../api/reports/continua/generate-research-links.js";
import generateResearchLinkHandler from "../api/reports/continua/generate-research-link.js";
import queueSaveReportTaskHandler from "../api/reports/continua/queue-save-report-task.js";
import queueRegenerateFolderTaskHandler from "../api/reports/regenerate-folder/queue-regenerate-folder-task.js";
import writeQuickDraftHandler from "../api/reports/quick-draft/write-quick-draft.js";
import saveFolderIdToFirebaseHandler from "../api/reports/save-report/save-folder-id-to-firebase.js";
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
    writeDraftReport: {
      function: draftReportStreamHandler,
      // endpoint: "/api/reports/draft-report/draft-report",
      inputs: [
        "briefing",
        "expertises",
        "specializedTraining",
        "feedback",
        "maxGenerations",
        "currentGeneration",
      ],
      outputs: ["draftResponseContent", "currentGeneration"],
    },
    quickDraft: {
      // function: quickDraftHandler,
      // endpoint: "/api/reports/draft-report/draft-report",
      inputs: [
        "briefingInput",
        "userId",
        "draft",
        // "expertises",
        // "specializedTraining",
        "feedback",
        // "maxGenerations",
        // "currentGeneration",
      ],
      outputs: ["draftResponseContent"],
      subtasks: [
        {
          taskName: "generateExpertise",
          function: generateExpertiseHandler,
          // endpoint: "/api/agents/add-agent/generate-expertise",
          inputs: ["briefingInput", "specializedTraining", "userId"],
          outputs: ["expertiseOutput"],
        },
        {
          taskName: "writeQuickDraft",
          function: writeQuickDraftHandler,
          // endpoint: "/api/reports/draft-report/draft-report",
          inputs: [
            "expertiseOutput",
            "briefingInput",
            "feedback",
            "draft",
            "userId",
          ],
          outputs: ["draftResponseContent"],
        },
      ],
    },
    continuum: {
      inputs: [
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
          // endpoint: "/api/reports/continua/generate-research-link",
          inputs: [
            "parentReportId",
            "userId",
            "parentReportContent",
            "existingHyperlinks",
          ],
          outputs: ["researchLink"],
        },
        {
          taskSchema: "steamContinuumDraft",
          function: streamContinuumDraftHandler,
          // endpoint: "/api/reports/draft-report/draft-report",
          inputs: [
            "researchLink",
            "expertises",
            "specializedTraining",
            "userId",
          ],
          outputs: ["draft"],
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

        {
          taskName: "saveLink",
          function: saveLinkHandler,
          // endpoint: "/api/reports/save-report/save-links",
          inputs: ["parentReportId", "childReportId", "userId", "researchLink"],
          outputs: ["saveLinksData"],
        },
        // {
        //   taskName: "queueRegenerateFolderTask",
        //   function: queueRegenerateFolderTaskHandler,
        //   // endpoint: "/api/reports/save-report/start-generate-continua-tasks",
        //   inputs: ["folderId", "userId"],
        //   outputs: [],
        // },
      ],
    },
    finalizeAndVisualizeReport: {
      inputs: [
        "draft",
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

        {
          taskName: "saveLinks",
          function: saveLinksHandler,
          // endpoint: "/api/reports/save-report/save-links",
          inputs: [
            "parentReportId",
            "childReportId",
            "highlightedText",
            "elementId",
            "userId",
          ],
          outputs: ["saveLinksData"],
        },
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
    saveReport: {
      inputs: [
        "draft",
        "agentId",
        "expertises",
        "specializedTraining",
        "parentReportId",
        "userId",
        "maxGenerations",
        "currentGeneration",
        "draft1",
        "draft2",
        "draft3",
        "researchLink1",
        "researchLink2",
        "researchLink3",
      ],
      outputs: [],
      subtasks: [
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
          taskName: "saveReportToSupabase",
          function: saveReportToSupabaseHandler,
          endpoint: "/api/reports/save-report/save-report-to-supabase",
          inputs: [
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
          taskName: "saveLinks",
          function: saveLinksHandler,
          // endpoint: "/api/reports/save-report/save-links",
          inputs: [
            "parentReportId",
            "childReportId",
            "highlightedText",
            "elementId",
            "userId",
          ],
          outputs: ["saveLinksData"],
        },
        {
          taskName: "handleReportFoldering",
          function: handleReportFolderingHandler,
          // endpoint: "/api/reports/save-report/handle-report-foldering",
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
          taskName: "startGenerateContinuumTasks",
          function: startGenerateContinuumTasksHandler,
          // endpoint: "/api/reports/save-report/start-generate-continua-tasks",
          inputs: [
            "childReportId",
            "parentReportId",
            "draft",
            "userId",
            "maxGenerations",
            "currentGeneration",
            "reportSummary",
            "expertises",
            "specializedTraining",
            "agentId",
          ],
          outputs: ["currentGeneration"],
        },
        {
          taskName: "queueRegenerateFolderTask",
          function: queueRegenerateFolderTaskHandler,
          // endpoint: "/api/reports/save-report/start-generate-continua-tasks",
          inputs: ["folderId", "userId", "maxGenerations", "currentGeneration"],
          outputs: [],
        },

        // subtask to generate links for continua!
      ],
    },
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
    doContinuum: {
      inputs: [
        "draft",
        "agentId",
        "expertises",
        "reportSummary",
        "userId",
        "maxGenerations",
        "currentGeneration",
        "parentReportId",
        "childReportId",
      ],
      outputs: [], // Specify outputs
      subtasks: [
        {
          taskName: "generateResearchLinks",
          function: generateResearchLinksHandler,
          // endpoint: "/api/reports/continua/generate-research-links",
          inputs: ["parentReportId", "childReportId", "draft"],
          //   outputs: ["researchLinks"],
          outputs: ["researchLink1", "researchLink2", "researchLink3"],
        },

        // write drafts 1, 2, and 3 in separate tasks
        // save drafts 1, 2, and 3 in separate tasks
        // make sure generations is passed and updated to avoid infinite loop

        {
          taskName: "writeDraftReport1",
          function: draftReportHandler,
          // endpoint: "/api/reports/draft-report/draft-report",
          inputs: [
            "reportSummary",
            "agentId",
            "researchLink1",
            "expertises",
            "specializedTraining",
            "feedback",
            "maxGenerations",
            "currentGeneration",
          ],
          outputs: ["draft1", "currentGeneration"],
        },
        {
          taskName: "queueSaveReport1Task",
          function: queueSaveReportTaskHandler,
          // endpoint: "/api/reports/continua/queue-save-report-task",
          inputs: [
            "draft1",
            "researchLink1",
            "agentId",
            "expertises",
            "specializedTraining",
            "userId",
            "maxGenerations",
            "currentGeneration",
          ],
          outputs: [],
          subtasks: [],
        },
        {
          taskName: "writeDraftReport2",
          // endpoint: "/api/reports/draft-report/draft-report",
          function: draftReportHandler,
          inputs: [
            "reportSummary",
            "agentId",
            "researchLink2",
            "expertises",
            "specializedTraining",
            "feedback",
            "maxGenerations",
            "currentGeneration",
          ],
          outputs: ["draft2", "currentGeneration"],
        },
        {
          taskName: "queueSaveReport2Task",
          function: queueSaveReportTaskHandler,
          // endpoint: "/api/reports/continua/queue-save-report-task",
          inputs: [
            "draft2",
            "researchLink2",
            "agentId",
            "expertises",
            "specializedTraining",
            "userId",
            "maxGenerations",
            "currentGeneration",
          ],
          outputs: [],
          subtasks: [],
        },

        {
          taskName: "writeDraftReport3",
          function: draftReportHandler,
          // endpoint: "/api/reports/draft-report/draft-report",
          inputs: [
            "reportSummary",
            "agentId",
            "researchLink3",
            "expertises",
            "specializedTraining",
            "feedback",
            "maxGenerations",
            "currentGeneration",
          ],
          outputs: ["draft3", "currentGeneration"],
        },

        {
          taskName: "queueSaveReport3Task",
          function: queueSaveReportTaskHandler,
          // endpoint: "/api/reports/continua/queue-save-report-task",
          inputs: [
            "draft3",
            "researchLink3",
            "agentId",
            "expertises",
            "specializedTraining",
            "userId",
            "maxGenerations",
            "currentGeneration",
          ],
          outputs: [],
          subtasks: [],
        },
      ],
    },
  };
}
