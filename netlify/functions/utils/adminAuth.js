const crypto = require('crypto')

function safeCompare(a, b) {
    if (!a || !b) return false
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
}

module.exports = { safeCompare }
