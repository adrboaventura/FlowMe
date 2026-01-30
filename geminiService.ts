
import { GoogleGenAI, Type } from "@google/genai";
import { Workflow, FieldType, LayoutMode, TriggerType, AIHelpResponse } from "../types";

/**
 * GEMINI INTELLIGENCE CORE
 * Refactored to ensure fresh API client on every call to resolve 403 issues.
 */
export const geminiService = {
  getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  },

  /**
   * INTENT PARSER
   * Translates natural language into actionable app commands.
   */
  async parseVoiceIntent(transcript: string, availableWorkflows: string[]): Promise<{action: string, payload?: any}> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the FlowMe Voice Controller. The user said: "${transcript}".
      Available Tabs: ['dashboard', 'workflows', 'tasks', 'chat', 'sync', 'help', 'settings'].
      Available Flows: ${JSON.stringify(availableWorkflows)}.
      
      Determine the intent and return strictly JSON:
      1. Action: "SET_TAB", Payload: { tabId: string }
      2. Action: "OPEN_FLOW", Payload: { flowTitle: string }
      3. Action: "COMPARE", Payload: { category: string }
      4. Action: "CREATE_FLOW", Payload: { prompt: string }
      5. Action: "UNKNOWN"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            payload: { type: Type.OBJECT }
          },
          required: ["action"]
        }
      }
    });
    return JSON.parse(response.text || '{"action": "UNKNOWN"}');
  },

  /**
   * ALERT RULE PARSER
   * Converts natural language rules into structured configuration for autonomous monitoring.
   */
  async parseAlertRule(prompt: string): Promise<any> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Parse this alert rule into JSON: "${prompt}". 
      Available TriggerTypes: DEADLINE_MISSED, STILL_RUNNING, NOT_STARTED.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triggerType: { type: Type.STRING },
            deadlineTime: { type: Type.STRING, description: "HH:mm format (24h)" },
            maxDurationMinutes: { type: Type.NUMBER },
            escalationTarget: { type: Type.STRING, enum: ["group", "specific_user"] }
          },
          required: ["triggerType", "escalationTarget"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  /**
   * ASSIGNMENT PARSER
   * Maps natural language deployment requests to specific workflows and groups.
   */
  async parseAssignment(prompt: string, workflows: string[], groups: string[]): Promise<any> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Coordinate this work assignment: "${prompt}". 
      Available Workflows: ${JSON.stringify(workflows)}. 
      Available Groups: ${JSON.stringify(groups)}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workflow_name: { type: Type.STRING },
            target_group: { type: Type.STRING },
            recurrence: { type: Type.STRING, enum: ["once", "daily", "weekly", "custom"] },
            start_time: { type: Type.STRING, description: "HH:mm format (24h)" }
          },
          required: ["workflow_name", "target_group", "recurrence"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  /**
   * OPERATIONAL RISK ANALYST
   * Synthesizes complex system states into actionable human-readable insights.
   */
  async analyzeOperationalRisks(activeCount: number, overdueCount: number, completedToday: number, alerts: string[]): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform an operational risk audit based on these metrics:
      - Active Tasks: ${activeCount}
      - Overdue/Alarm State: ${overdueCount}
      - Successful Completions Today: ${completedToday}
      - Recent Incident Log: ${JSON.stringify(alerts)}
      
      Synthesize these into a professional summary of bottlenecks and risks.`,
      config: { 
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text || "Operational analysis engine is currently recalibrating.";
  },

  async getJudgeVerdict(scores: any, writeup: string): Promise<{verdict: string, wowFactor: boolean}> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze hackathon submission: Scores: ${JSON.stringify(scores)}, Writeup: ${writeup}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING },
            wowFactor: { type: Type.BOOLEAN }
          },
          required: ["verdict", "wowFactor"]
        }
      }
    });
    return JSON.parse(response.text || '{"verdict": "Error", "wowFactor": false}');
  },

  async generateWorkflow(prompt: string): Promise<Partial<Workflow>> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Design enterprise workflow for: "${prompt}"`,
      config: {
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            layout: { type: Type.STRING, enum: Object.values(LayoutMode) },
            fields: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: Object.values(FieldType) },
                  required: { type: Type.BOOLEAN }
                },
                required: ["label", "type"]
              }
            }
          },
          required: ["title", "description", "layout", "fields"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async getAISupportAssistant(question: string, knowledgeBase: string, systemState: any, language: string): Promise<AIHelpResponse> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Support query: "${question}" in ${language}. KB: ${knowledgeBase}. State: ${JSON.stringify(systemState)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer_text: { type: Type.STRING },
            recommended_action_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            related_help_section: { type: Type.STRING }
          },
          required: ["answer_text", "recommended_action_steps", "related_help_section"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async compareInstances(instanceA: any, instanceB: any, workflowTitle: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Compare runs for "${workflowTitle}". Identify superior submission.`,
      config: { thinkingConfig: { thinkingBudget: 2000 } }
    });
    return response.text || "";
  },

  async synthesizeEvidence(data: any, selectedMediaBase64: string[], format: string) {
    const ai = this.getClient();
    const parts: any[] = [
      ...selectedMediaBase64.map(b => ({ inlineData: { data: b.split(',')[1], mimeType: 'image/png' } })),
      { text: `Synthesize into ${format}.` }
    ];
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts }
    });
    return response.text || "";
  }
};
