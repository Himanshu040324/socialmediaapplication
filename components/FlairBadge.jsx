// FlairBadge — reusable colored pill badge for post flairs.
// Props:
//   name   string   flair display name
//   color  string   hex color e.g. '#7c6fe0'
//   size   'xs'|'sm'  default 'sm'
//   onClick  optional click handler (used for filter chips)

export default function FlairBadge({ name, color, size = 'sm', onClick, active = false }) {
  const hex    = color ?? '#7c6fe0'
  const styles = {
    display:         'inline-flex',
    alignItems:      'center',
    gap:             '4px',
    backgroundColor: active ? hex + '33' : hex + '18',
    color:           hex,
    border:          `1px solid ${active ? hex + '88' : hex + '40'}`,
    borderRadius:    '6px',
    fontFamily:      'Syne, sans-serif',
    fontWeight:      600,
    letterSpacing:   '0.01em',
    cursor:          onClick ? 'pointer' : 'default',
    transition:      'all 0.12s ease',
    whiteSpace:      'nowrap',
    ...(size === 'xs'
      ? { fontSize: '10px', padding: '1px 6px' }
      : { fontSize: '11px', padding: '2px 8px' }),
  }

  const Tag = onClick ? 'button' : 'span'

  return (
    <Tag
      style={styles}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.backgroundColor = hex + '33'
        e.currentTarget.style.borderColor     = hex + '88'
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.backgroundColor = active ? hex + '33' : hex + '18'
        e.currentTarget.style.borderColor     = active ? hex + '88' : hex + '40'
      } : undefined}
    >
      {/* Dot */}
      <span style={{
        width:           '5px',
        height:          '5px',
        borderRadius:    '50%',
        backgroundColor: hex,
        flexShrink:      0,
      }} />
      {name}
    </Tag>
  )
}