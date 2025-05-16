import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RecentRecipients: FC = () => {
  // Mock recipients, in a real app this would come from API
  const recipients = [
    { id: 1, name: "James Smith", initials: "JS", color: "bg-primary" },
    { id: 2, name: "Sarah Lee", initials: "SL", color: "bg-secondary" },
    { id: 3, name: "Mike Johnson", initials: "MJ", color: "bg-[#7209B7]" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Recent Recipients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3">
          {recipients.map((recipient) => (
            <div key={recipient.id} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full ${recipient.color} mb-2 flex items-center justify-center`}>
                <span className="text-white font-medium">{recipient.initials}</span>
              </div>
              <span className="text-xs text-center">{recipient.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-secondary/10 mb-2 flex items-center justify-center">
              <i className="ri-add-line text-xl text-muted-foreground"></i>
            </div>
            <span className="text-xs text-muted-foreground text-center">Add New</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentRecipients;
