//
//  Keychain.swift
//  NextMetal
//
import Foundation
import Security

enum KeychainError: Error { case unexpectedStatus(OSStatus) }

enum Keychain {

    /// Save or overwrite a string value.
    static func set(_ value: String, for key: String) throws {
        let data = Data(value.utf8)

        // If the item already exists – delete, then add.
        try? delete(key)

        var query: [CFString: Any] = [
            kSecClass           : kSecClassGenericPassword,
            kSecAttrAccount     : key,
            kSecValueData       : data,
            kSecAttrAccessible  : kSecAttrAccessibleAfterFirstUnlock
        ]

        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeychainError.unexpectedStatus(status) }
    }

    /// Read a string value (returns `nil` if not present).
    static func get(_ key: String) throws -> String? {
        let query: [CFString: Any] = [
            kSecClass           : kSecClassGenericPassword,
            kSecAttrAccount     : key,
            kSecReturnData      : kCFBooleanTrue!,
            kSecMatchLimit      : kSecMatchLimitOne
        ]

        var result: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess else { throw KeychainError.unexpectedStatus(status) }

        guard let data = result as? Data, let str = String(data: data, encoding: .utf8)
        else { return nil }

        return str
    }

    /// Delete an item (silently succeeds if the key does not exist).
    static func delete(_ key: String) throws {
        let query: [CFString: Any] = [
            kSecClass       : kSecClassGenericPassword,
            kSecAttrAccount : key
        ]

        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound
        else { throw KeychainError.unexpectedStatus(status) }
    }
}

