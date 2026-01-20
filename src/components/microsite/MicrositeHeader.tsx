import { FC } from "react";
import { createElementSmartLink, createItemSmartLink } from "../../utils/smartlink";

type MicrositeHeaderProps = {
  title: string;
  logoUrl?: string;
  logoAlt?: string;
  itemId?: string;
};

const MicrositeHeader: FC<MicrositeHeaderProps> = ({
  title,
  logoUrl,
  logoAlt,
  itemId
}) => {
  return (
    <header className="bg-burgundy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={logoAlt || title}
              className="h-10 w-auto"
            />
          ) : (
            <h1
              className="text-xl font-bold font-libre tracking-wide"
              {...createItemSmartLink(itemId)}
              {...createElementSmartLink("headline")}
            >
              {title}
            </h1>
          )}
        </div>
      </div>
    </header>
  );
};

export default MicrositeHeader;
