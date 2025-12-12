import { createContext, FC, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import KontentSmartLink, {
  IRefreshMessageData,
  IRefreshMessageMetadata,
  IUpdateMessageData,
  KontentSmartLinkEvent,
} from "@kontent-ai/smart-link";
import { useAppContext } from "./AppContext";

interface SmartLinkContextValue {
  readonly smartLink?: KontentSmartLink | null;
}

const defaultContextValue: SmartLinkContextValue = {
  smartLink: undefined,
};

const SmartLinkContext = createContext<SmartLinkContextValue>(defaultContextValue);

export const SmartLinkContextComponent: FC<PropsWithChildren> = ({ children }) => {
  const { environmentId } = useAppContext();
  const [smartLink, setSmartLink] = useState<KontentSmartLink | null>(null);

  useEffect(() => {
    const instance = KontentSmartLink.initialize({
      defaultDataAttributes: {
        environmentId: environmentId,
        languageCodename: "default",
      },
    });

    setSmartLink(instance);

    return () => {
      // instance?.destroy();
      setSmartLink(null);
    };
  }, [environmentId, smartLink]);

  const value = useMemo(() => ({ smartLink }), [smartLink]);

  return <SmartLinkContext.Provider value={value}>{children}</SmartLinkContext.Provider>;
};

export const useSmartLink = (): KontentSmartLink | null => {
  const { smartLink } = useContext(SmartLinkContext);

  if (typeof smartLink === "undefined") {
    throw new Error("You need to place SmartLinkProvider to one of the parent components to use useSmartLink.");
  }

  return smartLink;
};

export const useCustomRefresh = (
  callback: (data: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => void,
): void => {
  const smartLink = useSmartLink();

  useEffect(() => {
    if (smartLink) {
      smartLink.on(KontentSmartLinkEvent.Refresh, callback);

      return () => {
        smartLink.off(KontentSmartLinkEvent.Refresh, callback);
      };
    }

    return;
  }, [smartLink, callback]);
};

export const useLivePreview = (callback: (data: IUpdateMessageData) => void): void => {
  const smartLink = useSmartLink();

  useEffect(() => {
    if (smartLink) {
      smartLink.on(KontentSmartLinkEvent.Update, callback);

      return () => {
        smartLink.off(KontentSmartLinkEvent.Update, callback);
      };
    }

    return;
  }, [smartLink, callback]);
};
