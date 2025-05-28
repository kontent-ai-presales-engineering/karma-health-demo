import React from "react";
import { createComponentSmartLink, createElementSmartLink, createItemSmartLink } from "../../utils/smartlink";

type DisclaimerBaseProps = Readonly<{
  title: string;
  text: string;
  parentId: string;
  componentId: string | null;
  theme: "burgundy" | "base";
}>;

const DisclaimerBase: React.FC<DisclaimerBaseProps> = ({ title, text, parentId, componentId, theme }) => {
  return (
    <div className={`${theme === "burgundy" ? "burgundy-theme" : ""} bg-background-color pt-16 pb-20 rounded-lg py-16`}>
      <h1 className="text-6xl text-heading-2-color font-serif text-center mb-6"
      {...createItemSmartLink(parentId)}
      {...createElementSmartLink("headline")}
      {...(componentId && createComponentSmartLink(componentId))}>
        {title}
      </h1>
      <p className="text-center text-body-color text-lg max-w-4xl mx-auto"
      {...createItemSmartLink(parentId)}
      {...createElementSmartLink("subheadline")}
      {...(componentId && createComponentSmartLink(componentId))}
      >{text}</p>
    </div>
  );
};

export default DisclaimerBase;
