import React, { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { createClient } from "../utils/client";
import { useAppContext } from "../context/AppContext";
import { BlogPostType, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import {
  createElementSmartLink,
  createItemSmartLink,
} from "../utils/smartlink";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const BlogDetail: React.FC = () => {
  const { environmentId, apiKey } = useAppContext();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const queryClient = useQueryClient();

  const blogPostQuery = useQuery({
    queryKey: [`blog-post_${slug}`, isPreview, lang],
    queryFn: () =>
      createClient(environmentId, apiKey, isPreview)
        .items<BlogPostType>()
        .type("blog_post")
        .equalsFilter("elements.url_slug", slug ?? "")
        .languageParameter((lang ?? "default") as LanguageCodenames)
        .toPromise()
        .then((res) => res.data.items[0])
        .catch((err) => {
          if (err instanceof DeliveryError) {
            return null;
          }
          throw err;
        }),
  });

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (blogPostQuery.data) {
      applyUpdateOnItemAndLoadLinkedItems(
        blogPostQuery.data,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items as BlogPostType[])
      ).then((updatedItem) => {
        if (updatedItem) {
          queryClient.setQueryData([`blog-post_${slug}`, isPreview, lang], updatedItem);
        }
      });
    }
  }, [blogPostQuery.data, environmentId, apiKey, isPreview, slug, lang, queryClient]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        blogPostQuery.refetch();
      }
    },
    [blogPostQuery],
  );

  useCustomRefresh(onRefresh);

  const blogPost = blogPostQuery.data;

  if (!blogPost) {
    return <div className="flex-grow" />;
  }

  const createTag = (tag: string) => (
    <div className="w-fit text-small border tracking-wider font-[700] text-grey border-azure px-4 py-2 rounded-lg uppercase">
      {tag}
    </div>
  );

  return (
    <div className="container flex flex-col gap-12 px-3">
      <div className="flex flex-row items-center pt-[104px] pb-[160px]">
        <div className="flex flex-col flex-1 gap-6 ">
          {createTag("Blog Post")}
          <h1 className="text-heading-1 text-heading-1-color mb-6 max-w-[12ch]"
          {...createItemSmartLink(blogPost.system.id)}
          {...createElementSmartLink("title")}
          >
            {blogPost.elements.title?.value}
          </h1>
        </div>
        <div className="flex flex-col flex-1">
          <img
            width={670}
            height={440}
            src={blogPost.elements.image?.value[0]?.url}
            alt={blogPost.elements.image?.value[0]?.description ?? ""}
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="rich-text-body max-w-3xl mx-auto flex flex-col gap-5"
      {...createItemSmartLink(blogPost.system.id)}
      {...createElementSmartLink("body")}>
        <PortableText
          value={transformToPortableText(blogPost.elements.body?.value)}
          components={defaultPortableRichTextResolvers}
        />
      </div>
    </div>
  );
};

export default BlogDetail;
