import React, { useCallback, useState, useEffect } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import BlogList from "../components/blog/BlogList";
import { Page, BlogPost } from "../model/content-types";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { LanguageCodenames } from "../model";
import { IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

const useBlogPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [page, setPage] = useState<Page | null>(null);

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
          setPage(updatedItem as Page);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<Page>("blog")
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

const useBlogPosts = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey } = useAppContext();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    // Update the specific blog post in the list
    setBlogPosts(prevPosts => {
      return prevPosts.map(post => {
        if (post.system.codename === data.item.codename) {
          // Apply the update and handle the Promise
          applyUpdateOnItemAndLoadLinkedItems(
            post,
            data,
            (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
              .items()
              .inFilter("system.codename", [...codenamesToFetch])
              .toPromise()
              .then(res => res.data.items)
          ).then((updatedItem) => {
            if (updatedItem) {
              setBlogPosts(prev => prev.map(p => 
                p.system.codename === data.item.codename ? updatedItem as BlogPost : p
              ));
            }
          });
          return post; // Return the current post while waiting for the update
        }
        return post;
      });
    });
  }, [environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .items<BlogPost>()
      .type("blog_post")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setBlogPosts(res.data.items);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setBlogPosts([]);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return blogPosts;
};

const BlogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const blogPage = useBlogPage(isPreview, lang);
  const blogPosts = useBlogPosts(isPreview, lang);

  if (!blogPage || !blogPosts) {
    return <div className="flex-grow" />;
  }

  return (
    <div className="flex flex-col gap-12">
      <PageSection color="bg-creme">
        <div className="flex flex-col-reverse gap-16 lg:gap-0 lg:flex-row items-center py-16 lg:py-0 lg:pt-[104px] lg:pb-[160px]">
          <div className="flex flex-col flex-1 gap-6">
            <h1 className="text-heading-1 text-heading-1-color"
            {...createItemSmartLink(blogPage.system.id)}
            {...createElementSmartLink("headline")}
            >
              {blogPage.elements.headline.value}
            </h1>
            <p className="text-body-lg text-body-color"
            {...createItemSmartLink(blogPage.system.id)}
            {...createElementSmartLink("subheadline")}
            >
              {blogPage.elements.subheadline.value}
            </p>
          </div>
          <div className="flex flex-col flex-1">
            <img
              width={670}
              height={440}
              src={blogPage.elements.hero_image?.value[0]?.url}
              alt={blogPage.elements.hero_image?.value[0]?.description ?? ""}
              className="rounded-lg"
            />
          </div>
        </div>
      </PageSection>

      {!isEmptyRichText(blogPage.elements.body.value) && (
        <PageSection color="bg-white">
          <div className="flex flex-col pt-10 mx-auto gap-6"
          {...createItemSmartLink(blogPage.system.id)}
          {...createElementSmartLink("body")}
          >
            <PortableText
              value={transformToPortableText(blogPage.elements.body.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </PageSection>
      )}
      
      <PageSection color="bg-white">
        <div className="pb-[160px] pt-[104px]">
          <BlogList
            blogs={blogPosts.map(post => ({
              imageSrc: post.elements.image.value[0]?.url,
              title: post.elements.title.value,
              description: transformToPortableText(post.elements.body.value),
              readMoreLink: post.elements.url_slug.value,
            }))}
          />
        </div>
      </PageSection>
    </div>
  );
};

export default BlogPage;
