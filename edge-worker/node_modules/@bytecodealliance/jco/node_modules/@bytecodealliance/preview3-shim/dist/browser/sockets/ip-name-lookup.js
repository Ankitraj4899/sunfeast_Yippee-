import { ipNameLookup } from "@bytecodealliance/preview2-shim/sockets";
class NameLookupError extends Error {
    payload;
    constructor(payload) {
        super(payload.tag);
        this.payload = payload;
    }
}
async function resolveAddresses(name) {
    try {
        const stream = ipNameLookup.resolveAddresses({}, name);
        const addresses = [];
        while (true) {
            const address = stream.resolveNextAddress();
            if (!address) {
                break;
            }
            addresses.push(address);
        }
        if (addresses.length === 0) {
            throw new NameLookupError({ tag: "name-unresolvable" });
        }
        return addresses;
    }
    catch (error) {
        if (error instanceof NameLookupError) {
            throw error;
        }
        const tag = typeof error === "string" ? error : error?.tag;
        if (tag === "not-supported") {
            throw new NameLookupError({ tag: "other", val: "not-supported" });
        }
        throw new NameLookupError({ tag: "other", val: String(error) });
    }
}
export default {
    resolveAddresses,
};
