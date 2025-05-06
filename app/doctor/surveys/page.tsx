import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import { DoctorService } from "@services/DoctorService";
import { SurveyService } from "@services/SurveyService";
import SurveyCard from "@components/surveys/SurveyCard";
import Card from "@components/ui/Card";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export default async function DoctorSurveys({
  searchParams,
}: {
  searchParams?: { [key: string]: string | undefined };
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
  
  // Get available surveys
  const availableSurveys = await SurveyService.getActiveSurveysForDoctor(doctor.id);
  
  // Get completed surveys
  const completedSurveys = await SurveyService.getCompletedSurveysForDoctor(doctor.id);

  // Check if coming from a successful submission
  const justSubmitted = searchParams?.submitted === "true";
  
  return (
    <DashboardLayout>
      {justSubmitted && (
        <div className="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Survey Submitted Successfully
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Thank you for completing the survey. Your points have been added to your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete surveys to earn points which can be redeemed for rewards.
        </p>
      </div>
      
      <div className="mb-8">
        <Card className="stats-card border-l-4 border-blue-500">
          <Card.Content className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Your Point Balance</h3>
                <div className="mt-2 text-sm text-gray-500">
                  Complete more surveys to earn additional points
                </div>
              </div>
              <div className="mt-3 sm:mt-0">
                <div className="flex items-baseline text-2xl font-semibold text-blue-600">
                  {doctor.totalPoints - doctor.redeemedPoints}
                  <span className="ml-2 text-sm font-medium text-gray-500">available points</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">of {doctor.totalPoints} total points earned</div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
      
      <Tabs>
        <TabList className="flex border-b border-gray-200 mb-6">
          <Tab 
            className="py-3 px-6 border-b-2 border-transparent font-medium text-gray-500 cursor-pointer hover:text-gray-700 hover:border-gray-300 focus:outline-none ui-selected:border-blue-500 ui-selected:text-blue-600" 
            selectedClassName="border-blue-500 text-blue-600"
          >
            Available Surveys ({availableSurveys.length})
          </Tab>
          <Tab 
            className="py-3 px-6 border-b-2 border-transparent font-medium text-gray-500 cursor-pointer hover:text-gray-700 hover:border-gray-300 focus:outline-none ui-selected:border-blue-500 ui-selected:text-blue-600" 
            selectedClassName="border-blue-500 text-blue-600"
          >
            Completed Surveys ({completedSurveys.length})
          </Tab>
        </TabList>
        
        <TabPanel>
          {availableSurveys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No available surveys</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no surveys available for you at the moment.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Please check back later for new surveys.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSurveys.map((survey) => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  role="doctor"
                  buttonText="Take Survey"
                />
              ))}
            </div>
          )}
        </TabPanel>
        
        <TabPanel>
          {completedSurveys.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No completed surveys</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't completed any surveys yet.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Start taking surveys to see them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedSurveys.map((response) => (
                <SurveyCard
                  key={response.id}
                  survey={{
                    id: response.survey.id,
                    title: response.survey.title,
                    description: response.survey.description,
                    points: response.pointsEarned,
                    estimatedTime: response.survey.estimatedTime,
                    status: response.survey.status,
                    createdAt: response.survey.createdAt,
                    updatedAt: response.survey.updatedAt,
                  }}
                  role="doctor"
                  buttonText="View Details"
                  completed={true}
                  completedAt={response.completedAt}
                />
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>
    </DashboardLayout>
  );
}
