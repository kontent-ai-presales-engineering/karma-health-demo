import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { LanguageCodenames, type CallToActionType } from "../model";
import { createClient } from "../utils/client";
import { useCallback, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import { useLivePreview } from "../context/SmartLinkContext";
import { IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";

export interface UseBannerResult {
  banner: Replace<CallToActionType, { elements: Partial<CallToActionType["elements"]> }> | null;
  isLoading: boolean;
  error: string | null;
}

export const useBanner = (isPreview: boolean, lang: string | null, slug: string | null): UseBannerResult => {
  const { environmentId, apiKey } = useAppContext();
  const [banner, setBanner] = useState<Replace<CallToActionType, { elements: Partial<CallToActionType["elements"]> }> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (banner) {
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
      }).catch((err) => {
        console.error('Error updating banner:', err);
        setError('Failed to update banner content');
      });
    }
  }, [banner, environmentId, apiKey, isPreview]);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setError('No slug provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    createClient(environmentId, apiKey, isPreview)
      .item<CallToActionType>(slug)
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        const item = res.data.item as Replace<CallToActionType, { elements: Partial<CallToActionType["elements"]> }> | undefined;
        if (item) {
          setBanner(item);
          setError(null);
        } else {
          setBanner(null);
          setError('Banner not found');
        }
      })
      .catch((err) => {
        console.error('Error fetching banner:', err);
        if (err instanceof DeliveryError) {
          setBanner(null);
          setError('Banner not found');
        } else {
          setError('Failed to load banner content');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [environmentId, apiKey, isPreview, lang, slug]);

  useLivePreview(handleLiveUpdate);

  return { banner, isLoading, error };
};