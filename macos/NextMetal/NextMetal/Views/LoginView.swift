//
//  LoginView.swift
//  NextMetal
//

import SwiftUI

struct LoginView: View {

    @ObservedObject var vm: AuthViewModel

    @State private var email = UserDefaults.standard.string(forKey: "rememberEmail") ?? ""
    @State private var password = ""
    @State private var remember = true

    var body: some View {
        VStack(spacing: 24) {
            Text("NextMetal").font(.title).bold()

            TextField("Email", text: $email)
                .textFieldStyle(.roundedBorder)

            SecureField("Password", text: $password)
                .textFieldStyle(.roundedBorder)

            Toggle("Remember me", isOn: $remember)

            Button("Login") {
                vm.login(email: email, password: password, remember: remember)
            }
            .buttonStyle(.borderedProminent)
            .disabled(email.isEmpty || password.isEmpty)

            if let msg = vm.errorMessage {
                Text(msg).foregroundColor(.red).multilineTextAlignment(.center)
            }
        }
        .padding(40)
    }
}
