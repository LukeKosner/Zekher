import { TranslationServiceClient } from "@google-cloud/translate";

// Instantiates a client
const translationClient = new TranslationServiceClient();

const projectId = "gen-lang-client-0418505604";
const location = "global";
const text = "Hello, world!";

async function translateText() {
  try {
    // Construct request
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: "text/plain", // mime types: text/plain, text/html
      sourceLanguageCode: "en",
      targetLanguageCode: "es"
    };

    // Run request
    return await translationClient.translateText(request);
  } catch (error) {
    console.error("Error during translation:", error);
    throw error;
  }
}

export default async function Page() {
  const raw = await translateText();
  return (
    <div>
      <h1>Translation Result</h1>
      <pre>{JSON.stringify(raw, null, 2)}</pre>
    </div>
  );
}
