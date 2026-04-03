import { Response } from "express";
import Groq from "groq-sdk";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getAISuggestions(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const userId = req.userId as string;
  const { projectId, taskId } = req.params as {
    projectId: string;
    taskId: string;
  };

  try {
    //Verify member
    const member = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!member) {
      res.status(403).json({ error: "Not a member of this project" });
      return;
    }
    // Get task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Strip HTML from description for cleaner prompt
    const plainDescription = task.description
      ? task.description
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";

    const prompt = `You are a project management assistant helping a developer team.

Given this task:
Title: "${task.title}"
Description: "${plainDescription || "No description provided"}"
Current Priority: ${task.priority}

Respond ONLY with a valid JSON object in this exact format, no markdown, no explanation:
{
  "suggestedPriority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "priorityReason": "one sentence explanation",
  "subtasks": [
    { "title": "subtask title", "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" },
    { "title": "subtask title", "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" },
    { "title": "subtask title", "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }
  ]
}

Generate 3 to 5 specific, actionable subtasks that break down the work. Keep subtask titles concise (under 60 chars).`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 500,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    // Strip markdown code fences if model wraps in ```json
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    res.json(parsed);
  } catch (err) {
    console.error("AI suggestion error:", err);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
}
