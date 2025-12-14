import { BridgeExtension } from '@10play/tentap-editor';
import { useMemo } from 'react';

export const useReadyBridge = (onReady: () => void) => {
    const bridge = useMemo(() => new BridgeExtension({
        onBridgeMessage: (payload) => {
            console.log("ReadyBridge: Message received", JSON.stringify(payload));
            if (payload && typeof payload === 'object' && 'type' in payload && payload.type === 'EDITOR_LOADED') {
                onReady();
                return true; // We handled it
            }
            return false;
        },
    }), [onReady]);

    return bridge;
};
