import { DeliveryError } from "@kontent-ai/delivery-sdk";

import "../index.css";
import { LanguageCodenames, type CallToActionType } from "../model";
import { createClient } from "../utils/client";
import { FC, useCallback, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import { useParams, useSearchParams } from "react-router-dom";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useSuspenseQueries } from "@tanstack/react-query";
import CallToActionComponent from "../components/CallToAction";
import PageSection from "../components/PageSection";

const useBanner = (isPreview: boolean, lang: string | null, slug: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [banner, setBanner] = useState<Replace<CallToActionType, { elements: Partial<CallToActionType["elements"]> }> | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (banner) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
      applyUpdateOnItemAndLoadLinkedItems(
        banner,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setBanner(updatedItem as Replace<CallToActionType, { elements: Partial<CallToActionType["elements"]> }>);
        }
      });
    }
  }, [banner, environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<CallToActionType>(slug ?? "")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        const item = res.data.item as Replace<CallToActionType, { elements: Partial<CallToActionType["elements"]> }> | undefined;
        if (item) {
          setBanner(item);
        } else {
          setBanner(null);
        }
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setBanner(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return banner;
};

const BannerDetail: FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const { slug } = useParams();
  const lang = searchParams.get("lang");

  const banner = useBanner(isPreview, lang, slug ?? null);

  const [bannerData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["banner"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .item<CallToActionType>(slug ?? "")
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .toPromise()
            .then(res =>
              res.data.item as Replace<CallToActionType, { elements: Partial<CallToActionType["elements"]> }> ?? null
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
        bannerData.refetch();
      }
    },
    [banner],
  );

  useCustomRefresh(onRefresh);

  if (!banner || !Object.entries(banner.elements).length) {
    return <div className="flex-grow">Empty page</div>;
  }

  return (

    <div className="flex-grow">
      <PageSection color="bg-white">
        <CallToActionComponent
          title={banner.elements.headline?.value ?? ""}
          description={banner.elements.subheadline?.value ?? ""}
          buttonText={banner.elements.button_label?.value ?? ""}
          buttonHref={banner.elements.button_link?.linkedItems[0]?.elements.url.value ?? ""}
          imageSrc={banner.elements.image?.value[0]?.url}
          imageAlt={banner.elements.image?.value[0]?.description ?? "alt"}
          imagePosition={banner.elements.image_position?.value[0]?.codename ?? "left"}
          componentId={banner.system.id}
          componentName={banner.system.name}
        />
      </PageSection>
    </div>
  );
};

export default BannerDetail;
