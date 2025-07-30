import { cn } from "@/lib/utils"

interface AvatarProps {
  username: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

function getInitials(username: string): string {
  if (!username) return "?"

  const cleaned = username.trim()

  if (cleaned.includes(" ")) {
    return cleaned
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  return cleaned.charAt(0).toUpperCase()
}

function getBackgroundColor(username: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-cyan-500"
  ]

  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ username, size = "md", className }: AvatarProps) {
  const initials = getInitials(username)
  const bgColor = getBackgroundColor(username)

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl"
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl text-white font-semibold",
        bgColor,
        sizeClasses[size],
        className
      )}
      title={username}
    >
      {initials}
    </div>
  )
}

interface CustomAvatarProps {
  username: string
  size?: number // Custom size in pixels
  backgroundColor?: string
  textColor?: string
  className?: string
  onClick?: () => void
}

export function CustomAvatar({
  username,
  size = 40,
  backgroundColor,
  textColor = "white",
  className,
  onClick
}: CustomAvatarProps) {
  const initials = getInitials(username)
  const defaultBgColor = getBackgroundColor(username)

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold cursor-default",
        backgroundColor || defaultBgColor,
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(size * 0.4, 12), // Responsive font size
        color: textColor
      }}
      title={username}
      onClick={onClick}
    >
      {initials}
    </div>
  )
}

export function useAvatar(username: string) {
  const initials = getInitials(username)
  const backgroundColor = getBackgroundColor(username)

  return {
    initials,
    backgroundColor,
    getInitials: () => getInitials(username),
    getBackgroundColor: () => getBackgroundColor(username)
  }
}