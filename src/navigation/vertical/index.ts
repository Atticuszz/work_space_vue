import dashboard from './dashboard'
import type { VerticalNavItems } from '@/@layouts/types'

export default [
  ...dashboard, {
    title: 'consumption',
    to: { name: 'consumption' },
    icon: { icon: 'tabler-brand-cashapp' },
  },
  {
    title: 'Second page',
    to: { name: 'second-page' },
    icon: { icon: 'tabler-file' },
  },
] as VerticalNavItems
