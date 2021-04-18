"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientState = exports.ClientEventType = void 0;
var ClientEventType;
(function (ClientEventType) {
    ClientEventType[ClientEventType["STATE"] = 0] = "STATE";
})(ClientEventType = exports.ClientEventType || (exports.ClientEventType = {}));
var ClientState;
(function (ClientState) {
    ClientState[ClientState["PLAYING"] = 0] = "PLAYING";
    ClientState[ClientState["NOT_PLAYING"] = 1] = "NOT_PLAYING";
})(ClientState = exports.ClientState || (exports.ClientState = {}));
//# sourceMappingURL=client.js.map