import { FC } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { CollectionCodenames, LandingPage, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAppContext } from "../context/AppContext";
import { createPreviewLink } from "../utils/link";

const Navigation: FC = () => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const lang = searchParams.get("lang");
  const collectionParam = searchParams.get("collection")
  const collectionFilter = collectionParam ?? collection ?? "patient_resources";

  const [navigation] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["navigation"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items<LandingPage>()
            .type("landing_page")
            .limitParameter(1)
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .collections([collectionFilter as CollectionCodenames])
            .toPromise()
            .then(res => res.data.items[0]?.elements.subpages.linkedItems.map(subpage => ({
              name: subpage.elements.headline.value,
              link: subpage.elements.url.value,
            })))
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            }),
      },
    ],
  });

  const createMenuLink = (name: string, link: string) => (
    <li key={name}>
      <NavLink to={createPreviewLink(link, isPreview)} className="text-xl leading-5 text-gray w-fit block hover:text-burgundy">{name}</NavLink>
    </li>
  );

  return (
    <nav>
      <menu className="flex flex-col lg:flex-row gap-5 lg:gap-[60px] items-center list-none">
        {
          navigation.data?.map(({ name, link }) => createMenuLink(name, link))
        }
      </menu>
    </nav>
  );
};

export default Navigation;
