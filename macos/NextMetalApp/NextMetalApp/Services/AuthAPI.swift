//
//  AuthAPI.swift
//  NextMetalApp
//

import Foundation
import Security

/* DTO */
struct LoginReply: Decodable {
    let token: String
    let user : AppUser
}

// AuthAPI.swift  (add at top, after imports)
#if DEBUG
private func dbg(_ items: Any...) { items.forEach { print("-", $0) } }
#else
private func dbg(_: Any...) {}
#endif

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
        dbg("LOAD keychain status", SecItemCopyMatching(q as CFDictionary, &item))

        return s
        
    }

    static func save(_ jwt: String) {
        
        let q: [String:Any] = [
            kSecClass       as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
        ]
        SecItemDelete(q as CFDictionary)

        let addQ: [String:Any] = [
            kSecClass         as String: kSecClassGenericPassword,
            kSecAttrService   as String: service,
            kSecAttrAccount   as String: key,
            kSecValueData     as String: Data(jwt.utf8),
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ]
        let status = SecItemAdd(addQ as CFDictionary, nil)
        dbg("SAVE keychain status", status)          // should now print 0
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
    private static let base = URL(string: "https://nextmetal.org")!
    private static let ses  = URLSession.shared

    // MARK: - Login
    static func login(email: String, password: String) async throws -> AppUser {
        let req = try makeRequest(
            path: "/api/auth/login",
            method: "POST",
            json: ["email": email, "password": password]
        )

        let (data, resp) = try await ses.data(for: req)
        guard let http = resp as? HTTPURLResponse, (200..<300).contains(http.statusCode)
        else { throw URLError(.badServerResponse) }

        let reply = try JSONDecoder().decode(LoginReply.self, from: data)

        KeychainStore.save(reply.token)
        return reply.user
    }

    // MARK: - Profile
    static func profile() async throws -> AppUser {
        guard let jwt = KeychainStore.jwt else {
            throw URLError(.userAuthenticationRequired)
        }

        var req = URLRequest(url: base.appendingPathComponent("/api/auth/profile"))
        req.httpMethod = "GET"
        req.addValue("Bearer \(jwt)", forHTTPHeaderField: "Authorization")
        req.addValue("application/json", forHTTPHeaderField: "Accept")
        dbg("REQ", "GET", req.url!.absoluteString)

        let (data, resp) = try await ses.data(for: req)
        guard let http = resp as? HTTPURLResponse,
              200..<300 ~= http.statusCode else {
            throw URLError(.badServerResponse)
        }
        dbg("RES profile", http.statusCode)
        dbg("RAW", String(data: data, encoding: .utf8) ?? "<binary>")

        // decode directly
        return try JSONDecoder().decode(AppUser.self, from: data)
    }

    static func logout() { KeychainStore.clear() }

    private static func makeRequest(path: String,
                                    method: String,
                                    json: [String:Any]) throws -> URLRequest {
        var r = URLRequest(url: base.appendingPathComponent(path))
        r.httpMethod = method
        r.addValue("application/json", forHTTPHeaderField: "Content-Type")
        r.httpBody = try JSONSerialization.data(withJSONObject: json)

        // ↓↓↓  new  ↓↓↓
        dbg("REQ", method, r.url?.absoluteString ?? "")
        dbg("BODY", json)

        return r
    }
}
