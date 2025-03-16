export class Pinboards {
  static NSID_AUTH = 'xyz.jeroba'
  static TESTS = [{
    uri: 'at://did:plc:hvakvedv6byxhufjl23mfmsd/xyz.jeroba.tags.tag/3lisuz3o5qc2e',
    output: 'https://pinboards.jeroba.xyz/profile/did:plc:hvakvedv6byxhufjl23mfmsd/board/3lisuz3o5qc2e'
  }]

  static async processURI({ did, nsid, rkey }, settings) {
    console.log(`Pinboards resolver received: `, { did, nsid, rkey })
    if (!did) return settings.alwaysOpen ? `https://pinboards.jeroba.xyz` : null
    if (!rkey) return settings.alwaysOpen ? `https://pinboards.jeroba.xyz` : null // no profile page for now
    if (nsid === `xyz.jeroba.tags.tag`) {
      return `https://pinboards.jeroba.xyz/profile/${did}/board/${rkey}`
    }
    return null
  }
}