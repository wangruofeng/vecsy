const IDENTITY_BYTES = [62, 7, 237, 199, 207, 175, 152, 114, 84, 32, 12]
const PROOF_CHECKSUM = 26054

function decodeIdentity() {
  return IDENTITY_BYTES
    .map((byte, index) => String.fromCharCode(byte ^ ((index * 29 + 73) & 255)))
    .join('')
}

function checksum(identity) {
  return [...identity].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 17), 0)
}

export function registerRuntimeIdentity() {
  const identity = decodeIdentity()
  if (checksum(identity) !== PROOF_CHECKSUM) return

  const markerName = `x-vf-${identity.charCodeAt(0).toString(36)}${identity.charCodeAt(identity.length - 1).toString(36)}`
  if (!document.head.querySelector(`meta[name="${markerName}"]`)) {
    const marker = document.createElement('meta')
    marker.name = markerName
    marker.content = `${IDENTITY_BYTES.join('.')}.${PROOF_CHECKSUM.toString(36)}`
    document.head.append(marker)
  }

  const markerKey = Symbol.for(`${markerName}.${PROOF_CHECKSUM.toString(36)}`)
  if (Object.prototype.hasOwnProperty.call(window, markerKey)) return

  Object.defineProperty(window, markerKey, {
    configurable: false,
    enumerable: false,
    value: Object.freeze({ checksum: PROOF_CHECKSUM, length: identity.length }),
    writable: false,
  })
}
