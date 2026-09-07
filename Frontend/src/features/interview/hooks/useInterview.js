import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api.js"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router-dom"
import { useAuth } from "../../auth/hooks/useAuth"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, downloadingResume, setDownloadingResume, report, setReport, reports, setReports } = context
    const { user } = useAuth()

   const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true)

    try {
        const response = await generateInterviewReport({
            jobDescription,
            selfDescription,
            resumeFile
        })

        if (!response || !response.interviewReport) {
            throw new Error("Interview report was not returned by the server")
        }

        setReport(response.interviewReport)

        return response.interviewReport

    } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to generate interview report. Please try again."
        alert(errorMsg)
        return null

    } finally {
        setLoading(false)
    }
}

   const getReportById = async (interviewId) => {
    setLoading(true)

    try {
        const response = await getInterviewReportById(interviewId)

        setReport(response.interviewReport)

        return response.interviewReport

    } catch (error) {
        return null

    } finally {
        setLoading(false)
    }
}

  const getReports = async () => {
    try {
        const response = await getAllInterviewReports()

        setReports(response.interviewReports || [])

        return response.interviewReports

    } catch (error) {
        return []

    }
}

    const getResumePdf = async (interviewReportId) => {
        setDownloadingResume(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            let errorMsg = "Failed to download resume PDF. Please try again."
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text()
                    const parsed = JSON.parse(text)
                    if (parsed.message) errorMsg = parsed.message
                } catch (_) {}
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message
            } else if (error.message) {
                errorMsg = error.message
            }
            alert(errorMsg)
        } finally {
            setDownloadingResume(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else if (user) {
            getReports()
        } else {
            setReports([])
        }
    }, [ interviewId, user ])

    return { loading, downloadingResume, report, reports, generateReport, getReportById, getReports, getResumePdf }

}



