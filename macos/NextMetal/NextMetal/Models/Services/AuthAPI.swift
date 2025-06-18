//
//  AuthAPI.swift
//  NextMetal
//
import Foundation
import Combine

// MARK: – DTOs

struct AppUser: Decodable {
    let id: UUID
    let email: String
    let points: Int
}

private struct LoginResponse: Decodable {
    let token: String
    let user : AppUser
}

// MARK: – API

enum AuthAPI {

    // ───────── Public publisher (SwiftUI friendly) ─────────
    @MainActor
    static var userPublisher: Published<AppUser?>.Publisher { $user }

    // ───────── Internal state ─────────
    @Published private static var user: AppUser?               // drives the publisher
    private static let base = URL(string: "https://app.nextmetal.org")!
    private static let jwtKey = "nextmetal.jwt"                // key-chain key

    // MARK: login -------------------------------------------------------------
    static func login(email: String, password: String) async throws {
        let body = ["email": email, "password": password]

        let (data, _) = try await URLSession.shared.data(
            for: request("auth/login", json: body)
        )

        let res = try JSONDecoder().decode(LoginResponse.self, from: data)
        try Keychain.set(res.token, for: jwtKey)
        await MainActor.run { user = res.user }
    }

    // MARK: register ----------------------------------------------------------
    static func register(email: String,
                         password: String,
                         referral: String? = nil) async throws {
        var body = ["email": email, "password": password]
        if let ref = referral, !ref.isEmpty { body["referralCode"] = ref }
        // the back-end immediately returns the same JSON as /auth/login
        let (data, _) = try await URLSession.shared.data(
            for: request("auth/register", json: body)
        )
        let res = try JSONDecoder().decode(LoginResponse.self, from: data)
        try Keychain.set(res.token, for: jwtKey)
        await MainActor.run { user = res.user }
    }

    // MARK: logout ------------------------------------------------------------
    static func logout() throws {
        try Keychain.delete(jwtKey)
        user = nil
    }

    // MARK: helper ------------------------------------------------------------
    private static func request(_ path: String,
                                json body: [String: Any]) -> URLRequest {
        var req = URLRequest(url: base.appendingPathComponent(path))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)
        return req
    }
}
