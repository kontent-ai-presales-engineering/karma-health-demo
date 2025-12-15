import React, { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { LanguageCodenames, PersonType } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import PageSection from "../components/PageSection";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PersonDetailPage: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const queryClient = useQueryClient();

  const { data: person, refetch } = useQuery({
    queryKey: ["person-detail", slug, lang, isPreview],
    queryFn: async () => {
      try {
        const response = await createClient(environmentId, apiKey, isPreview)
          .item<PersonType>(slug ?? "")
          .languageParameter((lang ?? "default") as LanguageCodenames)
          .toPromise();

        return response.data.item ?? null;
      } catch (err) {
        if (err instanceof DeliveryError) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!slug,
  });

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (person) {
      applyUpdateOnItemAndLoadLinkedItems(
        person,
        data,
        (codenamesToFetch: readonly string[]) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          queryClient.setQueryData(["person-detail", slug, lang, isPreview], updatedItem);
        }
      });
    }
  }, [person, environmentId, apiKey, isPreview, slug, lang, queryClient]);

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

  if (!person) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex flex-col gap-12">
      <PageSection color="bg-azure">
        <div className="azure-theme flex flex-col-reverse gap-16 lg:flex-row items-center pt-[104px] pb-[160px]">
          <div className="flex flex-col flex-1 gap-6">
            <div className="w-fit text-xs text-body-color border tracking-wider font-[700] border-tag-border-color px-4 py-2 rounded-lg uppercase">
              {person.system.language === "es-ES" ? "Equipo" : "Team"}
            </div>
            <h1 className="text-heading-1 leading-[84%] text-heading-1-color"
            {...createItemSmartLink(person.system.id)}
            {...createElementSmartLink("first_name")}
            >
              {person.elements.first_name?.value} {person.elements.last_name?.value}
            </h1>
            {person.elements.job_title?.value && (
              <p className="text-body-xl text-body-color"
              {...createItemSmartLink(person.system.id)}
              {...createElementSmartLink("job_title")}
              >
                {person.elements.job_title.value}
              </p>
            )}
          </div>
          <div className="flex-1">
            <img
              width={670}
              height={440}
              src={person.elements.image?.value[0]?.url ?? ""}
              alt={person.elements.image?.value[0]?.description ?? ""}
              className="rounded-lg w-[670px] h-[440px] object-cover"
            />
          </div>
        </div>
      </PageSection>

      <PageSection color="bg-white">
        <div className="flex flex-col gap-12 mx-auto items-center max-w-fit">
          {person.elements.biography?.value && (
            <div className="rich-text-body flex mx-auto flex-col gap-5 items-center max-w-[728px]"
            {...createItemSmartLink(person.system.id)}
            {...createElementSmartLink("biography")}
            >
              <PortableText
                value={transformToPortableText(person.elements.biography.value)}
                components={defaultPortableRichTextResolvers}
              />
            </div>
          )}
        </div>
      </PageSection>
    </div>
  );
};

export default PersonDetailPage;