import { useState } from 'react'

import type { EventImageProps } from '@/types/interfaces/components/eventImage'

import './EventImage.css'

const fallback = '/images/poster-fallback.svg'
const PosterImage = ({ src, title, className = '' }: EventImageProps) => {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return <img className={className + ' common-event-image'} src={!src || failed ? fallback : src} alt={title} decoding="async" loading="lazy" data-loaded={loaded} onLoad={() => setLoaded(true)} onError={() => {
    if (!failed) {
      setFailed(true); setLoaded(false)
    }
  }} />
}
const EventImage = (props: EventImageProps) => <PosterImage key={props.src ?? ''} {...props} />
export default EventImage
