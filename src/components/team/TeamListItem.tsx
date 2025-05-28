import { FC } from "react";
import ButtonLink from "../ButtonLink";
import { createItemSmartLink } from "../../utils/smartlink";

type TeamListItemProps = {
  image: {
    url?: string;
    alt: string;
  };
  prefix: string;
  suffix?: string;
  firstName: string;
  lastName: string;
  title: string;
  link: string;
  itemId: string;
};

export const TeamListItem: FC<TeamListItemProps> = ({ image, prefix, suffix, firstName, lastName, title, link, itemId }) => {
  return (
    <div className="flex flex-col items-center text-center gap-6"
          {...createItemSmartLink(itemId)}>
      <div className="w-[300px] h-[300px] rounded-full overflow-hidden">
        <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
      </div>
      <h3 className="flex-none text-heading-3 text-burgundy">
        {prefix} {firstName} {lastName}
        {suffix && `, ${suffix}`}
      </h3>
      <p className="text-grey-600 text-body-lg mt-auto">{title}</p>
      <ButtonLink href={link} style="transparent" className="mt-auto">
        Show bio
      </ButtonLink>
    </div>
  );
};
