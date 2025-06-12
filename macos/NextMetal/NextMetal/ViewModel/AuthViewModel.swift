//
//  AuthViewModel.swift
//  NextMetal
//

import SwiftUI
import Vapor

@MainActor
final class AuthViewModel: ObservableObject {

    private(set) var app: Application!

    @Published var user: AppUser?
    @Published var errorMessage: String?

    func inject(_ app: Application) { self.app = app }

    func login(email: String, password: String, remember: Bool) {
        guard let app else { return }

        Task { [weak self] in
            do {
                let u = try await AuthService.login(email: email,
                                                    password: password,
                                                    via: app)
                self?.user = u
                self?.errorMessage = nil
                if remember {
                    UserDefaults.standard.set(email, forKey: "rememberEmail")
                }
            } catch {
                self?.errorMessage = error.localizedDescription
            }
        }
    }

    func logout() { user = nil }
}
