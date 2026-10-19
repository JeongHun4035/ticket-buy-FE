import {
  useState,
} from 'react'

import Button from '@/components/common/Button/Button'
import Popup from '@/components/common/Popup/Popup'

import type { PopupSampleId, PopupSample } from '@/types/interfaces/pages/examplePopup'
import '../../Examples.css'

const PopupPage: React.FC = () => {
  const [openPopup, setOpenPopup] =
    useState<PopupSampleId | null>(null)

  const popupSampleOptions: PopupSample[] = [
    {
      id: 'sm',
      title: 'Small',
      size: 'sm',
    },
    {
      id: 'md',
      title: 'Medium',
      size: 'md',
    },
    {
      id: 'lg',
      title: 'Large',
      size: 'lg',
    },
    {
      id: 'custom',
      title: 'Custom',
      style: {
        width: '900px',
        height: '500px',
      },
    },
  ]

  const selectedPopup = popupSampleOptions.find(popup => popup.id === openPopup)

  return (
    <div>
      <div>
        {popupSampleOptions.map(popup => (
          <Button
            key={popup.id}
            onClick={() => setOpenPopup(popup.id)}
          >
            {popup.title}
          </Button>
        ))}
      </div>

      <Popup
        isOpen={openPopup !== null}
        title={`${selectedPopup?.title ?? ''} Popup`}
        size={selectedPopup?.size ?? 'md'}
        {...(selectedPopup?.className !== undefined ? { className: selectedPopup.className } : {})}
        {...(selectedPopup?.style !== undefined ? { style: selectedPopup.style } : {})}
        onClose={() => setOpenPopup(null)}
        footer={(
          <div>
            <Button
              size='sm'
              onClick={() => setOpenPopup(null)}
            >
              Confirm
            </Button>
            <Button
              size='sm'
              onClick={() => setOpenPopup(null)}
            >
              Cancel
            </Button>

          </div>
        )}
      >
        <div>
          <h3>
            Popup Content
          </h3>

          <p>
            This is {selectedPopup?.title} popup content.
          </p>

          <input
            type="text"
            placeholder="Input sample"
          />
        </div>
      </Popup>
    </div>
  )
}

export default PopupPage
