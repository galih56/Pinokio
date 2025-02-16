import { CalendarDays, User, AlertCircle, Check, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ScrollArea } from "../ui/scroll-area"

type ActivityItem = {
  id: string
  issue_id: number
  user_id: number
  user_type?: string
  action: "created" | "updated" | "status_change"
  action_details: string // This will be a JSON string
  created_at: string // Assuming you have a timestamp
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    issue_id: 1,
    user_id: 101,
    user_type: "admin",
    action: "created",
    action_details: JSON.stringify({ description: "Issue created" }),
    created_at: "2025-02-16T18:30:00Z",
  },
  {
    id: "2",
    issue_id: 1,
    user_id: 102,
    action: "updated",
    action_details: JSON.stringify({ updated_fields: ["title", "description"] }),
    created_at: "2025-02-16T17:45:00Z",
  },
  {
    id: "2",
    issue_id: 1,
    user_id: 102,
    action: "updated",
    action_details: JSON.stringify({ updated_fields: ["title", "description"] }),
    created_at: "2025-02-16T17:45:00Z",
  },
  {
    id: "3",
    issue_id: 1,
    user_id: 101,
    user_type: "admin",
    action: "status_change",
    action_details: JSON.stringify({ previous_status: "open", new_status: "closed" }),
    created_at: "2025-02-16T16:20:00Z",
  },
  {
    id: "3",
    issue_id: 1,
    user_id: 101,
    user_type: "admin",
    action: "status_change",
    action_details: JSON.stringify({ previous_status: "open", new_status: "closed" }),
    created_at: "2025-02-16T16:20:00Z",
  },
  {
    id: "3",
    issue_id: 1,
    user_id: 101,
    user_type: "admin",
    action: "status_change",
    action_details: JSON.stringify({ previous_status: "open", new_status: "closed" }),
    created_at: "2025-02-16T16:20:00Z",
  },
]

const getActionIcon = (action: ActivityItem["action"]) => {
  switch (action) {
    case "created":
      return <Check className="w-5 h-5 text-green-500" />
    case "updated":
      return <RefreshCw className="w-5 h-5 text-blue-500" />
    case "status_change":
      return <AlertCircle className="w-5 h-5 text-orange-500" />
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />
  }
}

const formatActionDetails = (action: ActivityItem["action"], details: string) => {
  const parsedDetails = JSON.parse(details)
  switch (action) {
    case "created":
      return parsedDetails.description
    case "updated":
      return `Updated fields: ${parsedDetails.updated_fields.join(", ")}`
    case "status_change":
      return `Status changed from ${parsedDetails.previous_status} to ${parsedDetails.new_status}`
    default:
      return "Unknown action"
  }
}

const ActivityItem = ({ item }: { item: ActivityItem }) => {
  return (
    <li className="flex items-start space-x-4 py-4">
      <div className="flex-shrink-0">{getActionIcon(item.action)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          User {item.user_id}{" "}
          {item.action === "created"
            ? "created an issue"
            : item.action === "updated"
              ? "updated an issue"
              : "changed issue status"}
        </p>
        <p className="text-sm text-gray-600">{formatActionDetails(item.action, item.action_details)}</p>
        <p className="text-sm text-gray-500 flex items-center mt-1">
          <CalendarDays className="w-4 h-4 mr-1" />
          {new Date(item.created_at).toLocaleString()}
        </p>
      </div>
    </li>
  )
}

export default function ActivityLog() {
  return (
    <Card className="max-h-[60vh] flex flex-col">
        <CardHeader>
            <CardTitle>
                Activity Log
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
                <ul className="divide-y divide-gray-200">
                    {mockActivities.map((activity) => (
                    <ActivityItem key={activity.id} item={activity} />
                    ))}
                </ul>
            </ScrollArea>
        </CardContent>
    </Card>
  )
}

