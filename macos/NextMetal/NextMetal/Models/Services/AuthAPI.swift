//
//  AuthAPI.swift
//  NextMetalApp
//

import Foundation
import Security

/* DTO */
struct LoginReply: Decodable { let token: String }

/* Keychain */
private enum KeychainStore {
    private static let service = "io.nextmetal.app"
    private static let key     = "jwt"

    static var jwt: String? {
        let q: [String:Any] = [
            kSecClass       as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData  as String: true,
            kSecMatchLimit  as String: kSecMatchLimitOne
        ]
        var item: CFTypeRef?
        guard SecItemCopyMatching(q as CFDictionary, &item) == errSecSuccess,
              let d = item as? Data,
              let s = String(data: d, encoding: .utf8) else { return nil }
        return s
    }

    static func save(_ jwt: String) {
        let q: [String:Any] = [
            kSecClass       as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData   as String: Data(jwt.utf8)
        ]
        SecItemDelete(q as CFDictionary)
        SecItemAdd   (q as CFDictionary, nil)
    }

    static func clear() {
        let q: [String:Any] = [
            kSecClass       as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(q as CFDictionary)
    }
}

/* API */
enum AuthAPI {
    private static let base = URL(string: "http://localhost:3001")!
    private static let ses  = URLSession.shared

    static func login(email: String, password: String) async throws {
        let req = try makeRequest(path: "/api/auth/login",
                                  method: "POST",
                                  json: ["email": email, "password": password])
        let (data, _) = try await ses.data(for: req)
        let rep = try JSONDecoder().decode(LoginReply.self, from: data)
        KeychainStore.save(rep.token)
    }

    static func logout() { KeychainStore.clear() }

    static func profile() async throws -> AppUser {
        guard let jwt = KeychainStore.jwt else { throw URLError(.userAuthenticationRequired) }
        var req = URLRequest(url: base.appendingPathComponent("/api/auth/me"))
        req.httpMethod = "GET"
        req.addValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        let (d, _) = try await ses.data(for: req)
        return try JSONDecoder().decode(AppUser.self, from: d)
    }

    private static func makeRequest(path: String,
                                    method: String,
                                    json: [String:Any]) throws -> URLRequest {
        var r = URLRequest(url: base.appendingPathComponent(path))
        r.httpMethod = method
        r.addValue("application/json", forHTTPHeaderField: "Content-Type")
        r.httpBody = try JSONSerialization.data(withJSONObject: json)
        return r
    }
}
