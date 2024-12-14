export function getElementSelector(element: Element): string {
  const id = element.id ? `#${element.id}` : '';
  const classes = Array.from(element.classList).map(c => `.${c}`).join('');
  return `${element.tagName.toLowerCase()}${id}${classes}`;
}

export function getComputedStyles(element: Element) {
  // Since we're using jsdom, we'll use a simplified version
  // that just gets inline styles and defaults
  const style = (element as HTMLElement).style;
  return {
    backgroundColor: style.backgroundColor || 'white',
    color: style.color || 'black',
    display: style.display || 'block',
  };
}

export function isVisibleElement(element: Element): boolean {
  const style = (element as HTMLElement).style;
  return style.display !== 'none' && style.visibility !== 'hidden';
}