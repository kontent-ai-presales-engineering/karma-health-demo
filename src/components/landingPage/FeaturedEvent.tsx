import { FC } from "react";
import FeaturedComponentBase from "./FeaturedComponentBase";
import { Event } from "../../model";
import { formatDate } from "../../utils/date";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../../utils/richtext";
import { Replace } from "../../utils/types";
import { PortableText } from "@portabletext/react";
import Tags from "../Tags";
import Link from "../Link";
import { createItemSmartLink } from "../../utils/smartlink";

type FeaturedEventProps = Readonly<{
  event: Replace<Event, { elements: Partial<Event["elements"]> }>;
}>;

const FeaturedEvent: FC<FeaturedEventProps> = ({ event }) => {
  const shouldRender = Object.entries(event.elements).length > 0;

  return shouldRender
    ? (
      <FeaturedComponentBase
        image={{
          url: event.elements.image?.value[0]?.url ?? "",
          alt: event.elements.image?.value[0]?.description ?? "",
        }}
        type="event"
        displayFeatured={true}
      >
        <>
          <div
          {...createItemSmartLink(event.system.id)}
          >
            <h2 className="text-center lg:text-left text-5xl font-semibold text-burgundy">
              {event.elements.name?.value}
            </h2>
            <p className="text-center lg:text-left text-gray-light mt-6 text-lg">
              {`${
                event.elements.start_date?.value?.length
                  ? formatDate(event.elements.start_date?.value as string)
                  : ""
              }${
                event.elements.end_date?.value?.length
                  ? ` - ${formatDate(event.elements.end_date?.value as string)}`
                  : ""
              }`}
            </p>
            <Tags
              tags={[...event.elements.event_type?.value ?? [], ...event.elements.event_topic?.value ?? []].map(t =>
                t.name
              )}
              className="mt-4"
            />
            <div className="mt-4">
              <PortableText
                value={transformToPortableText(event.elements.description?.value ?? "")}
                components={defaultPortableRichTextResolvers}
              />
            </div>
          </div>
          {event.elements.description?.value !== "<p><br></p>" && <Link href={"#"} text="Read more" className="mt-6" />}
        </>
      </FeaturedComponentBase>
    )
    : <></>;
};

export default FeaturedEvent;
