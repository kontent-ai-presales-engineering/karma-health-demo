import { FC } from "react";
import { Elements } from "@kontent-ai/delivery-sdk";
import { createElementSmartLink, createItemSmartLink } from "../../utils/smartlink";

type MicrositeHeroProps = {
  headline?: Elements.TextElement;
  subheadline?: Elements.TextElement;
  heroImage?: Elements.AssetsElement;
  itemId?: string;
};

const MicrositeHero: FC<MicrositeHeroProps> = ({
  headline,
  subheadline,
  heroImage,
  itemId
}) => {
  const imageUrl = heroImage?.value?.[0]?.url;
  const imageDescription = heroImage?.value?.[0]?.description;
  const isVideo = heroImage?.value?.[0]?.type?.startsWith('video');

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image/Video */}
      {imageUrl && (
        <div
          className="absolute inset-0 z-0"
          {...createItemSmartLink(itemId)}
          {...createElementSmartLink("hero_image")}
        >
          {isVideo ? (
            <video
              src={imageUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={`${imageUrl}?auto=format&w=1920&q=80`}
              alt={imageDescription || "Hero background"}
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-burgundy/70 via-burgundy/50 to-burgundy/70" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {headline?.value && (
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-libre font-bold text-white mb-6 leading-tight"
            {...createItemSmartLink(itemId)}
            {...createElementSmartLink("headline")}
          >
            {headline.value}
          </h1>
        )}
        {subheadline?.value && (
          <p
            className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto"
            {...createItemSmartLink(itemId)}
            {...createElementSmartLink("subheadline")}
          >
            {subheadline.value}
          </p>
        )}
      </div>
    </section>
  );
};

export default MicrositeHero;
