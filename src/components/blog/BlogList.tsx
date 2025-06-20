import React from "react";
import BlogListItem from "./BlogListItem";
import Divider from "../Divider";
import PageSection from "../PageSection";
import { PortableTextObject } from "@kontent-ai/rich-text-resolver";

type Blog = Readonly<{
  imageSrc?: string;
  title: string;
  description: PortableTextObject[];
  readMoreLink: string;
}>;

type BlogListProps = Readonly<{
  blogs: Blog[];
}>;

const BlogList: React.FC<BlogListProps> = ({ blogs }) => {
  const blogItems = blogs.map((blog, index) => (
    <div key={index}>
      <PageSection key={index} color="bg-white">
        <div className="max-w-6xl mx-auto">
          <BlogListItem
            key={index}
            imageSrc={blog.imageSrc}
            title={blog.title}
            description={blog.description}
            readMoreLink={blog.readMoreLink}
            className="pt-[98px] pb-[150px]"
          />
        </div>
      </PageSection>
      <Divider key={`divider-${index}`} />
    </div>
  ));

  return (
    <div className="flex flex-col">
      {blogItems}
    </div>
  );
};

export default BlogList;
