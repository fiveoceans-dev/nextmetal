//
//  Keychain.swift
//  NextMetalApp
//

import Foundation
import Security

/// Minimal native wrapper that stores one JWT string.
/// No external libraries, no emoji, no extra fluff.
enum Keychain {

    private static let service = Bundle.main.bundleIdentifier ?? "io.nextmetal.app"
    private static let account = "jwt"

    // MARK: – Write
    static func save(_ token: String) throws {
        try delete()                                         // remove stale item

        let attrs: [String: Any] = [
            kSecClass             as String: kSecClassGenericPassword,
            kSecAttrService       as String: service,
            kSecAttrAccount       as String: account,
            kSecValueData         as String: Data(token.utf8),
            kSecAttrAccessible    as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        let status = SecItemAdd(attrs as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeychainError(status: status) }
    }

    // MARK: – Read
    static func jwt() throws -> String {
        let query: [String: Any] = [
            kSecClass             as String: kSecClassGenericPassword,
            kSecAttrService       as String: service,
            kSecAttrAccount       as String: account,
            kSecReturnData        as String: true,
            kSecMatchLimit        as String: kSecMatchLimitOne
        ]

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)

        guard status == errSecSuccess,
              let data = item as? Data,
              let token = String(data: data, encoding: .utf8)
        else { throw KeychainError(status: status) }

        return token
    }

    // MARK: – Delete
    @discardableResult
    static func delete() throws -> Bool {
        let query: [String: Any] = [
            kSecClass       as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound
        else { throw KeychainError(status: status) }
        return status == errSecSuccess
    }

    // MARK: – Error
    struct KeychainError: LocalizedError {
        let status: OSStatus
        var errorDescription: String? {
            SecCopyErrorMessageString(status, nil) as String? ??
            "Keychain error \(status)"
        }
    }
}
