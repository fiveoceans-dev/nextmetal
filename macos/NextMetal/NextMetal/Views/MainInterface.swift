//
//  MainInterface.swift
//  NextMetal
//


import SwiftUI

struct MainInterface: View {
    var body: some View {
        TabView {
            DockerView()
                .tabItem {
                    Label("Docker", systemImage: "shippingbox.fill")
                }

            WalletView()
                .tabItem {
                    Label("Wallet", systemImage: "wallet.pass.fill")
                }
        }
        .frame(minWidth: 640, minHeight: 480)
    }
}
