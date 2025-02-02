import { useLocation, useNavigate } from "react-router-dom";
import IssueTrackerForm from "@/features/issues/components/issue-tracker-form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PublicIssues } from "@/features/issues/components/public-issues";

export const IssueTrackerFormRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the current tab from the URL or default to 'Form'
  const currentTab = new URLSearchParams(location.search).get("tab") || "Request List";

  // Function to handle tab change and update the URL
  const handleTabChange = (value: string) => {
    navigate(`?tab=${value}`, { replace: true });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="Request List">Request List</TabsTrigger>
        <TabsTrigger value="Form">Form</TabsTrigger>
      </TabsList>
      <TabsContent value="Request List">
        <PublicIssues />
      </TabsContent>
      <TabsContent value="Form">
        <div className="m-4 mt-8">
          <header className="text-center px-2 text-gray-800">
            <h2 className="text-xl font-bold my-2">Request Tracker Form</h2>
            <p className="text-sm mb-4">
              Let us know how we can assist you. Submit feature requests, report bugs, or share any issues you’ve encountered.
            </p>
          </header>
          <IssueTrackerForm onSuccess={() => handleTabChange('Request List')}/>
        </div>
      </TabsContent>
    </Tabs>
  );
};
