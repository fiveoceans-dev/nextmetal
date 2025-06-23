//
//  AuthVM.swift
//  NextMetalApp
//

import Foundation

@MainActor
final class AuthViewModel: ObservableObject {
    @Published var user     : AppUser? = nil
    @Published var remember : Bool     = UserDefaults.standard.bool(forKey: "rememberEmailOn")
    @Published var errorMsg : String?  = nil

    var cachedEmail: String {
        get { UserDefaults.standard.string(forKey: "rememberedEmail") ?? "" }
        set { UserDefaults.standard.set(newValue, forKey: "rememberedEmail") }
    }

    func login(email: String, password: String) {
        Task {
            do {
                try await AuthAPI.login(email: email, password: password)
                let profile = try await AuthAPI.profile()
                self.user = profile
                handleRemember(email: email)
                errorMsg = nil
            } catch { errorMsg = error.localizedDescription }
        }
    }

    func logout() {
        AuthAPI.logout()
        user = nil
        errorMsg = nil
    }

    private func handleRemember(email: String) {
        if remember {
            cachedEmail = email
            UserDefaults.standard.set(true, forKey: "rememberEmailOn")
        } else {
            UserDefaults.standard.removeObject(forKey: "rememberedEmail")
            UserDefaults.standard.set(false, forKey: "rememberEmailOn")
        }
    }
}
