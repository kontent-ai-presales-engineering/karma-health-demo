import React, { useCallback, useState, useEffect } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import TeamMemberList from "../components/team/TeamMemberList";
import { PageType, PersonType } from "../model";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { LanguageCodenames } from "../model";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { Replace } from "../utils/types";
import { useSuspenseQueries } from "@tanstack/react-query";

const useTeamPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [page, setPage] = useState<Replace<PageType, { elements: Partial<PageType["elements"]> }> | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
      applyUpdateOnItemAndLoadLinkedItems(
        page,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setPage(updatedItem as Replace<PageType, { elements: Partial<PageType["elements"]> }>);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<PageType>("our_team")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setPage(res.data.item);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setPage(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return page;
};

const useTeamMembers = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [teamMembers, setTeamMembers] = useState<PersonType[]>([]);
  

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    // Update the specific team member in the list
    setTeamMembers(prevMembers => {
      return prevMembers.map(member => {
        if (member.system.codename === data.item.codename) {
          // Apply the update and handle the Promise
          applyUpdateOnItemAndLoadLinkedItems(
            member,
            data,
            (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
              .items()
              .inFilter("system.codename", [...codenamesToFetch])
              .toPromise()
              .then(res => res.data.items)
          ).then((updatedItem) => {
            if (updatedItem) {
              setTeamMembers(prev => prev.map(m =>
                m.system.codename === data.item.codename ? updatedItem as PersonType : m
              ));
            }
          });
          return member; // Return the current member while waiting for the update
        }
        return member;
      });
    });
  }, [environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .items<PersonType>()
      .type("person")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setTeamMembers(res.data.items);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setTeamMembers([]);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return teamMembers;
};

const OurTeamPage: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const teamPage = useTeamPage(isPreview, lang);  
  const teamMembers = useTeamMembers(isPreview, lang);  

  const [teamPageData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["landing_page"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items()
            .type("landing_page")
            .limitParameter(1)
            .toPromise()
            .then(res =>
              res.data.items[0] as Replace<PageType, { elements: Partial<PageType["elements"]> }> ?? null
            )
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            }),
      },
    ],
  });

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        teamPageData.refetch();
      }
    },
    [teamPage],
  );

  useCustomRefresh(onRefresh);

  if (!teamPage || !teamMembers) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex flex-col gap-12">
      <PageSection color="bg-creme">
        <div className="flex flex-col-reverse gap-16 lg:gap-0 lg:flex-row items-center py-16 lg:py-0 lg:pt-[104px] lg:pb-[160px]">
          <div className="flex flex-col flex-1 gap-6">
            <h1 className="text-heading-1 text-heading-1-color"
              {...createItemSmartLink(teamPage.system.id)}
              {...createElementSmartLink("headline")}
            >
              {teamPage.elements.headline?.value}
            </h1>
            <p className="text-body-lg text-body-color"
              {...createItemSmartLink(teamPage.system.id)}
              {...createElementSmartLink("subheadline")}
            >
              {teamPage.elements.subheadline?.value}
            </p>
          </div>
          <div className="flex flex-col flex-1">
            <img
              width={670}
              height={440}
              src={teamPage.elements.hero_image?.value[0]?.url}
              alt={teamPage.elements.hero_image?.value[0]?.description ?? ""}
              className="rounded-lg"
            />
          </div>
        </div>
      </PageSection>

      {!isEmptyRichText(teamPage.elements.body?.value ?? "") && (
        <PageSection color="bg-white">
          <div className="flex flex-col pt-10 mx-auto gap-6"
            {...createItemSmartLink(teamPage.system.id)}
            {...createElementSmartLink("body")}
          >
            <PortableText
              value={transformToPortableText(teamPage.elements.body?.value ?? "")}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </PageSection>
      )}

      <PageSection color="bg-white">
        <div className="pb-[160px] pt-[104px]">
          <TeamMemberList
            teamMembers={teamMembers.map(member => ({
              image: {
                url: member.elements.image.value[0]?.url ?? "",
                alt: member.elements.image.value[0]?.description
                  ?? member.elements.first_name.value + " " + member.elements.last_name.value,
              },
              prefix: member.elements.prefix.value,
              suffix: member.elements.suffixes.value,
              firstName: member.elements.first_name.value,
              lastName: member.elements.last_name.value,
              position: member.elements.job_title.value,
              link: member.system.codename,
              itemId: member.system.id,
            }))}
          />
        </div>
      </PageSection>
    </div>
  );
};

export default OurTeamPage;
