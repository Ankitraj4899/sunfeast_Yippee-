import * as preview2Sockets from "@bytecodealliance/preview2-shim/sockets";
import { readableFromPreview2Input, writeToPreview2Output } from "../streams.js";
let tcpProvider = preview2Sockets;
let udpProvider = preview2Sockets;
class SocketError extends Error {
    payload;
    constructor(payload) {
        super(payload.tag);
        this.name = "SocketError";
        this.payload = payload;
    }
}
export function socketErrorCode(error) {
    let tag = typeof error === "string" ? error : error?.tag;
    if (!tag && error instanceof Error) {
        tag = error.message;
    }
    if (tag === "would-block" || tag === "not-in-progress") {
        return { tag: "invalid-state" };
    }
    if (tag) {
        return { tag };
    }
    return { tag: "other", val: String(error) };
}
function socketError(error) {
    throw error instanceof SocketError ? error : new SocketError(socketErrorCode(error));
}
function socketCall(operation) {
    try {
        return operation();
    }
    catch (error) {
        socketError(error);
    }
}
export function _setTcpProvider(provider) {
    const previous = tcpProvider;
    tcpProvider = provider;
    return previous;
}
export function _setUdpProvider(provider) {
    const previous = udpProvider;
    udpProvider = provider;
    return previous;
}
export class TcpSocket {
    #socket;
    #input;
    #output;
    static create(addressFamily) {
        try {
            return TcpSocket._wrap(tcpProvider.tcpCreateSocket.createTcpSocket(addressFamily));
        }
        catch (error) {
            socketError(error);
        }
    }
    static _wrap(socket, input, output) {
        const wrapped = new TcpSocket();
        wrapped.#socket = socket;
        wrapped.#input = input;
        wrapped.#output = output;
        return wrapped;
    }
    bind(localAddress) {
        try {
            this.#socket.startBind({}, localAddress);
            this.#socket.finishBind();
        }
        catch (error) {
            socketError(error);
        }
    }
    async connect(remoteAddress) {
        try {
            this.#socket.startConnect({}, remoteAddress);
            const connected = this.#socket.finishConnect();
            if (Array.isArray(connected)) {
                [this.#input, this.#output] = connected;
            }
        }
        catch (error) {
            socketError(error);
        }
    }
    listen() {
        try {
            this.#socket.startListen();
            this.#socket.finishListen();
        }
        catch (error) {
            socketError(error);
        }
        return new ReadableStream({
            pull: async (controller) => {
                while (true) {
                    try {
                        const [socket, input, output] = this.#socket.accept();
                        controller.enqueue(TcpSocket._wrap(socket, input, output));
                        return;
                    }
                    catch (error) {
                        if (error === "would-block") {
                            await new Promise((resolve) => setTimeout(resolve, 0));
                            continue;
                        }
                        controller.error(new SocketError(socketErrorCode(error)));
                        return;
                    }
                }
            },
        });
    }
    async send(data) {
        if (!this.#output) {
            return { tag: "err", val: { tag: "invalid-state" } };
        }
        try {
            await writeToPreview2Output(data, this.#output);
            return { tag: "ok", val: undefined };
        }
        catch (error) {
            return { tag: "err", val: socketErrorCode(error) };
        }
    }
    receive() {
        if (!this.#input) {
            const error = { tag: "invalid-state" };
            const stream = new ReadableStream({
                start(controller) {
                    controller.error(new SocketError(error));
                },
            });
            return [stream, Promise.resolve({ tag: "err", val: error })];
        }
        return readableFromPreview2Input(this.#input, socketErrorCode);
    }
    getLocalAddress() {
        try {
            return this.#socket.localAddress();
        }
        catch (error) {
            socketError(error);
        }
    }
    getRemoteAddress() {
        try {
            return this.#socket.remoteAddress();
        }
        catch (error) {
            socketError(error);
        }
    }
    getIsListening() {
        return socketCall(() => this.#socket.isListening());
    }
    getAddressFamily() {
        return socketCall(() => this.#socket.addressFamily());
    }
    setListenBacklogSize(value) {
        socketCall(() => this.#socket.setListenBacklogSize(value));
    }
    getKeepAliveEnabled() {
        return socketCall(() => this.#socket.keepAliveEnabled());
    }
    setKeepAliveEnabled(value) {
        socketCall(() => this.#socket.setKeepAliveEnabled(value));
    }
    getKeepAliveIdleTime() {
        return socketCall(() => this.#socket.keepAliveIdleTime());
    }
    setKeepAliveIdleTime(value) {
        socketCall(() => this.#socket.setKeepAliveIdleTime(value));
    }
    getKeepAliveInterval() {
        return socketCall(() => this.#socket.keepAliveInterval());
    }
    setKeepAliveInterval(value) {
        socketCall(() => this.#socket.setKeepAliveInterval(value));
    }
    getKeepAliveCount() {
        return socketCall(() => this.#socket.keepAliveCount());
    }
    setKeepAliveCount(value) {
        socketCall(() => this.#socket.setKeepAliveCount(value));
    }
    getHopLimit() {
        return socketCall(() => this.#socket.hopLimit());
    }
    setHopLimit(value) {
        socketCall(() => this.#socket.setHopLimit(value));
    }
    getReceiveBufferSize() {
        return socketCall(() => this.#socket.receiveBufferSize());
    }
    setReceiveBufferSize(value) {
        socketCall(() => this.#socket.setReceiveBufferSize(value));
    }
    getSendBufferSize() {
        return socketCall(() => this.#socket.sendBufferSize());
    }
    setSendBufferSize(value) {
        socketCall(() => this.#socket.setSendBufferSize(value));
    }
}
export class UdpSocket {
    #socket;
    #incoming;
    #outgoing;
    static create(addressFamily) {
        try {
            const wrapped = new UdpSocket();
            wrapped.#socket = udpProvider.udpCreateSocket.createUdpSocket(addressFamily);
            return wrapped;
        }
        catch (error) {
            socketError(error);
        }
    }
    bind(localAddress) {
        try {
            this.#socket.startBind({}, localAddress);
            this.#socket.finishBind();
        }
        catch (error) {
            socketError(error);
        }
    }
    connect(remoteAddress) {
        try {
            [this.#incoming, this.#outgoing] = this.#socket.stream(remoteAddress);
        }
        catch (error) {
            socketError(error);
        }
    }
    disconnect() {
        try {
            [this.#incoming, this.#outgoing] = this.#socket.stream(undefined);
        }
        catch (error) {
            socketError(error);
        }
    }
    async send(data, remoteAddress) {
        try {
            if (!this.#outgoing) {
                [this.#incoming, this.#outgoing] = this.#socket.stream(remoteAddress);
            }
            this.#outgoing.checkSend();
            this.#outgoing.send([{ data, remoteAddress }]);
        }
        catch (error) {
            socketError(error);
        }
    }
    async receive() {
        if (!this.#incoming) {
            try {
                [this.#incoming, this.#outgoing] = this.#socket.stream(undefined);
            }
            catch (error) {
                socketError(error);
            }
        }
        while (true) {
            try {
                const [datagram] = this.#incoming.receive(1n);
                if (datagram) {
                    return [datagram.data, datagram.remoteAddress];
                }
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
            catch (error) {
                socketError(error);
            }
        }
    }
    getLocalAddress() {
        try {
            return this.#socket.localAddress();
        }
        catch (error) {
            socketError(error);
        }
    }
    getRemoteAddress() {
        try {
            return this.#socket.remoteAddress();
        }
        catch (error) {
            socketError(error);
        }
    }
    getAddressFamily() {
        return socketCall(() => this.#socket.addressFamily());
    }
    getUnicastHopLimit() {
        return socketCall(() => this.#socket.unicastHopLimit());
    }
    setUnicastHopLimit(value) {
        socketCall(() => this.#socket.setUnicastHopLimit(value));
    }
    getReceiveBufferSize() {
        return socketCall(() => this.#socket.receiveBufferSize());
    }
    setReceiveBufferSize(value) {
        socketCall(() => this.#socket.setReceiveBufferSize(value));
    }
    getSendBufferSize() {
        return socketCall(() => this.#socket.sendBufferSize());
    }
    setSendBufferSize(value) {
        socketCall(() => this.#socket.setSendBufferSize(value));
    }
}
export default {
    TcpSocket,
    UdpSocket,
};
