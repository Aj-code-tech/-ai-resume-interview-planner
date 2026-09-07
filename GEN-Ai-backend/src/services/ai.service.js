const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


// ===============================
// INTERVIEW REPORT SCHEMA
// ===============================

const interviewReportSchema = z.object({

    matchScore: z
        .number()
        .int()
        .min(0)
        .max(100)
        .describe(
            "An accurate, objective match score from 0 to 100 calculated strictly using the weighted rubric based on actual verified skills and experience vs job requirements"
        ),

    technicalQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe("The technical question that can be asked in the interview"),

                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question"
                    ),

                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover, and what approach to take"
                    )
            })
        )
        .describe(
            "Technical questions that can be asked in the interview along with their intention and how to answer them"
        ),

    behavioralQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe("The behavioral question that can be asked in the interview"),

                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question"
                    ),

                answer: z
                    .string()
                    .describe(
                        "How to answer this question, what points to cover, and what approach to take"
                    )
            })
        )
        .describe(
            "Behavioral questions that can be asked in the interview along with their intention and how to answer them"
        ),

    skillGaps: z
        .array(
            z.object({
                skill: z
                    .string()
                    .describe("The skill which the candidate is lacking"),

                severity: z
                    .enum(["low", "medium", "high"])
                    .describe(
                        "The severity of this skill gap and how much it can impact the candidate's chances"
                    )
            })
        )
        .describe(
            "List of skill gaps in the candidate's profile along with their severity"
        ),

    preparationPlan: z
        .array(
            z.object({
                day: z
                    .number()
                    .describe("The day number in the preparation plan, starting from 1"),

                focus: z
                    .string()
                    .describe(
                        "The main focus of this day, such as data structures, system design, or mock interviews"
                    ),

                tasks: z
                    .array(z.string())
                    .describe(
                        "List of tasks to complete on this day"
                    )
            })
        )
        .describe(
            "A day-wise preparation plan for the candidate"
        ),

    title: z
        .string()
        .describe(
            "The title of the job for which the interview report is generated"
        )
})


// ===============================
// GENERATE INTERVIEW REPORT
// ===============================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

      const prompt = `
You are an expert technical hiring manager and evaluator conducting a rigorous, evidence-based candidate assessment.

CANDIDATE RESUME:
${resume || "Not provided"}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

Perform an honest, objective analysis of the candidate's actual qualifications against the job description.

CRITICAL INSTRUCTIONS FOR CALCULATING MATCH SCORE (0 - 100):
- DO NOT default to arbitrary high scores like 85, 88, or 90.
- Calculate the score strictly based on actual evidence found in the resume and self-description:
  1. Technical Skills Match (40% weight):
     Compare all required and preferred technologies, libraries, tools, and platforms mentioned in the job description against verified skills in the candidate's profile. Deduct heavily for missing core skills.
  2. Experience Level & Domain Alignment (30% weight):
     Compare the candidate's years of experience and educational background to the job requirements. If the role requires senior experience or a specialized degree that the candidate does not have (e.g. fresher or transitioning fields), deduct points accordingly.
  3. Practical Project Evidence (20% weight):
     Check whether the candidate has executed real projects that demonstrate the core job responsibilities.
  4. Role Responsibilities Fit (10% weight):
     Assess how well the candidate's demonstrated background covers the day-to-day duties.
- BENCHMARKS:
  * 85 - 100: Exceptional / Near-perfect fit. Candidate satisfies nearly all required and preferred criteria.
  * 70 - 84: Good match. Meets all core requirements, minor gaps in preferred tools or experience.
  * 50 - 69: Moderate / Partial match. Possesses basic fundamentals but lacks key experience, advanced stack, or required seniority.
  * Below 50: Low match. Major skill gaps or mismatch in domain/experience.
- The match score MUST directly align with the "skillGaps" list: if there are several High or Medium severity skill gaps, the score should decrease accordingly.

IMPORTANT:
- The "title" field is REQUIRED. Extract the job title from the JOB DESCRIPTION.
- The title must be a non-empty string. Never return null, undefined, or an empty string for title.
- If the exact job title is not explicitly mentioned, infer the most appropriate job title from the job description.
- Do not invent candidate experience.
- Make all interview questions realistic, tailored, and relevant to the candidate's profile and the job description.
- Identify genuine skill gaps with accurate severity ("low", "medium", "high").
- Formulate a practical day-wise interview preparation plan.

Return the response strictly according to the provided JSON schema.
`

        const response = await ai.models.generateContent({

            // IMPORTANT:
            // gemini-2.0-flash is no longer available
            model: "gemini-3.6-flash",

            contents: prompt,

            config: {
                responseMimeType: "application/json",

                responseSchema:
                    z.toJSONSchema(interviewReportSchema)
            }
        })

        if (!response || !response.text) {
            throw new Error("Gemini returned an empty response")
        }

        const report = JSON.parse(response.text)

        if (!report.title) {
            throw new Error("Gemini did not return a job title")
        }

        return report

    } catch (error) {

        console.error(
            "Gemini Interview Report Error:",
            error?.message || error
        )

        throw error
    }
}


// ===============================
// GENERATE PDF FROM HTML
// ===============================

async function generatePdfFromHtml(htmlContent) {

    const browser = await puppeteer.launch()

    try {

        const page = await browser.newPage()

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        })

        const pdfBuffer = await page.pdf({

            format: "A4",
            printBackground: true,
            pageRanges: "1",

            margin: {
                top: "8mm",
                bottom: "8mm",
                left: "10mm",
                right: "10mm"
            }
        })

        return pdfBuffer

    } finally {

        await browser.close()
    }
}


// ===============================
// RESUME PDF SCHEMA
// ===============================

const resumePdfSchema = z.object({

    html: z
        .string()
        .describe(
            "HTML content of the resume which can be converted to PDF using Puppeteer"
        )
})


// ===============================
// GENERATE RESUME PDF
// ===============================

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    try {

        const prompt = `
Generate a comprehensive, high-impact, ATS-optimized single-page resume in HTML/CSS for the candidate.

CANDIDATE RESUME:
${resume || "Not provided"}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

PAGE FILL & PROPORTION GOAL (CRITICAL):
- The resume MUST fill approximately 90% to 95% of the A4 page height from top to bottom.
- It MUST NOT look empty, sparse, or leave a large blank gap at the bottom.
- It MUST strictly fit within EXACTLY ONE SINGLE A4 PAGE (do not allow overflow onto a 2nd page).

SECTIONS TO INCLUDE TO FULLY POPULATE THE PAGE:
1. HEADER: Candidate Name (19pt bold), Target Role Subtitle (10pt semi-bold), Contact line (Phone | Email | GitHub | LinkedIn | Location).
2. PROFESSIONAL SUMMARY: 3-4 impactful, keyword-rich sentences aligning candidate's analytical skills and engineering discipline with the target job.
3. TECHNICAL SKILLS: Categorized (Programming Languages, Databases & Querying, BI & Visualization Tools, Analysis & Methodologies, Core Competencies).
4. KEY PROJECTS: 3 distinct projects (or 2 deep projects) with:
   - Project title, tech stack (right-aligned), duration/link
   - 3 detailed, metric-driven bullet points (action verb + what was built + impact).
5. WORK & LEADERSHIP EXPERIENCE: 2 roles/positions (e.g. Data Analyst Training/Internships, Cultural Society Treasurer/Coordinator) with 2 detailed bullets each.
6. EDUCATION: Degree, Institution, CGPA, specialization, plus senior secondary school details.
7. ACHIEVEMENTS & CERTIFICATIONS: 2-3 concise bullet points (Hackathons, courses, awards).

STYLING & CSS REQUIREMENTS:
- Output a complete HTML document with an inline <style> block.
- Use clean, modern printable CSS:
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 8.8pt;
    line-height: 1.32;
  }
  .header { text-align: center; margin-bottom: 6px; }
  .name { font-size: 19pt; font-weight: 700; color: #0f172a; letter-spacing: 0.5px; }
  .role-title { font-size: 10pt; font-weight: 600; color: #2563eb; margin-top: 1px; }
  .contact { font-size: 8.5pt; color: #475569; margin-top: 2px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
  .section { margin-bottom: 6px; }
  .section-title {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #0f172a;
    border-bottom: 1.2px solid #0f172a;
    padding-bottom: 1px;
    margin-bottom: 3px;
    letter-spacing: 0.5px;
  }
  .item { margin-bottom: 3px; }
  .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 8.8pt; color: #0f172a; }
  .item-sub { display: flex; justify-content: space-between; font-size: 8.2pt; color: #64748b; font-style: italic; margin-bottom: 1px; }
  ul { padding-left: 15px; margin-top: 1px; }
  li { font-size: 8.5pt; line-height: 1.28; color: #334155; margin-bottom: 1.5px; }
  .summary-text { font-size: 8.6pt; line-height: 1.32; color: #334155; }
  .skills-list { display: flex; flex-direction: column; gap: 2px; font-size: 8.5pt; }
  .skill-row { display: flex; gap: 6px; }
  .skill-category { font-weight: 600; color: #0f172a; min-width: 125px; }
  .skill-values { color: #334155; }

CONTENT REQUIREMENTS:
- Tailor the candidate's skills and projects specifically to the target Job Description.
- Feature the candidate's strongest matching skills, projects, and achievements.
- Do not invent experience or fake companies; highlight genuine demonstrated work.
- Return ONLY the requested JSON format containing the complete HTML string in the "html" property.
`

        const response = await ai.models.generateContent({

            // IMPORTANT:
            // Use an available Gemini model
            model: "gemini-3.6-flash",

            contents: prompt,

            config: {
                responseMimeType: "application/json",

                responseSchema:
                    z.toJSONSchema(resumePdfSchema)
            }
        })

        if (!response || !response.text) {
            throw new Error("Gemini returned an empty response")
        }

        const jsonContent = JSON.parse(response.text)

        if (!jsonContent.html) {
            throw new Error("Gemini did not return HTML content")
        }

        const pdfBuffer =
            await generatePdfFromHtml(jsonContent.html)

        return pdfBuffer

    } catch (error) {

        console.error(
            "Gemini Resume PDF Error:",
            error?.message || error
        )

        throw error
    }
}


// ===============================
// EXPORT
// ===============================

module.exports = {
    generateInterviewReport,
    generateResumePdf
}