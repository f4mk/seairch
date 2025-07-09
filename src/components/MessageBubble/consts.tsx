import type { Components } from 'react-markdown'

export const components: Components = {
  p: ({ children }) => <p className='break-all whitespace-pre-wrap'>{children}</p>,
  strong: ({ children }) => <strong className='break-all'>{children}</strong>,
  em: ({ children }) => <em className='break-all'>{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className='break-all text-blue-500' target='_blank' rel='noreferrer'>
      {children}
    </a>
  ),
  code({ children }) {
    return (
      <pre className='bg-muted text-foreground overflow-auto rounded p-3 text-xs'>
        <code className='min-w-0 overflow-hidden break-all whitespace-pre-wrap'>{children}</code>
      </pre>
    )
  },
  table({ children }) {
    return (
      <div className='overflow-auto'>
        <table className='w-full table-auto'>{children}</table>
      </div>
    )
  },
}
