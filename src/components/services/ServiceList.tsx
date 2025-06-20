import React from "react";
import ServiceListItem from "./ServiceListItem";

// Define the ServiceData type with a flattened structure
type ServiceData = Readonly<{
  image: {
    url: string;
    alt: string;
  };
  name: string;
  summary: string;
  tags: ReadonlyArray<string>;
  urlSlug: string;
}>;

type ServiceListProps = Readonly<{
  services: ReadonlyArray<ServiceData>;
}>;

const ServiceList: React.FC<ServiceListProps> = ({ services }) => {
  return (
    <div className="flex flex-col items-center gap-[104px]">
      {services.length === 0 ? <p className="text-center text-grey text-xl">No services available</p> : (
        services.map((service, index) => (
          <ServiceListItem
            key={index}
            image={service.image}
            name={service.name}
            summary={service.summary}
            tags={service.tags}
            slug={service.urlSlug}
          />
        ))
      )}
    </div>
  );
};

export default ServiceList;
