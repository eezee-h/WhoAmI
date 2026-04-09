export function isBoldShortcut(key: string, metaKey: boolean, ctrlKey: boolean) {
  return (metaKey || ctrlKey) && key.toLowerCase() === 'b'
}

export function wrapTextSelectionWithBold(value: string, selectionStart: number, selectionEnd: number) {
  const before = value.slice(0, selectionStart)
  const selected = value.slice(selectionStart, selectionEnd)
  const after = value.slice(selectionEnd)
  const wrapped = `**${selected}**`
  const nextValue = `${before}${wrapped}${after}`
  const nextSelectionStart = selectionStart + 2
  const nextSelectionEnd = selectionEnd + 2

  return {
    nextValue,
    nextSelectionStart,
    nextSelectionEnd,
  }
}

export function wrapContentEditableSelectionWithBold(root: HTMLElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  if (!root.contains(range.commonAncestorContainer)) return false

  const selected = selection.toString()
  const wrapped = `**${selected}**`
  const textNode = document.createTextNode(wrapped)

  range.deleteContents()
  range.insertNode(textNode)

  const nextRange = document.createRange()
  nextRange.setStart(textNode, 2)
  nextRange.setEnd(textNode, selected ? wrapped.length - 2 : 2)

  selection.removeAllRanges()
  selection.addRange(nextRange)
  return true
}
