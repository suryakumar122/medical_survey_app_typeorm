import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import Card from "@components/ui/Card";
import Link from "next/link";
import { ClipboardDocumentListIcon, UserCircleIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { DoctorService } from "@services/DoctorService";
import { SurveyService } from "@services/SurveyService";
import { formatDate } from "@lib/utils";

export default async function DoctorDashboard() {
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
  
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="stats-card border-l-4 border-blue-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Available Surveys</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{availableSurveys.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              New surveys ready for completion
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-green-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Available Points</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {doctor.totalPoints - doctor.redeemedPoints}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Points available for redemption
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-purple-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Completed Surveys</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{completedSurveys.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              Total surveys completed
            </p>
          </Card.Content>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Surveys</h2>
            <Link href="/doctor/surveys" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {availableSurveys.length === 0 ? (
            <Card>
              <Card.Content>
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Check back later for new surveys to complete.
                  </p>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-4">
              {availableSurveys.slice(0, 3).map((survey) => (
                <Card key={survey.id} className="survey-card hover:shadow-md transition-shadow">
                  <Card.Content>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {survey.description ? survey.description.substring(0, 100) + (survey.description.length > 100 ? '...' : '') : 'No description'}
                        </p>
                        <div className="mt-2 flex space-x-4 text-sm">
                          <span className="flex items-center text-gray-500">
                            <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {survey.estimatedTime} min
                          </span>
                          <span className="flex items-center text-gray-500">
                            <svg className="mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            {survey.points} points
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <span className="text-xs text-gray-500">
                          From {survey.client.companyName}
                        </span>
                        <Link 
                          href={`/doctor/surveys/${survey.id}`}
                          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Take Survey
                        </Link>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          
          <Card>
            <Card.Content>
              {completedSurveys.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start taking surveys to see your activity here.
                  </p>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {completedSurveys.slice(0, 5).map((response, index) => (
                      <li key={response.id}>
                        <div className="relative pb-8">
                          {index !== completedSurveys.slice(0, 5).length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircleIcon className="h-5 w-5 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900">
                                  Completed survey: <span className="font-medium">{response.survey.title}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Earned {response.pointsEarned} points
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {formatDate(response.completedAt || response.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/doctor/surveys" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Browse Surveys</h3>
              <p className="text-sm text-gray-500">
                View and take available surveys to earn points
              </p>
            </Card.Content>
          </Card>
        </Link>
        
        <Link href="/doctor/points" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <CreditCardIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Points</h3>
              <p className="text-sm text-gray-500">
                View your point balance and redeem rewards
              </p>
            </Card.Content>
          </Card>
        </Link>
        
        <Link href="/doctor/profile" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <UserCircleIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Update Profile</h3>
              <p className="text-sm text-gray-500">
                Manage your personal and professional information
              </p>
            </Card.Content>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}
