"use client"

import { Editor } from "@/components/blocks/editor-x/editor"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { $getRoot } from "lexical"
import { editorTheme } from "@/components/editor/themes/editor-theme"
import { nodes } from "@/components/blocks/editor-x/nodes"
import { useEffect, useState } from "react"
import { InitialConfigType } from "@lexical/react/LexicalComposer"

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

// Helper component to handle HTML <-> Lexical conversion
function HtmlConverter({
    htmlContent,
    onChange
}: {
    htmlContent: string
    onChange: (html: string) => void
}) {
    const [editor] = useLexicalComposerContext()
    const [isFirstRender, setIsFirstRender] = useState(true)

    // Load initial HTML content
    useEffect(() => {
        if (isFirstRender && htmlContent) {
            editor.update(() => {
                const parser = new DOMParser()
                const dom = parser.parseFromString(htmlContent, "text/html")
                const nodes = $generateNodesFromDOM(editor, dom)

                // Clear existing content and insert new nodes
                const root = $getRoot()
                root.clear()
                root.append(...nodes)
            })
            setIsFirstRender(false)
        }
    }, [editor, htmlContent, isFirstRender])

    // Subscribe to updates and convert to HTML
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const htmlString = $generateHtmlFromNodes(editor)
                onChange(htmlString)
            })
        })
    }, [editor, onChange])

    return null
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    // We need to pass the custom nodes and theme to the wrapper to support HTML generation
    // However, the internal Editor component uses its own LexicalComposer. 
    // We strictly need to modify the Editor component to accept plugins OR 
    // we use a modified approach where we inject our logic.

    // Since the Editor component in blocks/editor-x/editor.tsx fully wraps LexicalComposer,
    // we cannot simply nest another composer or plugin outside easily without context.
    // BUT checking the Editor component, it accepts `onChange`.

    // The Editor component returns `editorState` (Lexical state) in its onChange. 
    // It does NOT return HTML.

    // To solve this cleanly, we'll modify the Editor component to accept children (plugins) 
    // OR just copy its config here.

    // Let's reuse the Editor component but we need to inject the HTML conversion logic *inside* it.
    // The Editor component in `editor.tsx` does NOT export a way to inject plugins.

    // PLAN B: modify `components/blocks/editor-x/editor.tsx` to accept Children.
    // For now, let's assume we can't easily modify that file without breaking its structure, 
    // so let's try to RE-IMPLEMENT the composer here using the same plugins.

    // Actually, looking at `editor.tsx`, it exports `editorConfig`. 
    // No, it defines it locally.

    // To avoid duplicating all the plugins setup which is complex in `plugins.tsx`, 
    // we should modify `components/blocks/editor-x/editor.tsx` to accept `children`.

    // Let's update `rich-text-editor.tsx` to wrapper that uses a modified Editor.
    // But first, let's modify `editor.tsx` to be more flexible. 

    // Wait, I can't modify `editor.tsx` in this step. I am supposed to replace `rich-text-editor.tsx`.
    // I will write a temporary wrapper that completely REPLACES the logic of `Editor` 
    // but imports `Plugins` and `nodes`.

    const initialConfig: InitialConfigType = {
        namespace: "RichTextEditor",
        theme: editorTheme,
        nodes: nodes,
        onError: (error: Error) => {
            console.error(error)
        },
    }

    return (
        <div className="bg-background overflow-hidden rounded-lg border shadow">
            <LexicalComposer initialConfig={initialConfig}>
                <div className="relative">
                    {/* We reuse the Plugins component from the block */}
                    {/* We need to import Plugins and wrapping providers */}
                    {/* Note: editor.tsx wraps Plugins in TooltipProvider */}

                    <HtmlConverter htmlContent={content} onChange={onChange} />

                    {/* We need to dynamically import Plugins to avoid circular deps if any, 
                         but standard import is fine. */}
                    <EditorPluginsWrapper />
                </div>
            </LexicalComposer>
        </div>
    )
}

import { Plugins } from "@/components/blocks/editor-x/plugins"
import { TooltipProvider } from "@/components/ui/tooltip"

function EditorPluginsWrapper() {
    return (
        <TooltipProvider>
            <Plugins />
        </TooltipProvider>
    )
}
