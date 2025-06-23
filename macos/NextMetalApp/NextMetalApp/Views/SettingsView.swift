//
//  SettingsView.swift
//  NextMetalApp
//

import SwiftUI

struct SettingsView: View {
    var body: some View {
        ZStack {
            Text("SETTINGS")
                .font(Orbitron.mono(size: 18))
                .foregroundColor(.cyberCyan)
                .neon(.cyberCyan)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview { SettingsView() }
