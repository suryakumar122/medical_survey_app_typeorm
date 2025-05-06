"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import Card from "@components/ui/Card";
import { Tab } from "@headlessui/react";
import SurveyStats from "@components/analytics/SurveyStats";
import DoctorEngagement from "@components/analytics/DoctorEngagement";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Button from "@components/ui/Button";
import toast from "react-hot-toast";

export default function ClientAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [client, setClient] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState("all");
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session.user.role !== "client") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, session, router]);
  
  const fetchData = async () => {
    try {
      // Fetch client profile
      const clientResponse = await fetch("/api/clients/profile");
      if (!clientResponse.ok) throw new Error("Failed to fetch client profile");
      const clientData = await clientResponse.json();
      setClient(clientData.data);
      
      // Fetch surveys
      const surveysResponse = await fetch("/api/surveys");
      if (!surveysResponse.ok) throw new Error("Failed to fetch surveys");
      const surveysData = await surveysResponse.json();
      setSurveys(surveysData.data);
      
      // Fetch analytics data
      const analyticsResponse = await fetch("/api/clients/analytics");
      if (!analyticsResponse.ok) throw new Error("Failed to fetch analytics");
      const analyticsData = await analyticsResponse.json();
      setAnalyticsData(analyticsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleExportData = (type) => {
    // In a real application, this would call an API endpoint to generate the export
    toast.success(`Exporting ${type} data...`);
    
    // Simulate a download after a delay
    setTimeout(() => {
      toast.success(`${type} data exported successfully!`);
    }, 2000);
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-800">
            Unable to load analytics data
          </h2>
          <p className="mt-2 text-gray-600">
            Please try again later or contact support
          </p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your survey performance and doctor engagement
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExportData("CSV")}
            leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExportData("PDF")}
            leftIcon={<ArrowDownTrayIcon className="h-5 w-5" />}
          >
            Export PDF
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="stats-card border-l-4 border-blue-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Total Doctors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.doctorStats.total}</p>
            <p className="text-sm text-gray-500 mt-1">
              {analyticsData.doctorStats.activationRate}% activation rate
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-green-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Surveys Created</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.surveyStats.total}</p>
            <p className="text-sm text-gray-500 mt-1">
              {analyticsData.surveyStats.active} currently active
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-indigo-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Completion Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.surveyStats.completionRate}%</p>
            <p className="text-sm text-gray-500 mt-1">
              Overall survey completion
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-purple-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Total Points</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{analyticsData.pointStats.totalAwarded.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">
              {analyticsData.pointStats.totalRedeemed.toLocaleString()} redeemed
            </p>
          </Card.Content>
        </Card>
      </div>
      
      <div className="mb-6">
        <Card>
          <Card.Content className="p-6">
            <div className="mb-4">
              <label htmlFor="survey-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Survey:
              </label>
              <select
                id="survey-filter"
                className="mt-1 block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedSurvey}
                onChange={(e) => setSelectedSurvey(e.target.value)}
              >
                <option value="all">All Surveys</option>
                {surveys.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Survey Participation</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {analyticsData.surveyStats.totalParticipation}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Total survey responses
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Average Completion Time</h4>
                <div className="text-3xl font-bold text-green-600">
                  {analyticsData.surveyStats.avgCompletionTime} min
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Average time to complete
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Doctor Engagement</h4>
                <div className="text-3xl font-bold text-indigo-600">
                  {analyticsData.doctorStats.engagementRate}%
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Doctors completing at least one survey
                </p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-50 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
              ${
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'
              }`
            }
          >
            Survey Performance
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full py-2.5 text-sm font-medium leading-5 rounded-lg
              ${
                selected
                  ? 'bg-white shadow text-blue-700'
                  : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-700'
              }`
            }
          >
            Doctor Engagement
          </Tab>
        </Tab.List>
        
        <Tab.Panels>
          <Tab.Panel>
            <SurveyStats 
              data={analyticsData.surveyPerformance} 
              surveyFilter={selectedSurvey}
              surveys={surveys}
            />
          </Tab.Panel>
          
          <Tab.Panel>
            <DoctorEngagement 
              data={analyticsData.doctorEngagement} 
              surveyFilter={selectedSurvey}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </DashboardLayout>
  );
}
