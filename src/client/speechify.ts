import { Data, DataType, StreamChunk } from "@common";
import React, { useEffect, useState } from "react";

import {
  SpeechifyClient,
  ClientState,
  SpeechifyClientEvent,
  ClientEventType,
} from "@common/client";

export default class SpeechifyClientImpl implements SpeechifyClient {
  constructor(host: string) {}

  private listener: any;
  private stateChecker: any;

  private clientState: ClientState = ClientState.NOT_PLAYING;
  private lastKnowState = ClientState.NOT_PLAYING;

  async postData(url = '', data = {}): Promise<any> {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  async addToQueue(data: Data): Promise<boolean> {
    await this.postData('/api/addToQueue', data)
    .then(data => {
      console.log(data); // JSON data parsed by `data.json()` call
    });
    return true;
  }

  async getData(url = '', data = {}): Promise<any> {
    return await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
    }).then(function(response) {
      return response.json();
    });
  }

  play(): void {
    speechSynthesis.resume();
    this.stateChecker = setInterval(this.getState.bind(this), 1000);
    try {
      this.getData('/api/getNextChunk', 'GET')
      .then(data => {
        for (var i = 0; i < data.chunk.length; i++) {
          console.log(data.chunk[i]);
          const utterance = new SpeechSynthesisUtterance(data.chunk[i]);
          speechSynthesis.speak(utterance);
          this.listener({
            type: ClientEventType.STATE,
            state: ClientState.PLAYING,
          });
          console.log(utterance);
        }
      });
    } catch (e) {
      this.clientState = ClientState.NOT_PLAYING;
    }
  }

  pause(): void {
    speechSynthesis.pause();
  }

  getState(): ClientState {
    if (speechSynthesis.speaking) {
      this.clientState = ClientState.PLAYING;
    } else {
      this.clientState = ClientState.NOT_PLAYING;
    }
    if (this.lastKnowState != this.clientState) {
      this.listener({
        type: ClientEventType.STATE,
        state: this.clientState,
      });
      if (this.stateChecker && this.clientState == ClientState.NOT_PLAYING) {
        clearInterval(this.stateChecker);
      }
    }
    this.lastKnowState = this.clientState;
    return this.clientState;
  }

  subscribe(listener: (event: SpeechifyClientEvent) => void): () => void {
    this.listener = listener;
    return () => {};
  }
}
