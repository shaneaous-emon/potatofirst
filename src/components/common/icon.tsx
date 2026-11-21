import {
  ArrowRight, ArrowUpRight, Clock, HeartHandshake, Home, Leaf, Mail, MapPin, MessageCircle,
  Package, Phone, ShieldCheck, ShoppingBag, Truck, User, type LucideProps,
} from "lucide-react";

/** String → icon map so CMS/section content can reference icons by name. */
const ICONS = {
  leaf: Leaf,
  package: Package,
  bag: ShoppingBag,
  truck: Truck,
  phone: Phone,
  mail: Mail,
  "map-pin": MapPin,
  clock: Clock,
  heart: HeartHandshake,
  shield: ShieldCheck,
  user: User,
  home: Home,
  message: MessageCircle,
  "arrow-right": ArrowRight,
  "arrow-up-right": ArrowUpRight,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: IconName } & LucideProps) {
  const C = ICONS[name];
  return <C aria-hidden {...props} />;
}
