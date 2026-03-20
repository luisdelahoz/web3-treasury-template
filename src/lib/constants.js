export const NETWORKS = {
  ethereum: {
    icon:       '◆',
    label:      'Ethereum',
    cls:        'eth',
    nativeSym:  'ETH',
    geckoId:    'ethereum',
    explorer:   'https://api.etherscan.io/api',
    envKey:     'VITE_ETHERSCAN_KEY',
  },
  polygon: {
    icon:       '◆',
    label:      'Polygon',
    cls:        'poly',
    nativeSym:  'MATIC',
    geckoId:    'matic-network',
    explorer:   'https://api.polygonscan.com/api',
    envKey:     'VITE_POLYGONSCAN_KEY',
  },
}

export const API_KEYS = {
  ethereum: import.meta.env.VITE_ETHERSCAN_KEY  || '',
  polygon:  import.meta.env.VITE_POLYGONSCAN_KEY || '',
}
