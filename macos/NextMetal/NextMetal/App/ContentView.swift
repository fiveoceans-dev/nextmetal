//
//  ContentView.swift
//  NextMetal
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "bolt.fill")
                .resizable()
                .scaledToFit()
                .frame(width: 64, height: 64)
                .foregroundColor(.accentColor)

            Text("Welcome to NextMetal")
                .font(.title)
                .bold()

            Text("A lightweight macOS controller for Docker and Ethereum testnet wallets.")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()
        }
        .padding()
        .frame(width: 400, height: 300)
    }
}

#Preview {
    ContentView()
}
