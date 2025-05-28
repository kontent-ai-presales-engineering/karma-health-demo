import React from "react";
import FeaturedArticle from "../landingPage/FeaturedArticle";
import Divider from "../Divider";
import PageSection from "../PageSection";

// Define the ArticleData type with a flattened structure
type ArticleData = Readonly<{
  image: Readonly<{
    url: string;
    alt: string;
  }>;
  title: string;
  introduction: string;
  publishDate: string;
  topics: ReadonlyArray<string>;
  urlSlug: string;
  itemId: string;
}>;

type ArticleListProps = Readonly<{
  articles: ReadonlyArray<ArticleData>;
}>;

const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  return (
    <div className="flex flex-col items-center">
      {articles.length === 0
        ? <p className="text-center text-grey text-body-xl">No articles available</p>
        : (articles.map((article, index) => (
          <div key={article.urlSlug}>
            <PageSection color="bg-white">
              <FeaturedArticle
                key={article.urlSlug}
                article={{
                  image: article.image,
                  title: article.title,
                  introduction: article.introduction,
                  publishDate: article.publishDate,
                  topics: article.topics,
                  itemId: article.itemId
                }}
                urlSlug={article.urlSlug}
              />
            </PageSection>
            {index !== articles.length - 1 && <Divider />}
          </div>
        )))}
    </div>
  );
};

export default ArticleList;
