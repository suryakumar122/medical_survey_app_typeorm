import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import Card from "@components/ui/Card";
import Link from "next/link";
import { UserGroupIcon, ClipboardDocumentListIcon, ChartBarIcon, UserIcon } from "@heroicons/react/24/outline";
import { ClientService } from "@services/ClientService";
import { DoctorService } from "@services/DoctorService";
import { RepresentativeService } from "@services/RepresentativeService";
import { SurveyService } from "@services/SurveyService";
import { formatDate } from "@lib/utils";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "client") {
    redirect("/login");
  }
  
  // Get client info
  const client = await ClientService.getClientByUserId(session.user.id);
  
  if (!client) {
    redirect("/login");
  }
  
  // Get client's doctors, representatives, and surveys
  const doctors = await DoctorService.getDoctorsByClientId(client.id);
  const representatives = await RepresentativeService.getRepsByClientId(client.id);
  const surveys = await SurveyService.getSurveysByClientId(client.id);
  
  // Recent activities (simplistic approach for demo)
  const recentActivities = [
    ...surveys.map(survey => ({
      type: 'survey',
      title: `Created survey: ${survey.title}`,
      date: survey.createdAt,
      status: survey.status,
      id: survey.id
    })),
    ...doctors.slice(0, 5).map(doctor => ({
      type: 'doctor',
      title: `Added doctor: ${doctor.user.name}`,
      date: doctor.createdAt,
      status: doctor.user.status,
      id: doctor.id
    })),
    ...representatives.slice(0, 5).map(rep => ({
      type: 'representative',
      title: `Added representative: ${rep.user.name}`,
      date: rep.createdAt,
      status: rep.user.status,
      id: rep.id
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  
  // Calculate statistics
  const activeDoctors = doctors.filter(doctor => doctor.user.status === "active").length;
  const pendingDoctors = doctors.filter(doctor => doctor.user.status === "pending").length;
  const activeSurveys = surveys.filter(survey => survey.status === "active").length;
  const completedSurveys = surveys.filter(survey => survey.status === "completed").length;
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {client.companyName}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="stats-card border-l-4 border-blue-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Doctors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{doctors.length}</p>
            <div className="flex space-x-2 text-sm text-gray-500 mt-1">
              <span className="text-green-600">{activeDoctors} active</span>
              <span>•</span>
              <span className="text-yellow-600">{pendingDoctors} pending</span>
            </div>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-indigo-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Representatives</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{representatives.length}</p>
            <p className="text-sm text-gray-500 mt-1">
              Team members in the field
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-green-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Surveys</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{surveys.length}</p>
            <div className="flex space-x-2 text-sm text-gray-500 mt-1">
              <span className="text-green-600">{activeSurveys} active</span>
              <span>•</span>
              <span className="text-blue-600">{completedSurveys} completed</span>
            </div>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-purple-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Completion Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {surveys.length > 0 
                ? Math.round((completedSurveys / surveys.length) * 100) 
                : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Survey completion rate
            </p>
          </Card.Content>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Surveys</h2>
            <Link href="/client/surveys" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          
          {surveys.length === 0 ? (
            <Card>
              <Card.Content>
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys created</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first survey
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/client/surveys/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create New Survey
                    </Link>
                  </div>
                </div>
              </Card.Content>
            </Card>
          ) : (
            <div className="space-y-4">
              {surveys.slice(0, 3).map((survey) => (
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          survey.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : survey.status === 'draft' 
                              ? 'bg-gray-100 text-gray-800' 
                              : survey.status === 'completed' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                        </span>
                        <Link 
                          href={`/client/surveys/${survey.id}`}
                          className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Survey
                        </Link>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              ))}
              
              <div className="text-center pt-4">
                <Link
                  href="/client/surveys/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Survey
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          
          <Card>
            <Card.Content>
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your recent activities will appear here
                  </p>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivities.map((activity, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index !== recentActivities.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                activity.type === 'survey' 
                                  ? 'bg-blue-500' 
                                  : activity.type === 'doctor' 
                                    ? 'bg-green-500' 
                                    : 'bg-indigo-500'
                              }`}>
                                {activity.type === 'survey' ? (
                                  <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                                ) : activity.type === 'doctor' ? (
                                  <UserGroupIcon className="h-5 w-5 text-white" />
                                ) : (
                                  <UserIcon className="h-5 w-5 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900">
                                  {activity.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Status: {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {formatDate(activity.date)}
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
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/client/surveys" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Surveys</h3>
              <p className="text-sm text-gray-500">
                Create and manage surveys
              </p>
            </Card.Content>
          </Card>
        </Link>
        
        <Link href="/client/doctors" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <UserGroupIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Doctors</h3>
              <p className="text-sm text-gray-500">
                Manage doctor accounts
              </p>
            </Card.Content>
          </Card>
        </Link>
        
        <Link href="/client/representatives" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <UserIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Representatives</h3>
              <p className="text-sm text-gray-500">
                Manage your field team
              </p>
            </Card.Content>
          </Card>
        </Link>
        
        <Link href="/client/analytics" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <ChartBarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-500">
                View insights and reports
              </p>
            </Card.Content>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}
