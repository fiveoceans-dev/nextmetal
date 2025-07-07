//
//  LoginView.swift
//  NextMetalApp
//

import SwiftUI

struct LoginView: View {

    // MARK: – State & DI
    @ObservedObject var vm: AuthViewModel
    @State private var email:    String
    @State private var password: String = ""

    init(vm: AuthViewModel) {
        self.vm  = vm
        _email   = State(initialValue: vm.cachedEmail)   // read-only getter
    }

    // MARK: – UI
    var body: some View {
        VStack(spacing: 24) {

            Text("NEXTMETAL.NODE")
                .font(Orbitron.mono(size: 22, weight: .bold))
                .foregroundColor(.cyberYellow)
                .neon()

            // ── credentials ─────────────────────────────────────────────
            Group {
                TextField("E-MAIL",    text: $email)
                SecureField("PASSWORD", text: $password)
            }
            .textFieldStyle(.plain)
            .padding(12)
            .background(Color.cyberGrid.opacity(0.25))
            .cornerRadius(4)
            .font(Orbitron.mono(size: 13))

            // ── remember toggle ─────────────────────────────────────────
            Toggle("REMEMBER ME", isOn: $vm.remember)
#if os(macOS)
                .toggleStyle(.checkbox)
#else
                .toggleStyle(.switch)
#endif
                .font(Orbitron.mono(size: 11))
                .tint(.cyberCyan)
                .frame(maxWidth: .infinity, alignment: .leading)

            // ── action button ───────────────────────────────────────────
            Button("ACCESS") {
                vm.login(email: email, password: password)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)

            // ── error banner ────────────────────────────────────────────
            if let err = vm.errorMessage {
                Text(err)
                    .font(Orbitron.mono(size: 11))
                    .foregroundColor(.cyberRed)
            }
        }
        .padding(40)
        .frame(width: 360)
        .foregroundColor(.white)
    }
}

// MARK: – Preview

#Preview {
    LoginView(vm: AuthViewModel())
        .background(Color.cyberBg)
}
