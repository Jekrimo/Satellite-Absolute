import { WebRTCUser } from '~/types/webrtc/User'

import { Config } from '~/config'

import Emitter from '~/libraries/WebRTC/Emitter'
import { WebRTCEvents } from '~/libraries/WebRTC/types'

export default class WebRTC extends Emitter {
  // Identifier to connect to signaling server with
  id: string | undefined
  // If this is undefined, the WebRTC services cannot run
  initalized: boolean | undefined
  // List of peers we're actively or have been connected to
  peers: Map<string, WebRTCUser> | undefined

  // --- Internal ---
  //
  // List of functions to execute after init
  protected _fnQueue: Array<Function>
  protected _announceURLs: Array<string> = Config.webtorrent.announceURLs

  constructor() {
    super()
    this._fnQueue = []
    this.peers = new Map()
  }

  /**
   * @method init
   * @description Bind required startup data to the WebRTC class
   * @param id identifier to connect to the signaling server with
   * @example
   */
  init(id: string) {
    this.id = id

    this.initalized = true
    this._runQueue()
    this.emit(WebRTCEvents.INIT, '')
  }

  /**
   * @computed peerCount
   * @description Get the total count of connected peers
   * @returns
   * @example
   */
  get peerCount(): number {
    return this.peers ? this.peers.size : 0
  }

  // --- Private Methods ---
  //
  // Methods reserved for internal use

  /**
   * @method _queue
   * @description Queue functions that are exectued before init for execution later
   * @param fn
   */
  protected _queue(fn: Function) {
    this._fnQueue.push(fn)
  }

  /**
   * @method _runQueue
   * @description Execute all queued functions
   */
  protected _runQueue() {
    this._fnQueue.forEach((fn) => fn())
  }

  /**
   * @method setAnnounceURLs
   * @description Allow to specify different WebTorrent announce URLs for the signaling
   * @param announceURLs list of announce urls
   * @example
   */
  setAnnounceURLs(announceURLs: Array<string>) {
    this._announceURLs = announceURLs
  }

  /**
   * @method _connect
   * @description Internal abstraction of connect to allow for connection queueing
   * @param peerId identifier of peer we're connecting to
   * @returns
   * @example
   */
  protected _connect(peerId: string): void {
    console.log('connecting to', peerId)
    return undefined
  }

  // --- Public Methods ---
  //
  // Methods who are exposed for interaction

  /**
   * @method exists
   * @description Check if we are connected to a given peer by ID
   * @param peerId identifier of peer we're seeking
   * @returns
   * @example
   */
  exists(peerId: string): boolean {
    if (!this.peers) return false
    return this.peers.has(peerId)
  }

  /**
   * @method getPeer
   * @description Get a WebRTCUser from the list of connected peers
   * @param peerId identifier of peer we're seeking
   * @returns
   * @example
   */
  getPeer(peerId: string): WebRTCUser | undefined {
    return this.peers?.get(peerId)
  }

  /**
   * @method connect
   * @description Connect to a new peer
   * @param peerId identifier of peer we're connecting to
   * @example
   */
  connect(peerId: string) {
    if (!this.initalized) {
      this._queue(() => this._connect(peerId))
    } else {
      this._connect(peerId)
    }
  }
}
