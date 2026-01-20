import { DeliveryError } from "@kontent-ai/delivery-sdk";
import PageContent from "../components/PageContent";
import "../index.css";
import { LanguageCodenames, PageType, type LandingPageType } from "../model";
import { createClient } from "../utils/client";
import { FC, useCallback, useState, useEffect, Suspense, useMemo } from "react";
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
import MicrositePageContent from "../components/microsite/MicrositePageContent";
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

  // Get subpages and manage active page state
  const subpages = useMemo(() =>
    (microsite?.elements.subpages?.linkedItems ?? []).filter(Boolean) as PageType[],
    [microsite?.elements.subpages?.linkedItems]
  );

  // Use 'home' as a special value to indicate the landing page content
  const [activePageId, setActivePageId] = useState<string | 'home'>('home');

  // Get the currently active page (undefined when 'home' is selected)
  const activePage = useMemo(() =>
    activePageId === 'home' ? undefined : subpages.find(page => page.system.id === activePageId),
    [subpages, activePageId]
  );

  const handleNavigate = useCallback((pageId: string) => {
    setActivePageId(pageId);
    // Scroll to top of content area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleHomeClick = useCallback(() => {
    setActivePageId('home');
    // Scroll to top of content area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!microsite || !Object.entries(microsite.elements).length) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Microsite Header */}
      <MicrositeHeader
        title={microsite.elements.headline?.value ?? microsite.system.name}
        itemId={microsite.system.id}
      />

      {/* Navigation from subpages */}
      {subpages.length > 0 && (
        <MicrositeNavigation
          subpages={subpages}
          activePageId={activePageId === 'home' ? undefined : activePageId}
          onNavigate={handleNavigate}
          onHomeClick={handleHomeClick}
          isHomeActive={activePageId === 'home'}
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
        {/* Show active subpage content if a page is selected */}
        {activePage ? (
          <MicrositePageContent page={activePage} />
        ) : (
          /* Show Landing Page Body Copy when Home is selected */
          microsite.elements.body_copy?.value && (
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
          )
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
      <MicrositeFooter title={microsite.elements.headline?.value ?? microsite.system.name} />
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