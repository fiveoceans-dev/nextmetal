//
//  WalletView.swift
//  NextMetal
//

import SwiftUI
import CryptoKit

struct WalletView: View {
    @State private var privateKeyHex: String = ""
    @State private var publicAddress: String = ""
    @State private var balance: String = "-"
    @State private var recipient: String = ""
    @State private var amount: String = ""
    @State private var statusMessage: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Ethereum Wallet").font(.title2).bold()

            Text("Public Address:")
                .font(.headline)
            Text(publicAddress.isEmpty ? "(none)" : publicAddress)
                .font(.system(.body, design: .monospaced))
                .padding(8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.gray.opacity(0.1))
                .cornerRadius(8)

            HStack {
                Button("Generate New Key") {
                    generateKey()
                }
                Button("Import Key") {
                    importPrivateKey()
                }
            }

            Divider()

            Text("Balance: \(balance) ETH")
                .font(.headline)
            Button("Refresh Balance") {
                refreshBalance()
            }

            Divider()

            Text("Transfer ETH:")
                .font(.headline)
            TextField("Recipient Address", text: $recipient)
                .textFieldStyle(.roundedBorder)
            TextField("Amount (ETH)", text: $amount)
                .textFieldStyle(.roundedBorder)
            Button("Send") {
                sendETH()
            }

            if !statusMessage.isEmpty {
                Text(statusMessage)
                    .foregroundColor(.blue)
                    .padding(.top, 8)
            }

            Spacer()
        }
        .padding(24)
        .onAppear {
            loadKeyIfAvailable()
        }
    }

    private func generateKey() {
        let privateKey = Curve25519.Signing.PrivateKey()
        privateKeyHex = privateKey.rawRepresentation.map { String(format: "%02x", $0) }.joined()
        publicAddress = "0x" + SHA256.hash(data: privateKey.publicKey.rawRepresentation).prefix(20).map { String(format: "%02x", $0) }.joined()
        statusMessage = "New key generated"
        balance = "-"
    }

    private func importPrivateKey() {
        // Replace with real UI for importing (e.g., file picker or secure input)
        statusMessage = "Import not yet implemented"
    }

    private func refreshBalance() {
        // Replace with Infura/Alchemy API calls
        if publicAddress.isEmpty {
            statusMessage = "No public address"
            return
        }
        statusMessage = "Fetching balance..."
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.balance = "0.05" // Mocked value
            self.statusMessage = "Balance updated"
        }
    }

    private func sendETH() {
        guard !publicAddress.isEmpty else {
            statusMessage = "No wallet loaded"
            return
        }
        guard !recipient.isEmpty, !amount.isEmpty else {
            statusMessage = "Enter recipient and amount"
            return
        }
        // Replace with web3 CLI or JSON-RPC command
        statusMessage = "Sent \(amount) ETH to \(recipient) (mocked)"
    }

    private func loadKeyIfAvailable() {
        // You can persist keys in Keychain or secure file and reload here
    }
}
