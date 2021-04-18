"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _common_1 = require("@common");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
class MySpeechify {
    constructor() {
        this.dataQueue = [];
        this.nodes = [];
    }
    addToQueue(data) {
        if (data.type == _common_1.DataType.HTML) {
            this.dataQueue.push(this.fetchReadableContentFromHTML(data.data));
        }
        if (data.type == _common_1.DataType.TXT) {
            this.dataQueue.push(this.fetchReadableContentFromTxt(data.data));
        }
        if (data.type == _common_1.DataType.JSON) {
            this.dataQueue.push(this.fetchReadableContentFromJson(data.data));
        }
        console.log(this.dataQueue.length);
        return true;
    }
    getNextChunk() {
        return this.dataQueue.shift();
    }
    // Return a string[]instead.
    dummyFetchReadableContentFromHTML(htmldata) {
        const dom = new JSDOM(htmldata);
        var x = dom.window.document.querySelectorAll("p, span");
        var readableContent = [];
        for (var i = 0; i < x.length; i++) {
            readableContent.push(x[i].textContent);
        }
        return readableContent;
    }
    fetchReadableContentFromHTML(htmldata) {
        const dom = new JSDOM(htmldata);
        this.nodes = this.nodes.concat(Array.from(dom.window.document.children));
        var readableContent = [];
        while (this.nodes.length > 0) {
            var node = this.nodes.shift();
            if (node.children.length != 0) {
                this.nodes = this.nodes.concat(Array.from(node.children));
            }
            else {
                if (node.textContent) {
                    readableContent.push(node.textContent);
                }
            }
        }
        return readableContent;
    }
    fetchReadableContentFromTxt(txt) {
        var readableContent = [];
        readableContent.push(txt);
        return readableContent;
    }
    fetchReadableContentFromJson(json) {
        var readableContent = [];
        const obj = JSON.parse(json);
        for (var prop in obj) {
            readableContent.push("Key: " + prop);
            readableContent.push("Value: " + obj[prop]);
        }
        return readableContent;
    }
}
exports.default = MySpeechify;
//# sourceMappingURL=speechify.js.map