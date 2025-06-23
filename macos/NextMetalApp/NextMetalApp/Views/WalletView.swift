//
//  WalletView.swift
//  NextMetalApp
//


import SwiftUI

struct WalletView: View {
    var body: some View {
        ZStack {
            Text("WALLET")
                .font(Orbitron.mono(size: 18))
                .foregroundColor(.cyberCyan)
                .neon(.cyberCyan)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
