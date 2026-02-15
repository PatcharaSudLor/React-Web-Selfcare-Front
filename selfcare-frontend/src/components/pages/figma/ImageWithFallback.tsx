import React from 'react'

export function ImageWithFallback({ src, alt, className }: { src: string; alt?: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=No+image'
      }}
    />
  )
}

export default ImageWithFallback
