//
//  NextMetalAppApp.swift
//  NextMetalApp
//
import SwiftUI

@main
struct NextMetalApp: App {
    @StateObject private var authVM = AuthViewModel()

    var body: some Scene {
        WindowGroup {
            if authVM.user != nil {
                MainTabView()
                    .frame(minWidth: 800, maxWidth: .infinity, minHeight: 600, maxHeight: .infinity)
                    .background(Color.cyberBg)
            } else {
                LoginView(vm: authVM)
                    .frame(minWidth: 800, maxWidth: .infinity, minHeight: 600, maxHeight: .infinity)
                    .background(Color.cyberBg)
            }
        }
    }
}
