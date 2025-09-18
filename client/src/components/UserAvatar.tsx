import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: {
    name: string;
    avatar?: string;
    userId: string;
  };
  size?: number;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 45 }) => {
  // Hash function to generate a numeric value from a string
  const hashStringToNumber = (str: string) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return Math.abs(hash);
  };

  // Improved color generation with richer and darker hues
  const hue = (hashStringToNumber(user.userId) * 137) % 360; // Spread the hues more evenly
  const saturation = 80; // Higher saturation for richer colors
  const lightness = 40; // Slightly darker for better contrast
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  // Fallback initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar
      style={{
        width: size,
        height: size,
      }}
    >
      <AvatarImage
        src={user.avatar}
        alt={user.name}
        style={{
          objectFit: "cover",
        }}
      />
      <AvatarFallback
        style={{
          backgroundColor: color,
          color: "#fff",
          fontSize: `${size / 2.3}px`,
          lineHeight: `${size}px`,
        }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};
