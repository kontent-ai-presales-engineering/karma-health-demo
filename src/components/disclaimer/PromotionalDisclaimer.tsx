import React from "react";
import DisclaimerBase from "./DisclaimerBase";

type PromotionalDisclaimerProps = Readonly<{
  title: string;
  text: string;
  componentId: string;
  componentName: string;
}>;

const PromotionalDisclaimer: React.FC<PromotionalDisclaimerProps> = ({ title, text, componentId, componentName }) => (
  <DisclaimerBase title={title} text={text} componentId={componentId} componentName={componentName} theme="burgundy" />
);

export default PromotionalDisclaimer;
