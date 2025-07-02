import React from "react";
import { createElementSmartLink, createItemSmartLink } from "../../utils/smartlink";

type DisclaimerBaseProps = Readonly<{
  title: string;
  text: string;
  componentId: string;
  componentName: string;
  theme: "burgundy" | "base";
}>;

const DisclaimerBase: React.FC<DisclaimerBaseProps> = ({ title, text, componentId, componentName, theme }) => {
  return (
    <div className={`${theme === "burgundy" ? "burgundy-theme" : ""} bg-background-color pt-16 pb-20 rounded-lg py-16`}
      {...createItemSmartLink(componentId, componentName)}>
      <h1 className="text-6xl text-heading-2-color font-serif text-center mb-6"
        {...createElementSmartLink("headline")}>
        {title}
      </h1>
      <p className="text-center text-body-color text-lg max-w-4xl mx-auto"
        {...createElementSmartLink("subheadline")}
      >{text}</p>
    </div>
  );
};

export default DisclaimerBase;
