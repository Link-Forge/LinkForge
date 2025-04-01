import { 
  HomeIcon, 
  Cog6ToothIcon, 
  LinkIcon, 
  PaintBrushIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'
import { DiscordIcon } from '@/components/ui/Icon/DiscordIcon'

export const sidebarLinks = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon
  },
  {
    name: 'Linkler',
    href: '/dashboard/links',
    icon: LinkIcon
  },
  {
    name: 'Profil',
    href: '/dashboard/profile',
    icon: UserCircleIcon
  },
  {
    name: 'Tasarım',
    href: '/dashboard/design',
    icon: PaintBrushIcon
  },
  {
    name: 'Discord',
    href: '/dashboard/discord',
    icon: DiscordIcon
  },
  {
    name: 'Ayarlar',
    href: '/dashboard/settings',
    icon: Cog6ToothIcon
  }
] 