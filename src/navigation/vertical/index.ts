import dashboard from './dashboard'
import type { VerticalNavItems } from '@/@layouts/types'

export default [
  ...dashboard, {
    title: 'Home',
    to: { name: 'index' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Second page',
    to: { name: 'second-page' },
    icon: { icon: 'tabler-file' },
  },
] as VerticalNavItems
