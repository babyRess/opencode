import type { ValidComponent } from "solid-js"
import { createSimpleContext } from "./helper"

const ctx = createSimpleContext<ValidComponent, { component: ValidComponent }>({
  name: "EditorComponent",
  init: (props) => props.component,
})

export const EditorComponentProvider = ctx.provider
export const useEditorComponent = ctx.use
