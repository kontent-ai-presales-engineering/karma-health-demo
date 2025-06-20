import React from "react";
import ButtonLink from "../ButtonLink";
import Tags from "../Tags";

type ServiceListItemProps = Readonly<{
  image: Readonly<{
    url?: string;
    alt: string;
  }>;
  name: string;
  summary: string;
  tags: ReadonlyArray<string>;
  slug: string;
}>;

const ServiceListItem: React.FC<ServiceListItemProps> = ({
  image,
  name,
  summary,
  tags,
  slug,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-16 justify-center items-center">
      <div className="flex-1 flex flex-col">
        <img
          width={440}
          height={300}
          src={image.url ? `${image.url}?auto=format&w=600` : undefined}
          alt={image.alt}
          className="object-cover rounded-lg self-end w-[440px] h-[300px]"
        />
      </div>
      <div className="flex-1">
        <h2 className="text-center lg:text-left text-heading-2 font-semibold text-azure">
          {name}
        </h2>
        <div className="mt-6">
          <Tags tags={tags} />
        </div>

        <div className="mt-6">
          <p className="text-left text-grey mt-4 text-xl">
            {summary}
          </p>
        </div>

        <div className="mt-8 flex justify-center lg:justify-start">
          <ButtonLink
            href={slug}
            className=""
          >
            Learn more
          </ButtonLink>
        </div>
      </div>
    </div>
  );
};

export default ServiceListItem;
