import type { Components } from 'react-markdown'

export const components: Components = {
  p: ({ children }) => <p className='break-all whitespace-pre-wrap'>{children}</p>,
  strong: ({ children }) => <strong className='break-all'>{children}</strong>,
  em: ({ children }) => <em className='break-all'>{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className='text-blue-500 break-all' target='_blank' rel='noreferrer'>
      {children}
    </a>
  ),
  code({ children }) {
    return (
      <pre className='bg-muted text-foreground p-3 rounded text-xs overflow-auto'>
        <code className='whitespace-pre-wrap break-all min-w-0 overflow-hidden'>{children}</code>
      </pre>
    )
  },
  table({ children }) {
    return (
      <div className='overflow-auto'>
        <table className='table-auto w-full'>{children}</table>
      </div>
    )
  },
}
