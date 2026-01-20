import { FC } from "react";
import { PageType } from "../../model";
import { createElementSmartLink, createItemSmartLink } from "../../utils/smartlink";
import PageContent from "../PageContent";

type MicrositePageContentProps = {
  page: PageType;
};

const MicrositePageContent: FC<MicrositePageContentProps> = ({ page }) => {
  const heroImage = page.elements.hero_image?.value?.[0];
  const isVideo = heroImage?.type?.startsWith('video');

  return (
    <section className="py-12 bg-white" id={`page-${page.system.id}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2
            className="text-3xl md:text-4xl font-libre font-bold text-burgundy mb-4"
            {...createItemSmartLink(page.system.id, page.system.name)}
            {...createElementSmartLink("headline")}
          >
            {page.elements.headline?.value}
          </h2>
          {page.elements.subheadline?.value && (
            <p
              className="text-lg text-gray-600"
              {...createItemSmartLink(page.system.id, page.system.name)}
              {...createElementSmartLink("subheadline")}
            >
              {page.elements.subheadline.value}
            </p>
          )}
        </div>

        {/* Optional Hero Image for subpage */}
        {heroImage && (
          <div
            className="mb-8 rounded-lg overflow-hidden"
            {...createItemSmartLink(page.system.id, page.system.name)}
            {...createElementSmartLink("hero_image")}
          >
            {isVideo ? (
              <video
                src={heroImage.url}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-64 md:h-96 object-cover"
              />
            ) : (
              <img
                src={`${heroImage.url}?auto=format&w=1200&q=80`}
                alt={heroImage.description || page.elements.headline?.value || "Page image"}
                className="w-full h-64 md:h-96 object-cover"
              />
            )}
          </div>
        )}

        {/* Page Body Content */}
        {page.elements.body && (
          <PageContent
            body={page.elements.body}
            itemId={page.system.id}
            elementName="body"
          />
        )}
      </div>
    </section>
  );
};

export default MicrositePageContent;
