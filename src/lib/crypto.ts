export function hashPasswordMD5(password: string): string {
  if (typeof window !== 'undefined') {
    // Client-side implementation
    const crypto = require('crypto-js')
    return crypto.MD5(password).toString()
  } else {
    // Server-side implementation  
    const crypto = require('crypto')
    return crypto.createHash('md5').update(password).digest('hex')
  }
}