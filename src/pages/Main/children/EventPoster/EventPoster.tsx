import EventImage from '@/components/common/EventImage/EventImage'

import type { EventPosterProps } from '@/types/interfaces/pages/main'

const EventPoster = ({ event }: EventPosterProps) => (
  <div className="event-poster"><EventImage className="event-poster-image" src={event.posterUrl} title={event.title} /></div>
)

export default EventPoster
