import React, { useCallback } from 'react'
import { css, cx } from 'emotion'

import avatarA from '~/assets/avatars/a.svg'
import avatarB from '~/assets/avatars/b.svg'
import avatarC from '~/assets/avatars/c.svg'
import avatarD from '~/assets/avatars/d.svg'
import avatarE from '~/assets/avatars/e.svg'
import avatarF from '~/assets/avatars/f.svg'
import avatarG from '~/assets/avatars/g.svg'
import avatarH from '~/assets/avatars/h.svg'
import avatarI from '~/assets/avatars/i.svg'
import avatarJ from '~/assets/avatars/j.svg'

export const avatars = [
  {
    id: 'a',
    img: avatarA,
  },
  {
    id: 'b',
    img: avatarB,
  },
  {
    id: 'c',
    img: avatarC,
  },
  {
    id: 'd',
    img: avatarD,
  },
  {
    id: 'e',
    img: avatarE,
  },
  {
    id: 'f',
    img: avatarF,
  },
  {
    id: 'g',
    img: avatarG,
  },
  {
    id: 'h',
    img: avatarH,
  },
  {
    id: 'i',
    img: avatarI,
  },
  {
    id: 'j',
    img: avatarJ,
  },
]

const clsId = css`
  width: 100%;
  height: 100%;
  font-size: 0;
  background: #000d;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }

  &.-a {
    background-color: dimgray;
  }
  &.-b {
    background-color: darkcyan;
  }
  &.-c {
    background-color: mediumslateblue;
  }
  &.-d {
    background-color: dodgerblue;
  }
  &.-e {
    background-color: orangered;
  }
  &.-f {
    background-color: beige;
  }
  &.-g {
    background-color: palevioletred;
  }
  &.-h {
    background-color: gold;
  }
  &.-i {
    background-color: royalblue;
  }
  &.-j {
    background-color: mediumseagreen;
  }
`

const Avatar: React.FC<{ id: string }> = ({ id }) => {
  const avatar = avatars.find(a => a.id === id)

  if (!avatar) return null

  return (
    <div className={cx(clsId, `-${id}`)}>
      <img src={avatar.img} alt="" />
    </div>
  )
}

export default Avatar
