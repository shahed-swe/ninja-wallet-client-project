import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceProps {
  name: string;
  bg: string;
  initial: string;
}

const SupportedServices: FC = () => {
  const services: ServiceProps[] = [
    { name: "Zelle", bg: "bg-[#0074DE]", initial: "Z" },
    { name: "PayPal", bg: "bg-[#00457C]", initial: "PP" },
    { name: "Cash App", bg: "bg-[#00D54B]", initial: "CA" },
    { name: "Venmo", bg: "bg-[#008CFF]", initial: "V" },
    { name: "Apple Pay", bg: "bg-[#1434CB]", initial: "AP" },
    { name: "Google Pay", bg: "bg-[#4285F4]", initial: "GP" },
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Supported Services</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {services.map((service) => (
            <div 
              key={service.name}
              className="bg-secondary/5 rounded-lg p-3 flex flex-col items-center justify-center"
            >
              <div className={`w-10 h-10 rounded-full ${service.bg} mb-2 flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">{service.initial}</span>
              </div>
              <span className="text-xs">{service.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportedServices;
