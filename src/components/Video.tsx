import { FC } from "react";
import { Video as VideoType } from "../model";
import { Replace } from "../utils/types";
import { createComponentSmartLink, createItemSmartLink } from "../utils/smartlink";

type VideoProps = {
  video: Replace<VideoType, { elements: Partial<VideoType["elements"]> }>;
  parentId: string;
  componentId: string | null;
};

const VideoComponent: FC<VideoProps> = ({ video, parentId, componentId }) => {
  return (
    <div className="flex flex-col items-center py-16">
      <h2 className="text-azure text-[40px] md:text-[64px] leading-[54px] w-2/4 text-center"
      {...createItemSmartLink(parentId)}
      {...(componentId && createComponentSmartLink(componentId))}>
        {video.elements.headline?.value}
      </h2>
      <p className="w-4/6 text-center text-xl pt-6 text-gray">
        {video.elements.description?.value}
      </p>
      {video.elements.video_link?.value
        ? (
          <figure className="pt-20 w-full">
            <iframe
              className="m-auto w-full lg:w-[900px]"
              title={video.elements.headline?.value ?? "Video Title"}
              width={900}
              height={590}
              src={`${video.elements.video_link.value}${
                video.elements.autoplay?.value[0]?.codename === "true" ? "&autoplay=1&mute=1" : ""
              }`}
              referrerPolicy="strict-origin-when-cross-origin"
              allow={"autoplay"}
            />
            <figcaption className="text-gray-light block m-auto w-fit text-xl pt-6">
              {video.elements.caption?.value}
            </figcaption>
          </figure>
        )
        : <></>}
    </div>
  );
};

export default VideoComponent;
