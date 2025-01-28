import { memberService } from './members'
import { spaceService } from './spaces'
import { channelService } from './channels'

export const SpaceServices = {
  members: memberService,
  spaces: spaceService,
  channels: channelService,
}

export { memberService, spaceService, channelService }
