import { AudioState } from './types'

const mutations = {
  mute(state: AudioState) {
    // We clone a new object here since vuex
    // will not react to deep values
    state.muted = !state.muted
  },
  deafen(state: AudioState) {
    const isDeafened = state.deafened
    state.previousVolume = isDeafened ? state.previousVolume : state.volume
    state.volume = isDeafened ? state.previousVolume : 0
    state.deafened = !isDeafened
  },
  setVolume(state: AudioState, volume: Number) {
    state.previousVolume = volume
    state.volume = volume
  },
  setInputVolume(state: AudioState, inputVolume: Number) {
    state.inputVolume = inputVolume
  },
}

export default mutations
