import {
  Accessibility,
  CarFront,
  Flame,
  GraduationCap,
  Home,
  ShieldAlert,
  Users,
} from 'lucide-react'
import type { CategoryConfig } from '../../models/campus'

export const hammondCategories: CategoryConfig[] = [
  {
    id: 'ada',
    label: 'ADA Accessibility',
    description: 'Accessible parking, entrances, and mobility support points',
    defaultEnabled: true,
    colorToken: 'var(--color-focus)',
    icon: Accessibility,
  },
  {
    id: 'parking',
    label: 'Parking',
    description: 'Open, permit, and visitor parking areas',
    defaultEnabled: true,
    colorToken: 'var(--color-accent-navy)',
    icon: CarFront,
  },
  {
    id: 'residence',
    label: 'Residence',
    description: 'Student residential and housing zones',
    defaultEnabled: true,
    colorToken: 'var(--color-warning)',
    icon: Home,
  },
  {
    id: 'emergency',
    label: 'Emergency & Safety',
    description: 'Campus police and emergency call points',
    defaultEnabled: true,
    colorToken: 'var(--color-danger)',
    icon: ShieldAlert,
  },
  {
    id: 'community',
    label: 'Community Resources',
    description: 'Shared services and support facilities',
    defaultEnabled: true,
    colorToken: 'var(--color-success)',
    icon: Users,
  },
  {
    id: 'campusLife',
    label: 'Campus Life',
    description: 'Student life, recreation, and social spaces',
    defaultEnabled: true,
    colorToken: 'var(--color-accent-gold)',
    icon: GraduationCap,
  },
  {
    id: 'research',
    label: 'Research & Centers',
    description: 'Academic and research facilities',
    defaultEnabled: true,
    colorToken: 'var(--color-accent-navy)',
    icon: Flame,
  },
]
