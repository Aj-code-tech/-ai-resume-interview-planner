const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription = "", jobDescription = "" } = req.body || {}

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({ message: "Job description is required." })
        }

        let resumeText = ""
        if (req.file && req.file.buffer) {
            try {
                const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))
                const parsed = await parser.getText()
                resumeText = parsed?.text || ""
            } catch (pdfError) {
                console.warn("Could not extract text with pdf-parse:", pdfError.message)
                if (req.file.mimetype === "text/plain" || req.file.originalname?.endsWith(".txt")) {
                    resumeText = req.file.buffer.toString("utf-8")
                }
            }
        }

        const cleanResume = resumeText.trim()
        const cleanSelfDesc = (selfDescription || "").trim()

        if (!cleanResume && !cleanSelfDesc) {
            return res.status(400).json({
                message: "Please provide either a readable resume (PDF) or a quick self-description."
            })
        }

        const interViewReportByAi = await generateInterviewReport({
            resume: cleanResume,
            selfDescription: cleanSelfDesc,
            jobDescription: jobDescription.trim()
        })

        const userId = req.user.id || req.user._id

        const interviewReport = await interviewReportModel.create({
            user: userId,
            resume: cleanResume,
            selfDescription: cleanSelfDesc,
            jobDescription: jobDescription.trim(),
            ...interViewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("generateInterViewReportController error:", error)
        res.status(500).json({
            message: error.message || "Failed to generate interview report.",
            error: error.message
        })
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params
        const userId = req.user.id || req.user._id

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: userId })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("getInterviewReportByIdController error:", error)
        res.status(500).json({
            message: "Failed to fetch interview report.",
            error: error.message
        })
    }
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const userId = req.user.id || req.user._id
        const interviewReports = await interviewReportModel.find({ user: userId }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error("getAllInterviewReportsController error:", error)
        res.status(500).json({
            message: "Failed to fetch interview reports.",
            error: error.message
        })
    }
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params
        const userId = req.user.id || req.user._id

        let interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: userId })
        if (!interviewReport) {
            interviewReport = await interviewReportModel.findById(interviewReportId)
        }

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(Buffer.from(pdfBuffer))
    } catch (error) {
        console.error("generateResumePdfController error:", error)
        res.status(500).json({
            message: error.message || "Failed to generate resume PDF.",
            error: error.message
        })
    }
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }