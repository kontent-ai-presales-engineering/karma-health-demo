import React, { useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { Service, Person, LanguageCodenames } from "../model";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import PageSection from "../components/PageSection";
import Tags from "../components/Tags";
import { NavLink } from "react-router-dom";
import { createPreviewLink } from "../utils/link";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { useQuery } from "@tanstack/react-query";

interface TeamMemberCardProps {
  prefix?: string;
  firstName: string;
  lastName: string;
  suffix?: string;
  jobTitle: string;
  image: {
    url?: string;
    alt: string;
  };
  codename: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = React.memo(({ 
  prefix, 
  firstName, 
  lastName, 
  suffix, 
  jobTitle, 
  image, 
  codename 
}) => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  return (
    <div className="flex gap-4 items-center">
      <img src={image.url} alt={image.alt} className="w-[95px] h-[95px] object-cover rounded-full" />
      <div className="flex flex-col gap-2 items-start">
        <NavLink
          to={createPreviewLink(`/our-team/${codename}`, isPreview)}
          className="text-heading-4 underline text-burgundy hover:text-azure"
        >
          {prefix && <span>{prefix}</span>}
          {firstName} {lastName}
          {suffix && <span>, {suffix}</span>}
        </NavLink>
        <p className="text-small text-grey text-center">
          {jobTitle}
        </p>
      </div>
    </div>
  );
});

TeamMemberCard.displayName = 'TeamMemberCard';

const ServiceDetail: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const { data: service, refetch } = useQuery({
    queryKey: [`service-detail_${slug}`, lang, isPreview],
    queryFn: async () => {
      const client = createClient(environmentId, apiKey, isPreview);
      
      // First get the service by slug
      const slugResponse = await client
        .items<Service>()
        .type("service")
        .equalsFilter("elements.url_slug", slug ?? "")
        .toPromise();
      
      const serviceCodename = slugResponse.data.items[0]?.system.codename;
      
      if (!serviceCodename) {
        return null;
      }

      // Then get the full service data with language
      const serviceResponse = await client
        .items<Service>()
        .type("service")
        .equalsFilter("system.codename", serviceCodename)
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .depthParameter(1)
        .toPromise();

      return serviceResponse.data.items[0] ?? null;
    },
    enabled: !!slug,
  });

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (service) {
      applyUpdateOnItemAndLoadLinkedItems(
        service,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          refetch();
        }
      });
    }
  }, [service, environmentId, apiKey, isPreview, refetch]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        refetch();
      }
    },
    [refetch],
  );

  useCustomRefresh(onRefresh);

  const teamMembers = useMemo(() => 
    service?.elements.team.linkedItems.map((person: Person) => ({
      id: person.system.id,
      prefix: person.elements.prefix?.value,
      firstName: person.elements.first_name?.value || "",
      lastName: person.elements.last_name?.value || "",
      suffix: person.elements.suffixes?.value,
      jobTitle: person.elements.job_title?.value || "",
      image: {
        url: person.elements.image?.value[0]?.url || "",
        alt: person.elements.image?.value[0]?.description
          || `Photo of ${person.elements.first_name?.value} ${person.elements.last_name?.value}`,
      },
      codename: person.system.codename,
    })) ?? [], [service?.elements.team.linkedItems]);

  if (!service) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex flex-col gap-12">
      <PageSection color="bg-azure">
        <div className="azure-theme flex flex-col-reverse gap-16 lg:gap-0 lg:flex-row items-center pt-[104px] pb-[160px]">
          <div className="flex flex-col flex-1 gap-6">
            <div className="w-fit text-small text-body-color border tracking-wider font-[700] border-white px-4 py-2 rounded-lg uppercase">
              Service
            </div>
            <h1 className="text-heading-1 text-heading-1-color max-w-[12ch]"
            {...createItemSmartLink(service.system.id)}
            {...createElementSmartLink("name")}
            >
              {service.elements.name.value}
            </h1>
            <p className="text-body-lg text-body-color text-[32px] leading-[130%]"
            {...createItemSmartLink(service.system.id)}
            {...createElementSmartLink("summary")}
            >
              {service.elements.summary.value}
            </p>
          </div>
          <div className="flex flex-col flex-1">
            <img
              width={670}
              height={440}
              src={service.elements.image.value[0]?.url ?? ""}
              alt={service.elements.image.value[0]?.description ?? ""}
              className="rounded-lg w-[670px] h-[440px]"
            />
          </div>
        </div>
      </PageSection>

      <PageSection color="bg-white">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 max-w-6xl mx-auto">
          <div className="rich-text-body lg:basis-2/3 flex-mx-auto flex flex-col gap-5"
          {...createItemSmartLink(service.system.id)}
          {...createElementSmartLink("description")}
          >
            <PortableText
              value={transformToPortableText(service.elements.description?.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>

          <div className="flex flex-col gap-20">
            <div className="flex flex-col gap-10">
              <h2 className="text-heading-2 text-burgundy">
                Medical Specialties
              </h2>
              <Tags
                tags={service.elements.medical_specialties.value.map(specialty => specialty.name)}
                orientation="vertical"
                itemId={service.system.id}
                elementCodename="medical_specialties"
              />
            </div>

            {service.elements.team.linkedItems.length > 0 && (
              <div className="max-w-3xl">
                <h2 className="text-heading-2 text-burgundy mb-10">Team</h2>
                <div className="flex flex-col gap-6">
                  {teamMembers.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      {...member}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PageSection>
    </div>
  );
};

export default React.memo(ServiceDetail);
