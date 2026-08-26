import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'PathFind AI Backend with Gemini AI',
      timestamp: new Date().toISOString(),
    });
  });

  // Gemini AI Personalized Learning & Career Advisor Chat Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history = [], context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid message string is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY is not configured in process.env');
        return res.status(503).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured in the server environment.',
          isConfigError: true,
        });
      }

      const {
        learnerProfile,
        skillGapAnalysis,
        activePhase,
        nextBestAction,
        recommendations,
        overallProgress,
      } = context || {};

      // Initialize Gemini SDK with telemetry header
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      // Construct detailed grounding context safely
      const profileSummary = learnerProfile
        ? `Learner Name: ${learnerProfile.name || 'Learner'}
Target Career Goal: ${learnerProfile.careerGoal || 'AI Engineer'}
Current Experience Level: ${learnerProfile.experienceLevel || 'Intermediate'}
Weekly Study Budget: ${learnerProfile.weeklyHours || 6} hours/week
Preferred Learning Style: ${learnerProfile.preferredLearningStyle || 'Hands-on'}
Preferred Difficulty: ${learnerProfile.preferredDifficulty || 'Adaptive'}
Current Skills: ${(learnerProfile.skills || []).map((s: any) => `${s.name} (${s.proficiency}%)`).join(', ') || 'General fundamentals'}
Completed Courses / Modules: ${(learnerProfile.completedCourses || []).join(', ') || 'None completed yet'}`
        : 'Learner profile not provided';

      const topGapsList = Array.isArray(skillGapAnalysis?.top3SkillsToImprove)
        ? skillGapAnalysis.top3SkillsToImprove
        : [];

      const gapsSummary = topGapsList.length > 0
        ? `Overall Target Role Readiness Score: ${skillGapAnalysis?.overallReadinessScore || 0}%
Top Priority Skill Gaps to Improve:
${topGapsList
  .map(
    (g: any, i: number) =>
      `${i + 1}. ${g.name || g.skillName || 'Skill'} (Current: ${g.currentProficiency ?? 0}%, Required Target: ${g.requiredProficiency ?? 80}%, Priority: ${g.priority || 'High'}) — Reason: ${g.reason || 'Core benchmark prerequisite'}`
  )
  .join('\n')}
Status Breakdown: ${skillGapAnalysis?.masteredCount ?? 0} Mastered, ${skillGapAnalysis?.developingCount ?? 0} Developing, ${skillGapAnalysis?.gapCount ?? 0} Critical Gaps.`
        : `Overall Target Role Readiness Score: ${skillGapAnalysis?.overallReadinessScore || 0}%`;

      const phaseSummary = activePhase
        ? `Active Phase ${activePhase.phaseNumber || 1}: ${activePhase.title || 'In Progress'} (${activePhase.progress || 0}% completed)
Phase Focus: ${activePhase.whyThisPhase || 'Core skill mastery'}
Required Skills in this Phase: ${Array.isArray(activePhase.skills) ? activePhase.skills.join(', ') : 'Foundation topics'}
Assessment Status: ${activePhase.isAssessmentPassed ? 'Assessment Passed' : 'Assessment Pending / In Progress'}`
        : 'Active roadmap phase not provided';

      const nextActionSummary = nextBestAction
        ? `Deterministic Next Best Action: "${nextBestAction.title || 'Next Step'}" (${nextBestAction.type || 'Course'}, Phase ${nextBestAction.phaseNumber || 1})
Why this action is prescribed: ${nextBestAction.whyThisAction || 'Prerequisite milestone'}
Targeted Skills: ${Array.isArray(nextBestAction.skillsTargeted) ? nextBestAction.skillsTargeted.join(', ') : 'Core skills'}`
        : 'None currently queued';

      const recsSummary = Array.isArray(recommendations) && recommendations.length > 0
        ? recommendations
            .slice(0, 5)
            .map(
              (r: any) =>
                `• ${r.title || 'Resource'} [${r.type || 'Course'}] (Match: ${r.matchPercentage || 80}%, Difficulty: ${r.difficulty || 'Adaptive'}) — Rationale: ${r.whyRecommended || 'Aligns with target path'}`
            )
            .join('\n')
        : 'No specific recommendations attached';

      const systemInstruction = `You are the expert PathFind AI Personalized Learning & Career Advisor, powered by Gemini.
Your role is to actively mentor the learner (${learnerProfile?.name || 'the learner'}), providing personalized guidance, conceptual clarity, and strategic advice for their journey toward becoming a ${learnerProfile?.careerGoal || 'AI Engineer'}.

CRITICAL OPERATING RULES:
1. SPECIFICITY & GROUNDING: Always answer the user's specific question directly. Ground your advice in the learner's actual profile, skill gaps, active roadmap phase, and calculated recommendations provided in the context below.
2. SOURCE OF TRUTH: The deterministic engines in PathFind AI are the source of truth for curriculum sequence and skill gaps. Do not invent non-existent curriculum requirements, fake test scores, or unrelated courses.
3. PEDAGOGICAL CLARITY & ADAPTIVE EXPLANATIONS:
   - When the user asks about concepts (e.g. overfitting, gradient descent, statistics, linear algebra, Docker, neural networks): explain intuitively with clear analogies, concise structured formatting, bold key terms, and practical code snippets when helpful.
   - When the user asks "What should I learn next?" or "Why do I need X?": connect the explanation directly to their identified skill gaps (${topGapsList.map((g: any) => g.name || g.skillName).join(', ') || 'essential topics'}) and active roadmap phase.
   - When the user asks "Why did my roadmap change?" or asks about newly unlocked modules, completed progress, or assessment outcomes: explain how completing prerequisite items or achieving assessment mastery boosted their proficiency and dynamically updated their roadmap and Next Best Action. Remind them that deterministic prerequisite rules govern unlocking.
4. RELEVANT ACTIONS: If your advice suggests an action within the app, specify a structured action object with 'label' (e.g., "View Learning Roadmap", "Take Phase Assessment", "Review Recommendations") and 'page' ('learning-path', 'recommendations', 'assessments', 'progress', 'dashboard', 'profile').
5. SUGGESTED FOLLOW-UPS: Always provide 2 to 4 contextual follow-up questions tailored to their question and progress.

=== CURRENT AUTHENTICATED LEARNER CONTEXT ===
[Profile]
${profileSummary}

[Current Roadmap Progress]
${phaseSummary}
Total Roadmap Completion: ${overallProgress || 0}%

[Skill Gap Matrix]
${gapsSummary}

[Next Best Action Engine Result]
${nextActionSummary}

[Current Top Recommendations]
${recsSummary}`;

      // Build conversation contents
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      // Add recent message history (up to last 6 turns)
      if (Array.isArray(history) && history.length > 0) {
        const recentHistory = history.slice(-6);
        for (const item of recentHistory) {
          if (item && item.text && typeof item.text === 'string' && (item.sender === 'user' || item.sender === 'assistant')) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Add the latest user message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const candidateModels = ['gemini-2.5-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  text: {
                    type: Type.STRING,
                    description:
                      'The comprehensive, pedagogically structured markdown explanation or guidance answering the learner specific question.',
                  },
                  suggestedFollowUps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                    description:
                      '2 to 4 suggested quick follow-up questions relevant to this topic and learner progress.',
                  },
                  action: {
                    type: Type.OBJECT,
                    description:
                      'Optional navigation action directing user to a relevant section in PathFind AI.',
                    properties: {
                      label: {
                        type: Type.STRING,
                        description:
                          'Short action button label, e.g. "View Learning Roadmap", "Take Phase Assessment", "Review Recommendations".',
                      },
                      page: {
                        type: Type.STRING,
                        description:
                          'Destination page identifier: learning-path, recommendations, assessments, progress, profile, or dashboard.',
                      },
                    },
                  },
                },
                required: ['text', 'suggestedFollowUps'],
              },
            },
          });
          if (response && response.text) {
            break;
          }
        } catch (mErr: any) {
          console.warn(`Attempt with model ${modelName} encountered error:`, mErr?.message || mErr);
          lastError = mErr;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error('No response received from Gemini AI model');
      }

      let rawText = response.text?.trim() || '';
      let cleanJson = rawText;

      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.substring(7);
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.substring(3);
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.substring(0, cleanJson.length - 3);
      }
      cleanJson = cleanJson.trim();

      let parsedData: any = {};
      try {
        parsedData = JSON.parse(cleanJson);
      } catch (parseError) {
        console.warn('Could not parse JSON schema from Gemini response, using raw text:', parseError);
        parsedData = {
          text: rawText || 'I have analyzed your request based on your current learning roadmap.',
          suggestedFollowUps: [
            'What should I learn next?',
            'Why should I learn statistics before machine learning?',
            'Explain overfitting simply.',
            "I'm struggling with regression.",
          ],
        };
      }

      return res.json({
        success: true,
        text: parsedData.text || rawText || 'Response received from PathFind Advisor.',
        suggestedFollowUps: Array.isArray(parsedData.suggestedFollowUps)
          ? parsedData.suggestedFollowUps.filter((q: any) => typeof q === 'string')
          : [
              'What should I learn next?',
              'Why should I learn statistics before machine learning?',
              'Explain overfitting simply.',
              "I'm struggling with regression.",
            ],
        action:
          parsedData.action &&
          typeof parsedData.action.label === 'string' &&
          typeof parsedData.action.page === 'string'
            ? parsedData.action
            : undefined,
      });
    } catch (err: any) {
      console.error('Gemini API Chat error in server.ts:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Error communicating with Gemini AI service',
      });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), 'vite.config.ts'),
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
        watch: isHmrDisabled ? null : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PathFind AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
