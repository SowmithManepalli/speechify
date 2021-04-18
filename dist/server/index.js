"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const speechify_1 = __importDefault(require("./speechify"));
const assert_1 = require("assert");
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
const jsdom = require("jsdom");
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(cors_1.default());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
const port = Number(process.env.PORT) || 8050;
const speechify = new speechify_1.default();
app.post("/api/addToQueue", (req, res) => {
    const result = speechify.addToQueue(req.body);
    res.send({ success: result });
});
app.get("/api/getNextChunk", (req, res) => {
    const chunk = speechify.getNextChunk();
    assert_1.strict(chunk);
    res.send({ chunk });
});
// START THE SERVER
// =============================================================================
app.listen(port);
console.log(`App listening on ${port}`);
//# sourceMappingURL=index.js.map