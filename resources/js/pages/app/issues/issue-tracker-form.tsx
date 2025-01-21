import IssueTrackerForm from "@/features/issues/components/issue-tracker-form";
import { useParams } from "react-router-dom";
import PublicFormLayout from "@/components/layout/public-form-layout"

export const IssueTrackerFormRoute = () => {
  const params = useParams();
  
  const CustomerHeader = () => (
    <header className="text-center px-2 text-gray-800">
      <h2 className="text-xl font-bold my-2">Request Tracker Form</h2>
      <p>Let us know how we can assist you. Submit feature requests, report bugs, or share any issues you’ve encountered.</p>
    </header>
  );
  return (
    <PublicFormLayout
      header={<CustomerHeader/>}
      >
        <IssueTrackerForm/>
    </PublicFormLayout>
  )
}