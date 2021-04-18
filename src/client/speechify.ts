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

  // Checks the state of speechSynthesis and propogate it to play button.
  private stateChecker: any;
  // propogates the state to play button.
  private listener: any;

  private clientState: ClientState = ClientState.NOT_PLAYING;
  private lastKnowState = ClientState.NOT_PLAYING;

  // Helper function to make a HTTP post request, takes a url and data to be sent.
  async postData(url = '', data = {}): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    });
    return response.json();
  }

  // Helper function to make a HTTP get request, takes a url.
  async getData(url = ''): Promise<any> {
    return await fetch(url, {
      method: 'GET',
    }).then(function(response) {
      return response.json();
    });
  }

  // Sends data to the server to be added to the queue.
  async addToQueue(data: Data): Promise<boolean> {
    return this.postData('/api/addToQueue', data)
    .then(data => {
      return true;
    });
  }

  play(): void {
    // Resume an existing paused utterance.
    speechSynthesis.resume();
    if (this.stateChecker == undefined) {
      this.stateChecker = setInterval(this.getState.bind(this), 1000);
    }
    this.clientState = ClientState.PLAYING;
    try {
      // if there is no pending utterance, fetch new data from the queue.
      if (!speechSynthesis.speaking) {
        this.getData('/api/getNextChunk')
        .then(data => {
          for (var i = 0; i < data.chunk.length; i++) {
            const utterance = new SpeechSynthesisUtterance(data.chunk[i]);
            speechSynthesis.speak(utterance);
          }
        });
      } else {
        this.sendStateChangeEvent(ClientState.PLAYING);
      }
    } catch (e) {
      this.clientState = ClientState.NOT_PLAYING;
    }
  }

  pause(): void {
    speechSynthesis.pause();
    this.clientState = ClientState.NOT_PLAYING;
    this.sendStateChangeEvent(this.clientState);
  }

  getState(): ClientState {
    if (speechSynthesis.speaking) {
      this.clientState = ClientState.PLAYING;
    } else {
      this.clientState = ClientState.NOT_PLAYING;
    }
    if (this.lastKnowState != this.clientState) {
      this.sendStateChangeEvent(this.clientState);
      if (this.clientState == ClientState.NOT_PLAYING) {
        clearInterval(this.stateChecker);
      }
    }
    this.lastKnowState = this.clientState;
    return this.clientState;
  }

  sendStateChangeEvent(clientState: ClientState): void {
    this.listener({
      type: ClientEventType.STATE,
      state: clientState,
    });
  }

  subscribe(listener: (event: SpeechifyClientEvent) => void): () => void {
    this.listener = listener;
    return () => {};
  }
}
