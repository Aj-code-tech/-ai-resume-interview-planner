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

    const { loading, setLoading, report, setReport, reports, setReports } = context
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
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            // handle error silently
        } finally {
            setLoading(false)
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

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}



