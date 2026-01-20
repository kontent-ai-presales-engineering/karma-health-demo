import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { LanguageCodenames, LandingPageType } from "../model";
import { createClient } from "../utils/client";
import { useCallback, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import { useLivePreview } from "../context/SmartLinkContext";
import { IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";

export interface UseLandingPageResult {
  landingPage: Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }> | null;
  isLoading: boolean;
  error: string | null;
}

export const useLandingPage = (isPreview: boolean, lang: string | null, slug: string | null): UseLandingPageResult => {
  const { environmentId, apiKey } = useAppContext();
  const [landingPage, setLandingPage] = useState<Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (landingPage) {
      applyUpdateOnItemAndLoadLinkedItems(
        landingPage,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .depthParameter(3)
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setLandingPage(updatedItem as Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }>);
        }
      }).catch((err) => {
        console.error('Error updating landing page:', err);
        setError('Failed to update landing page content');
      });
    }
  }, [landingPage, environmentId, apiKey, isPreview]);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setError('No slug provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    createClient(environmentId, apiKey, isPreview)
      .item<LandingPageType>(slug)
      .depthParameter(3)
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        const item = res.data.item as Replace<LandingPageType, { elements: Partial<LandingPageType["elements"]> }> | undefined;
        if (item) {
          setLandingPage(item);
          setError(null);
        } else {
          setLandingPage(null);
          setError('Landing page not found');
        }
      })
      .catch((err) => {
        console.error('Error fetching landing page:', err);
        if (err instanceof DeliveryError) {
          setLandingPage(null);
          setError('Landing page not found');
        } else {
          setError('Failed to load landing page content');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [environmentId, apiKey, isPreview, lang, slug]);

  useLivePreview(handleLiveUpdate);

  return { landingPage, isLoading, error };
};
