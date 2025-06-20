import { Elements } from "@kontent-ai/delivery-sdk";
import { FC } from "react";
import ButtonLink from "./ButtonLink";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

type HeroImageProps = Readonly<{
  data: {
    headline?: Elements.TextElement;
    subheadline?: Elements.TextElement;
    heroImage?: Elements.AssetsElement;
    itemId?: string;
  };
  buttonLink?: string;

}>;

const HeroImage: FC<HeroImageProps> = ({ data, buttonLink }) => {
  return (
    <div className="burgundy-theme flex flex-col py-10 lg:py-0 lg:flex-row lg:gap-32">
      <div className="lg:basis-1/2 pt-10 lg:pt-[104px] pb-10 lg:pb-[160px] flex flex-col items-center lg:items-start gap-10">
        <h1 className="text-center lg:text-left font-libre text-[64px] md:text-[94px] text-heading-1-color font-bold leading-[64px] md:leading-[78px]"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("headline")}
        >
          {data.headline?.value}
        </h1>
        <p className="text-center lg:text-left font-sans text-xl text-body-color"
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("subheadline")}
        >{data.subheadline?.value}</p>
        {buttonLink != "nolink" && (
          <ButtonLink href={buttonLink ?? "services"}>
            <p>Explore our services</p>
          </ButtonLink>
        )}
      </div>
      <div className="lg:basis-1/2"
        {...createItemSmartLink(data.itemId)}
        {...createElementSmartLink("hero_image")}
      >
        {data.heroImage?.value[0]
          ? (
            data.heroImage.value[0].type?.startsWith('image') ? (
              <img
                className="object-cover h-full mx-auto"
                width={660}
                height={770}
                src={`${data.heroImage.value[0].url}?auto=format&w=800`}
                alt={data.heroImage.value[0].description ?? "image-alt"}
              />
            ) : (
              <video
                src={data.heroImage.value[0].url}
                autoPlay={true}
                loop={true}
                muted={true}
                width={660}
                height={770}    
                className="object-cover h-full mx-auto"
              />
            )
          ) : <></>}
      </div>
    </div>
  );
};

export default HeroImage;