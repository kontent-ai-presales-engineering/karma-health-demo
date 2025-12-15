import React, { useCallback, useState, useEffect } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { LanguageCodenames, PageType, ServiceType } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import ServiceList from "../components/services/ServiceList";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { IUpdateMessageData, IRefreshMessageData, IRefreshMessageMetadata, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useLivePreview, useCustomRefresh } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

const useServicesPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [page, setPage] = useState<PageType | null>(null);

  const refetch = useCallback(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<PageType>("services")
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

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page) {
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
          setPage(updatedItem as PageType);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

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

  useEffect(() => {
    refetch();
  }, [refetch]);

  useLivePreview(handleLiveUpdate);
  useCustomRefresh(onRefresh);

  return page;
};

const useServices = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [services, setServices] = useState<ServiceType[]>([]);

  const refetch = useCallback(() => {
    createClient(environmentId, apiKey, isPreview)
      .items<ServiceType>()
      .type("service")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setServices(res.data.items);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setServices([]);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    setServices(prevServices => {
      return prevServices.map(service => {
        if (service.system.codename === data.item.codename) {
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
              setServices(prev => prev.map(s =>
                s.system.codename === data.item.codename ? updatedItem as ServiceType : s
              ));
            }
          });
          return service;
        }
        return service;
      });
    });
  }, [environmentId, apiKey, isPreview]);

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

  useEffect(() => {
    refetch();
  }, [refetch]);

  useLivePreview(handleLiveUpdate);
  useCustomRefresh(onRefresh);

  return services;
};

const ServicesListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const servicesPage = useServicesPage(isPreview, lang);
  const services = useServices(isPreview, lang);

  if (!servicesPage || !services) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex flex-col gap-12">
      <PageSection color="bg-creme">
        <div className="flex flex-col-reverse gap-16 lg:gap-0 lg:flex-row items-center py-16 lg:py-0 lg:pt-[104px] lg:pb-[160px]">
          <div className="flex flex-col flex-1 gap-6">
            <h1 className="text-heading-1 text-heading-1-color"
            {...createItemSmartLink(servicesPage.system.id)}
            {...createElementSmartLink("headline")}
            >
              {servicesPage.elements.headline.value}
            </h1>
            <p className="text-body-lg text-body-color"
            {...createItemSmartLink(servicesPage.system.id)}
            {...createElementSmartLink("subheadline")}
            >
              {servicesPage.elements.subheadline.value}
            </p>
          </div>
          <div className="flex flex-col flex-1">
            <img
              width={670}
              height={440}
              src={servicesPage.elements.hero_image?.value[0]?.url}
              alt={servicesPage.elements.hero_image?.value[0]?.description ?? ""}
              className="rounded-lg"
            />
          </div>
        </div>
      </PageSection>
      {!isEmptyRichText(servicesPage.elements.body.value) && (
        <PageSection color="bg-white">
          <div className="flex flex-col pt-16 mx-auto gap-6"
          {...createItemSmartLink(servicesPage.system.id)}
          {...createElementSmartLink("body")}
          >
            <PortableText
              value={transformToPortableText(servicesPage.elements.body.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </PageSection>
      )}
      <PageSection color="bg-white">
        <ServiceList
          services={services.map(service => ({
            image: {
              url: service.elements.image.value[0]?.url ?? "",
              alt: service.elements.image.value[0]?.description ?? "",
            },
            name: service.elements.name.value,
            summary: service.elements.summary.value,
            tags: service.elements.medical_specialties.value.map(specialty => specialty.name),
            urlSlug: service.elements.url_slug.value,
            itemId: service.system.id,
          }))}
        />
      </PageSection>
    </div>
  );
};

export default ServicesListingPage;
