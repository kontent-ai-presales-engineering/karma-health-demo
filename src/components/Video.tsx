import { FC } from "react";
import { VideoType } from "../model";
import { Replace } from "../utils/types";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { getYouTubeEmbedUrl, isYouTubeUrl } from "../utils/youtube";

type VideoProps = {
  video: Replace<VideoType, { elements: Partial<VideoType["elements"]> }>;
  componentId: string;
  componentName: string;
};

const VideoComponent: FC<VideoProps> = ({ video, componentId, componentName }) => {
  const videoUrl = video.elements.video_link?.value;
  const shouldAutoplay = video.elements.autoplay?.value[0]?.codename === "true";

  // Get the proper embed URL for YouTube videos, or use the original URL for other video types
  const embedUrl = videoUrl && isYouTubeUrl(videoUrl)
    ? getYouTubeEmbedUrl(videoUrl, shouldAutoplay, shouldAutoplay)
    : videoUrl;

  return (
    <div className="flex flex-col items-center py-16"
      {...createItemSmartLink(componentId, componentName)}>
      <h2 className="text-azure text-[40px] md:text-[64px] leading-[54px] w-2/4 text-center"
        {...createElementSmartLink("headline")}>
        {video.elements.headline?.value}
      </h2>
      <p className="w-4/6 text-center text-xl pt-6 text-gray"
        {...createElementSmartLink("description")}>
        {video.elements.description?.value}
      </p>
      {embedUrl
        ? (
          <figure className="pt-20 w-full">
            <iframe
              className="m-auto w-full lg:w-[900px]"
              title={video.elements.headline?.value ?? "Video Title"}
              width={900}
              height={590}
              src={embedUrl}
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
