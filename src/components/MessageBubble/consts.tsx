import type { Components } from 'react-markdown'

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const isReferenceLink = (text: string): boolean => {
  return /^\[\d+\]$/.test(text.trim())
}

export const components: Components = {
  p: ({ children }) => <p className='break-all whitespace-pre-wrap'>{children}</p>,
  strong: ({ children }) => <strong className='break-all'>{children}</strong>,
  em: ({ children }) => <em className='break-all'>{children}</em>,
  a: ({ href, children }) => {
    if (!href || href === 'undefined' || href === 'null') {
      return <span className='break-all text-muted-foreground'>{children}</span>
    }

    const isValid = isValidUrl(href)

    if (!isValid) {
      return <span className='break-all text-muted-foreground'>{children}</span>
    }

    return (
      <a
        href={href}
        target='_blank'
        rel='noreferrer noopener'
        style={{
          color: '#2563eb',
          textDecoration: 'underline',
          textDecorationColor: '#2563eb',
        }}
      >
        {children}
      </a>
    )
  },
  text: ({ children }) => {
    const text = String(children)

    if (isReferenceLink(text)) {
      return <span className='break-all text-muted-foreground opacity-60'>{children}</span>
    }

    return <span className='break-all'>{children}</span>
  },
  code({ children }) {
    return (
      <pre className='overflow-auto rounded bg-muted p-3 text-xs text-foreground'>
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
