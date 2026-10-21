import * as preview2Sockets from "@bytecodealliance/preview2-shim/sockets";
import type { Duration, ErrorCode, IpAddressFamily, IpSocketAddress, Result, TcpSocket as TcpSocketT, UdpSocket as UdpSocketT } from "../../../types/interfaces/wasi-sockets-types.d.ts";
type TcpProvider = {
    tcp: typeof preview2Sockets.tcp;
    tcpCreateSocket: typeof preview2Sockets.tcpCreateSocket;
};
type UdpProvider = {
    udp: typeof preview2Sockets.udp;
    udpCreateSocket: typeof preview2Sockets.udpCreateSocket;
};
export declare function socketErrorCode(error: unknown): ErrorCode;
export declare function _setTcpProvider(provider: TcpProvider): TcpProvider;
export declare function _setUdpProvider(provider: UdpProvider): UdpProvider;
export declare class TcpSocket implements TcpSocketT {
    #private;
    static create(addressFamily: IpAddressFamily): TcpSocket;
    static _wrap(socket: unknown, input?: unknown, output?: unknown): TcpSocket;
    bind(localAddress: IpSocketAddress): void;
    connect(remoteAddress: IpSocketAddress): Promise<void>;
    listen(): ReadableStream<TcpSocketT>;
    send(data: ReadableStream<number>): Promise<Result<void, ErrorCode>>;
    receive(): [ReadableStream<number>, Promise<Result<void, ErrorCode>>];
    getLocalAddress(): IpSocketAddress;
    getRemoteAddress(): IpSocketAddress;
    getIsListening(): boolean;
    getAddressFamily(): IpAddressFamily;
    setListenBacklogSize(value: bigint): void;
    getKeepAliveEnabled(): boolean;
    setKeepAliveEnabled(value: boolean): void;
    getKeepAliveIdleTime(): Duration;
    setKeepAliveIdleTime(value: Duration): void;
    getKeepAliveInterval(): Duration;
    setKeepAliveInterval(value: Duration): void;
    getKeepAliveCount(): number;
    setKeepAliveCount(value: number): void;
    getHopLimit(): number;
    setHopLimit(value: number): void;
    getReceiveBufferSize(): bigint;
    setReceiveBufferSize(value: bigint): void;
    getSendBufferSize(): bigint;
    setSendBufferSize(value: bigint): void;
}
export declare class UdpSocket implements UdpSocketT {
    #private;
    static create(addressFamily: IpAddressFamily): UdpSocket;
    bind(localAddress: IpSocketAddress): void;
    connect(remoteAddress: IpSocketAddress): void;
    disconnect(): void;
    send(data: Uint8Array, remoteAddress: IpSocketAddress | undefined): Promise<void>;
    receive(): Promise<[Uint8Array, IpSocketAddress]>;
    getLocalAddress(): IpSocketAddress;
    getRemoteAddress(): IpSocketAddress;
    getAddressFamily(): IpAddressFamily;
    getUnicastHopLimit(): number;
    setUnicastHopLimit(value: number): void;
    getReceiveBufferSize(): bigint;
    setReceiveBufferSize(value: bigint): void;
    getSendBufferSize(): bigint;
    setSendBufferSize(value: bigint): void;
}
declare const _default: {
    TcpSocket: typeof TcpSocket;
    UdpSocket: typeof UdpSocket;
};
export default _default;
export type * from "../../../types/interfaces/wasi-sockets-types.d.ts";
