//
//  MainTabView.swift
//  NextMetalApp
//

import SwiftUI
struct MainTabView: View {
    var body: some View {
        TabView {
            DockerView()
                .tabItem { Label("Docker", systemImage: "shippingbox") }

//            WalletView()
//                .tabItem { Label("Wallet", systemImage: "wallet.pass") }

            RewardsView()
                .tabItem { Label("Rewards", systemImage: "gift") }
            
            SettingsView()
                .tabItem { Label("Settings", systemImage: "gear") }
        }
        .frame(minWidth: 800, minHeight: 550)
    }
}
