import { CalendarDays, AlertCircle, Check, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { formatDateTime } from "@/lib/datetime";

// Define LogAction type
export type LogAction = "created" | "updated" | "status_change";

// Define LogDetails as a flexible object for any details
export type LogDetails = {
  [key: string]: any;
};

// LogItem is a generic type to support any LogDetails
export type LogItem<T extends LogDetails> = {
  id: string;
  user? : any ;
  action: LogAction;
  actionDetails: T;
  createdAt: string;
};

// Define ActivityItemProps to be generic, accepting LogItem of any type
type ActivityItemProps<T extends LogDetails> = {
  item: LogItem<T>;
};

// Function to return action icons based on action type
const getActionIcon = (action: LogAction) => {
  switch (action) {
    case "created":
      return <Check className="w-5 h-5 text-green-500" />;
    case "updated":
      return <RefreshCw className="w-5 h-5 text-blue-500" />;
    case "status_change":
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
};

// Formatting action details
const formatActionDetails = (action: LogAction, details: LogDetails) => {
  switch (action) {
    case "created":
      return details.description || "Created item";
    case "updated":
      return `Updated fields: ${details.updatedFields?.join(", ")}`;
    case "status_change":
      return `Status changed from ${details.previousStatus} to ${details.newStatus}`;
    default:
      return "Unknown action";
  }
};

// ActivityItem component to display each log entry
const ActivityItem = <T extends LogDetails>({ item }: ActivityItemProps<T>) => {
  return (
    <li className="flex items-start space-x-4 py-4">
      <div className="flex-shrink-0">{getActionIcon(item.action)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {item.action === "created"
            ? "Created an item"
            : item.action === "updated"
            ? "Updated an item"
            : "Changed item status"}
        </p>
        {(item.action == "updated" || item.action == "status_change") && <p className="text-sm text-gray-600">{formatActionDetails(item.action, item.actionDetails)}</p>}
        <p className="text-xs text-gray-500 flex items-center mt-1 space-x-2">
          <CalendarDays className="w-4 h-4" />
          <span>
            {formatDateTime(item.createdAt)}
          </span>
          {item.user ? (
            <>
              {item.user?.name && <span>{item.user.name}</span>} 
            </>
          ) : null}
        </p>
      </div>
    </li>
  );
};

// ActivityLog component to display the list of activities
export default function ActivityLog<T extends LogDetails>({ logData }: { logData: LogItem<T>[] }) {
  return (
    <Card className="max-h-[60vh] flex flex-col">
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {logData ? 
        <ScrollArea className="h-full">
          <ul className="divide-y divide-gray-200">
            {logData.map((activity) => (
              <ActivityItem key={activity.id} item={activity} />
            ))}
          </ul>
        </ScrollArea>:
          <div className="flex items-center justify-center w-full min-h-[60vh]">
            <p className="text-gray-500">No issues found.</p>
          </div>
        }
      </CardContent>
    </Card>
  );
}
