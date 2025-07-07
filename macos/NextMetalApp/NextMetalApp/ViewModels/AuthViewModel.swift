//
//  AuthViewModel.swift
//  NextMetalApp
//

import Foundation

@MainActor
final class AuthViewModel: ObservableObject {

    // ───────── Public state ─────────
    @Published var user: AppUser?                = nil
    @Published var remember                     : Bool
    @Published var errorMessage                 : String? = nil
    @Published var isBusy                       : Bool    = false   // <- optional spinner

    // ───────── Init ─────────
    init() {
        // pull remember-me state once
        remember = UserDefaults.standard.bool(forKey: Keys.rememberOn)
    }

    // MARK: – Login / Logout ----------------------------------------------

    /// Log-in and store the JWT (no profile call).
    func login(email: String, password: String) {
        isBusy = true
        Task { @MainActor in
            defer { isBusy = false }
            do {
                user = try await AuthAPI.login(email: email, password: password)
                persistRemember(email: email)
                errorMessage = nil
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }


    /// Clears JWT + local state.
    func logout() {
        AuthAPI.logout()
        user          = nil
        errorMessage  = nil
    }

    // MARK: – Profile (lazy) ----------------------------------------------

    /// Call this whenever you actually need the user record.
    func refreshProfile() {
        isBusy = true
        Task {
            defer { isBusy = false }
            do {
                user         = try await AuthAPI.profile()
                errorMessage = nil
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    // MARK: – Private helpers ---------------------------------------------

    private func persistRemember(email: String) {
        if remember {
            UserDefaults.standard.set(true,  forKey: Keys.rememberOn)
            UserDefaults.standard.set(email, forKey: Keys.cachedEmail)
        } else {
            UserDefaults.standard.set(false, forKey: Keys.rememberOn)
            UserDefaults.standard.removeObject(forKey: Keys.cachedEmail)
        }
    }

    // quick wrapper around UserDefaults keys
    private enum Keys {
        static let rememberOn  = "rememberEmailOn"
        static let cachedEmail = "rememberedEmail"
    }

    // Public getter for the login screen
    var cachedEmail: String {
        UserDefaults.standard.string(forKey: Keys.cachedEmail) ?? ""
    }
}
