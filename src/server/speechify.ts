import { DataType, Data, StreamChunk } from "@common";
import { SpeechifyServer } from "@common/server";

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

export default class MySpeechify implements SpeechifyServer {
  private readonly dataQueue: StreamChunk[] = [];
  private nodes: any[] = [];

  constructor() {}

  addToQueue(data: Data): boolean {
    if (data.type == DataType.HTML) {
      this.dataQueue.push(this.fetchReadableContentFromHTML(data.data));
    }
    if (data.type == DataType.TXT) {
      this.dataQueue.push(this.fetchReadableContentFromTxt(data.data));
    }
    if (data.type == DataType.JSON) {

    }
    console.log(this.dataQueue.length);
    return true;
  }

  getNextChunk(): StreamChunk | undefined {
    return this.dataQueue.shift();
  }

  // Return a string[]instead.
  dummyFetchReadableContentFromHTML(htmldata: string): any {
    const dom = new JSDOM(htmldata);
    var x = dom.window.document.querySelectorAll("p, span");
    var readableContent = [];
    for (var i = 0; i < x.length; i++) {
      readableContent.push(x[i].textContent);
    }
    return readableContent;
  }

  fetchReadableContentFromHTML(htmldata: string): any {
    const dom = new JSDOM(htmldata);
    this.nodes = this.nodes.concat(Array.from(dom.window.document.children));
    var readableContent = [];
    while (this.nodes.length > 0) {
      var node = this.nodes.shift();
      if (node.children.length != 0) {
        this.nodes = this.nodes.concat(Array.from(node.children));
      } else {
        if (node.textContent) {
          readableContent.push(node.textContent);
        }
      }
    }
    return readableContent;
  }

  fetchReadableContentFromTxt(txt: string): any {
    var readableContent = [];
    readableContent.push(txt);
    return readableContent;
  }

  fetchReadableContentFromJson(htmldata: string): any {
    var readableContent = [];
    readableContent.push(htmldata);
    return readableContent;
  }
}
