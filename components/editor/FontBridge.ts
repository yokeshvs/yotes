import { BridgeExtension } from '@10play/tentap-editor';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';

type FontEditorState = {
    activeFontFamily: string | undefined;
};

type FontEditorInstance = {
    setFontFamily: (fontFamily: string) => void;
    unsetFontFamily: () => void;
};

declare module '@10play/tentap-editor' {
    interface EditorBridge extends FontEditorInstance { }
}

// Define the messages that will be sent to the Web side
type SetFontMessage = {
    type: 'setFontFamily';
    payload: string;
};

type UnsetFontMessage = {
    type: 'unsetFontFamily';
    payload?: undefined;
}

type FontBridgeMessage = SetFontMessage | UnsetFontMessage;

export const FontBridge = new BridgeExtension<FontEditorState, FontEditorInstance, FontBridgeMessage>({
    tiptapExtension: FontFamily,
    tiptapExtensionDeps: [TextStyle],
    // @ts-ignore - TextStyle might complain about default export but it usually works in Babel/Metro. If not, we might need * as TextStyle
    onBridgeMessage: (editor, message) => {
        if (message.type === 'setFontFamily') {
            editor.chain().focus().setFontFamily(message.payload).run();
        }
        if (message.type === 'unsetFontFamily') {
            editor.chain().focus().unsetFontFamily().run();
        }
        return false;
    },
    extendEditorInstance: (sendBridgeMessage) => {
        return {
            setFontFamily: (fontFamily: string) => sendBridgeMessage({ type: 'setFontFamily', payload: fontFamily }),
            unsetFontFamily: () => sendBridgeMessage({ type: 'unsetFontFamily' }),
        };
    },
    extendEditorState: (editor) => {
        return {
            activeFontFamily: editor.getAttributes('textStyle').fontFamily,
        };
    },
});
