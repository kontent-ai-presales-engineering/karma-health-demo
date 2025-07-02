import React from "react";
import DisclaimerBase from "./DisclaimerBase";

type InformationalDisclaimerProps = Readonly<{
  title: string;
  text: string;
  componentId: string;
  componentName: string;
}>;

const InformationalDisclaimer: React.FC<InformationalDisclaimerProps> = ({ title, text, componentId, componentName }) => (
  <DisclaimerBase title={title} text={text} theme="base" componentId={componentId} componentName={componentName} />
);

export default InformationalDisclaimer;