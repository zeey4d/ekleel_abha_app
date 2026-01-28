import React from 'react'

export function getImageUrl(path: string | null | undefined) {
  if (!path) return 'https://via.placeholder.com/300';
  if (path.startsWith('http')) return path; 

  const base = (process.env.EXPO_PUBLIC_BASE_IMAGE_URL || 'https://ekleelhaba.duckdns.org/image/').replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${base}/${cleanPath}`;
}
