import { DeliveryError } from "@kontent-ai/delivery-sdk";

import HeroImage from "../components/HeroImage";
import PageContent from "../components/PageContent";
import PageSection from "../components/PageSection";
import "../index.css";
import { LanguageCodenames, type PageType } from "../model";
import { createClient } from "../utils/client";
import { FC, useCallback, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import { useParams, useSearchParams } from "react-router-dom";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useSuspenseQueries } from "@tanstack/react-query";

const usePage = (isPreview: boolean, lang: string | null, slug: string | null) => {
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
      .items<PageType>()
      .type("page")
      .limitParameter(1)
      .equalsFilter("elements.url", slug ?? "")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        const item = res.data.items[0] as Replace<PageType, { elements: Partial<PageType["elements"]> }> | undefined;
        if (item) {
          setPage(item);
        } else {
          setPage(null);
        }
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

const Page: FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const { slug } = useParams();
  const lang = searchParams.get("lang");

  const page = usePage(isPreview, lang, slug ?? null);

  const [pageData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["page"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items<PageType>()
            .type("page")
            .limitParameter(1)
            .equalsFilter("elements.url", slug ?? "")
            .languageParameter((lang ?? "default") as LanguageCodenames)
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
        pageData.refetch();
      }
    },
    [page],
  );

  useCustomRefresh(onRefresh);

  if (!page || !Object.entries(page.elements).length) {
    return <div className="flex-grow">Empty page</div>;
  }

  return (
    <div className="flex-grow">
      {
        page.elements.headline?.value && (
          <PageSection color="bg-burgundy">
            <HeroImage
              data={{
                headline: page.elements.headline,
                subheadline: page.elements.subheadline,
                heroImage: page.elements.hero_image,
                itemId: page.system.id
              }}
              buttonLink="nolink"
            />
          </PageSection>
        )
      }
      <PageSection color="bg-white">
        <PageContent body={page.elements.body!} itemId={page.system.id} elementName="body" />
      </PageSection>
    </div>
  );
};

export default Page;
