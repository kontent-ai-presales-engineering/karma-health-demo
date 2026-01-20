import { FC } from "react";
import { PageType } from "../../model";
import { createElementSmartLink, createItemSmartLink } from "../../utils/smartlink";

type MicrositeNavigationProps = {
  subpages: PageType[];
  activePageId?: string;
  onNavigate: (pageId: string) => void;
  onHomeClick: () => void;
  isHomeActive?: boolean;
  parentItemId?: string;
};

const MicrositeNavigation: FC<MicrositeNavigationProps> = ({
  subpages,
  activePageId,
  onNavigate,
  onHomeClick,
  isHomeActive,
  parentItemId
}) => {
  if (!subpages || subpages.length === 0) {
    return null;
  }

  return (
    <nav
      className="bg-white border-b border-gray-200 sticky top-0 z-40"
      {...createItemSmartLink(parentItemId)}
      {...createElementSmartLink("subpages")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-1 overflow-x-auto py-4">
          {/* Home Button */}
          <button
            onClick={onHomeClick}
            className={`
              px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
              whitespace-nowrap
              ${isHomeActive
                ? 'bg-burgundy text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-burgundy'
              }
            `}
          >
            Home
          </button>
          {subpages.map((page) => {
            const isActive = page.system.id === activePageId;
            return (
              <button
                key={page.system.id}
                onClick={() => onNavigate(page.system.id)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full transition-all duration-200
                  whitespace-nowrap
                  ${isActive
                    ? 'bg-burgundy text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-burgundy'
                  }
                `}
                {...createItemSmartLink(page.system.id, page.system.name)}
                {...createElementSmartLink("headline")}
              >
                {page.elements.headline?.value || page.system.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MicrositeNavigation;
