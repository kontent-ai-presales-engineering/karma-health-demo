import React from "react";
import Link from "../Link";
import { PortableText } from "@portabletext/react";
import { PortableTextObject } from "@kontent-ai/rich-text-resolver";

type BlogListItemProps = Readonly<{
  imageSrc?: string;
  title: string;
  description: PortableTextObject[];
  readMoreLink: string;
  className?: string;
}>;

const BlogListItem: React.FC<BlogListItemProps> = ({
  imageSrc,
  title,
  description,
  readMoreLink,
  className,
}) => {
  return (
    <div className={`flex flex-col md:flex-row gap-16 w-full ${className}`}>
      <div className="">
        <img
          width={440}
          height={288}
          src={imageSrc}
          alt={title}
          className=" w-[440px] h-[288px] object-cover rounded-md"
        />
      </div>
      <div className="md:w-2/3 flex flex-col justify-center gap-5">
        <h2 className="text-heading-2 font-libre text-burgundy mb-4">
          {title}
        </h2>
        <div className="text-body-lg text-gray mb-4 max-w-3xl line-clamp-4">
          <PortableText value={description} />
        </div>
        <Link href={readMoreLink} text="Read more" />
      </div>
    </div>
  );
};

export default BlogListItem;
