import {
  MessageCircle,
  User,
  Users,
  Hash,
  Home,
  Coffee,
  Utensils,
  ShoppingBag,
  Clock,
  Sun,
  Plane,
  Compass,
  MapPin,
  Heart,
  Music,
  Briefcase,
  Mail,
  BookOpen,
  Smile,
  Sparkles,
} from "lucide-react";
const icons = {
  message: MessageCircle,
  user: User,
  users: Users,
  hash: Hash,
  home: Home,
  coffee: Coffee,
  utensils: Utensils,
  bag: ShoppingBag,
  clock: Clock,
  sun: Sun,
  plane: Plane,
  compass: Compass,
  map: MapPin,
  heart: Heart,
  music: Music,
  briefcase: Briefcase,
  mail: Mail,
  book: BookOpen,
  smile: Smile,
  sparkles: Sparkles,
};
export function TopicIcon({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  const Icon = icons[name as keyof typeof icons] || BookOpen;
  return <Icon size={size} strokeWidth={1.8} aria-hidden />;
}
