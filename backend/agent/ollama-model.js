import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { Ollama } from "langchain/llms/ollama";
import { execSync } from "child_process";

export function getAvailableModels() {
  try {
    const output = execSync("ollama list", { encoding: "utf8" });
    const models = output.split('\n')
      .filter(line => line.trim())
      .map(line => line.split(' ')[0]);
    return models.length > 0 ? models : ['mistral'];
  } catch (error) {
    console.error("Error fetching available models:", error.message);
    return ['mistral'];
  }
}

export function getOllamaModel(model) {
  const availableModels = getAvailableModels();
  const selectedModel = model && availableModels.includes(model) ? model : 'mistral';

  return new Ollama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: selectedModel,
  });
}
