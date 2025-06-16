### Export to EXCEL/CSV 
- [v] Install excel library
- [v] Create Classes for data mapping
- [v] FormService/Controller functions and endpoints
- [] api hooks for excel download (POST HTTP)

### Add time limit and auto-submit

### Progress Card for proctered form (assessment test or similar usage)

### Integrate With Google Spreadsheet

### Track form attempt



```
import { AlertTriangle, CheckCircle, Clock, Eye, Link2, MoveLeft, Send, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"
    
    
      {/* Record Progress Card - keeping your existing code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Record Progress
          </CardTitle>
          <CardDescription>Track record completion and token usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Overview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Completion Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        completionRate >= 80
                          ? "text-green-600"
                          : completionRate >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {completionRate.toFixed(0)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {completionRate >= 80
                        ? "Great progress!"
                        : completionRate >= 50
                          ? "Good progress"
                          : "Needs attention"}
                    </span>
                  </div>
                </div>
                <Progress value={completionRate} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{tokenStats.used} completed</span>
                  <span>{tokenStats.generated} total invites</span>
                </div>
              </div>

              {/* Token Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Link2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-blue-700">{tokenStats.generated}</p>
                  <p className="text-xs text-blue-600">Generated</p>
                </div>

                <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-lg font-bold text-green-700">{tokenStats.used}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>

                <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-700">{tokenStats.unused}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>

                <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <p className="text-lg font-bold text-orange-700">{tokenStats.expired}</p>
                  <p className="text-xs text-orange-600">Expired</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Quick Actions</h4>

              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Responses
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Expiry
                </Button>
              </div>

              {tokenStats.expired > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <p className="text-xs text-orange-700">
                      {tokenStats.expired} expired links. Consider regenerating links for pending applicants.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
```

### Submitted By

```
// form-responses.tsx
  // Create columns for DataTable
  const columns: ColumnDef<FormResponse>[] = useMemo(() => {
    const baseColumns: ColumnDef<FormResponse>[] = [
      {
        accessorKey: "submittedAt",
        header: "Submitted At",
        cell: ({ row }) => {
          const response = row.original
          const apiResponse = entries.find((entry) => entry.id === response.id)
          return new Date(response.submittedAt).toLocaleDateString()
        },
      },
      {
        id: "submittedBy",
        header: "Submitted By",
        cell: ({ row }) => {
          const response = row.original
          const apiResponse = entries.find((entry) => entry.id === response.id)
          return apiResponse?.submittedByUser?.name || "Unknown"
        },
      },
    ]


// FormResponseResource.php

// User who submitted the form (loaded via 'submittedByUser:id,name,email')
/*
'submitted_by_user' => $this->whenLoaded('submittedByUser', function () {
    return [
        'id' => $this->submittedByUser->id,
        'name' => $this->submittedByUser->name,
        'email' => $this->submittedByUser->email,
    ];
}),
*/
```