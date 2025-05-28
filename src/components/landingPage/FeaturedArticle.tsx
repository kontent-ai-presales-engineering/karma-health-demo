import React from "react";
import FeaturedComponentBase from "./FeaturedComponentBase";
import Tags from "../Tags";
import Link from "../Link";
import { createItemSmartLink } from "../../utils/smartlink";

type FeaturedArticleProps = Readonly<{
  article: Readonly<{
    image: Readonly<{
      url: string;
      alt: string;
    }>;
    title: string;
    publishDate: string;
    introduction: string;
    topics: ReadonlyArray<string>;
    itemId: string;
  }>;
  displayFeatured?: boolean;
  urlSlug: string;
}>;

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article, displayFeatured = false, urlSlug }) => {
  return (
    <FeaturedComponentBase
      type="article"
      image={{
        url: article.image.url,
        alt: article.image.alt,
      }}
      displayFeatured={displayFeatured}
    >
      <>
        <div
        {...createItemSmartLink(article.itemId)}
        >
          <h2 className="text-center lg:text-left text-heading-2 font-semibold text-burgundy">
            {article.title}
          </h2>
          <p className="text-center lg:text-left text-gray-light mt-6 text-body-md">
            {article.publishDate
              && `Published on ${
                new Date(article.publishDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                })
              }`}
          </p>
          <Tags
            tags={article.topics}
            className="mt-4"
          />
          <p className="text-left text-gray-700 mt-4 text-body-lg">
            {article.introduction}
          </p>
        </div>
        <Link href={urlSlug} text="Read more" className="mt-6" />
      </>
    </FeaturedComponentBase>
  );
};

export default FeaturedArticle;
