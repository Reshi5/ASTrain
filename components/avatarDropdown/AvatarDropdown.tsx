import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LoginIcon from "@mui/icons-material/Login";
import styles from "./AvatarDropdown.module.scss";
import defaultAvatar from "../../images/defaultAvatar.png";
import Image from "next/image";

type TDropdownItem = {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
};

interface IDropdownItem {
  item: TDropdownItem;
}

const DropdownItem: React.FC<IDropdownItem> = ({ item }) => (
  <button className={styles.dropdownItemButton} onClick={item.onClick}>
    {item.icon}
    <p className={styles.button_text}>{item.title}</p>
  </button>
);

interface IDropdownContent {
  dropdownItems: TDropdownItem[];
}

const DropdownContent: React.FC<IDropdownContent> = ({ dropdownItems }) => {
  return (
    <div className={styles.dropdownContent}>
      {dropdownItems.map((item, i) => {
        return (
          <div className={styles.dropdownContent_item} key={i}>
            <DropdownItem item={item} />
          </div>
        );
      })}
    </div>
  );
};

const AvatarDropdown: React.FC = () => {
  const node = useRef<HTMLDivElement>(null);
  const auth = useContext(AuthContext);
  const { authState } = auth;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownItems = [
    {
      title: "Log Out",
      icon: <LoginIcon />,
      onClick: auth.logout,
    },
  ];

  const handleClick = (e: MouseEvent) => {
    if (!node.current!.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <div ref={node}>
      <button
        // ref={node} // TODO recheck the dropdown logic
        className={styles.avatarDropdown}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Image
          src={authState.userInfo?.avatar || defaultAvatar}
          className={styles.avatarDropdown_avatar}
          alt="Avatar"
          height={30}
          width={30}
        />
        <div className={styles.avatarDropdown_userName}>
          {authState.userInfo?.firstName}
        </div>
        <div className={styles.avatarDropdown_arrowCont}>
          <ArrowDropDownIcon />
        </div>
      </button>

      {dropdownOpen && (
        <div className={styles.avatarDropdown_dropContent}>
          <DropdownContent dropdownItems={dropdownItems} />
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;
