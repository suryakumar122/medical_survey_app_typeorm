import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import { DoctorService } from "@services/DoctorService";
import { SurveyService } from "@services/SurveyService";
import SurveyForm from "@components/surveys/SurveyForm";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default async function DoctorSurveyDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "doctor") {
    redirect("/login");
  }
  
  // Get doctor info
  const doctor = await DoctorService.getDoctorByUserId(session.user.id);
  
  if (!doctor) {
    redirect("/login");
  }
  
  // Get survey details
  const survey = await SurveyService.getSurveyById(params.id);
  
  if (!survey) {
    redirect("/doctor/surveys");
  }
  
  // Check if this survey is active
  if (survey.status !== "active") {
    redirect("/doctor/surveys");
  }
  
  // Check if doctor has already completed this survey
  const completedSurveys = await SurveyService.getCompletedSurveysForDoctor(doctor.id);
  const alreadyCompleted = completedSurveys.some(
    (response) => response.surveyId === survey.id && response.completed
  );
  
  if (alreadyCompleted) {
    redirect("/doctor/surveys");
  }
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link 
          href="/doctor/surveys" 
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Surveys
        </Link>
      </div>
      
      <SurveyForm survey={survey} doctorId={doctor.id} />
    </DashboardLayout>
  );
}
