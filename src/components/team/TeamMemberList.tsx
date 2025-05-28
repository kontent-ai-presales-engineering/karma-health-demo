import { FC } from "react";
import { TeamListItem } from "./TeamListItem";

interface TeamMemberListProps {
  teamMembers: {
    image: {
      url: string;
      alt: string;
    };
    prefix: string;
    suffix: string;
    firstName: string;
    lastName: string;
    position: string;
    link: string;
    itemId: string;
  }[];
}

const TeamMemberList: FC<TeamMemberListProps> = ({ teamMembers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-[104px]">
      {teamMembers.map((member) => (
        <TeamListItem
          key={member.link}
          image={member.image}
          prefix={member.prefix}
          suffix={member.suffix}
          firstName={member.firstName}
          lastName={member.lastName}
          title={member.position}
          link={member.link}
          itemId={member.itemId}
        />
      ))}
    </div>
  );
};

export default TeamMemberList;
