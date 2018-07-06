"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const http = require("http");
const server_1 = require("./server");
debug("ts-express:server");
const port = normalizePort(process.env.PORT || 3000);
server_1.default.set("port", port);
console.log(`Server listening on port ${port}`);
/**
 * Create HTTP server.
 */
exports.server = http.createServer(server_1.default);
// Socket.io for real time communication
exports.io = require("socket.io").listen(exports.server);
exports.server.listen(port);
exports.server.on("error", onError);
exports.server.on("listening", onListening);
function normalizePort(val) {
    const port = typeof val === "string" ? parseInt(val, 10) : val;
    if (isNaN(port)) {
        return val;
    }
    else if (port >= 0) {
        return port;
    }
    else {
        return false;
    }
}
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
    switch (error.code) {
        case "EACCES":
            // tslint:disable-next-line:no-console
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            // tslint:disable-next-line:no-console
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening() {
    const addr = exports.server.address();
    const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
}
/**
 * Socket events
 */
exports.io.sockets.on("connection", function (socket) {
    console.log("Socket connected");
    // // Socket event for POST
    // socket.on("POST", function(tableName) {
    //   io.emit("GET", tableName);
    // });
    // // Socket event for DELETE
    // socket.on("DELETE", function(tableName) {
    //   io.emit("GET", tableName);
    // });
    // // Socket event for PUT
    // socket.on("PUT", function(tableName) {
    //   io.emit("GET", tableName);
    // });
});
//# sourceMappingURL=index.js.map