import { DeliveryError } from "@kontent-ai/delivery-sdk";
import PageContent from "../components/PageContent";
import "../index.css";
import { LanguageCodenames, type LandingPageType } from "../model";
import { createClient } from "../utils/client";
import { FC, useCallback, useState, useEffect, Suspense } from "react";
import { AppContextComponent, useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import { useParams, useSearchParams } from "react-router-dom";
import { SmartLinkContextComponent, useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useSuspenseQueries } from "@tanstack/react-query";
import MicrositeFooter from "../components/microsite/MicrositeFooter";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import MicrositeHeader from "../components/microsite/MicrositeHeader";
import MicrositeNavigation from "../components/microsite/MicrositeNavigation";
import MicrositeHero from "../components/microsite/MicrositeHero";
import Loader from "../components/Loader";

const useMicrosite = (isPreview: boolean, lang: string | null, slug: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [microsite, setMicrosite] = useState<Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }> | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (microsite) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
      applyUpdateOnItemAndLoadLinkedItems(
        microsite,
        data,
        codenamesToFetch => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setMicrosite(updatedItem as Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }>);
        }
      });
    }
  }, [microsite, environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<LandingPageType>(slug ?? "")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        const item = res.data.item as Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }> | undefined;
        if (item) {
          setMicrosite(item);
        } else {
          setMicrosite(null);
        }
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setMicrosite(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return microsite;
};

const MicrositeContent: FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const { slug } = useParams();

  const microsite = useMicrosite(isPreview, lang, slug ?? null);

  const [micrositeData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["microsite"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .item<LandingPageType>(slug ?? "")
            .toPromise()
            .then(res =>
              res.data.item as Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }> ?? null
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
        micrositeData.refetch();
      }
    },
    [microsite],
  );

  useCustomRefresh(onRefresh);

  if (!microsite || !Object.entries(microsite.elements).length) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Microsite Header */}
      <MicrositeHeader
        title={microsite.elements.metadata__title?.value ?? ""}
        itemId={microsite.system.id}
      />

      {/* Navigation from subpages */}
      {microsite.elements.subpages?.linkedItems?.length && microsite.elements.subpages?.linkedItems?.length > 0 && (
        <MicrositeNavigation
          subpages={microsite.elements.subpages.linkedItems}
          activePageId={microsite.elements.subpages.linkedItems[0]?.system.id}
          parentItemId={microsite.system.id}
        />
      )}

      {/* Hero Section */}
      <MicrositeHero
        headline={microsite.elements.headline}
        subheadline={microsite.elements.subheadline}
        heroImage={microsite.elements.hero_image}
        itemId={microsite.system.id}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Landing Page Body Copy */}
        {microsite.elements.body_copy?.value && (
          <section className="py-12 bg-white">
            <div
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
              {...createItemSmartLink(microsite.system.id)}
              {...createElementSmartLink("body_copy")}
            >
              <PageContent
                body={microsite.elements.body_copy}
                itemId={microsite.system.id}
                elementName="body_copy"
              />
            </div>
          </section>
        )}

        {/* Featured Content Section */}
        {microsite.elements.featured_content?.value && microsite.elements.featured_content.value.length > 0 && (
          <section
            className="py-12 bg-creme"
            {...createItemSmartLink(microsite.system.id)}
            {...createElementSmartLink("featured_content")}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-libre font-bold text-burgundy mb-8 text-center">
                Featured
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {microsite.elements.featured_content.linkedItems?.filter(Boolean).map((item) => (
                  item?.system?.id ? (
                    <div
                      key={item.system.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      {...createItemSmartLink(item.system.id, item.system.name)}
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-burgundy mb-2">
                          {(item.elements as any).headline?.value || item.system.name}
                        </h3>
                        {(item.elements as any).subheadline?.value && (
                          <p className="text-gray-600 text-sm">
                            {(item.elements as any).subheadline.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Microsite Footer */}
      <MicrositeFooter title={microsite.elements.metadata__title?.value ?? ""} />
    </div>
  );
};

const Microsite: FC = () => (
  <Suspense
    fallback={
      <div className="flex w-screen h-screen justify-center items-center">
        <Loader />
      </div>
    }
  >
    <AppContextComponent>
      <SmartLinkContextComponent>
        <MicrositeContent />
      </SmartLinkContextComponent>
    </AppContextComponent>
  </Suspense>
);

export default Microsite;