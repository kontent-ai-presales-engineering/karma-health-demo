import React, { useCallback, useState, useEffect } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError, ITaxonomyTerms } from "@kontent-ai/delivery-sdk";
import ArticleList from "../components/articles/ArticleList";
import { PageType, ArticleType, isArticleTypeTaxonomyTermCodename, isGeneralHealthcareTopicsTaxonomyTermCodename, LanguageCodenames } from "../model";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import Selector, { SelectorOption } from "../components/Selector";
import ImageWithTag from "../components/ImageWithTag";
import Tags from "../components/Tags";
import ButtonLink from "../components/ButtonLink";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Replace } from "../utils/types";

type FeaturedArticleProps = Readonly<{
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  title: string;
  published: string;
  tags: ReadonlyArray<string>;
  description: string;
  urlSlug: string;
  itemId: string;
}>;
const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ image, title, published, tags, description, urlSlug, itemId }) => {
  return (
    <div className="flex flex-col lg:flex-row items-center pt-[104px] pb-[120px] gap-12"
    {...createItemSmartLink(itemId)}
    {...createElementSmartLink("featured_article")}>
      <ImageWithTag
        image={{
          url: image.url,
          alt: image.alt,
          width: image.width,
          height: image.height,
        }}
        tagText="Featured Article"
        className="lg:basis-1/2 xl:basis-2/5"
      />

      <div className="lg:basis-1/2 xl:basis-3/5">
        <h2 className="text-heading-2 text-heading-2-color">{title}</h2>
        <p className="text-body-md text-body-color pt-4">{published}</p>
        <Tags tags={tags} className="mt-4" />
        <p className="text-body-lg text-body-color pt-3">
          {description}
        </p>
        <ButtonLink href={urlSlug} className="mt-6">Read More</ButtonLink>
      </div>
    </div>
  );
};

const useArticlesListingPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [page, setPage] = useState<PageType | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
      applyUpdateOnItemAndLoadLinkedItems(
        page,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setPage(updatedItem as PageType);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<PageType>("research")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setPage(res.data.item);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setPage(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return page;
};

const useArticles = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [articles, setArticles] = useState<ArticleType[]>([]);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    // Update the specific article in the list
    setArticles(prevArticles => {
      return prevArticles.map(article => {
        if (article.system.codename === data.item.codename) {
          // Apply the update and handle the Promise
          applyUpdateOnItemAndLoadLinkedItems(
            article,
            data,
            (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
              .items()
              .inFilter("system.codename", [...codenamesToFetch])
              .toPromise()
              .then(res => res.data.items)
          ).then((updatedItem) => {
            if (updatedItem) {
              setArticles(prev => prev.map(a =>
                a.system.codename === data.item.codename ? updatedItem as ArticleType : a
              ));
            }
          });
          return article; // Return the current article while waiting for the update
        }
        return article;
      });
    });
  }, [environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .items<ArticleType>()
      .type("article")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setArticles(res.data.items);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setArticles([]);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return articles;
};

const useArticleTypes = (isPreview: boolean) => {
  const { environmentId, apiKey } = useAppContext();
  const [types, setTypes] = useState<{ terms: ITaxonomyTerms[] }>({ terms: [] });

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .taxonomy("article_type")
      .toPromise()
      .then(res => {
        setTypes(res.data.taxonomy);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setTypes({ terms: [] });
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview]);

  return types;
};

const useArticleTopics = (isPreview: boolean) => {
  const { environmentId, apiKey } = useAppContext();
  const [topics, setTopics] = useState<{ terms: ITaxonomyTerms[] }>({ terms: [] });

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .taxonomy("general_healthcare_topics")
      .toPromise()
      .then(res => {
        setTopics(res.data.taxonomy);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setTopics({ terms: [] });
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview]);

  return topics;
};

const ArticlesListingPage: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const articlesListingPage = useArticlesListingPage(isPreview, lang);
  const articles = useArticles(isPreview, lang);
  const articleTypes = useArticleTypes(isPreview);
  const articleTopics = useArticleTopics(isPreview);

  const [articleType, setArticleType] = useState<string>("All");
  const [articleTopic, setArticleTopic] = useState<string>("All");

  const articleTypeCodename = searchParams.get("type");
  const articleTopicCodename = searchParams.get("topic");

  const handleArticleTypeChange = (option: SelectorOption) => {
    setArticleType(option.label);
    if (option.label === "All") {
      searchParams.delete("type");
    } else {
      searchParams.set("type", option.codename);
    }
  };

  const handleArticleTopicChange = (option: SelectorOption) => {
    setArticleTopic(option.label);
    if (option.label === "All") {
      searchParams.delete("topic");
    } else {
      searchParams.set("topic", option.codename);
    }
  };

  const [landingPageData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["landing_page"],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items()
            .type("landing_page")
            .limitParameter(1)
            .toPromise()
            .then(res =>
              res.data.items[0] as Replace<PageType, { elements: Partial<PageType["elements"]> }> ?? null
            )
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            }),
      },
    ],
  });

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        landingPageData.refetch();
      }
    },
    [articlesListingPage],
  );

  useCustomRefresh(onRefresh);

  if (!articlesListingPage || !articles) {
    return <div className="flex-grow" />;
  }

  const featuredArticle = articles[0];

  return (
    <div className="flex flex-col">
      <PageSection color="bg-creme">
        <div className="flex flex-col-reverse gap-16 lg:gap-0 lg:flex-row items-center py-16 lg:py-0 lg:pt-[104px] lg:pb-[160px]">
          <div className="flex flex-col flex-1 gap-6">
            <h1 className="text-heading-1 text-heading-1-color"
              {...createItemSmartLink(articlesListingPage.system.id)}
              {...createElementSmartLink("headline")}
            >
              {articlesListingPage.elements.headline.value}
            </h1>
            <p className="text-body-lg text-body-color"
              {...createItemSmartLink(articlesListingPage.system.id)}
              {...createElementSmartLink("subheadline")}
            >
              {articlesListingPage.elements.subheadline.value}
            </p>
          </div>
          <div className="flex flex-col flex-1">
            <img
              width={670}
              height={440}
              src={articlesListingPage.elements.hero_image?.value[0]?.url}
              alt={articlesListingPage.elements.hero_image?.value[0]?.description ?? ""}
              className="rounded-lg"
            />
          </div>
        </div>
      </PageSection>

      {!isEmptyRichText(articlesListingPage.elements.body.value) && (
        <PageSection color="bg-white">
          <div className="flex flex-col pt-10 mx-auto gap-6"
            {...createItemSmartLink(articlesListingPage.system.id)}
            {...createElementSmartLink("body")}
          >
            <PortableText
              value={transformToPortableText(articlesListingPage.elements.body.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </PageSection>
      )}

      {featuredArticle && (
        <PageSection color="bg-white">
          <FeaturedArticle
            image={{
              url: featuredArticle.elements.image.value[0]?.url ?? "",
              alt: featuredArticle.elements.image.value[0]?.description ?? featuredArticle.elements.title.value,
              width: 670,
              height: 440,
            }}
            title={featuredArticle.elements.title.value}
            published={featuredArticle.elements.publish_date.value ?? ""}
            tags={featuredArticle.elements.topics.value.map(t => t.name)}
            description={featuredArticle.elements.introduction.value}
            urlSlug={featuredArticle.elements.url_slug.value}
            itemId={featuredArticle.system.id}
          />
        </PageSection>
      )}

      <PageSection color="bg-white">
        <div className="flex flex-col gap-8 pt-[104px] pb-[160px]">
          <div className="flex flex-col lg:flex-row gap-8">
            <Selector
              label="Article Type"
              options={[
                { label: "All", codename: "" },
                ...articleTypes.terms.map((t: ITaxonomyTerms) => ({
                  label: t.name,
                  codename: t.codename,
                })),
              ]}
              selectedOption={articleType}
              onChange={handleArticleTypeChange}
            />
            <Selector
              label="Topic"
              options={[
                { label: "All", codename: "" },
                ...articleTopics.terms.map((t: ITaxonomyTerms) => ({
                  label: t.name,
                  codename: t.codename,
                })),
              ]}
              selectedOption={articleTopic}
              onChange={handleArticleTopicChange}
            />
          </div>
          <ArticleList
            articles={articles.filter(a =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              isArticleTypeTaxonomyTermCodename(articleTypeCodename)
                ? a.elements.article_type.value[0]?.codename === articleTypeCodename
                : true
            )
              .filter(a =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                isGeneralHealthcareTopicsTaxonomyTermCodename(articleTopicCodename)
                  ? a.elements.topics.value.find(t => t.codename === articleTopicCodename)
                  : true
              )
              .map(article => ({
                image: {
                  url: article.elements.image.value[0]?.url ?? "",
                  alt: article.elements.image.value[0]?.description ?? article.elements.title.value,
                },
                title: article.elements.title.value,
                introduction: article.elements.introduction.value,
                publishDate: article.elements.publish_date.value ?? "",
                topics: article.elements.topics.value.map(term => term.name),
                urlSlug: article.elements.url_slug.value,
                itemId: article.system.id,
              }))}
          />
        </div>
      </PageSection>
    </div>
  );
};

export default ArticlesListingPage;
