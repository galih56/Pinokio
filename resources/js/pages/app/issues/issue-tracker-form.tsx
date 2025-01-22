import IssueTrackerForm from "@/features/issues/components/issue-tracker-form";
import { useParams } from "react-router-dom";
import PublicFormLayout from "@/components/layout/public-form-layout"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export const IssueTrackerFormRoute = () => {
  const params = useParams();
  

  return (
    <PublicFormLayout>
      <Card  className="p-6 my-6 mx-12">
        <Tabs defaultValue="Form">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Form">Form</TabsTrigger>
            <TabsTrigger value="History">History</TabsTrigger>
          </TabsList>
          <TabsContent value="Form">
            <div className="m-4 mt-8">
              <header className="text-center px-2 text-gray-800">
                <h2 className="text-xl font-bold my-2">Request Tracker Form</h2>
                <p>Let us know how we can assist you. Submit feature requests, report bugs, or share any issues you’ve encountered.</p>
              </header>
              <IssueTrackerForm/>
            </div>
          </TabsContent>
          <TabsContent value="History">
            {/* <IssueHistory/> */}

          </TabsContent>
        </Tabs>
      </Card>
    </PublicFormLayout>
  )
}