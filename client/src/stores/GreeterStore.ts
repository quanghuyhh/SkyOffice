import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

interface GreeterState {
  greeterDialogOpen: boolean
  greeterId: null | string
  greeterUrl: null | string
  urls: Map<string, string>
}

const initialState: GreeterState = {
  greeterDialogOpen: false,
  greeterId: null,
  greeterUrl: null,
  urls: new Map(),
}

export const greeterSlice = createSlice({
  name: 'greeter',
  initialState,
  reducers: {
    openGreeterDialog: (state, action: PayloadAction<string>) => {
      state.greeterDialogOpen = true
      state.greeterId = action.payload
      const url = state.urls.get(action.payload)
      if (url) state.greeterUrl = url
      const game = phaserGame.scene.keys.game as Game
      game.disableKeys()
    },
    closeGreeterDialog: (state) => {
      const game = phaserGame.scene.keys.game as Game
      game.enableKeys()
      // game.network.disconnectFromWhiteboard(state.greeterId!)
      state.greeterDialogOpen = false
      state.greeterId = null
      state.greeterUrl = null
    },
    setGreeterUrls: (state, action: PayloadAction<{ greeterId: string; roomId: string }>) => {
      state.urls.set(
        action.payload.greeterId,
        `https://www.tldraw.com/r/sky-office-${action.payload.roomId}`
      )
    },
  },
})

export const { openGreeterDialog, closeGreeterDialog, setGreeterUrls } =
  greeterSlice.actions

export default greeterSlice.reducer
